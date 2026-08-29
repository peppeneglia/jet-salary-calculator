/**
 * Test a prova di regressione sul motore.
 *
 * ⚠️ I parametri usati qui sono **sintetici**, scelti tondi e diversi da quelli
 * reali proprio perché nessuno li scambi per parametri normativi: `core/` non
 * deve contenerne, nemmeno nei test. Questi casi verificano **invarianti di
 * struttura**, non numeri di legge — i valori attesi derivati dalla norma sono
 * lavoro dei casi di test, che si costruiscono sulle discontinuità.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

import { calcolaNetto } from './calcola'
import {
  aliquota,
  annoImposta,
  euro,
  type AssunzioneDichiarata,
  type EnteRisolto,
  type EntiRisolti,
  type Fonte,
  type FontiRegola,
  type Input,
  type Lingua,
  type Mensilita,
  type ParametriComunali,
  type ParametriRegionali,
  type Regime,
} from './types'

// ---------------------------------------------------------------------------
// Regime sintetico
// ---------------------------------------------------------------------------

const fonte: Fonte = {
  atto: 'Regime sintetico di test — nessun valore reale',
  consultataIl: '2026-01-01',
  provenienza: 'verificata',
}

// Scritta per esteso e non generata: se `IdRegola` acquista una voce, questo
// oggetto smette di compilare — che è il punto del `Record` pieno.
const fontiRegola: FontiRegola = {
  'base-contributiva': [fonte],
  'aliquota-ivs': [fonte],
  'quota-aggiuntiva': [fonte],
  'esclusione-contributi-dal-reddito': [fonte],
  'scaglioni-irpef': [fonte],
  'detrazione-lavoro-dipendente': [fonte],
  'troncamento-rapporti': [fonte],
  'detrazione-cuneo': [fonte],
  'pavimento-imposta-netta': [fonte],
  'gate-addizionali': [fonte],
  'soglia-esenzione-comunale': [fonte],
  'somma-cuneo': [fonte],
  'trattamento-integrativo': [fonte],
}

// ---------------------------------------------------------------------------
// Lingua sintetica
//
// ⚠️ Scritta per esteso e **non importata da `data/`**: `core/` non conosce i
// livelli sopra di sé, e la suite che gira in questo file lo verifica su sé
// stessa. Vale qui la stessa regola dei parametri: i testi reali stanno in
// `data/testi.ts`, questi sono sintetici e non vanno scambiati per quelli.
//
// La tabella è un `Record` pieno, quindi una voce aggiunta a `IdTesto` senza
// il suo testo **non compila** — che è il punto del `Record` pieno, e vale per
// i testi come vale per `FontiRegola`.
//
// Le frasi sono minime tranne dove un test le legge: quelle portano le parole
// che il test cerca, perché è l'unico modo in cui l'asserzione dice qualcosa.
// ---------------------------------------------------------------------------

const lingua: Lingua = {
  codice: 'it',
  tag: 'it-IT',
  testi: {
    'regionale.regola.esente': 'Soglia di esenzione deliberata dall’ente.',
    'regionale.spiegazione.esente': 'Sotto la soglia l’addizionale regionale non è dovuta.',
    'regionale.ragione.esente':
      'Il reddito complessivo ({rc}) non supera la soglia di esenzione di {soglia} deliberata da {ente}.',
    'soglia-esenzione-regionale.regola': 'Soglia deliberata dall’ente impositore.',
    'ral.etichetta': 'RAL',
    'ral.regola': 'Punto di partenza.',
    'ral.spiegazione': 'La RAL comprende le mensilità aggiuntive.',
    'contributi.etichetta': 'Contributi',
    'contributi.regola': 'Aliquota a carico del lavoratore.',
    'contributi.spiegazione.ordinaria': 'Contribuzione, non imposta.',
    'contributi.spiegazione.apprendista': 'Aliquota ridotta per l’apprendista.',
    'base-contributiva.etichetta': 'Base contributiva',
    'base-contributiva.regola': 'Somme al lordo di ogni trattenuta.',
    'base-contributiva.spiegazione': 'Coincide con la RAL nel caso standard.',
    'quota.etichetta': 'Quota aggiuntiva',
    'quota.regola.regime': 'Un punto sulle quote eccedenti, per i regimi sotto il limite.',
    'quota.regola': 'Un punto sulle quote eccedenti la prima fascia.',
    'quota.spiegazione.regime': 'Il presupposto è del regime, non del lavoratore.',
    'quota.ragione.regime': 'Aliquota ordinaria {aliquotaOrdinaria}, limite {limite}.',
    'quota.spiegazione.sotto-soglia': 'Sotto la prima fascia non si applica.',
    'quota.ragione.sotto-soglia': 'Retribuzione {retribuzione}, prima fascia {soglia}.',
    'quota.spiegazione.applicata': 'Solo sulla parte oltre {soglia}.',
    'reddito-complessivo.etichetta': 'Reddito complessivo',
    'reddito-complessivo.regola': 'I contributi non concorrono a formare il reddito.',
    'reddito-complessivo.spiegazione': 'Il reddito nasce già al netto dei contributi.',
    'irpef-lorda.etichetta': 'IRPEF lorda',
    'irpef-lorda.regola': 'Aliquote per scaglioni.',
    'irpef-lorda.spiegazione': 'Ogni scaglione alla propria aliquota.',
    'detrazione.etichetta': 'Detrazione per lavoro dipendente',
    'detrazione.regola': 'Detrazione a tratti sul reddito complessivo.',
    'detrazione.spiegazione': 'Uno sconto sull’imposta, non una trattenuta.',
    'detrazione-incremento.etichetta': 'Incremento fascia {da}–{a}',
    'detrazione-incremento.regola': 'La detrazione del comma 1 è aumentata.',
    'detrazione-incremento.spiegazione': 'Un gradino, non una curva.',
    'detrazione-cuneo.etichetta': 'Ulteriore detrazione',
    'detrazione-cuneo.regola': 'Ulteriore detrazione dall’imposta lorda.',
    'detrazione-cuneo.spiegazione': 'La seconda gamba del taglio del cuneo.',
    'irpef-netta.etichetta': 'IRPEF netta',
    'irpef-netta.regola': 'Detrazioni fino alla concorrenza dell’imposta.',
    'irpef-netta.spiegazione.capiente': 'Qui la capienza c’è.',
    'irpef-netta.spiegazione.incapiente': 'L’imposta si ferma a zero.',
    'irpef.etichetta': 'IRPEF',
    'irpef.regola': 'Imposta progressiva per scaglioni.',
    'irpef.spiegazione': 'L’imposta che va allo Stato.',
    'scaglione.etichetta': 'Da {da} a {a} — {aliquota}',
    'scaglione.etichetta.ultimo': 'Oltre {da} — {aliquota}',
    'scaglione.regola': 'Scaglione da {da} a {a}.',
    'scaglione.regola.ultimo': 'Scaglione da {da} in su.',
    'scaglione.spiegazione': 'Quota compresa nella fascia: {quota}.',
    'gate.etichetta.aperto': 'Le addizionali sono dovute',
    'gate.etichetta.chiuso': 'Le addizionali non sono dovute',
    'gate.regola': 'Dovute se l’IRPEF risulta dovuta.',
    'gate.spiegazione': 'Il presupposto è binario.',
    'gate.ragione.aperto': 'IRPEF netta {netta}, presupposto soddisfatto.',
    'gate.ragione.chiuso': 'IRPEF netta zero, presupposto assente.',
    'addizionale.spiegazione.gate': 'Non si riduce: non è dovuta.',
    'addizionale.ragione.gate': 'IRPEF netta zero.',
    'regionale.etichetta': 'Addizionale regionale — {ente}',
    'regionale.regola.non-istituita': 'Dovuta all’ente che l’ha istituita.',
    'regionale.spiegazione.non-istituita': 'Il tributo non esiste per questo ente.',
    'regionale.ragione.non-istituita': 'Non istituita per {ente}.',
    'regionale.regola.gate': 'Dovuta se l’IRPEF risulta dovuta.',
    'regionale.regola': 'Aliquota deliberata dall’ente impositore.',
    'regionale.spiegazione': 'Stessa base dell’IRPEF.',
    'regionale.fascia-intera.etichetta': 'Aliquota {aliquota} sull’intero imponibile',
    'regionale.fascia-intera.regola': 'Aliquota per fascia, applicata all’intero imponibile.',
    'regionale.fascia-intera.spiegazione': 'Non cambia pendenza al confine: cambia tutta.',
    'detrazioni-regionali.etichetta': 'Detrazione regionale',
    'detrazioni-regionali.regola': 'Detrazione fino a concorrenza dell’imposta dovuta.',
    'detrazioni-regionali.spiegazione': '{ente} prevede {quante} in questa fascia.',
    // ⚠️ La frase che i test leggono. Senza, l'asserzione non direbbe nulla.
    'detrazioni-regionali.spiegazione.pavimento':
      'Spettano {dovuta}, ma se ne usa {usata}: l’addizionale si ferma a zero e il residuo non diventa un credito.',
    'detrazioni-regionali.una': 'una detrazione propria',
    'detrazioni-regionali.molte': '{n} detrazioni proprie',
    'comunale.etichetta': 'Addizionale comunale — {ente}',
    'comunale.regola.non-istituita': 'Dovuta al comune che l’ha istituita.',
    'comunale.spiegazione.non-istituita': 'Il tributo non esiste in questo comune.',
    'comunale.ragione.non-istituita': 'Non istituita nel comune di {ente}.',
    'comunale.regola.gate': 'Dovuta se l’IRPEF risulta dovuta.',
    'comunale.regola.esente': 'Non dovuta sotto la soglia di esenzione.',
    'comunale.spiegazione.esente': 'Due condizioni distinte.',
    'comunale.ragione.esente': 'Reddito {rc}, soglia {soglia}, comune di {ente}.',
    'comunale.regola': 'Aliquota deliberata dal comune.',
    'comunale.spiegazione.ereditato': 'Si applicano le aliquote del {anno}.',
    'comunale.spiegazione.deliberato': 'Stessa base dell’IRPEF.',
    'soglia-esenzione.etichetta': 'Soglia di esenzione: {soglia}',
    'soglia-esenzione.regola': 'Soglia stabilita con regolamento comunale.',
    'soglia-esenzione.spiegazione.esente': 'Sotto {soglia} non è dovuta affatto.',
    'soglia-esenzione.spiegazione.dovuta': 'Soglia secca, non franchigia.',
    'soglia-esenzione.ragione.esente': 'Reddito {rc} sotto la soglia {soglia}.',
    'soglia-esenzione.ragione.dovuta': 'Reddito {rc} sopra la soglia {soglia}.',
    'somma-cuneo.etichetta': 'Somma per il taglio del cuneo',
    'somma-cuneo.regola.non-dovuta': 'Somma per reddito non superiore alla soglia.',
    'somma-cuneo.spiegazione.non-dovuta': 'Sopra la soglia cambia forma.',
    'somma-cuneo.ragione.non-dovuta': 'Reddito {rc} sopra la soglia di accesso {soglia}.',
    'somma-cuneo.regola': 'Somma che non concorre a formare il reddito.',
    'somma-cuneo.spiegazione': 'Denaro erogato che si somma al netto.',
    'trattamento-integrativo.etichetta': 'Trattamento integrativo',
    'trattamento-integrativo.regola.spetta': 'Somma condizionata alla capienza.',
    'trattamento-integrativo.spiegazione.spetta': 'Si somma al netto.',
    'trattamento-integrativo.regola.non-spetta': 'Somma condizionata a soglia e capienza.',
    'trattamento-integrativo.spiegazione.non-spetta': 'Quando spetta, si somma al netto.',
    'trattamento-integrativo.ragione.sopra-soglia': 'Reddito {rc} sopra il limite {soglia}.',
    'trattamento-integrativo.ragione.incapiente':
      'Imposta lorda {lorda}, scarto {scarto}, soglia {sogliaGate}.',
  },
}

const regime: Regime = {
  anno: annoImposta(2026),
  fontiRegola,
  contributi: {
    aliquotaOrdinaria: { valore: aliquota(10), fonte },
    aliquotaApprendista: { valore: aliquota(6), fonte },
    quotaAggiuntiva: {
      aliquota: { valore: aliquota(2), fonte },
      sogliaPrimaFascia: { valore: euro(50_000), fonte },
      aliquotaMassimaRegime: { valore: aliquota(20), fonte },
    },
  },
  irpef: {
    scaglioni: {
      fonte,
      valore: [
        { da: euro(0), a: euro(20_000), aliquota: aliquota(20) },
        { da: euro(20_000), a: null, aliquota: aliquota(40) },
      ],
    },
  },
  troncamentoRapportiDetrazione: { valore: 4, fonte },
  detrazioneLavoroDipendente: {
    fasce: {
      fonte,
      valore: [
        { redditoDa: euro(0), redditoA: euro(10_000), formula: { forma: 'costante', importo: euro(2_000) } },
        {
          redditoDa: euro(10_000),
          redditoA: euro(30_000),
          formula: {
            forma: 'lineare-decrescente',
            base: euro(0),
            quota: euro(2_000),
            riferimento: euro(30_000),
            ampiezza: euro(20_000),
            espressione: '2.000 × (30.000 − RC) / 20.000',
          },
        },
        { redditoDa: euro(30_000), redditoA: null, formula: { forma: 'costante', importo: euro(0) } },
      ],
    },
    incrementoFasciaIntermedia: {
      fonte,
      valore: { importo: euro(100), redditoDa: euro(15_000), redditoA: euro(25_000) },
    },
    minimi: { fonte, valore: { generale: euro(500), tempoDeterminato: euro(1_000) } },
  },
  cuneo: {
    somma: {
      sogliaAccesso: { valore: euro(12_000), fonte },
      fasce: {
        fonte,
        valore: [
          { redditoDa: euro(0), redditoA: euro(5_000), percentuale: aliquota(8) },
          { redditoDa: euro(5_000), redditoA: euro(12_000), percentuale: aliquota(6) },
          { redditoDa: euro(12_000), redditoA: null, percentuale: aliquota(4) },
        ],
      },
    },
    detrazione: {
      fasce: {
        fonte,
        valore: [
          { redditoDa: euro(12_000), redditoA: euro(20_000), formula: { forma: 'costante', importo: euro(800) } },
          { redditoDa: euro(20_000), redditoA: null, formula: { forma: 'costante', importo: euro(0) } },
        ],
      },
    },
  },
  trattamentoIntegrativo: {
    importo: { valore: euro(1_000), fonte },
    sogliaRedditoComplessivo: { valore: euro(9_000), fonte },
    scartoSulGate: { valore: euro(50), fonte },
  },
}

// ---------------------------------------------------------------------------
// Enti sintetici, costruiti a mano: nessun CSV, nessun import di dati
// ---------------------------------------------------------------------------

const regioneScaglioni: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Regione di test',
  annoDelibera: 2026,
  fonte,
  parametri: {
    aliquota: {
      forma: 'scaglioni-previgenti',
      scaglioni: [
        { da: euro(0), a: euro(15_000), aliquota: aliquota(1) },
        { da: euro(15_000), a: null, aliquota: aliquota(2) },
      ],
    },
    detrazioni: [],
    sogliaEsenzione: null,
  },
}

/** Esercita D-057: l'ente regionale ha una soglia, ed è un cliff come la comunale. */
const regioneConSoglia: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Regione con soglia',
  annoDelibera: 2026,
  fonte,
  parametri: {
    aliquota: { forma: 'unica', aliquota: aliquota(1.23) },
    detrazioni: [],
    sogliaEsenzione: { valore: euro(25_000), fonte },
  },
}

