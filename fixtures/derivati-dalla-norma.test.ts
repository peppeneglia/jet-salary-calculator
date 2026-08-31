/**
 * I quattro casi derivati dalla norma — verifica di correttezza, non regressione.
 *
 * ⚠️ Questa è l'altra famiglia di test, e la differenza è tutta qui.
 *
 * `ancoraggio.test.ts`, `discontinuita.test.ts` e `catalogo-reale.test.ts` hanno
 * valori attesi **prodotti dal motore stesso**: sono regressione, dicono «nulla
 * si è mosso in silenzio». Se il motore fosse sbagliato, sarebbero verdi lo
 * stesso.
 *
 * I valori attesi di questo file **non li ha prodotti il motore**. Li ha
 * derivati a mano dagli articoli una sessione senza accesso a questo codice,
 * partendo solo dai testi normativi e dai due dataset MEF, e sono trascritti
 * dalla pagina *Casi di test* in Notion. Un fallimento qui non significa «un
 * numero si è mosso»: significa **il motore non fa quello che la legge dice** —
 * oppure la derivazione ha letto male, e va deciso quale delle due, mai
 * riallineando il valore atteso.
 *
 * I casi sono ancorati al **reddito complessivo**, non alla RAL — D-075 —
 * perché lì stanno le soglie e perché l'aliquota IVS non era fra le fonti di
 * quella sessione. Vale l'identità che rende il confronto possibile: i contributi
 * sono esclusi dal reddito (art. 51 c. 2 lett. a TUIR), quindi
 * RC = RAL − contributi, e
 *
 *     netto = RC − IRPEF netta − addizionali + voci che aggiungono
 *
 * dove l'aliquota contributiva si semplifica. La RAL immessa è ricostruita
 * dividendo, e il test **asserisce il RC prima del netto**: vedi la nota sulla
 * fragilità del caso 1.
 *
 * Esito del primo confronto (31/08/2026): quattro casi e quattro gemelli,
 * tutti entro la tolleranza di D-025. Nessuna divergenza.
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import type { Passo, Risultato } from '../core/types'
import { regime2026 } from '../data/regime-2026'

/** D-025: uno scarto maggiore è un bug di calcolo, non di arrotondamento. */
const TOLLERANZA = 0.01

/**
 * Quanto stretto deve tornare il RC ricostruito. Non è una tolleranza di
 * calcolo: è la verifica che la divisione abbia riportato al punto giusto.
 */
const TOLLERANZA_RC = 1e-6

/**
 * L'aliquota si legge dal regime, non si riscrive qui: due copie dello stesso
 * numero divergono in silenzio, ed è la ragione per cui `data/` esiste.
 *
 * ⚠️ È anche il parametro che la sessione della derivazione ha dichiarato
 * mancante: non sta in `./fonti/`. Il motore lo prende da INPS circ. 40/2011.
 * Il confronto non ne dipende — i valori attesi sono su RC — ma la RAL da
 * immettere sì.
 */
const ALIQUOTA_IVS: number = regime2026.contributi.aliquotaOrdinaria.valore

const ralCheProduce = (redditoComplessivo: number): number =>
  redditoComplessivo / (1 - ALIQUOTA_IVS / 100)

const calcola = (redditoComplessivo: number, codiceCatastale: string): Risultato => {
  const esito = eseguiCalcolo({
    ral: ralCheProduce(redditoComplessivo),
    codiceCatastale,
    tipoContratto: 'indeterminato',
    mensilita: 12,
  })
  if (esito.stato !== 'ok') {
    throw new Error(`${codiceCatastale} a RC ${redditoComplessivo}: ${esito.errore.codice}`)
  }
  return esito.risultato
}

