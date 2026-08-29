/**
 * L'invariante di D-024, verificata **su ciò che l'utente legge** — D-066.
 *
 * ⚠️ **È la prima verifica sulla presentazione del progetto, e la ragione per
 * cui serviva è che il difetto era passato proprio di lì.** La suite verificava
 * che la traccia sommasse al netto, ed era vero: nel motore il netto **è** la
 * somma degli effetti, quindi l'asserzione era una tautologia che non poteva
 * fallire. Ma la garanzia di D-024 — *«i numeri mostrati sommano al totale»* —
 * è un'affermazione **sulla pagina**, e arrotondare non commuta con il sommare.
 *
 * Su RAL 30.000 a Milano le voci facevano 23.425,49 e la testata diceva
 * 23.425,48, con dieci test verdi.
 *
 * Qui i numeri si **formattano e si rileggono**, con lo stesso formattatore
 * della pagina: se un totale non torna, torna anche il difetto.
 */

import { describe, expect, it } from 'vitest'

import { perLaPagina } from '../app/_lib/arrotonda'
import { eseguiCalcolo } from '../app/_lib/calcolo'
import { formato } from '../app/_lib/formato'
import type { CodiceLingua, Passo, Risultato } from '../core/types'

const LINGUE: readonly CodiceLingua[] = ['it', 'en']

/**
 * Rilegge un importo **dalla stringa che la pagina scrive**.
 *
 * Non usa `leggiImporto`, che serve a leggere ciò che una persona digita: qui
 * si rilegge l'uscita di `Intl`, che può usare il segno meno tipografico
 * (U+2212) e lo spazio unificatore stretto fra numero e valuta.
 */
const rileggi = (mostrato: string): number => {
  const pulito = mostrato
    .replace(/[−]/g, '-')
    .replace(/[\s  ]/g, '')
    .replace(/[€+]/g, '')
  const negativo = pulito.startsWith('-')
  const cifre = pulito.replace(/^-/, '')
  // L'ultimo separatore è quello decimale, qualunque sia la lingua.
  const ultimo = Math.max(cifre.lastIndexOf(','), cifre.lastIndexOf('.'))
  const intero = ultimo < 0 ? cifre : cifre.slice(0, ultimo).replace(/[.,]/g, '')
  const decimali = ultimo < 0 ? '' : cifre.slice(ultimo + 1)
  const n = Number(`${intero}.${decimali || '0'}`)
  return negativo ? -n : n
}

const risultatoDi = (ral: number, codice = 'F205'): Risultato => {
  const e = eseguiCalcolo({ ral, codiceCatastale: codice, tipoContratto: 'indeterminato', mensilita: 13 })
  if (e.stato !== 'ok') throw new Error(`calcolo fallito per ${codice}`)
  return perLaPagina(e.risultato)
}

/** I casi coprono i rami che cambiano forma, non solo quello base. */
const CASI: readonly { readonly nome: string; readonly ral: number; readonly comune: string }[] = [
  { nome: 'caso base — Milano', ral: 30_000, comune: 'F205' },
  { nome: 'sotto la soglia di esenzione comunale', ral: 24_000, comune: 'F205' },
  { nome: 'gate chiuso, incapiente', ral: 8_000, comune: 'F205' },
  { nome: 'ramo che aggiunge', ral: 15_000, comune: 'F205' },
  { nome: 'fascia intera regionale — Roma', ral: 22_000, comune: 'H501' },
  { nome: 'detrazione regionale capiente — Bolzano', ral: 33_000, comune: 'A952' },
  { nome: 'fascia alta', ral: 70_000, comune: 'F205' },
]