const comuneEreditato: EnteRisolto<ParametriComunali> = {
  stato: 'ereditato',
  nome: 'Comune di test',
  annoDiProvenienza: 2025,
  normaDiFallback: fonte,
  fonte,
  parametri: { aliquota: { forma: 'unica', aliquota: aliquota(0.5) }, sogliaEsenzione: euro(11_000) },
}

const comuneNonIstituito: EnteRisolto<ParametriComunali> = {
  stato: 'nonIstituito',
  nome: 'Comune senza addizionale',
}

const regioneNonIstituita: EnteRisolto<ParametriRegionali> = {
  stato: 'nonIstituito',
  nome: 'Ente senza addizionale',
}

/** Esercita D-033: l'ente prevede detrazioni proprie che il motore non applica. */
const regioneConDetrazioni: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Regione con detrazioni',
  annoDelibera: 2026,
  fonte,
  parametri: {
    aliquota: { forma: 'unica', aliquota: aliquota(1.5) },
    detrazioni: [
      { importo: euro(150), redditoDa: euro(10_000), redditoA: euro(20_000), fonte },
      { importo: euro(60), redditoDa: euro(20_000), redditoA: null, fonte },
    ],
    sogliaEsenzione: null,
  },
}

/** Catalogo sintetico: una voce per ciascuna forma di condizione. */
const assunzioni: readonly AssunzioneDichiarata[] = [
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'T-sempre',
      testo: { it: 'Incondizionata.', en: 'Unconditional.' },
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
    },
  },
  {
    condizione: { tipo: 'ral-supera', soglia: { valore: euro(60_000), fonte } },
    assunzione: {
      id: 'T-soglia',
      testo: { it: 'Vale solo oltre una soglia di RAL.', en: 'Applies above a RAL threshold.' },
      direzione: 'netto-reale-piu-alto',
      collocazione: 'accanto-al-numero',
    },
  },
  {
    condizione: { tipo: 'contratto-diverso-da', contratto: 'apprendistato' },
    assunzione: {
      id: 'T-non-apprendista',
      testo: { it: 'Vale per chi non ha dichiarato un apprendistato.', en: 'Applies to anyone not on an apprenticeship.' },
      direzione: 'netto-reale-piu-alto',
      collocazione: 'blocco-semplificazioni',
    },
  },
]