const trova = (passi: readonly Passo[], id: string): Passo => {
  for (const p of passi) {
    if (p.id === id) return p
    if (p.dettaglio) {
      const dentro = p.dettaglio.find((x) => x.id === id) ?? trovaOpzionale(p.dettaglio, id)
      if (dentro) return dentro
    }
  }
  throw new Error(`passo «${id}» assente dalla traccia`)
}

const trovaOpzionale = (passi: readonly Passo[], id: string): Passo | undefined => {
  for (const p of passi) {
    if (p.id === id) return p
    if (p.dettaglio) {
      const dentro = trovaOpzionale(p.dettaglio, id)
      if (dentro) return dentro
    }
  }
  return undefined
}

/** Il valore in uscita da un passo applicato; `null` se il passo non è dovuto. */
const uscita = (r: Risultato, id: string): number | null => {
  const esito = trova(r.passi, id).esito
  if (esito.stato === 'nonDovuto') return null
  if (esito.stato !== 'applicato') throw new Error(`passo «${id}» non è un passo applicato`)
  return esito.esce
}

const gateAperto = (r: Risultato): boolean => {
  const esito = trova(r.passi, 'gate-addizionali').esito
  if (esito.stato !== 'verifica') throw new Error('il gate non è un passo di verifica')
  return esito.superata
}

const nonDovuto = (r: Risultato, id: string): boolean =>
  trova(r.passi, id).esito.stato === 'nonDovuto'

/**
 * Confronta un valore atteso che può essere un importo o l'assenza del tributo.
 * `null` significa *non dovuto*, che è una cosa diversa da zero: il gate delle
 * addizionali è binario, e un motore che rendesse «non dovuta» come 0,00
 * passerebbe un test scritto con lo zero.
 */
const atteso = (ottenuto: number | null, valore: number | null, cosa: string): void => {
  if (valore === null) {
    expect(ottenuto, `${cosa}: atteso NON DOVUTO`).toBeNull()
    return
  }
  expect(ottenuto, `${cosa}: atteso ${valore}`).not.toBeNull()
  expect(Math.abs((ottenuto as number) - valore), `${cosa}: atteso ${valore}, ottenuto ${ottenuto}`).toBeLessThanOrEqual(TOLLERANZA)
}

interface Atteso {
  readonly irpefLorda: number
  /** Detrazione dell'art. 13, incremento del c. 1.1 già incluso. */
  readonly detrazioneArt13: number
  /** Totale delle detrazioni dopo il cuneo: è la catena del blocco IRPEF. */
  readonly detrazioniCumulate: number
  readonly irpefNetta: number
  readonly addizionaleRegionale: number | null
  readonly addizionaleComunale: number | null
  readonly netto: number
}

interface CasoDerivato {
  readonly n: number
  readonly nome: string
  readonly codiceCatastale: string
  readonly redditoComplessivo: number
  readonly atteso: Atteso
}

/*
 * ---------------------------------------------------------------------------
 * I quattro casi.
 *
 * Ogni riga porta accanto l'articolo da cui la derivazione l'ha ricavata.
 * Anno d'imposta 2026, lavoro dipendente per l'intero anno, nessun carico di
 * famiglia, nessun onere deducibile, nessun altro reddito.
 * ---------------------------------------------------------------------------
 */

