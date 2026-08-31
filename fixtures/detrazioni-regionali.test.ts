/**
 * Le detrazioni regionali legate al solo reddito — i due difetti chiusi il 31/08/2026.
 *
 * ⚠️ **Questo file esiste perché nessuno degli altri poteva vedere questi due
 * difetti, e la ragione è la stessa in entrambi i casi: mancava il caso.**
 *
 * · **Umbria e Lazio.** I casi derivati a mano di *Casi di test* provano
 *   RC 28.000,00 e RC 28.001,00, e su quei due punti la lettura giusta e
 *   quella sbagliata **coincidono**. La divergenza vive tutta nei 99 centesimi
 *   in mezzo, che nessun caso attraversava. Qui si attraversano.
 * · **Bolzano.** La seconda detrazione non era modellata, quindi non c'era
 *   niente da confrontare: `catalogo-reale` percorre i 7.897 comuni ma
 *   verifica invarianti che un'imposta troppo alta non viola, e `ancoraggio`
 *   fissa valori **prodotti dal motore**, cioè quelli sbagliati.
 *
 * Famiglia: **derivati dall'atto**. Gli attesi qui sono calcolati dalle
 * aliquote e dalle formule che gli atti scrivono, non prodotti dal motore. Un
 * fallimento significa *il motore non fa quello che la legge dice*.
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import { valutaFormula } from '../core/calcola'
import { euro } from '../core/types'

/** Tolleranza di D-025. */
const CENT = 0.011

/** Il netto e l'addizionale regionale per una RAL, in un comune. */
const calcola = (ral: number, codiceCatastale: string) => {
  const e = eseguiCalcolo({ ral, codiceCatastale, tipoContratto: 'indeterminato', mensilita: 13 })
  expect(e.stato, `il calcolo per ${codiceCatastale} a RAL ${ral} è fallito`).toBe('ok')
  if (e.stato !== 'ok') throw new Error('irraggiungibile')
  const passo = e.risultato.passi.find((p) => p.id === 'addizionale-regionale')!
  const detrazioni = passo.dettaglio?.find((d) => d.id === 'detrazioni-regionali')
  return {
    rc: e.risultato.grandezze.redditoComplessivo as number,
    regionale: passo.esito.stato === 'applicato' ? (passo.esito.esce as number) : 0,
    /** Quanto la detrazione ha davvero abbattuto: `entra − esce` sul passo annidato. */
    detrazione:
      detrazioni?.esito.stato === 'applicato'
        ? (detrazioni.esito.entra as number) - (detrazioni.esito.esce as number)
        : 0,
    netto: e.risultato.nettoAnnuo as number,
  }
}

/**
 * La RAL che produce un dato reddito complessivo.
 *
 * ⚠️ Due rami, e il secondo non è un dettaglio: oltre la prima fascia
 * pensionabile — 56.224 euro di RAL — si aggiunge l'1% dell'art. 3-ter del
 * DL 384/1992 sulla sola quota eccedente, quindi `RC = RAL × 0,9081` smette di
 * valere. I casi altoatesini di questo file stanno tutti sopra quella soglia:
 * con la formula semplice il reddito reale sarebbe stato più basso di
 * duecentosessanta euro, e gli attesi derivati dall'atto non avrebbero torto
 * loro, avrebbe torto l'input.
 */
const ralPerRc = (rc: number) => {
  const semplice = rc / (1 - 0.0919)
  if (semplice <= 56_224) return semplice
  /* RC = RAL × 0,9081 − 1% × (RAL − 56.224)  ⇒  RAL = (RC − 562,24) / 0,8981 */
  return (rc - 562.24) / 0.8981
}