const entiStandard: EntiRisolti = { regionale: regioneScaglioni, comunale: comuneEreditato }
const entiSogliaRegionale: EntiRisolti = { regionale: regioneConSoglia, comunale: comuneEreditato }
const entiAssenti: EntiRisolti = { regionale: regioneNonIstituita, comunale: comuneNonIstituito }
const entiConDetrazioni: EntiRisolti = { regionale: regioneConDetrazioni, comunale: comuneEreditato }

/** Esercita il pavimento a zero: la detrazione supera l'addizionale. */
const regioneDetrazioneCapiente: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Regione con detrazione capiente',
  annoDelibera: 2026,
  fonte,
  parametri: {
    aliquota: { forma: 'unica', aliquota: aliquota(1) },
    detrazioni: [{ importo: euro(5_000), redditoDa: euro(0), redditoA: null, fonte }],
    sogliaEsenzione: null,
  },
}
const entiDetrazioneCapiente: EntiRisolti = {
  regionale: regioneDetrazioneCapiente,
  comunale: comuneEreditato,
}

/** Esercita D-062: aliquota per fascia intera, con progressione oltre l'ultima. */
const regioneFasceIntere: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Regione a fasce intere',
  annoDelibera: 2026,
  fonte,
  parametri: {
    aliquota: {
      forma: 'fasce-intere',
      fasce: [{ redditoDa: euro(0), redditoA: euro(20_000), percentuale: aliquota(1.23) }],
      progressioneOltre: [
        { da: euro(0), a: euro(15_000), aliquota: aliquota(1.73) },
        { da: euro(15_000), a: null, aliquota: aliquota(3.33) },
      ],
    },
    detrazioni: [],
    sogliaEsenzione: null,
  },
}
const entiFasceIntere: EntiRisolti = { regionale: regioneFasceIntere, comunale: comuneEreditato }