const CASI: readonly CasoDerivato[] = [
  /*
   * CASO 1 — Gignese (VB), Regione Piemonte, RC 50.000,00
   *
   * Verifica quattro discontinuità sullo stesso punto: la soglia di esenzione
   * comunale presa al suo valore esatto, la fine del secondo scaglione IRPEF,
   * l'azzeramento della detrazione dell'art. 13 con il suo pavimento, il
   * confine fra terza e quarta fascia dell'addizionale regionale.
   *
   *   IRPEF lorda   23% × 28.000 = 6.440,00        art. 11 c. 1 lett. a) TUIR
   *                 33% × 22.000 = 7.260,00        art. 11 c. 1 lett. b) TUIR,
   *                                                come sost. da L. 199/2025 art. 1 c. 3
   *                 = 13.700,00
   *   detr. art. 13 1.910 × (50.000 − 50.000)/22.000 = 0,00
   *                                                art. 13 c. 1 lett. c) e c. 6 TUIR
   *                 il rapporto non è maggiore di zero: il c. 6 non lo tronca
   *                 e la detrazione non diventa negativa
   *   c. 1.1        non spetta, RC oltre 35.000     art. 13 c. 1.1 TUIR
   *   detr. cuneo   non spetta, RC oltre 40.000     L. 207/2024 art. 1 c. 6
   *   IRPEF netta   13.700,00                       art. 11 c. 3 TUIR
   *   gate          netta 13.700,00 > 0: aperto     art. 50 c. 2 D.Lgs. 446/1997
   *                                                 art. 1 c. 4 D.Lgs. 360/1998
   *   add. reg.     progressiva su scaglioni previgenti (L. 207/2024 art. 1 c. 727,
   *                 prorogato da L. 199/2025 art. 1 c. 649):
   *                 1,62% × 15.000 = 243,00
   *                 2,68% × 13.000 = 348,40
   *                 3,31% × 22.000 = 728,20  →  1.319,60   prov. MEF 2187/2026
   *                 le detrazioni piemontesi sono per carichi di famiglia: fuori perimetro
   *   add. com.     esenzione «fino a euro 50.000,00», base 50.000,00: NON DOVUTA
   *                                                art. 1 c. 3-bis D.Lgs. 360/1998
   *   somma cuneo   non spetta, RC oltre 20.000     L. 207/2024 art. 1 c. 4
   *   netto         50.000,00 − 13.700,00 − 1.319,60 = 34.980,40
   */
  {
    n: 1,
    nome: 'Gignese (VB) — Piemonte, soglia di esenzione comunale al suo valore esatto',
    codiceCatastale: 'E028',
    redditoComplessivo: 50_000.0,
    atteso: {
      irpefLorda: 13_700.0,
      detrazioneArt13: 0.0,
      detrazioniCumulate: 0.0,
      irpefNetta: 13_700.0,
      addizionaleRegionale: 1_319.6,
      addizionaleComunale: null,
      netto: 34_980.4,
    },
  },

  /*
   * CASO 2 — Isera (TN), Provincia autonoma di Trento, RC 30.000,00
   *
   * Verifica la deduzione trentina — l'unico istituto del ramo locale che morde
   * sulla base e non sull'aliquota — l'ente impositore che è una provincia
   * autonoma e non una regione, e il troncamento alla quarta cifra decimale su
   * un rapporto periodico.
   *
   *   IRPEF lorda   23% × 28.000 = 6.440,00        art. 11 c. 1 lett. a) TUIR
   *                 33% ×  2.000 =   660,00        art. 11 c. 1 lett. b) TUIR
   *                 = 7.100,00
   *   detr. art. 13 rapporto (50.000 − 30.000)/22.000 = 0,909090909…
   *                 troncato alle prime quattro cifre = 0,9090
   *                 1.910 × 0,9090 = 1.736,19       art. 13 c. 1 lett. c) e c. 6 TUIR
   *                 arrotondando a 0,9091 verrebbe 1.736,38: la differenza è
   *                 la prova che il troncamento è applicato
   *   c. 1.1        RC fra 25.000 e 35.000: +65,00  art. 13 c. 1.1 TUIR
   *                 → 1.801,19
   *   detr. cuneo   RC fra 20.000 e 32.000: 1.000,00 fissi
   *                                                L. 207/2024 art. 1 c. 6 lett. a)
   *                 → detrazioni 2.801,19
   *   IRPEF netta   7.100,00 − 2.801,19 = 4.298,81  art. 11 c. 3 TUIR
   *   add. reg.     deduzione di 30.000 a chi ha imponibile non superiore a
   *                 30.000: base 30.000 − 30.000 = 0  →  0,00
   *                                                prov. MEF 2172/2026;
   *                                                L.P. Trento 13/2019 art. 1 c. 2-quater
   *   add. com.     esenzione 15.000 superata; scaglioni progressivi
   *                 0,33% × 28.000 = 92,40
   *                 0,40% ×  2.000 =  8,00  →  100,40      delibera 44/2025
   *   netto         30.000,00 − 4.298,81 − 0,00 − 100,40 = 25.600,79
   */
  {
    n: 2,
    nome: 'Isera (TN) — Provincia autonoma di Trento, deduzione locale e troncamento',
    codiceCatastale: 'E334',
    redditoComplessivo: 30_000.0,
    atteso: {
      irpefLorda: 7_100.0,
      detrazioneArt13: 1_801.19,
      detrazioniCumulate: 2_801.19,
      irpefNetta: 4_298.81,
      addizionaleRegionale: 0.0,
      addizionaleComunale: 100.4,
      netto: 25_600.79,
    },
  },

  /*
   * CASO 3 — Spello (PG), Regione Umbria, RC 28.001,00
   *
   * Verifica l'ente con detrazione propria legata al solo reddito, le
   * maggiorazioni regionali che si accendono un euro sopra la soglia, e il
   * raccordo fra lett. b) e lett. c) dell'art. 13, che deve risultare continuo.
   *
   *   IRPEF lorda   23% × 28.000 = 6.440,00        art. 11 c. 1 lett. a) TUIR
   *                 33% ×      1 =     0,33        art. 11 c. 1 lett. b) TUIR
   *                 = 6.440,33
   *   detr. art. 13 superato 28.000 si passa da lett. b) a lett. c)
   *                 rapporto 21.999/22.000 = 0,999954545… troncato = 0,9999
   *                 1.910 × 0,9999 = 1.909,81       art. 13 c. 1 lett. c) e c. 6 TUIR
   *                 continuità verificata a 28.000: lett. b) dà 1.910 + 1.190 × 0 = 1.910,00
   *                 e lett. c) dà 1.910 × 1 = 1.910,00 — un salto qui sarebbe un bug
   *   c. 1.1        +65,00  →  1.974,81             art. 13 c. 1.1 TUIR
   *   detr. cuneo   1.000,00  →  detrazioni 2.974,81
   *                                                L. 207/2024 art. 1 c. 6 lett. a)
   *   IRPEF netta   6.440,33 − 2.974,81 = 3.465,52  art. 11 c. 3 TUIR
   *   add. reg.     imponibile 28.001 oltre 28.000: le maggiorazioni di 0,50 e
   *                 1,79 punti si applicano, quindi aliquote piene, progressive
   *                 1,73% × 15.000 = 259,50
   *                 3,02% × 13.000 = 392,60
   *                 3,12% ×      1 =   0,03  →  652,13     prov. MEF 2168/2026;
   *                                                        L.R. Umbria 2/2025 art. 1 c. 1
   *                 detrazione dell'ente 150,00 per imponibile fra 28.001 e 50.000
   *                 — 28.001 è il primo valore della banda  →  502,13
   *                 pavimento a zero: non genera credito
   *   add. com.     esenzione 12.000 superata; scaglioni progressivi
   *                 0,75% × 28.000 = 210,00
   *                 0,78% ×      1 =   0,01  →  210,01     delibera 80/2025
   *   netto         28.001,00 − 3.465,52 − 502,13 − 210,01 = 23.823,34
   *
   * ⚠️ È il caso su cui morde la lacuna dichiarata dalla derivazione: il
   * D.L. 3/2020 non era fra le sue fonti, e 28.001 sta un euro sopra il
   * confine che quell'atto definirebbe per il trattamento integrativo. Il
   * motore lo nega perché il RC supera 15.000, cioè applicando il solo primo
   * periodo dell'art. 1 c. 1. Stesso esito, prova diversa: il secondo periodo
   * (RC 15.000–28.000) non è coperto da nessun caso di questa famiglia.
   */
  {
    n: 3,
    nome: 'Spello (PG) — Umbria, detrazione dell’ente e maggiorazioni che si accendono',
    codiceCatastale: 'I888',
    redditoComplessivo: 28_001.0,
    atteso: {
      irpefLorda: 6_440.33,
      detrazioneArt13: 1_974.81,
      detrazioniCumulate: 2_974.81,
      irpefNetta: 3_465.52,
      addizionaleRegionale: 502.13,
      addizionaleComunale: 210.01,
      netto: 23_823.34,
    },
  },

  /*
   * CASO 4 — Fiume Veneto (PN), Regione Friuli Venezia Giulia, RC 35.000,00
   *
   * Verifica la forma dell'aliquota regionale: fascia intera, non progressiva.
   * È il caso che un motore progressivo sbaglia in silenzio — leggendo le
   * quattro righe del dataset come scaglioni verrebbe 0,70% × 15.000 +
   * 1,23% × 20.000 = 351,00 invece di 430,50, e il netto salirebbe a 27.628,74:
   * 79,50 € di errore in un numero che resta perfettamente plausibile.
   *
   *   IRPEF lorda   23% × 28.000 = 6.440,00        art. 11 c. 1 lett. a) TUIR
   *                 33% ×  7.000 = 2.310,00        art. 11 c. 1 lett. b) TUIR
   *                 = 8.750,00
   *   detr. art. 13 rapporto 15.000/22.000 = 0,681818181… troncato = 0,6818
   *                 1.910 × 0,6818 = 1.302,24       art. 13 c. 1 lett. c) e c. 6 TUIR
   *   c. 1.1        «superiore a 25.000 ma non a 35.000»: a 35.000,00 esatti la
   *                 condizione è ancora soddisfatta, +65,00  →  1.367,24
   *                                                art. 13 c. 1.1 TUIR
   *   detr. cuneo   RC fra 32.000 e 40.000, formula decrescente:
   *                 1.000 × (40.000 − 35.000)/8.000 = 1.000 × 0,625 = 625,00
   *                                                L. 207/2024 art. 1 c. 6 lett. b)
   *                 il troncamento dell'art. 13 c. 6 non si applica qui: quel
   *                 comma richiama i rapporti dei commi 1, 3, 4 e 5 dell'art. 13
   *                 → detrazioni 1.992,24
   *   IRPEF netta   8.750,00 − 1.992,24 = 6.757,76  art. 11 c. 3 TUIR
   *   add. reg.     «Per reddito imponibile superiore a euro 15.000 l'aliquota
   *                 è pari a 1,23 per cento sull'intero importo»
   *                 1,23% × 35.000 = 430,50         prov. MEF 2169/2026;
   *                                                 L.R. FVG 14/2012 art. 1 c. 5
   *   add. com.     esenzione 25.000: c'è, è stata verificata e non scatta
   *                 aliquota unica 0,75% × 35.000 = 262,50     delibera 56/2025
   *   netto         35.000,00 − 6.757,76 − 430,50 − 262,50 = 27.549,24
   */
  {
    n: 4,
    nome: 'Fiume Veneto (PN) — Friuli Venezia Giulia, aliquota su fascia intera',
    codiceCatastale: 'D621',
    redditoComplessivo: 35_000.0,
    atteso: {
      irpefLorda: 8_750.0,
      detrazioneArt13: 1_367.24,
      detrazioniCumulate: 1_992.24,
      irpefNetta: 6_757.76,
      addizionaleRegionale: 430.5,
      addizionaleComunale: 262.5,
      netto: 27_549.24,
    },
  },
]