describe('Umbria e Lazio — l’estremo inferiore della banda è incluso', () => {
  /*
   * L.R. Umbria 11/04/2025 n. 2, art. 1 c. 3: la detrazione di 150 euro spetta
   * a chi ha reddito imponibile «compreso tra 28.001,00 e 50.000,00 euro».
   *
   * Sopra 28.000 le maggiorazioni umbre si riaccendono, quindi l'addizionale
   * lorda si calcola con le aliquote piene e progressive del c. 1:
   *   1,73% × 15.000            = 259,50
   *   3,02% × 13.000            = 392,60
   *   3,12% × (RI − 28.000)
   */
  const lordaUmbria = (rc: number) => 0.0173 * 15_000 + 0.0302 * 13_000 + 0.0312 * (rc - 28_000)

  it.each([
    ['28.000,99 — ultimo centesimo prima della banda', 28_000.99, false],
    ['28.001,00 — primo valore della banda', 28_001.0, true],
  ])('a RC %s la detrazione %s', (_nome, rc, spetta) => {
    const r = calcola(ralPerRc(rc), 'I888')
    expect(r.rc).toBeCloseTo(rc, 2)

    const lorda = lordaUmbria(rc)
    expect(r.detrazione).toBeCloseTo(spetta ? 150 : 0, 2)
    expect(r.regionale).toBeCloseTo(spetta ? lorda - 150 : lorda, 2)
  })

  /*
   * ⚠️ Il gradino ha il verso che sorprende, e va detto: **un euro in più di
   * reddito fa scendere l'addizionale**, perché a 28.001 la detrazione di 150
   * supera i 3,12 centesimi di imposta in più. È una discontinuità vera, non
   * un difetto, e la legge la scrive così.
   */
  it('il salto fra 28.000,99 e 28.001,00 vale esattamente la detrazione', () => {
    const prima = calcola(ralPerRc(28_000.99), 'I888')
    const dopo = calcola(ralPerRc(28_001.0), 'I888')
    /* La lorda cresce di 3,12% × 0,01 = 0,0003, la detrazione toglie 150. */
    expect(prima.regionale - dopo.regionale).toBeCloseTo(150 - 0.0312 * 0.01, 3)
  })

  /*
   * Il difetto che questo file chiude: prima del 31/08/2026 il motore
   * selezionava con estremo inferiore **escluso**, quindi a 28.000,50
   * concedeva 150 euro che la legge non dà.
   */
  it('a RC 28.000,50 la detrazione non spetta — è la micro-fascia che il difetto apriva', () => {
    const r = calcola(ralPerRc(28_000.5), 'I888')
    expect(r.detrazione).toBe(0)
    expect(r.regionale).toBeCloseTo(lordaUmbria(28_000.5), 2)
  })

  /*
   * Il Lazio ha la stessa forma, con 60 euro fra 28.001,00 e 30.000,00
   * (l.r. Lazio 20/2025 art. 2 c. 3). Il comune di prova è Roma, H501.
   */
  it('il Lazio ha la stessa forma, con 60 euro', () => {
    const sotto = calcola(ralPerRc(28_000.99), 'H501')
    const dentro = calcola(ralPerRc(28_001.0), 'H501')
    expect(sotto.detrazione).toBe(0)
    expect(dentro.detrazione).toBeCloseTo(60, 2)
  })
})

