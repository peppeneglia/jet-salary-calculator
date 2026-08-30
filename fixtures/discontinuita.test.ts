/**
 * Ogni gradino verso il basso deve avere un nome.
 *
 * A differenza di `ancoraggio.test.ts` questo test può fallire senza che
 * nessuno sappia la risposta giusta: percorre la RAL a passo fine e pretende
 * che ogni caduta del netto sia spiegata. Tre cause su quattro si leggono dai
 * dati; la quarta è il gate delle addizionali, che non ha una soglia in `data/`
 * perché non è un numero — è il punto in cui l'IRPEF netta smette di essere zero.
 *
 * ⚠️ Le soglie attese vengono dagli stessi dati che il motore applica: se una
 * cambiasse, si sposterebbero entrambi i lati e il test resterebbe verde. Prende
 * gli errori di struttura — uno scaglione applicato all'intero reddito, una
 * decrescenza resa come cliff — non quelli di valore.
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import { risolviComune } from '../app/_lib/comuni'
import { regime2026 } from '../data/regime-2026'
import type { Risultato } from '../core/types'

const PASSO = 25
const RAL_MIN = 3_000
const RAL_MAX = 90_000

/** Quanto largo è il margine entro cui un gradino «coincide» con una soglia. */
const TOLLERANZA_RC = PASSO

interface Punto {
  readonly ral: number
  readonly rc: number
  readonly netto: number
  readonly gateAperto: boolean
}

const leggi = (ral: number, codice: string): Punto => {
  const esito = eseguiCalcolo({ ral, codiceCatastale: codice, tipoContratto: 'indeterminato', mensilita: 13 })
  if (esito.stato !== 'ok') throw new Error(`${codice} a ${ral}: ${esito.errore.codice}`)
  const r: Risultato = esito.risultato
  const gate = r.passi.find((p) => p.id === 'gate-addizionali')
  return {
    ral,
    rc: r.grandezze.redditoComplessivo,
    netto: r.nettoAnnuo,
    gateAperto: gate?.esito.stato === 'verifica' ? gate.esito.superata : false,
  }
}

/**
 * Le soglie sul reddito complessivo oltre le quali un gradino è previsto,
 * lette dai parametri dell'anno e dall'ente, mai scritte qui.
 */
const sogliePreviste = (codice: string): readonly number[] => {
  const comune = risolviComune(codice)
  if (comune?.stato !== 'calcolabile') throw new Error(`${codice} non calcolabile`)

  const soglie: number[] = [
    // Le fasce della somma non sono scaglioni: ogni confine è un salto (D-062).
    ...regime2026.cuneo.somma.fasce.valore
      .map((f) => f.redditoA)
      .filter((a): a is NonNullable<typeof a> => a !== null),
    regime2026.cuneo.somma.sogliaAccesso.valore,
    regime2026.trattamentoIntegrativo.sogliaRedditoComplessivo.valore,
    // L'incremento dell'art. 13 c. 1.1 è un cliff: 65 € che spettano fino a
    // 35.000 e spariscono interi un centesimo sopra. Mancava, e il test lo ha
    // trovato come gradino non spiegato da 55,30 €.
    regime2026.detrazioneLavoroDipendente.incrementoFasciaIntermedia.valore.redditoA,
  ]

  const { regionale, comunale } = comune.enti
  if (regionale.stato !== 'nonIstituito' && regionale.parametri.sogliaEsenzione !== null) {
    soglie.push(regionale.parametri.sogliaEsenzione.valore)
  }
  if (comunale.stato !== 'nonIstituito' && comunale.parametri.sogliaEsenzione !== null) {
    soglie.push(comunale.parametri.sogliaEsenzione)
  }
  return soglie
}

/** I comuni sono veri e coprono le forme che esistono davvero nel dataset. */
const CASI = [
  { codice: 'F205', nome: 'Milano — unica, esenzione comunale a 23.000' },
  { codice: 'A083', nome: 'Agordo — scaglioni previgenti, esenzione a 10.000' },
  { codice: 'A049', nome: 'Acquaviva Platani — nessuna addizionale comunale' },
  { codice: 'A094', nome: 'Ayas — Valle d’Aosta, soglia di esenzione regionale' },
] as const

describe('ogni gradino verso il basso ha un nome', () => {
  it.each(CASI)('$nome', ({ codice }) => {
    const soglie = sogliePreviste(codice)
    const punti: Punto[] = []
    for (let ral = RAL_MIN; ral <= RAL_MAX; ral += PASSO) punti.push(leggi(ral, codice))

    const nonSpiegati: string[] = []
    const spiegatiDaSoglia = new Set<number>()
    let gateVisto = false

    for (let i = 1; i < punti.length; i++) {
      const prima = punti[i - 1]
      const dopo = punti[i]
      if (dopo.netto >= prima.netto) continue

      // Il gate che si apre: l'IRPEF netta passa da zero a positiva, e
      // l'addizionale diventa dovuta sull'intera base. Non ha una soglia
      // scritta in `data/` perché non è un numero.
      if (!prima.gateAperto && dopo.gateAperto) {
        gateVisto = true
        continue
      }

      const soglia = soglie.find((s) => prima.rc <= s + TOLLERANZA_RC && dopo.rc >= s - TOLLERANZA_RC)
      if (soglia !== undefined) {
        spiegatiDaSoglia.add(soglia)
        continue
      }

      nonSpiegati.push(
        `RAL ${prima.ral}→${dopo.ral} (RC ${prima.rc.toFixed(2)}→${dopo.rc.toFixed(2)}): ` +
          `netto ${prima.netto.toFixed(2)}→${dopo.netto.toFixed(2)}, scarto ${(dopo.netto - prima.netto).toFixed(2)}`,
      )
    }

    expect(nonSpiegati, `gradini senza spiegazione:\n  ${nonSpiegati.join('\n  ')}`).toEqual([])
    expect(gateVisto, 'il gate delle addizionali non si è mai aperto nell’intervallo').toBe(true)
  })
})