describe('i quattro casi derivati dalla norma', () => {
  it.each(CASI)('caso $n — $nome', ({ codiceCatastale, redditoComplessivo, atteso: a }) => {
    const r = calcola(redditoComplessivo, codiceCatastale)

    /*
     * ⚠️ Il RC si asserisce per primo, e non è una formalità.
     *
     * I casi stanno sulle soglie, e il caso 1 sta *esattamente* su una:
     * l'esenzione di Gignese vale «fino a euro 50.000,00». La RAL si ottiene
     * dividendo, quindi il RC ricostruito passa per la virgola mobile. Se
     * atterrasse una frazione di centesimo sopra il bersaglio, l'esenzione si
     * spegnerebbe e comparirebbero 400,00 € dal nulla. Asserendo qui, il test
     * dice *dove* è il problema invece di mostrare uno scarto misterioso in
     * fondo.
     */
    expect(
      Math.abs(r.grandezze.redditoComplessivo - redditoComplessivo),
      `il RC ricostruito dalla RAL non torna: ${r.grandezze.redditoComplessivo}`,
    ).toBeLessThan(TOLLERANZA_RC)

    atteso(uscita(r, 'irpef-lorda'), a.irpefLorda, 'IRPEF lorda')
    atteso(uscita(r, 'detrazione-art-13'), a.detrazioneArt13, 'detrazione art. 13')
    atteso(uscita(r, 'detrazione-cuneo'), a.detrazioniCumulate, 'detrazioni cumulate')
    atteso(uscita(r, 'irpef-netta'), a.irpefNetta, 'IRPEF netta')

    expect(gateAperto(r), 'il presupposto delle addizionali').toBe(true)

    atteso(uscita(r, 'addizionale-regionale'), a.addizionaleRegionale, 'addizionale regionale')
    atteso(uscita(r, 'addizionale-comunale'), a.addizionaleComunale, 'addizionale comunale')

    // Voci che aggiungono: nessuna delle due spetta sopra i 28.000 di RC.
    expect(nonDovuto(r, 'somma-cuneo'), 'la somma del cuneo').toBe(true)
    expect(nonDovuto(r, 'trattamento-integrativo'), 'il trattamento integrativo').toBe(true)

    atteso(r.nettoAnnuo, a.netto, 'netto annuo')
  })
})