// ---------------------------------------------------------------------------
// Scenari
// ---------------------------------------------------------------------------

const input = (ral: number, extra: Partial<Input> = {}): Input => ({
  ral: euro(ral),
  codiceCatastale: 'X000',
  tipoContratto: 'indeterminato',
  // D-052: il campo è obbligatorio, quindi anche qui va dichiarato. Il valore
  // è indifferente a tutto ciò che questi scenari verificano — le mensilità
  // dividono il netto annuo, non lo determinano — ed è esattamente quello che
  // il primo test di questo blocco asserisce.
  mensilita: 13,
  ...extra,
})

const scenari: readonly { nome: string; input: Input; enti: EntiRisolti }[] = [
  { nome: 'incapiente, gate chiuso', input: input(5_000), enti: entiStandard },
  { nome: 'trattamento integrativo spettante', input: input(10_000), enti: entiStandard },
  { nome: 'sotto la soglia di esenzione comunale', input: input(12_000), enti: entiStandard },
  { nome: 'somma del cuneo, sopra l\'esenzione', input: input(13_000), enti: entiStandard },
  { nome: 'detrazione da cuneo', input: input(20_000), enti: entiStandard },
  { nome: 'fascia alta, quota aggiuntiva 1%', input: input(70_000), enti: entiStandard },
  { nome: 'apprendistato', input: input(20_000, { tipoContratto: 'apprendistato' }), enti: entiStandard },
  { nome: 'mensilità assente', input: input(30_000, { mensilita: undefined }), enti: entiStandard },
  { nome: 'enti non istituiti', input: input(30_000), enti: entiAssenti },
  { nome: 'esattamente alla soglia di accesso al cuneo', input: input(12_000 / 0.9), enti: entiStandard },
  { nome: 'ente con detrazioni regionali proprie', input: input(25_000), enti: entiConDetrazioni },
]