/**
 * L'altra metà: le soglie che devono mordere, mordono. Si prova sulla coppia —
 * il valore alla soglia e un centesimo sopra — perché è l'unico modo di
 * distinguere un cliff da una decrescenza ripida.
 */
describe('le soglie dichiarate mordono davvero', () => {
  const ral = (rc: number) => rc / (1 - regime2026.contributi.aliquotaOrdinaria.valore / 100)

  it('la soglia di esenzione comunale di Milano è un cliff, non una franchigia', () => {
    const comune = risolviComune('F205')
    if (comune?.stato !== 'calcolabile' || comune.enti.comunale.stato === 'nonIstituito') {
      throw new Error('Milano dovrebbe avere un’addizionale comunale')
    }
    const soglia = comune.enti.comunale.parametri.sogliaEsenzione
    expect(soglia).not.toBeNull()

    const sotto = leggi(ral(soglia!), 'F205')
    const sopra = leggi(ral(soglia!) + 0.01, 'F205')

    // Sotto non è dovuta; sopra si paga sull'intera base, non sull'eccedenza.
    expect(sopra.netto).toBeLessThan(sotto.netto)
    const salto = sotto.netto - sopra.netto
    expect(salto, `il salto vale ${salto.toFixed(2)} €, atteso l’ordine di grandezza dell’aliquota sull’intera base`).toBeGreaterThan(100)
  })

  it('la soglia regionale della Valle d’Aosta è un cliff (D-057)', () => {
    const comune = risolviComune('A094')
    if (comune?.stato !== 'calcolabile' || comune.enti.regionale.stato === 'nonIstituito') {
      throw new Error('Ayas dovrebbe avere un ente regionale')
    }
    const soglia = comune.enti.regionale.parametri.sogliaEsenzione
    expect(soglia, 'la Valle d’Aosta è l’unico ente con soglia regionale').not.toBeNull()

    const sotto = leggi(ral(soglia!.valore), 'A094')
    const sopra = leggi(ral(soglia!.valore) + 0.01, 'A094')
    expect(sopra.netto).toBeLessThan(sotto.netto)
  })

  /**
   * L'art. 13 c. 6 impone di troncare a quattro decimali il rapporto della
   * detrazione, quindi al confine di una fascia il netto scende davvero di
   * `quota × 10⁻⁴`, circa 19 centesimi. È una discontinuità della norma, non del
   * motore: qualunque caduta più grande è un errore di struttura.
   */
  const quantoTroncamento = (): number => {
    const quote = regime2026.detrazioneLavoroDipendente.fasce.valore.map((f) =>
      f.formula.forma === 'lineare-decrescente' ? f.formula.quota : 0,
    )
    return Math.max(...quote) * 10 ** -regime2026.troncamentoRapportiDetrazione.valore
  }

  /**
   * ⚠️ Gli scaglioni IRPEF non devono produrre nessun gradino, ed è la metà
   * più importante della proprietà. Se un giorno qualcuno implementasse uno
   * scaglione come le fasce del cuneo — percentuale sull'intero reddito invece
   * che sulla parte eccedente — il netto crollerebbe a 28.000 e a 50.000. Il
   * numero resterebbe plausibile, e nient'altro se ne accorgerebbe.
   *
   * L'unica caduta ammessa è il quanto del troncamento: qualunque cosa più
   * grande è un errore di struttura.
   */
  it('i confini di scaglione IRPEF non producono gradini: sono progressivi', () => {
    const quanto = quantoTroncamento()
    for (const scaglione of regime2026.irpef.scaglioni.valore) {
      if (scaglione.a === null) continue
      const sotto = leggi(ral(scaglione.a), 'F205')
      const sopra = leggi(ral(scaglione.a) + 0.01, 'F205')
      expect(
        sotto.netto - sopra.netto,
        `al confine di scaglione RC ${scaglione.a} il netto è sceso di più del troncamento: lo scaglione è applicato all’intero reddito?`,
      ).toBeLessThanOrEqual(quanto)
    }
  })

  /**
   * Stessa forma per la decrescenza della detrazione da cuneo, che è lineare e
   * quindi non deve saltare in nessuno dei due estremi della sua banda.
   */
  it('la decrescenza della detrazione da cuneo è lineare, non a gradini', () => {
    const quanto = quantoTroncamento()
    for (const fascia of regime2026.cuneo.detrazione.fasce.valore) {
      if (fascia.redditoA === null) continue
      const sotto = leggi(ral(fascia.redditoA), 'F205')
      const sopra = leggi(ral(fascia.redditoA) + 0.01, 'F205')
      expect(
        sotto.netto - sopra.netto,
        `al confine RC ${fascia.redditoA} della detrazione da cuneo il netto è sceso di più del troncamento`,
      ).toBeLessThanOrEqual(quanto)
    }
  })
})