/*
 * ---------------------------------------------------------------------------
 * I gemelli.
 *
 * Un caso su una soglia prova metà di quello che dovrebbe: la derivazione porta
 * anche il valore atteso dall'altro lato, a un centesimo o a un euro di
 * distanza. Ogni gemello dichiara la voce che si muove, così un fallimento dice
 * quale istituto ha smesso di funzionare e non solo che il totale è cambiato.
 * ---------------------------------------------------------------------------
 */

interface Gemello {
  readonly n: number
  readonly nome: string
  readonly codiceCatastale: string
  readonly redditoComplessivo: number
  /** Il passo che cambia rispetto al caso, e il valore che deve assumere. */
  readonly passo: string
  readonly valore: number | null
  readonly netto: number
  /** Quanto si sposta il netto rispetto al caso, e perché. */
  readonly variazione: number
}

const GEMELLI: readonly Gemello[] = [
  /*
   * Caso 1 a RC 50.000,01 — la soglia di esenzione comunale è superata e
   * l'addizionale è dovuta sull'INTERA base, non sull'eccedenza: è un gradino,
   * non una franchigia (art. 1 c. 3-bis D.Lgs. 360/1998).
   * 0,8% × 50.000,01 = 400,00 — un centesimo di reddito costa 399,99 €.
   */
  {
    n: 1,
    nome: 'Gignese a RC 50.000,01 — la comunale si accende sull’intera base',
    codiceCatastale: 'E028',
    redditoComplessivo: 50_000.01,
    passo: 'addizionale-comunale',
    valore: 400.0,
    netto: 34_580.41,
    variazione: -399.99,
  },
  /*
   * Caso 2 a RC 30.000,01 — la deduzione trentina non spetta più: la
   * disposizione lo dice espressamente. Base da 0,00 a 30.000,01,
   * 1,23% × 30.000,01 = 369,00. Gradino di base, non di aliquota.
   */
  {
    n: 2,
    nome: 'Isera a RC 30.000,01 — la deduzione trentina smette di spettare',
    codiceCatastale: 'E334',
    redditoComplessivo: 30_000.01,
    passo: 'addizionale-regionale',
    valore: 369.0,
    netto: 25_231.8,
    variazione: -368.99,
  },
  /*
   * Caso 3 a RC 28.000,00 — le maggiorazioni umbre non si applicano: entrambe
   * le aliquote scendono a 1,23% (1,73 − 0,50 e 3,02 − 1,79) e la detrazione
   * di 150 non spetta perché la banda comincia a 28.001.
   * 1,23% × 28.000 = 344,40. Un euro di reddito in più ne toglie 157,26 di netto.
   */
  {
    n: 3,
    nome: 'Spello a RC 28.000,00 — maggiorazioni disapplicate e detrazione non ancora dovuta',
    codiceCatastale: 'I888',
    redditoComplessivo: 28_000.0,
    passo: 'addizionale-regionale',
    valore: 344.4,
    netto: 23_980.6,
    variazione: 157.26,
  },
  /*
   * Caso 4 a RC 35.000,01 — si spegne l'incremento di 65 € dell'art. 13 c. 1.1,
   * che è un cliff: la detrazione torna alla sola lett. c), 1.302,24.
   * Il gradino arriva sul netto quasi intero, 64,99 €.
   */
  {
    n: 4,
    nome: 'Fiume Veneto a RC 35.000,01 — si spegne l’incremento di 65 € del c. 1.1',
    codiceCatastale: 'D621',
    redditoComplessivo: 35_000.01,
    passo: 'detrazione-art-13',
    valore: 1_302.24,
    netto: 27_484.24,
    variazione: -64.99,
  },
]