describe('il totale mostrato è la somma delle voci mostrate (D-066)', () => {
  for (const lingua of LINGUE) {
    const { inEuro, inEuroConSegno } = formato(lingua)

    describe(`in ${lingua}`, () => {
      for (const caso of CASI) {
        it(`${caso.nome}: il netto è la somma dei passi di primo livello`, () => {
          const r = risultatoDi(caso.ral, caso.comune)
          const somma = r.passi.reduce(
            (acc, p) =>
              acc + (p.esito.stato === 'applicato' ? rileggi(inEuroConSegno(p.esito.effettoSulNetto)) : 0),
            rileggi(inEuro(r.input.ral)),
          )
          expect(rileggi(inEuro(r.nettoAnnuo))).toBeCloseTo(somma, 10)
        })

        /**
         * ⚠️ **L'asserzione non è circolare, e la differenza sta in dove si
         * guarda.** La relazione fra un blocco e i suoi figli — somma di
         * addendi, oppure ultimo anello di una catena — si **riconosce sui
         * numeri esatti del motore**, dove è vera per costruzione. Poi si
         * pretende che **sopravviva all'arrotondamento**, sui numeri formattati.
         *
         * Un blocco i cui figli non stanno in nessuna delle due relazioni non
         * viene messo alla prova: `contributi-ivs` ha per figlio la base
         * contributiva, che è una grandezza esposta e non un addendo dei
         * contributi. Pretendere una somma lì significherebbe chiedere al
         * blocco di essere qualcosa che non è.
         */
        it(`${caso.nome}: ogni blocco annidato torna sui propri figli`, () => {
          const e = eseguiCalcolo({
            ral: caso.ral,
            codiceCatastale: caso.comune,
            tipoContratto: 'indeterminato',
            mensilita: 13,
          })
          if (e.stato !== 'ok') throw new Error('calcolo fallito')
          const mostrato = perLaPagina(e.risultato)

          const uscite = (passi: readonly Passo[], come: (n: number) => number) =>
            passi.flatMap((f) => (f.esito.stato === 'applicato' ? [come(f.esito.esce)] : []))

          const vicino = (a: number, b: number, eps: number) => Math.abs(a - b) < eps

          const controlla = (esatto: Passo, reso: Passo) => {
            const figliEsatti = esatto.dettaglio ?? []
            const figliResi = reso.dettaglio ?? []
            figliEsatti.forEach((f, i) => controlla(f, figliResi[i]))

            if (esatto.esito.stato !== 'applicato' || reso.esito.stato !== 'applicato') return
            const esatte = uscite(figliEsatti, (n) => n)
            if (esatte.length === 0) return

            const rese = uscite(figliResi, (n) => rileggi(inEuro(n)))
            const padre = rileggi(inEuro(reso.esito.esce))

            if (vicino(esatte.reduce((a, b) => a + b, 0), esatto.esito.esce, 1e-6)) {
              const somma = rese.reduce((a, b) => a + b, 0)
              expect(padre, `${esatto.id}: somma dei figli mostrati`).toBeCloseTo(somma, 10)
            } else if (vicino(esatte[esatte.length - 1], esatto.esito.esce, 1e-6)) {
              expect(padre, `${esatto.id}: ultimo anello della catena`).toBeCloseTo(
                rese[rese.length - 1],
                10,
              )
            }
          }

          e.risultato.passi.forEach((p, i) => controlla(p, mostrato.passi[i]))
        })

        it(`${caso.nome}: le mensilità dividono il totale mostrato`, () => {
          const r = risultatoDi(caso.ral, caso.comune)
          const netto = rileggi(inEuro(r.nettoAnnuo))
          for (const m of [12, 13, 14] as const) {
            const atteso = Math.round((netto / m) * 100) / 100
            expect(rileggi(inEuro(r.nettoMensile[m]))).toBeCloseTo(atteso, 10)
          }
        })
      }
    })
  }
})

describe('lo scarto dal valore esatto resta sotto il centesimo (D-025)', () => {
  it('il caso base mostra 23.425,49 e il motore calcola 23.425,4846', () => {
    const e = eseguiCalcolo({
      ral: 30_000,
      codiceCatastale: 'F205',
      tipoContratto: 'indeterminato',
      mensilita: 13,
    })
    if (e.stato !== 'ok') throw new Error('ko')

    // ⚠️ Il motore non si è mosso, e non deve: la correzione è in presentazione.
    expect(e.risultato.nettoAnnuo).toBeCloseTo(23_425.4846, 4)

    const mostrato = perLaPagina(e.risultato).nettoAnnuo
    expect(mostrato).toBeCloseTo(23_425.49, 10)
    expect(Math.abs(mostrato - e.risultato.nettoAnnuo)).toBeLessThan(0.01)
  })
})

describe('la formattazione non dipende dalla build del runtime', () => {
  /**
   * ⚠️ `useGrouping: 'always'`. Il default delega a `minimumGroupingDigits` del
   * CLDR, che per l'italiano vale 2 nelle versioni recenti e 1 in quelle
   * precedenti: sotto i 10.000 lo stesso numero esce con o senza il separatore
   * **a seconda dell'ICU compilato nel runtime**. Fra il Node che rende la
   * pagina e il browser che la riprende non è la stessa.
   */
  it('il separatore delle migliaia c’è anche sotto i diecimila, in entrambe le lingue', () => {
    expect(formato('it').inEuro(1952.12)).toContain('1.952,12')
    expect(formato('en').inEuro(1952.12)).toContain('1,952.12')
  })

  it('e resta sopra i diecimila', () => {
    expect(formato('it').inEuro(30_000)).toContain('30.000,00')
    expect(formato('en').inEuro(30_000)).toContain('30,000.00')
  })
})
