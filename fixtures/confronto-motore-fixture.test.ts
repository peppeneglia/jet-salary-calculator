/**
 * Diagnostico: motore contro fixture, RAL 30.000 a Milano.
 *
 * **Non asserisce e non fallisce mai.** Il fixture è scritto a mano e dichiarato
 * non certificato: una divergenza può stare da entrambe le parti, e decidere
 * quale delle due abbia ragione è lavoro dei casi di test, non di questo file.
 * Qui si stampa soltanto dove i due non coincidono.
 *
 * Vive in `fixtures/` e non in `core/` perché importa `data/` e il fixture, e
 * `core/` non deve dipendere da nessuno dei due — è l'invariante che
 * `core/calcola.test.ts` verifica.
 */

import { test } from 'vitest'

import { calcolaNetto } from '../core/calcola'
import type { Passo, Risultato } from '../core/types'
import { assunzioni } from '../data/assunzioni'
import { lombardia, milano } from '../data/caso-base'
import { regime2026 } from '../data/regime-2026'
import { fixtureRal30000Milano } from './ral-30000-milano'

const TOLLERANZA = 0.01 // D-025

const f = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

interface Voce {
  readonly id: string
  readonly profondita: number
  readonly stato: string
  readonly valori: Readonly<Record<string, number>>
}

const appiattisci = (passi: readonly Passo[], profondita = 0, out: Voce[] = []): Voce[] => {
  for (const p of passi) {
    const valori: Record<string, number> = {}
    if (p.esito.stato === 'applicato') {
      valori.entra = p.esito.entra
      valori.esce = p.esito.esce
      valori.effetto = p.esito.effettoSulNetto
    } else if (p.esito.stato === 'verifica') {
      valori.grandezzaLetta = p.esito.grandezzaLetta
    }
    out.push({ id: p.id, profondita, stato: p.esito.stato, valori })
    if (p.dettaglio) appiattisci(p.dettaglio, profondita + 1, out)
  }
  return out
}

const riga = (titolo: string, righe: readonly string[]): string =>
  righe.length === 0 ? `  ${titolo}: nessuno` : `  ${titolo}:\n${righe.map((r) => `    · ${r}`).join('\n')}`

test('confronto diagnostico fra motore e fixture', () => {
  const calcolato: Risultato = calcolaNetto(
    fixtureRal30000Milano.input,
    regime2026,
    { regionale: lombardia, comunale: milano },
    assunzioni,
  )

  const atteso = appiattisci(fixtureRal30000Milano.passi)
  const ottenuto = appiattisci(calcolato.passi)

  const idAttesi = atteso.map((v) => v.id)
  const idOttenuti = ottenuto.map((v) => v.id)

  const soloFixture = idAttesi.filter((id) => !idOttenuti.includes(id))
  const soloMotore = idOttenuti.filter((id) => !idAttesi.includes(id))

  const comuni = idAttesi.filter((id) => idOttenuti.includes(id))
  const ordineDiverso = comuni.filter(
    (id, i) => comuni.filter((x) => idOttenuti.includes(x)).indexOf(id) !== i,
  )

  const statiDiversi: string[] = []
  const numeriDiversi: string[] = []

  for (const id of comuni) {
    const a = atteso.find((v) => v.id === id)!
    const b = ottenuto.find((v) => v.id === id)!

    if (a.stato !== b.stato) statiDiversi.push(`${id}: fixture "${a.stato}", motore "${b.stato}"`)

    for (const campo of new Set([...Object.keys(a.valori), ...Object.keys(b.valori)])) {
      const va = a.valori[campo]
      const vb = b.valori[campo]
      if (va === undefined || vb === undefined) continue
      const delta = vb - va
      if (Math.abs(delta) > TOLLERANZA) {
        numeriDiversi.push(`${id}.${campo}: fixture ${f.format(va)}, motore ${f.format(vb)} (Δ ${f.format(delta)})`)
      }
    }
  }

  // Ordine dei passi di primo livello, che è quello che la pagina scorre.
  const primoLivelloFixture = fixtureRal30000Milano.passi.map((p) => p.id)
  const primoLivelloMotore = calcolato.passi.map((p) => p.id)
  const ordineTop =
    primoLivelloFixture.join('|') === primoLivelloMotore.join('|')
      ? []
      : [`fixture: ${primoLivelloFixture.join(' → ')}`, `motore:  ${primoLivelloMotore.join(' → ')}`]

  const totali: string[] = []
  const deltaNetto = calcolato.nettoAnnuo - fixtureRal30000Milano.nettoAnnuo
  if (Math.abs(deltaNetto) > TOLLERANZA) {
    totali.push(
      `nettoAnnuo: fixture ${f.format(fixtureRal30000Milano.nettoAnnuo)}, motore ${f.format(calcolato.nettoAnnuo)} (Δ ${f.format(deltaNetto)})`,
    )
  }
  for (const m of [12, 13, 14] as const) {
    const delta = calcolato.nettoMensile[m] - fixtureRal30000Milano.nettoMensile[m]
    if (Math.abs(delta) > TOLLERANZA) {
      totali.push(
        `nettoMensile[${m}]: fixture ${f.format(fixtureRal30000Milano.nettoMensile[m])}, motore ${f.format(calcolato.nettoMensile[m])} (Δ ${f.format(delta)})`,
      )
    }
  }

  const scarti: string[] = []
  if (Math.abs(deltaNetto) <= TOLLERANZA && Math.abs(deltaNetto) > 0) {
    scarti.push(`netto annuo entro tolleranza: Δ ${f.format(deltaNetto)}`)
  }

  // Scritto su stderr: il reporter di default di vitest non stampa
  // console.log dei test che passano, e un diagnostico muto è inutile.
  process.stderr.write(
    [
      '',
      `Confronto motore ↔ fixture — RAL ${f.format(fixtureRal30000Milano.input.ral)}, ${milano.nome}, tolleranza ${TOLLERANZA}`,
      `  netto annuo — fixture ${f.format(fixtureRal30000Milano.nettoAnnuo)} · motore ${f.format(calcolato.nettoAnnuo)}`,
      riga('passi solo nel fixture', soloFixture),
      riga('passi solo nel motore', soloMotore),
      riga('ordine dei passi di primo livello', ordineTop),
      riga('passi con esito diverso', statiDiversi),
      riga('valori oltre tolleranza', numeriDiversi),
      riga('totali oltre tolleranza', totali),
      riga('scostamenti entro tolleranza', scarti),
      ordineDiverso.length > 0 ? riga('passi in posizione diversa', ordineDiverso) : '',
      '',
    ]
      .filter(Boolean)
      .join('\n'),
  )
})