describe('i gemelli dall’altro lato della soglia', () => {
  it.each(GEMELLI)('caso $n — $nome', ({ n, codiceCatastale, redditoComplessivo, passo, valore, netto, variazione }) => {
    const r = calcola(redditoComplessivo, codiceCatastale)

    expect(
      Math.abs(r.grandezze.redditoComplessivo - redditoComplessivo),
      `il RC ricostruito dalla RAL non torna: ${r.grandezze.redditoComplessivo}`,
    ).toBeLessThan(TOLLERANZA_RC)

    atteso(uscita(r, passo), valore, `${passo} del gemello`)
    atteso(r.nettoAnnuo, netto, 'netto annuo del gemello')

    /*
     * La variazione è la ragione per cui il gemello esiste: il gradino deve
     * esserci, con il segno giusto e la misura giusta. Verificarla contro il
     * caso rende il test una coppia, non due punti scollegati.
     *
     * ⚠️ Il limite è il doppio della tolleranza, e non per larghezza.
     * Qui si confrontano due valori **già arrotondati al centesimo**, quindi
     * la loro differenza porta il resto di entrambi. Il caso 4 lo mostra:
     * la derivazione dichiara un gradino di 64,99 € — che è il valore esatto,
     * 27.549,238 − 27.484,2433 — mentre i due netti presentati, 27.549,24 e
     * 27.484,24, ne dicono 65,00. Nessuno dei due è sbagliato: sono la stessa
     * quantità letta a precisioni diverse.
     */
    const caso = CASI.find((c) => c.n === n)
    if (!caso) throw new Error(`nessun caso ${n} a cui appaiare il gemello`)
    expect(
      Math.abs(netto - caso.atteso.netto - variazione),
      `il gradino atteso è ${variazione}, i due netti attesi ne dicono ${netto - caso.atteso.netto}`,
    ).toBeLessThanOrEqual(2 * TOLLERANZA)
  })
})