// ---------------------------------------------------------------------------
// 1. L'invariante del netto
// ---------------------------------------------------------------------------

describe('il netto è derivato dalla traccia', () => {
  test.each(scenari)('$nome: RAL più la somma degli effetti torna al netto', ({ input: i, enti }) => {
    const r = calcolaNetto(i, regime, enti, assunzioni, lingua)
    const somma = r.passi.reduce(
      (acc, p) => acc + (p.esito.stato === 'applicato' ? p.esito.effettoSulNetto : 0),
      i.ral as number,
    )
    expect(somma).toBeCloseTo(r.nettoAnnuo, 10)
  })

  test('i passi annidati non contribuiscono al netto', () => {
    const r = calcolaNetto(input(30_000), regime, entiStandard, assunzioni, lingua)
    const annidati = r.passi.flatMap((p) => p.dettaglio ?? [])
    expect(annidati.length).toBeGreaterThan(0)
    for (const p of annidati) {
      if (p.esito.stato === 'applicato') expect(p.esito.effettoSulNetto).toBe(0)
    }
  })
})

// ---------------------------------------------------------------------------
// 2. Le tre divisioni mensili
// ---------------------------------------------------------------------------

describe('le mensilità sono viste della stessa grandezza', () => {
  const mensilita: readonly Mensilita[] = [12, 13, 14]

  test.each(scenari)('$nome: ogni divisione moltiplicata torna al netto annuo', ({ input: i, enti }) => {
    const r = calcolaNetto(i, regime, enti, assunzioni, lingua)
    for (const m of mensilita) expect(r.nettoMensile[m] * m).toBeCloseTo(r.nettoAnnuo, 10)
  })

  test('il netto annuo non dipende dalle mensilità scelte', () => {
    const dodici = calcolaNetto(input(30_000, { mensilita: 12 }), regime, entiStandard, assunzioni, lingua)
    const quattordici = calcolaNetto(input(30_000, { mensilita: 14 }), regime, entiStandard, assunzioni, lingua)
    expect(dodici.nettoAnnuo).toBe(quattordici.nettoAnnuo)
  })

  /**
   * ⚠️ **Questo test ha cambiato oggetto, non è stato aggiustato** (D-052).
   *
   * Asseriva *«la mensilità assente vale 13»*. Era vero, e proteggeva la cosa
   * sbagliata: dopo D-050 l'interfaccia partiva da 12 mentre il motore
   * continuava ad assumere 13, e **la suite difendeva quello che il prodotto
   * aveva già smentito**. Un test verde su un comportamento superato è peggio
   * di nessun test, perché dà la stessa fiducia senza la stessa copertura.
   *
   * L'asserzione nuova è più forte perché **non invecchia con una scelta di
   * prodotto**: che il motore non accetti un input senza mensilità resta vero
   * qualunque numero il prodotto decida di mostrare per primo.
   *
   * Il rifiuto è del compilatore e non del runtime, ed è la forma giusta: il
   * motore è TypeScript puro e non fa validazione — quella sta un livello
   * sopra, in `app/_lib/calcolo.ts`, che risponde 400. `@ts-expect-error`
   * fallisce la build se un giorno il campo tornasse facoltativo, che è
   * precisamente la regressione da impedire.
   */
  test('il motore rifiuta un input senza mensilità', () => {
    const senzaMensilita = {
      ral: euro(30_000),
      codiceCatastale: 'X000',
      tipoContratto: 'indeterminato',
    } as const

    // @ts-expect-error — `mensilita` è obbligatorio in `Input` (D-052).
    const costruisci = (): Input => senzaMensilita
    expect(costruisci).toBeTypeOf('function')

    // E quando c'è, il motore la riporta intatta: non la reinterpreta.
    for (const m of mensilita) {
      expect(calcolaNetto(input(30_000, { mensilita: m }), regime, entiStandard, assunzioni, lingua).mensilita).toBe(m)
    }
  })
})