describe('Bolzano — la detrazione a formula, e il gradino che annulla', () => {
  /*
   * L.P. Bolzano 11/08/1998 n. 9 art. 21/sexiesdecies: oltre 50.000 euro di
   * imponibile spetta una detrazione pari a 125,00 × (RI − 50.000) / 25.000,
   * con massimo 125,00.
   *
   * ⚠️ **125 è lo 0,50% di 25.000**, cioè il salto di aliquota fra 1,23% e
   * 1,73% moltiplicato per l'ampiezza della banda 50.000–75.000. La detrazione
   * annulla il sovrapprelievo fino a 75.000: la provincia non alza l'aliquota
   * con un gradino, la fa entrare gradualmente.
   */
  const formulaAttesa = (rc: number) => Math.min(125, (125 * (rc - 50_000)) / 25_000)

  it.each([50_000, 55_000, 62_500, 70_000, 75_000, 80_000, 95_000])(
    'a RC %s la detrazione a formula vale quanto la scrive l’atto',
    (rc) => {
      /*
       * La formula si verifica sul motore puro e non end-to-end: sopra i
       * 90.000 la detrazione fissa da 430,50 sparisce, e sommarle renderebbe
       * il caso meno leggibile senza aggiungere copertura.
       */
      const valore = valutaFormula(
        {
          forma: 'lineare-crescente',
          base: euro(0),
          quota: euro(125),
          riferimento: euro(50_000),
          ampiezza: euro(25_000),
          massimo: euro(125),
          espressione: '125,00 × (RI − 50.000) / 25.000, massimo 125,00',
        },
        rc,
      )
      expect(valore).toBeCloseTo(formulaAttesa(rc), 6)
    },
  )

  it('il tetto morde a 75.000 e non oltre', () => {
    const conTetto = (rc: number) =>
      valutaFormula(
        {
          forma: 'lineare-crescente',
          base: euro(0),
          quota: euro(125),
          riferimento: euro(50_000),
          ampiezza: euro(25_000),
          massimo: euro(125),
          espressione: 'x',
        },
        rc,
      )
    expect(conTetto(74_999)).toBeLessThan(125)
    expect(conTetto(75_000)).toBeCloseTo(125, 6)
    expect(conTetto(200_000)).toBeCloseTo(125, 6)
  })

  /*
   * ⚠️ **La variante decrescente non sa esprimere questa forma**, e il test lo
   * fissa perché il registro affermava il contrario: la tabella delle
   * decisioni aperte diceva che bastava «riusare `lineare-decrescente`».
   * Con gli stessi quattro parametri quella variante **decresce**.
   */
  it('la variante decrescente non è la stessa cosa: cresce l’una, cala l’altra', () => {
    const parametri = {
      base: euro(0),
      quota: euro(125),
      riferimento: euro(50_000),
      ampiezza: euro(25_000),
      espressione: 'x',
    }
    const cresce = (rc: number) =>
      valutaFormula({ forma: 'lineare-crescente', ...parametri, massimo: null }, rc)
    const cala = (rc: number) => valutaFormula({ forma: 'lineare-decrescente', ...parametri }, rc)

    expect(cresce(60_000)).toBeGreaterThan(cresce(55_000))
    expect(cala(60_000)).toBeLessThan(cala(55_000))
    /* A parità di parametri sono opposte in segno rispetto al riferimento. */
    expect(cresce(60_000)).toBeCloseTo(-cala(60_000), 6)
  })

  /*
   * End to end su un comune altoatesino vero: la detrazione applicata è la
   * somma delle due, e sotto i 90.000 valgono entrambe.
   */
  it.each([
    ['RC sotto 50.000: solo la detrazione fissa', 45_405, 430.5],
    ['RC 62.500: la formula vale metà del tetto', 62_500, 430.5 + 62.5],
    ['RC 75.000: la formula è al tetto', 75_000, 430.5 + 125],
  ])('San Genesio Atesino — %s', (_nome, rc, atteso) => {
    const r = calcola(ralPerRc(rc), 'H858')
    expect(r.rc).toBeCloseTo(rc, 1)
    expect(r.detrazione).toBeCloseTo(atteso, 1)
  })

  /*
   * ⚠️ Il verso della correzione, misurato: il motore **sovrastimava**
   * l'imposta, quindi il netto mostrato era **più basso** del reale. Correggere
   * lo alza, fino a 125 euro.
   */
  it('la correzione alza il netto, e al massimo di 125 euro', () => {
    const r = calcola(ralPerRc(75_000), 'H858')
    /* Senza la formula la detrazione sarebbe stata la sola fissa da 430,50. */
    expect(r.detrazione - 430.5).toBeCloseTo(125, CENT)
  })
})