// ---------------------------------------------------------------------------
// 3. La separazione dei livelli
// ---------------------------------------------------------------------------

describe('core/ non conosce i livelli sopra di sé', () => {
  test('nessun file di core/ importa da data/, app/ o fixtures/', () => {
    const cartella = join(process.cwd(), 'core')
    const violazioni: string[] = []

    for (const file of readdirSync(cartella).filter((n) => n.endsWith('.ts'))) {
      const sorgente = readFileSync(join(cartella, file), 'utf8')
      for (const [, specifier] of sorgente.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        if (/(^|\/)(data|app|fixtures)(\/|$)/.test(specifier)) {
          violazioni.push(`${file} importa ${specifier}`)
        }
      }
    }

    expect(violazioni).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 4. Le assunzioni applicabili
// ---------------------------------------------------------------------------

describe('il motore restituisce solo le assunzioni che si applicano', () => {
  test('le incondizionate ci sono sempre', () => {
    const r = calcolaNetto(input(30_000), regime, entiStandard, assunzioni, lingua)
    expect(r.assunzioni.map((a) => a.id)).toContain('T-sempre')
  })

  test('quella con soglia compare solo sopra la soglia', () => {
    const sotto = calcolaNetto(input(30_000), regime, entiStandard, assunzioni, lingua)
    const sopra = calcolaNetto(input(90_000), regime, entiStandard, assunzioni, lingua)
    expect(sotto.assunzioni.map((a) => a.id)).not.toContain('T-soglia')
    expect(sopra.assunzioni.map((a) => a.id)).toContain('T-soglia')
  })

  test('quella sul contratto sparisce in apprendistato', () => {
    const indeterminato = calcolaNetto(input(30_000), regime, entiStandard, assunzioni, lingua)
    const apprendista = calcolaNetto(
      input(30_000, { tipoContratto: 'apprendistato' }),
      regime,
      entiStandard,
      assunzioni,
      lingua,
    )
    expect(indeterminato.assunzioni.map((a) => a.id)).toContain('T-non-apprendista')
    expect(apprendista.assunzioni.map((a) => a.id)).not.toContain('T-non-apprendista')
  })
})

// ---------------------------------------------------------------------------
// 4-bis. La soglia di esenzione regionale è un cliff, come la comunale (D-057)
// ---------------------------------------------------------------------------

describe('anche l’ente regionale può avere una soglia di esenzione', () => {
  test('sotto la soglia l’addizionale regionale non è dovuta, con la sua ragione', () => {
    const r = calcolaNetto(input(20_000), regime, entiSogliaRegionale, assunzioni, lingua)
    // Il gate deve essere aperto, altrimenti il test misurerebbe il gate e non la soglia.
    const gate = r.passi.find((p) => p.id === 'gate-addizionali')!
    expect(gate.esito.stato === 'verifica' && gate.esito.superata).toBe(true)
    const passo = r.passi.find((p) => p.id === 'addizionale-regionale')

    expect(passo!.esito.stato).toBe('nonDovuto')
    if (passo!.esito.stato === 'nonDovuto') {
      expect(passo!.esito.ragione).toContain('soglia di esenzione')
    }
    // La verifica è un passo con la sua ragione, non una voce a zero.
    const verifica = passo!.dettaglio?.find((d) => d.id === 'soglia-esenzione-regionale')
    expect(verifica?.esito.stato).toBe('verifica')
    if (verifica?.esito.stato === 'verifica') expect(verifica.esito.superata).toBe(false)
  })

  test('sopra la soglia si paga sull’intera base, non sull’eccedenza — è un cliff', () => {
    const rc = (r: ReturnType<typeof calcolaNetto>) => {
      const passo = r.passi.find((p) => p.id === 'reddito-complessivo')!
      return passo.esito.stato === 'applicato' ? passo.esito.esce : 0
    }
    const sopra = calcolaNetto(input(40_000), regime, entiSogliaRegionale, assunzioni, lingua)
    const passo = sopra.passi.find((p) => p.id === 'addizionale-regionale')!

    expect(passo.esito.stato).toBe('applicato')
    if (passo.esito.stato === 'applicato') {
      // 1,23% sull'INTERO reddito complessivo, non sulla parte oltre 15.000.
      expect(passo.esito.esce).toBeCloseTo((rc(sopra) * 1.23) / 100, 8)
    }
  })

  test('senza soglia il passo di verifica non compare affatto', () => {
    const r = calcolaNetto(input(40_000), regime, entiStandard, assunzioni, lingua)
    const passo = r.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(passo.dettaglio?.some((d) => d.id === 'soglia-esenzione-regionale')).not.toBe(true)
  })

  test('il netto resta la somma degli effetti anche con l’esenzione regionale', () => {
    const r = calcolaNetto(input(20_000), regime, entiSogliaRegionale, assunzioni, lingua)
    const somma = r.passi.reduce(
      (acc, p) => acc + (p.esito.stato === 'applicato' ? p.esito.effettoSulNetto : 0),
      20_000,
    )
    expect(somma).toBeCloseTo(r.nettoAnnuo, 10)
  })
})

// ---------------------------------------------------------------------------
// 5. Ciò che il motore non modella non sparisce in silenzio (D-033)
// ---------------------------------------------------------------------------

describe('le detrazioni regionali si applicano, con il pavimento a zero (D-061)', () => {
  test('spettano nella loro banda di reddito e riducono l’addizionale', () => {
    const r = calcolaNetto(input(25_000), regime, entiConDetrazioni, assunzioni, lingua)
    const regionale = r.passi.find((p) => p.id === 'addizionale-regionale')!
    const detrazione = regionale.dettaglio?.find((d) => d.id === 'detrazioni-regionali')
    expect(detrazione).toBeDefined()
    expect(detrazione!.esito.stato).toBe('applicato')
  })

  test('il pavimento è a zero: la detrazione non produce mai un credito', () => {
    const r = calcolaNetto(input(15_000), regime, entiDetrazioneCapiente, assunzioni, lingua)
    const regionale = r.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.esito.stato).toBe('applicato')
    if (regionale.esito.stato !== 'applicato') return
    expect(regionale.esito.esce).toBe(0)
    expect(regionale.esito.effettoSulNetto).toBe(0)
    const detrazione = regionale.dettaglio?.find((d) => d.id === 'detrazioni-regionali')
    expect(detrazione?.spiegazione).toContain('non diventa un credito')
  })

  test('non compare per un ente senza detrazioni proprie', () => {
    const r = calcolaNetto(input(25_000), regime, entiStandard, assunzioni, lingua)
    const regionale = r.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.dettaglio?.some((d) => d.id === 'detrazioni-regionali')).not.toBe(true)
  })

  test('il netto resta la somma degli effetti dei passi di primo livello', () => {
    const r = calcolaNetto(input(25_000), regime, entiConDetrazioni, assunzioni, lingua)
    const somma = r.passi.reduce(
      (acc, p) => acc + (p.esito.stato === 'applicato' ? p.esito.effettoSulNetto : 0),
      25_000,
    )
    expect(somma).toBeCloseTo(r.nettoAnnuo, 10)
  })
})

// ---------------------------------------------------------------------------
// 7. L'aliquota regionale per fascia intera non e' una progressione (D-062)
// ---------------------------------------------------------------------------

describe('l’aliquota regionale per fascia intera', () => {
  const reg = (r: ReturnType<typeof calcolaNetto>) => {
    const p = r.passi.find((x) => x.id === 'addizionale-regionale')!
    return p.esito.stato === 'applicato' ? p.esito.esce : 0
  }

  test('si applica all’intero imponibile, non alla sola parte in fascia', () => {
    const r = calcolaNetto(input(20_000), regime, entiFasceIntere, assunzioni, lingua)
    const rcPasso = r.passi.find((p) => p.id === 'reddito-complessivo')!
    if (rcPasso.esito.stato !== 'applicato') return
    // 1,23% sull'intero, non 1,73% sui primi 15.000 piu' 3,33% sul resto.
    expect(reg(r)).toBeCloseTo((rcPasso.esito.esce * 1.23) / 100, 8)
    const regionale = r.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.dettaglio?.some((d) => d.id === 'addizionale-regionale-fascia-intera')).toBe(true)
  })

  test('oltre l’ultima fascia intera torna alla progressione dichiarata', () => {
    const r = calcolaNetto(input(40_000), regime, entiFasceIntere, assunzioni, lingua)
    const rcPasso = r.passi.find((p) => p.id === 'reddito-complessivo')!
    if (rcPasso.esito.stato !== 'applicato') return
    const rc = rcPasso.esito.esce
    expect(reg(r)).toBeCloseTo((15_000 * 1.73) / 100 + ((rc - 15_000) * 3.33) / 100, 8)
    const regionale = r.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.dettaglio?.some((d) => d.id === 'addizionale-regionale-fascia-intera')).not.toBe(true)
    expect(regionale.dettaglio?.some((d) => d.id.startsWith('addizionale-regionale-scaglione'))).toBe(true)
  })

  test('il confine fra fascia intera e progressione e’ un gradino, non una pendenza', () => {
    const sotto = calcolaNetto(input(22_220), regime, entiFasceIntere, assunzioni, lingua)
    const sopra = calcolaNetto(input(22_230), regime, entiFasceIntere, assunzioni, lingua)
    // Dieci euro di RAL in piu' non possono spiegare un salto di questa taglia:
    // con i contributi sintetici al 10% il confine di RC 20.000 cade a RAL 22.222.
    expect(reg(sopra) - reg(sotto)).toBeGreaterThan(100)
  })
})
