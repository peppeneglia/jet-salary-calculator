/**
 * Il motore di calcolo.
 *
 * TypeScript puro: nessun React, nessun Next, nessun parametro normativo.
 * Ogni numero che viene da una legge arriva dal `Regime` o dagli enti risolti,
 * che il motore riceve come argomenti. Dal 29/08/2026 vale lo stesso per la
 * prosa: i testi arrivano dalla `Lingua`, che il motore riceve allo stesso modo
 * (D-041).
 *
 * Il netto non si calcola due volte: è la RAL più la somma degli effetti dei
 * passi di primo livello. Non esiste un secondo conto parallelo che si spera
 * coincida — l'invariante «i numeri mostrati sommano al totale» è una
 * tautologia verificata, non una fortuna (D-003, D-024).
 *
 * L'ordine di esecuzione non è libero: è determinato dalle fonti. Il gate del
 * trattamento integrativo legge valori intermedi del ramo fiscale, e le
 * addizionali dipendono dall'esito del ramo IRPEF, non solo dalla sua base.
 */

import {
  aliquota,
  euro,
  redditoComplessivo,
  redditoLavoroDipendente,
  retribuzionePrevidenziale,
  type Assunzione,
  type AssunzioneDichiarata,
  type CondizioneAssunzione,
  type EnteRisolto,
  type EntiRisolti,
  type Esito,
  type FasciaDetrazione,
  type FasciaSuIntero,
  type Fonte,
  type FormaAliquotaRegionale,
  type FormulaDetrazione,
  type IdTesto,
  type Input,
  type Lingua,
  type Mensilita,
  type ParametriComunali,
  type Passo,
  type Regime,
  type Risultato,
  type Scaglione,
} from './types'

// Helper puri

const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/**
 * Come si scrive una frase della traccia.
 *
 * ⚠️ Qui `core/` non è più legato all'italiano, e il pezzo che lo legava è
 * esattamente quello che D-038 aveva indicato (D-041). I campi `regola`,
 * `spiegazione` e `ragione` portano ancora prosa, e i numeri che vi compaiono
 * si formattano ancora dove la frase si costruisce: la proprietà che D-038
 * proteggeva — testo e numero nella stessa struttura, senza due verità libere
 * di divergere — resta intatta. A cambiare è da dove viene il testo.
 *
 * Da qui il vincolo minimo di allora, che vale ancora e ora per lingua:
 * una convenzione sola. Un'aliquota e un importo nella stessa stringa non
 * possono usare separatori decimali diversi, altrimenti la riga è incoerente
 * con sé stessa.
 */
interface Prosa {
  /** Un importo: due decimali imposti, separatori della lingua. */
  readonly f: (n: number) => string
  /** Un'aliquota: `23%` e non `23,00%`, decimali della lingua. */
  readonly p: (n: number) => string
  /**
   * Un numero puro, con il numero di decimali che gli serve.
   *
   * ⚠️ Esiste per il rapporto troncato dell'art. 13 c. 6, che `f` non sa
   * scrivere: `f` impone due decimali e trasformerebbe `0,0582` in `0,06`,
   * cancellando proprio il troncamento alla quarta cifra che il passo deve
   * mostrare. Senza questa funzione quel numero finiva in un template letterale
   * senza passare da nessun formattatore, e usciva `0.0582` con il punto
   * inglese in mezzo a numeri italiani — che è il difetto per cui D-038 esiste.
   */
  readonly r: (n: number, decimali: number) => string
  /** Un testo della tabella, con i segnaposti già sostituiti. */
  readonly t: (id: IdTesto, valori?: Readonly<Record<string, string>>) => string
}

/**
 * Sostituisce i segnaposti `{nome}` di un modello.
 *
 * È la sola logica che i testi richiedono, e sta qui e non in `data/`: il
 * catalogo dice *cosa* si scrive, il motore sa *come* comporlo. Un modello con
 * un segnaposto che nessun valore riempie resta visibile come tale, invece di
 * sparire in una stringa vuota: un buco che si vede si corregge, uno che non si
 * vede no.
 */
const interpola = (modello: string, valori?: Readonly<Record<string, string>>): string =>
  valori === undefined
    ? modello
    : modello.replace(/\{(\w+)\}/g, (intero, chiave: string) => valori[chiave] ?? intero)

const componiProsa = (lingua: Lingua): Prosa => {
  /*
   * ⚠️ `useGrouping: 'always'` per la stessa ragione di `app/_lib/formato.ts`:
   * il default delega a `minimumGroupingDigits` del CLDR, che cambia con la
   * versione di ICU compilata nel runtime. Lo stesso numero può uscire scritto
   * in due modi fra il server che rende la pagina e il browser che la riprende.
   */
  const importo = new Intl.NumberFormat(lingua.tag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })
  const percento = new Intl.NumberFormat(lingua.tag, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })

  return {
    f: (n) => importo.format(n),
    p: (n) => `${percento.format(n)}%`,
    r: (n, decimali) =>
      new Intl.NumberFormat(lingua.tag, {
        minimumFractionDigits: decimali,
        maximumFractionDigits: decimali,
        useGrouping: 'always',
      }).format(n),
    t: (id, valori) => interpola(lingua.testi[id], valori),
  }
}

/**
 * Troncamento, non arrotondamento. Il numero di cifre arriva dal regime
 * (art. 13 c. 6 e art. 12 c. 4 TUIR), la regola *troncare* è logica e sta qui.
 */
const tronca = (valore: number, decimali: number): number => {
  const fattore = 10 ** decimali
  return Math.trunc(valore * fattore) / fattore
}

/** Imposta progressiva: ogni scaglione è tassato alla propria aliquota. */
const applicaScaglioni = (base: number, scaglioni: readonly Scaglione[]): number => {
  let totale = 0
  for (const s of scaglioni) {
    const da: number = s.da
    const a: number = s.a ?? Number.POSITIVE_INFINITY
    if (base <= da) break
    totale += ((Math.min(base, a) - da) * s.aliquota) / 100
  }
  return totale
}

/*
 * ── Le due funzioni che escono da qui, e perché — D-077 ────────────────────
 *
 * `trovaFascia` e `valutaFormula` sono esportate. Sono le uniche due, e non è
 * un allentamento dell'incapsulamento: è la conseguenza di aver messo in
 * pagina il **grafico** di una detrazione.
 *
 * La pagina `/spiegazione` disegna la curva dell'art. 13 e quella della
 * detrazione da cuneo. Per disegnarle serve valutare la formula in una
 * cinquantina di punti — e una seconda implementazione di
 * `base + quota × (riferimento − reddito) / ampiezza`, con o senza il
 * troncamento alla quarta cifra, sarebbe **due copie della stessa regola**: la
 * curva mostrata e il numero calcolato potrebbero divergere senza che nessun
 * test se ne accorga, perché nessun test guarda un `path` SVG.
 *
 * Restano pure e senza stato, e continuano a non sapere niente di React: la
 * verifica di CLAUDE.md §3 — *`core/` non importa da `app/`* — non si muove.
 */

/**
 * Estremo inferiore escluso, superiore incluso.
 *
 * Non è una convenzione arbitraria: riproduce gli operatori delle norme.
 * L'art. 13 c. 1 lett. a) dice *non superiore a 15.000*, la lett. b) *superiore
 * a 15.000 e non superiore a 28.000*. Lo stesso vale per la partizione fra il
 * c. 4 e il c. 6 della L. 207/2024, dove a esattamente 20.000 spetta la somma e
 * non la detrazione. Usare operatori diversi da quelli della norma, sulle
 * soglie, eroga due benefici o nessuno.
 */
export const trovaFascia = <T extends { readonly redditoDa: number; readonly redditoA: number | null }>(
  fasce: readonly T[],
  reddito: number,
): T | undefined =>
  fasce.find((fascia) => reddito > fascia.redditoDa && (fascia.redditoA === null || reddito <= fascia.redditoA))

/**
 * Valuta una detrazione a tratti.
 *
 * `troncamento` si passa solo dove la norma lo impone. L'art. 13 c. 6 lo
 * prevede; la detrazione da cuneo vive fuori dal TUIR e non porta una clausola
 * equivalente, quindi lì il rapporto non si tronca.
 */
export const valutaFormula = (formula: FormulaDetrazione, reddito: number, troncamento?: number): number => {
  if (formula.forma === 'costante') return formula.importo
  const rapporto = (formula.riferimento - reddito) / formula.ampiezza
  const usato = troncamento === undefined ? rapporto : tronca(rapporto, troncamento)
  return formula.base + formula.quota * usato
}

/** Descrive una forma di aliquota in linguaggio da mostrare. */
const descriviScaglione = (s: Scaglione, prosa: Prosa): string =>
  s.a === null
    ? prosa.t('scaglione.etichetta.ultimo', { da: prosa.f(s.da), aliquota: prosa.p(s.aliquota) })
    : prosa.t('scaglione.etichetta', {
        da: prosa.f(s.da),
        a: prosa.f(s.a),
        aliquota: prosa.p(s.aliquota),
      })

const esitoNeutro = (entra: number, esce: number): Esito => ({
  stato: 'applicato',
  entra: euro(entra),
  esce: euro(esce),
  effettoSulNetto: euro(0),
  segno: 'neutro',
})

const esitoSottrae = (entra: number, esce: number): Esito => ({
  stato: 'applicato',
  entra: euro(entra),
  esce: euro(esce),
  // ⚠️ `esce === 0` va reso `0` e non `-0`: sono lo stesso numero per
  // JavaScript ma non per `Intl`, che stampa `−0,00`. Un'addizionale azzerata
  // da una detrazione capiente (D-061) passa esattamente di qui.
  effettoSulNetto: euro(esce === 0 ? 0 : -esce),
  segno: 'sottrae',
})

const esitoAggiunge = (entra: number, esce: number): Esito => ({
  stato: 'applicato',
  entra: euro(entra),
  esce: euro(esce),
  effettoSulNetto: euro(esce),
  segno: 'aggiunge',
})

/**
 * Valuta la condizione di un'assunzione. È l'unico posto in cui una
 * `CondizioneAssunzione` si traduce in un sì o un no: il catalogo dice *quando*,
 * il motore sa *come*.
 */
const assunzioneApplicabile = (
  condizione: CondizioneAssunzione,
  input: Input,
  ral: number,
  enti: EntiRisolti,
): boolean => {
  switch (condizione.tipo) {
    case 'sempre':
      return true
    case 'ral-supera':
      return ral > condizione.soglia.valore
    case 'contratto-diverso-da':
      return input.tipoContratto !== condizione.contratto
    case 'ente-regionale-e':
      return enti.regionale.nome === condizione.nome
  }
}

/** L'effetto sul netto di un passo di primo livello. I passi annidati valgono zero. */
const effetto = (passo: Passo): number =>
  passo.esito.stato === 'applicato' ? passo.esito.effettoSulNetto : 0

// Addizionali: la parte che dipende dall'ente risolto

/**
 * ⚠️ Tre forme, e la terza non è una progressione (D-062). L'aliquota per
 * fascia intera si applica all'intero imponibile e cambia per soglia:
 * al confine c'è un salto secco, non un cambio di pendenza. È la stessa
 * meccanica delle fasce percentuali della somma del cuneo, che il motore
 * calcola già — e infatti riusa `trovaFascia` e `FasciaSuIntero`.
 *
 * `progressioneOltre` serve agli enti ibridi: la fascia intera vale sotto
 * una soglia, e sopra si torna agli scaglioni pubblicati.
 */
const totaleAddizionale = (base: number, forma: FormaAliquotaRegionale): number => {
  if (forma.forma === 'unica') return (base * forma.aliquota) / 100
  if (forma.forma !== 'fasce-intere') return applicaScaglioni(base, forma.scaglioni)
  const fascia = trovaFascia(forma.fasce, base)
  if (fascia) return (base * fascia.percentuale) / 100
  return forma.progressioneOltre === null ? 0 : applicaScaglioni(base, forma.progressioneOltre)
}

/** Il dettaglio per scaglione, che esiste solo se l'ente non è ad aliquota unica. */
const dettaglioScaglioni = (
  base: number,
  scaglioni: readonly Scaglione[] | undefined,
  idPrefisso: string,
  fonte: Fonte,
  prosa: Prosa,
): readonly Passo[] | undefined => {
  if (scaglioni === undefined) return undefined
  const passi: Passo[] = []
  scaglioni.forEach((s, i) => {
    const da: number = s.da
    const a: number = s.a ?? Number.POSITIVE_INFINITY
    if (base <= da) return
    const quota = Math.min(base, a) - da
    passi.push({
      id: `${idPrefisso}-scaglione-${i + 1}`,
      etichetta: descriviScaglione(s, prosa),
      regola:
        s.a === null
          ? prosa.t('scaglione.regola.ultimo', { da: prosa.f(da) })
          : prosa.t('scaglione.regola', { da: prosa.f(da), a: prosa.f(s.a) }),
      spiegazione: prosa.t('scaglione.spiegazione', { quota: prosa.f(quota) }),
      parametro: { tipo: 'aliquota', valore: s.aliquota, fonte },
      esito: esitoNeutro(quota, (quota * s.aliquota) / 100),
    })
  })
  return passi
}

// Il motore

export function calcolaNetto(
  input: Input,
  regime: Regime,
  enti: EntiRisolti,
  assunzioni: readonly AssunzioneDichiarata[],
  lingua: Lingua,
): Risultato {
  const regole = regime.fontiRegola
  const passi: Passo[] = []
  const prosa = componiProsa(lingua)
  const { f, p, r, t } = prosa

  const ral: number = input.ral
  // D-052: nessun default qui. Il campo è obbligatorio nel tipo, e il valore
  // iniziale del prodotto vive nel livello che valida l'input.
  const mensilita: Mensilita = input.mensilita

  // 1. RAL

  passi.push({
    id: 'ral',
    etichetta: t('ral.etichetta'),
    /*
      Nessuna `fonti`, nessuna `regola`, nessuna `spiegazione`: la RAL è un
      input, non l'applicazione di una norma, e non ha nulla da spiegare che
      la pagina non dica già. È il passo che apre la catena, e il suo valore
      è tutto ciò che porta.
    */
    esito: esitoNeutro(ral, ral),
  })

  // 2. Ramo contributivo

  // Art. 12 c. 3 L. 153/1969: le somme si assumono al lordo di qualsiasi
  // contributo e trattenuta. La base è quindi il lordo, e la catena non è
  // circolare: si parte dal lordo, si sottrae, si ottiene l'imponibile fiscale.
  const retribuzioneImponibile = ral

  const apprendista = input.tipoContratto === 'apprendistato'
  const aliquotaContributiva = apprendista
    ? regime.contributi.aliquotaApprendista
    : regime.contributi.aliquotaOrdinaria

  const contributi = (retribuzioneImponibile * aliquotaContributiva.valore) / 100

  passi.push({
    id: 'contributi-ivs',
    etichetta: t('contributi.etichetta'),
    natura: 'previdenza',
    regola: t('contributi.regola'),
    spiegazione: apprendista
      ? t('contributi.spiegazione.apprendista')
      : t('contributi.spiegazione.ordinaria'),
    fonti: regole['aliquota-ivs'],
    parametro: {
      tipo: 'aliquota',
      valore: aliquotaContributiva.valore,
      fonte: aliquotaContributiva.fonte,
    },
    esito: esitoSottrae(retribuzioneImponibile, contributi),
    dettaglio: [
      {
        id: 'base-contributiva',
        etichetta: t('base-contributiva.etichetta'),
        regola: t('base-contributiva.regola'),
        spiegazione: t('base-contributiva.spiegazione'),
        fonti: regole['base-contributiva'],
        esito: esitoNeutro(ral, retribuzioneImponibile),
      },
    ],
  })

  // Quota aggiuntiva 1%.
  //
  // ⚠️ La condizione del 10% è riferita al regime pensionistico, non al
  // lavoratore: l'art. 3-ter si applica ai regimi «che prevedano aliquote
  // contributive a carico del lavoratore inferiori al 10 per cento». Si
  // verifica quindi l'aliquota ordinaria anche quando il contribuente è un
  // apprendista, che è iscritto allo stesso regime di tutti gli altri.
  const { quotaAggiuntiva } = regime.contributi
  const regimeSottoLimite =
    regime.contributi.aliquotaOrdinaria.valore < quotaAggiuntiva.aliquotaMassimaRegime.valore
  const soglia: number = quotaAggiuntiva.sogliaPrimaFascia.valore
  const eccedenza = retribuzioneImponibile - soglia

  /*
   * ⚠️ Quanto vale la quota si decide qui, una volta sola, e non lo si
   * ricalcola più.
   *
   * Prima questa espressione stava scritta due volte — nel passo che la
   * mostra e nel totale che entra nell'imponibile — insieme alla condizione
   * che la governa. Era la doppia verità che D-003 esiste per impedire,
   * dentro `core/`: due sedi che devono restare d'accordo e nessuno che le
   * costringa a farlo.
   *
   * ⚠️ E nessun test l'avrebbe vista. `nettoAnnuo` è derivato dalla
   * traccia, quindi l'invariante «la somma degli effetti torna al netto»
   * resterebbe verde anche se il totale divergesse dal passo: a sbagliare
   * sarebbe `rc`, e con lui IRPEF, detrazioni e addizionali — tutta la catena
   * a valle, con un numero perfettamente plausibile. È la stessa lezione di
   * D-066: un'invariante verificata dove è vera per costruzione dà copertura
   * zero.
   */
  const quotaDovuta =
    regimeSottoLimite && eccedenza > 0 ? (eccedenza * quotaAggiuntiva.aliquota.valore) / 100 : 0

  const parametroSoglia = {
    tipo: 'soglia',
    valore: quotaAggiuntiva.sogliaPrimaFascia.valore,
    fonte: quotaAggiuntiva.sogliaPrimaFascia.fonte,
  } as const

  if (!regimeSottoLimite) {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: t('quota.etichetta'),
      natura: 'previdenza',
      regola: t('quota.regola.regime'),
      spiegazione: t('quota.spiegazione.regime'),
      fonti: regole['quota-aggiuntiva'],
      parametro: parametroSoglia,
      esito: {
        stato: 'nonDovuto',
        ragione: t('quota.ragione.regime', {
          aliquotaOrdinaria: p(regime.contributi.aliquotaOrdinaria.valore),
          limite: p(quotaAggiuntiva.aliquotaMassimaRegime.valore),
        }),
      },
    })
  } else if (eccedenza <= 0) {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: t('quota.etichetta'),
      natura: 'previdenza',
      regola: t('quota.regola'),
      spiegazione: t('quota.spiegazione.sotto-soglia'),
      fonti: regole['quota-aggiuntiva'],
      parametro: parametroSoglia,
      esito: {
        stato: 'nonDovuto',
        ragione: t('quota.ragione.sotto-soglia', {
          retribuzione: f(retribuzioneImponibile),
          soglia: f(soglia),
        }),
      },
    })
  } else {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: t('quota.etichetta'),
      natura: 'previdenza',
      regola: t('quota.regola'),
      spiegazione: t('quota.spiegazione.applicata', { soglia: f(soglia) }),
      fonti: regole['quota-aggiuntiva'],
      parametro: {
        tipo: 'aliquota',
        valore: quotaAggiuntiva.aliquota.valore,
        fonte: quotaAggiuntiva.aliquota.fonte,
      },
      esito: esitoSottrae(eccedenza, quotaDovuta),
    })
  }

  const contributiTotali = contributi + quotaDovuta

  // 3. Dal lordo all'imponibile fiscale

  // Art. 51 c. 2 lett. a): i contributi obbligatori non concorrono a formare
  // il reddito. È un'esclusione, non una deduzione ex art. 10 — per questo il
  // reddito complessivo nasce già al netto e la catena resta lineare.
  const rc = ral - contributiTotali
  const rld = rc

  passi.push({
    id: 'reddito-complessivo',
    etichetta: t('reddito-complessivo.etichetta'),
    regola: t('reddito-complessivo.regola'),
    spiegazione: t('reddito-complessivo.spiegazione'),
    fonti: regole['esclusione-contributi-dal-reddito'],
    esito: esitoNeutro(ral, rc),
  })

  // 4. Ramo erariale

  const lorda = applicaScaglioni(rc, regime.irpef.scaglioni.valore)

  const dettaglioIrpef: Passo[] = [
    {
      id: 'irpef-lorda',
      etichetta: t('irpef-lorda.etichetta'),
      regola: t('irpef-lorda.regola'),
      spiegazione: t('irpef-lorda.spiegazione'),
      fonti: regole['scaglioni-irpef'],
      parametro: {
        tipo: 'scaglioni',
        valore: { forma: 'scaglioni-vigenti', scaglioni: regime.irpef.scaglioni.valore },
        fonte: regime.irpef.scaglioni.fonte,
      },
      esito: esitoNeutro(rc, lorda),
      dettaglio: dettaglioScaglioni(
        rc,
        regime.irpef.scaglioni.valore,
        'irpef-lorda',
        regime.irpef.scaglioni.fonte,
        prosa,
      ),
    },
  ]

  // Detrazione art. 13, con il troncamento del c. 6 e l'incremento del c. 1.1.
  const detrazione = regime.detrazioneLavoroDipendente
  const fasciaDetrazione: FasciaDetrazione | undefined = trovaFascia(detrazione.fasce.valore, rc)
  const detrazioneComma1 = fasciaDetrazione
    ? valutaFormula(fasciaDetrazione.formula, rc, regime.troncamentoRapportiDetrazione.valore)
    : 0

  const incremento = detrazione.incrementoFasciaIntermedia.valore
  const spettaIncremento = rc > incremento.redditoDa && rc <= incremento.redditoA
  const detrazioneArt13 = detrazioneComma1 + (spettaIncremento ? incremento.importo : 0)

  const passoDetrazione: Passo = {
    id: 'detrazione-art-13',
    etichetta: t('detrazione.etichetta'),
    regola: t('detrazione.regola'),
    spiegazione: t('detrazione.spiegazione'),
    // Due regole in un passo solo: la detrazione e il troncamento del suo rapporto.
    fonti: [...regole['detrazione-lavoro-dipendente'], ...regole['troncamento-rapporti']],
    parametro:
      fasciaDetrazione && fasciaDetrazione.formula.forma === 'lineare-decrescente'
        ? {
            tipo: 'formula',
            espressione: fasciaDetrazione.formula.espressione,
            applicata: `${f(fasciaDetrazione.formula.base)} + ${f(fasciaDetrazione.formula.quota)} × ${r(
              tronca(
                (fasciaDetrazione.formula.riferimento - rc) / fasciaDetrazione.formula.ampiezza,
                regime.troncamentoRapportiDetrazione.valore,
              ),
              regime.troncamentoRapportiDetrazione.valore,
            )} = ${f(detrazioneComma1)}`,
            fonte: detrazione.fasce.fonte,
          }
        : { tipo: 'importo', valore: euro(detrazioneComma1), fonte: detrazione.fasce.fonte },
    esito: esitoNeutro(rc, detrazioneArt13),
    dettaglio: spettaIncremento
      ? [
          {
            id: 'detrazione-art-13-incremento',
            etichetta: t('detrazione-incremento.etichetta', {
              da: f(incremento.redditoDa),
              a: f(incremento.redditoA),
            }),
            regola: t('detrazione-incremento.regola'),
            spiegazione: t('detrazione-incremento.spiegazione'),
            parametro: {
              tipo: 'importo',
              valore: incremento.importo,
              fonte: detrazione.incrementoFasciaIntermedia.fonte,
            },
            esito: esitoNeutro(detrazioneComma1, detrazioneArt13),
          },
        ]
      : undefined,
  }
  dettaglioIrpef.push(passoDetrazione)

  // ⚠️ Il gate del trattamento integrativo si valuta qui, prima di sommare
  // la detrazione da cuneo.
  //
  // La condizione confronta l'imposta lorda con la sola detrazione dell'art. 13
  // c. 1: l'elenco del DL 3/2020 è del 2020 e non può contenere una detrazione
  // creata nel 2025. Sommare tutte le detrazioni darebbe lo stesso numero nel
  // caso standard — la banda in cui il TI spetta è ampiamente sotto quella in
  // cui opera il cuneo — ma il codice sarebbe sbagliato e nessun test sul
  // risultato lo scoprirebbe (T-002).
  //
  // Sul c. 1.1: la norma non dice se l'importo aumentato sia ancora «spettante
  // ai sensi del comma 1». Qui la domanda è morta, perché il TI richiede un
  // reddito sotto la propria soglia e l'incremento parte molto più in alto
  // (T-003). Si usa comunque il valore del solo c. 1, che è la lettura
  // letterale.
  const ti = regime.trattamentoIntegrativo
  const sottoSogliaTi = rc <= ti.sogliaRedditoComplessivo.valore
  const sogliaGateTi = detrazioneComma1 - ti.scartoSulGate.valore
  const capienzaTi = lorda > sogliaGateTi
  const spettaTi = sottoSogliaTi && capienzaTi

  // Detrazione da cuneo. Il rapporto non si tronca: la clausola delle quattro
  // cifre decimali è dell'art. 13 c. 6 e dell'art. 12 c. 4, e questa detrazione
  // vive fuori dal TUIR.
  const fasciaCuneo = trovaFascia(regime.cuneo.detrazione.fasce.valore, rc)
  const detrazioneCuneo = fasciaCuneo ? valutaFormula(fasciaCuneo.formula, rc) : 0

  if (fasciaCuneo) {
    dettaglioIrpef.push({
      id: 'detrazione-cuneo',
      etichetta: t('detrazione-cuneo.etichetta'),
      regola: t('detrazione-cuneo.regola'),
      spiegazione: t('detrazione-cuneo.spiegazione'),
      fonti: regole['detrazione-cuneo'],
      parametro:
        fasciaCuneo.formula.forma === 'lineare-decrescente'
          ? {
              tipo: 'formula',
              espressione: fasciaCuneo.formula.espressione,
              applicata: `${f(detrazioneCuneo)}`,
              fonte: regime.cuneo.detrazione.fasce.fonte,
            }
          : { tipo: 'importo', valore: euro(detrazioneCuneo), fonte: regime.cuneo.detrazione.fasce.fonte },
      esito: esitoNeutro(detrazioneArt13, detrazioneArt13 + detrazioneCuneo),
    })
  }

  // Art. 11 c. 3: le detrazioni si operano sull'imposta lorda «fino alla
  // concorrenza del suo ammontare». Il pavimento a zero è una citazione, non
  // un'assunzione — e senza di esso in fascia bassa si producono imposte
  // negative.
  const detrazioniTotali = detrazioneArt13 + detrazioneCuneo
  const netta = Math.max(0, lorda - detrazioniTotali)

  dettaglioIrpef.push({
    id: 'irpef-netta',
    etichetta: t('irpef-netta.etichetta'),
    regola: t('irpef-netta.regola'),
    spiegazione:
      netta > 0 ? t('irpef-netta.spiegazione.capiente') : t('irpef-netta.spiegazione.incapiente'),
    /*
     * ⚠️ Nessun parametro, ed è una correzione (D-026).
     *
     * Qui stava `detrazioniTotali` con la fonte degli scaglioni: due errori in
     * una riga. Il totale delle detrazioni è una grandezza calcolata, non un
     * numero che una norma fissa; e l'art. 11 c. 1 sono gli scaglioni, che con
     * il pavimento a zero non c'entrano.
     *
     * D-026 nomina esattamente questo scambio: la fonte sul parametro dice *da
     * dove viene il numero*, e un numero che il motore ha appena calcolato non
     * viene da nessuna parte se non dal calcolo. Il passo porta la regola —
     * l'art. 11 c. 3, il pavimento — e le grandezze stanno in `entra` e `esce`,
     * che è il loro posto.
     */
    fonti: regole['pavimento-imposta-netta'],
    esito: esitoNeutro(lorda, netta),
  })

  passi.push({
    id: 'irpef',
    etichetta: t('irpef.etichetta'),
    natura: 'erariale',
    regola: t('irpef.regola'),
    spiegazione: t('irpef.spiegazione'),
    esito: esitoSottrae(rc, netta),
    dettaglio: dettaglioIrpef,
  })

  // 5. Ramo locale

  // Le addizionali dipendono dall'esito del ramo IRPEF, non solo dalla sua
  // base. Il gate è binario: o si applica sull'intera base, o non si applica
  // affatto. Non esiste una riduzione parziale.
  const gateAperto = netta > 0

  passi.push({
    id: 'gate-addizionali',
    etichetta: gateAperto ? t('gate.etichetta.aperto') : t('gate.etichetta.chiuso'),
    regola: t('gate.regola'),
    spiegazione: t('gate.spiegazione'),
    // Il gate è due norme, una per tributo.
    fonti: regole['gate-addizionali'],
    esito: {
      stato: 'verifica',
      superata: gateAperto,
      grandezzaLetta: euro(netta),
      ragione: gateAperto ? t('gate.ragione.aperto', { netta: f(netta) }) : t('gate.ragione.chiuso'),
    },
  })

  // Addizionale regionale.
  //
  // ⚠️ Il ramo regionale ha quattro assi, e ognuno è stato aggiunto dopo che
  // un dato ha falsificato l'affermazione che non servisse: forma
  // dell'aliquota, che ammette anche la fascia intera (D-062) · soglia di
  // esenzione a cliff (D-057) · detrazioni proprie con pavimento a zero
  // (D-061) · deduzione dalla base (D-064).
  //
  // L'argomento dal silenzio dell'art. 50 — *l'articolo non lo prevede, quindi
  // non esiste* — ha quindi fallito quattro volte. Ciò che manca non è la
  // rappresentazione dei meccanismi ma la norma statale che li autorizza:
  // il valore lo fissa l'atto dell'ente, ed è la riserva che D-059 ha reso
  // dichiarabile invece di tacere.
  const { regionale, comunale } = enti

  if (regionale.stato === 'nonIstituito') {
    passi.push({
      id: 'addizionale-regionale',
      etichetta: t('regionale.etichetta', { ente: regionale.nome }),
      natura: 'locale',
      regola: t('regionale.regola.non-istituita'),
      spiegazione: t('regionale.spiegazione.non-istituita'),
      esito: {
        stato: 'nonDovuto',
        ragione: t('regionale.ragione.non-istituita', { ente: regionale.nome }),
      },
    })
  } else if (!gateAperto) {
    passi.push({
      id: 'addizionale-regionale',
      etichetta: t('regionale.etichetta', { ente: regionale.nome }),
      natura: 'locale',
      regola: t('regionale.regola.gate'),
      spiegazione: t('addizionale.spiegazione.gate'),
      fonti: regole['gate-addizionali'],
      esito: { stato: 'nonDovuto', ragione: t('addizionale.ragione.gate') },
    })
  } else {
    const forma = regionale.parametri.aliquota
    const citataSoglia = regionale.parametri.sogliaEsenzione
    const sogliaRegionale = citataSoglia === null ? null : citataSoglia.valore
    const esenteRegionale = sogliaRegionale !== null && rc <= sogliaRegionale

    /**
     * ⚠️ Anche l'ente regionale può avere una soglia, ed è un cliff (D-057).
     *
     * Stessa meccanica della comunale, e stessa forma nella traccia: la soglia
     * è una verifica con la sua ragione, non una voce a zero.
     *
     * ⚠️ La citazione c'è, ed è l'atto dell'ente — con la sua riserva
     * (D-059). Il gate delle addizionali e la soglia comunale citano una norma
     * statale; qui quella norma non risulta — l'art. 50 non prevede la soglia,
     * ed è proprio l'argomento dal silenzio che questo campo ha falsificato per
     * la terza volta. Scrivere quell'articolo per simmetria sarebbe inventare
     * una citazione; lasciare il passo senza fonti aggirerebbe D-029, che ha
     * reso `fontiRegola` un `Record` pieno perché una regola non potesse entrare
     * senza citazione.
     *
     * La stessa `Fonte` sta due volte, e non è una ripetizione: sul
     * `parametro` dice *da dove viene il valore*, sul passo dice *chi stabilisce
     * la regola*. Che siano lo stesso atto è l'accertamento — questa è una
     * regola la cui unica base è la deliberazione dell'ente.
     */
    const passoSogliaRegionale: Passo | undefined =
      sogliaRegionale === null
        ? undefined
        : {
            id: 'soglia-esenzione-regionale',
            etichetta: t('soglia-esenzione.etichetta', { soglia: f(sogliaRegionale) }),
            regola: t('soglia-esenzione-regionale.regola'),
            fonti: [citataSoglia!.fonte],
            spiegazione: esenteRegionale
              ? t('soglia-esenzione.spiegazione.esente', { soglia: f(sogliaRegionale) })
              : t('soglia-esenzione.spiegazione.dovuta'),
            parametro: { tipo: 'soglia', valore: sogliaRegionale, fonte: citataSoglia!.fonte },
            esito: {
              stato: 'verifica',
              superata: !esenteRegionale,
              grandezzaLetta: euro(rc),
              ragione: esenteRegionale
                ? t('soglia-esenzione.ragione.esente', { rc: f(rc), soglia: f(sogliaRegionale) })
                : t('soglia-esenzione.ragione.dovuta', { rc: f(rc), soglia: f(sogliaRegionale) }),
            },
          }

    if (esenteRegionale) {
      passi.push({
        id: 'addizionale-regionale',
        etichetta: t('regionale.etichetta', { ente: regionale.nome }),
        natura: 'locale',
        regola: t('regionale.regola.esente'),
        spiegazione: t('regionale.spiegazione.esente'),
        fonti: [citataSoglia!.fonte],
        esito: {
          stato: 'nonDovuto',
          ragione: t('regionale.ragione.esente', {
            rc: f(rc),
            soglia: f(sogliaRegionale!),
            ente: regionale.nome,
          }),
        },
        dettaglio: [passoSogliaRegionale!],
      })
    } else {
      /*
       * La deduzione dalla base (D-064).
       *
       * ⚠️ Agisce su un piano diverso da tutto il resto di questo blocco.
       * La soglia di esenzione decide *se* si paga, le detrazioni abbattono
       * *l'imposta già calcolata*; questa cambia il reddito su cui l'imposta
       * si calcola. È la stessa distinzione fra deduzione e detrazione che il
       * ramo erariale porta fin dall'inizio, e qui compare sul ramo locale.
       *
       * ⚠️ Il diritto è a cliff, l'effetto no. Sopra `redditoMassimo` la
       * deduzione non spetta affatto — non decresce — e la base torna intera.
       * A Trento i due numeri coincidono, quindi sotto la soglia la base è
       * sempre zero; ma `Math.max(0, …)` sta qui perché il tipo ammette un
       * `importo` minore del `redditoMassimo`, e una base negativa produrrebbe
       * un'addizionale negativa invece di zero.
       *
       * ⚠️ Le condizioni continuano a leggere il reddito complessivo, non la
       * base dedotta, ed è ciò che dicono gli atti: soglia di esenzione e
       * fasce delle detrazioni sono scritte su *reddito imponibile*. Solo
       * l'aliquota legge la base. Nessun ente ha oggi deduzione e una delle
       * altre due, quindi la scelta non è osservabile sui dati 2026 — e per
       * questo va scritta invece che lasciata implicita.
       */
      const deduzione = regionale.parametri.deduzione
      const deduzioneSpetta = deduzione !== null && rc <= deduzione.redditoMassimo
      const baseRegionale = deduzioneSpetta ? Math.max(0, rc - deduzione.importo) : rc

      const lorda = totaleAddizionale(baseRegionale, forma)
      const dettaglioRegionale: Passo[] = []
      if (passoSogliaRegionale) dettaglioRegionale.push(passoSogliaRegionale)

      /*
       * ⚠️ Il passo esiste solo se l'ente prevede la deduzione, e i due
       * esiti non sono intercambiabili: `applicato` quando spetta, perché c'è
       * un'aritmetica da mostrare — `entra` il reddito, `esce` la base; e
       * `nonDovuto` quando non spetta, perché lì non c'è nessun numero da
       * mostrare, solo una ragione.
       *
       * ⚠️ Non è solo semantica: regge l'invariante di D-066. Un passo
       * `applicato` entra fra le uscite da cui la presentazione riconosce se i
       * figli sono addendi di un totale o anelli di una catena. Quando la
       * deduzione spetta la base è zero, non ci sono passi per scaglione, e
       * l'unico figlio *è* il totale; quando non spetta il passo si sfila e i
       * figli restano gli scaglioni, che sommano come prima. Renderlo
       * `applicato` in entrambi i casi romperebbe il riconoscimento proprio
       * sugli enti che questa voce serve.
       */
      if (deduzione !== null) {
        dettaglioRegionale.push({
          id: 'deduzione-regionale',
          etichetta: t('deduzione-regionale.etichetta', { importo: f(deduzione.importo) }),
          regola: t('deduzione-regionale.regola'),
          fonti: [deduzione.fonte],
          parametro: { tipo: 'importo', valore: deduzione.importo, fonte: deduzione.fonte },
          spiegazione: deduzioneSpetta
            ? t('deduzione-regionale.spiegazione')
            : t('deduzione-regionale.spiegazione.non-spetta'),
          esito: deduzioneSpetta
            ? esitoNeutro(rc, baseRegionale)
            : {
                stato: 'nonDovuto',
                ragione: t('deduzione-regionale.ragione.non-spetta', {
                  rc: f(rc),
                  soglia: f(deduzione.redditoMassimo),
                }),
              },
        })
      }

      // ⚠️ La fascia intera non è uno scaglione, e il dettaglio deve dirlo
      // (D-062). Un solo passo che dichiara l'aliquota applicata all'intero
      // imponibile: renderla come una riga di scaglione racconterebbe una
      // progressione che non c'è, ed è esattamente l'errore che la variante
      // esiste per chiudere.
      const fasciaIntera =
        forma.forma === 'fasce-intere' ? trovaFascia(forma.fasce, baseRegionale) : undefined
      if (fasciaIntera) {
        dettaglioRegionale.push({
          id: 'addizionale-regionale-fascia-intera',
          etichetta: t('regionale.fascia-intera.etichetta', { aliquota: p(fasciaIntera.percentuale) }),
          regola: t('regionale.fascia-intera.regola'),
          spiegazione: t('regionale.fascia-intera.spiegazione'),
          parametro: { tipo: 'aliquota', valore: fasciaIntera.percentuale, fonte: regionale.fonte },
          esito: esitoNeutro(baseRegionale, lorda),
        })
      } else {
        const scaglioni =
          forma.forma === 'unica'
            ? undefined
            : forma.forma === 'fasce-intere'
              ? (forma.progressioneOltre ?? undefined)
              : forma.scaglioni
        const perScaglione = dettaglioScaglioni(baseRegionale, scaglioni, 'addizionale-regionale', regionale.fonte, prosa)
        if (perScaglione) dettaglioRegionale.push(...perScaglione)
      }

      /*
       * Le detrazioni regionali, con il pavimento a zero (D-061).
       *
       * ⚠️ È il quarto pavimento del sistema, e va reso come tale. Se la
       * detrazione supera l'addizionale il risultato è zero, mai un credito:
       * lo scrivono la Provincia di Trento — *«se l'imposta dovuta risulta
       * minore della detrazione non sorge alcun credito d'imposta»* — e
       * Bolzano. Un passo che mostrasse la detrazione piena quando solo una
       * parte è stata usata direbbe una cosa falsa.
       *
       * Sono cumulabili: un ente può prevederne più d'una sulla stessa fascia.
       */
      const spettanti = regionale.parametri.detrazioni.filter(
        (d) => rc > d.redditoDa && (d.redditoA === null || rc <= d.redditoA),
      )
      const dovuta = spettanti.reduce((tot, d) => tot + d.importo, 0)
      const usata = Math.min(dovuta, lorda)
      const netta = lorda - usata

      if (spettanti.length > 0) {
        const quante =
          spettanti.length === 1
            ? t('detrazioni-regionali.una')
            : t('detrazioni-regionali.molte', { n: String(spettanti.length) })
        dettaglioRegionale.push({
          id: 'detrazioni-regionali',
          etichetta: t('detrazioni-regionali.etichetta'),
          regola: t('detrazioni-regionali.regola'),
          spiegazione:
            usata < dovuta
              ? t('detrazioni-regionali.spiegazione.pavimento', {
                  dovuta: f(dovuta),
                  usata: f(usata),
                })
              : t('detrazioni-regionali.spiegazione', { quante, ente: regionale.nome }),
          /*
           * ⚠️ Il parametro è la detrazione deliberata, non quella usata:
           * `usata` è `min(dovuta, lorda)`, cioè una grandezza calcolata dal
           * pavimento a zero, e nessuna legge regionale la fissa. Quanto se ne
           * sia potuto usare sta in `entra → esce` (D-026).
           *
           * Con più detrazioni cumulate non esiste un parametro, e il passo
           * non ne porta: l'importo complessivo si legge dall'esito.
           */
          parametro:
            spettanti.length === 1
              ? { tipo: 'importo', valore: spettanti[0].importo, fonte: spettanti[0].fonte }
              : undefined,
          esito: esitoNeutro(lorda, netta),
        })
      }

      passi.push({
        id: 'addizionale-regionale',
        etichetta: t('regionale.etichetta', { ente: regionale.nome }),
        natura: 'locale',
        regola: t('regionale.regola'),
        /*
         * ⚠️ La spiegazione ordinaria diventa falsa quando la deduzione
         * spetta. Dice *«si calcola sulla stessa base dell'IRPEF»*, e con una
         * deduzione dell'ente quella base non è più la stessa. Una frase che
         * resta uguale mentre il numero sotto cambia è la divergenza fra ciò
         * che si calcola e ciò che si spiega — cioè quello che la traccia
         * esiste per rendere impossibile.
         */
        spiegazione: deduzioneSpetta ? t('regionale.spiegazione.dedotta') : t('regionale.spiegazione'),
        parametro:
          forma.forma === 'unica'
            ? { tipo: 'aliquota', valore: forma.aliquota, fonte: regionale.fonte }
            : { tipo: 'scaglioni', valore: forma, fonte: regionale.fonte },
        esito: esitoSottrae(rc, netta),
        dettaglio: dettaglioRegionale.length > 0 ? dettaglioRegionale : undefined,
      })
    }

  }

  // Addizionale comunale: due gate in cascata, non uno.
  passi.push(
    costruisciAddizionaleComunale(
      comunale,
      rc,
      gateAperto,
      regole['gate-addizionali'],
      regole['soglia-esenzione-comunale'],
      prosa,
    ),
  )

  // 6. Ramo che aggiunge
  //
  // Somme che per legge non concorrono a formare il reddito: non riducono
  // l'imponibile, non hanno effetti a cascata sulla detrazione, si sommano al
  // netto. Restano due voci distinte e mai aggregate in un unico «bonus»:
  // una dipende solo dal reddito, l'altra dall'esito del ramo fiscale.

  // ⚠️ A esattamente la soglia di accesso spetta la somma e non la
  // detrazione: il c. 4 dice «non superiore a», il c. 6 «superiore a». Gli
  // operatori sono quelli della norma.
  const somma = regime.cuneo.somma
  const sottoSogliaCuneo = rc <= somma.sogliaAccesso.valore
  const fasciaSomma: FasciaSuIntero | undefined = trovaFascia(somma.fasce.valore, rld)

  if (!sottoSogliaCuneo) {
    passi.push({
      id: 'somma-cuneo',
      etichetta: t('somma-cuneo.etichetta'),
      natura: 'aggiunge',
      regola: t('somma-cuneo.regola.non-dovuta'),
      spiegazione: t('somma-cuneo.spiegazione.non-dovuta'),
      fonti: regole['somma-cuneo'],
      parametro: {
        tipo: 'soglia',
        valore: somma.sogliaAccesso.valore,
        fonte: somma.sogliaAccesso.fonte,
      },
      esito: {
        stato: 'nonDovuto',
        ragione: t('somma-cuneo.ragione.non-dovuta', {
          rc: f(rc),
          soglia: f(somma.sogliaAccesso.valore),
        }),
      },
    })
  } else {
    // ⚠️ Le fasce non sono scaglioni: la percentuale si applica all'intero
    // reddito di lavoro dipendente, non alla parte eccedente. Ogni confine è
    // quindi un salto secco verso il basso.
    const percentuale = fasciaSomma ? fasciaSomma.percentuale : aliquota(0)
    const importo = (rld * percentuale) / 100
    passi.push({
      id: 'somma-cuneo',
      etichetta: t('somma-cuneo.etichetta'),
      natura: 'aggiunge',
      regola: t('somma-cuneo.regola'),
      spiegazione: t('somma-cuneo.spiegazione'),
      fonti: regole['somma-cuneo'],
      parametro: { tipo: 'aliquota', valore: percentuale, fonte: somma.fasce.fonte },
      esito: esitoAggiunge(rld, importo),
    })
  }

  if (spettaTi) {
    passi.push({
      id: 'trattamento-integrativo',
      etichetta: t('trattamento-integrativo.etichetta'),
      natura: 'aggiunge',
      regola: t('trattamento-integrativo.regola.spetta'),
      spiegazione: t('trattamento-integrativo.spiegazione.spetta'),
      fonti: regole['trattamento-integrativo'],
      parametro: { tipo: 'importo', valore: ti.importo.valore, fonte: ti.importo.fonte },
      esito: esitoAggiunge(rc, ti.importo.valore),
    })
  } else {
    passi.push({
      id: 'trattamento-integrativo',
      etichetta: t('trattamento-integrativo.etichetta'),
      natura: 'aggiunge',
      regola: t('trattamento-integrativo.regola.non-spetta'),
      spiegazione: t('trattamento-integrativo.spiegazione.non-spetta'),
      fonti: regole['trattamento-integrativo'],
      parametro: {
        tipo: 'soglia',
        valore: ti.sogliaRedditoComplessivo.valore,
        fonte: ti.sogliaRedditoComplessivo.fonte,
      },
      esito: {
        stato: 'nonDovuto',
        ragione: !sottoSogliaTi
          ? t('trattamento-integrativo.ragione.sopra-soglia', {
              rc: f(rc),
              soglia: f(ti.sogliaRedditoComplessivo.valore),
            })
          : t('trattamento-integrativo.ragione.incapiente', {
              lorda: f(lorda),
              scarto: f(ti.scartoSulGate.valore),
              sogliaGate: f(sogliaGateTi),
            }),
      },
    })
  }

  // 7. Il netto è derivato, non calcolato

  // RAL più la somma degli effetti dei passi di primo livello. Il passo `ral`
  // vale zero: è il punto di partenza, non una voce che muove il netto.
  const nettoAnnuo = passi.reduce((totale, passo) => totale + effetto(passo), ral)

  const nettoMensile = Object.fromEntries(
    MENSILITA.map((m) => [m, euro(nettoAnnuo / m)]),
  ) as Record<Mensilita, ReturnType<typeof euro>>

  return {
    annoImposta: regime.anno,
    input,
    mensilita,
    grandezze: {
      redditoComplessivo: redditoComplessivo(rc),
      redditoLavoroDipendente: redditoLavoroDipendente(rld),
      retribuzionePrevidenziale: retribuzionePrevidenziale(retribuzioneImponibile),
    },
    enti,
    passi,
    nettoAnnuo: euro(nettoAnnuo),
    nettoMensile,
    // Solo le assunzioni che si applicano a questo calcolo. La pagina non può
    // quindi mostrarne una che il motore non ha considerato.
    assunzioni: assunzioni
      .filter((a) => assunzioneApplicabile(a.condizione, input, ral, enti))
      .map((a) => a.assunzione) as readonly Assunzione[],
  }
}

/**
 * L'addizionale comunale ha due gate in cascata: prima *l'imposta è
 * dovuta?*, poi *il contribuente è sotto la soglia di esenzione del suo
 * comune?*. Il secondo è indipendente dal primo, ed è un cliff: un euro sopra
 * la soglia e si paga sull'intera base, non sull'eccedenza.
 */
function costruisciAddizionaleComunale(
  ente: EnteRisolto<ParametriComunali>,
  rc: number,
  gateAperto: boolean,
  fontiGate: readonly Fonte[],
  fontiEsenzione: readonly Fonte[],
  prosa: Prosa,
): Passo {
  const { f, t } = prosa
  const etichetta = t('comunale.etichetta', { ente: ente.nome })

  if (ente.stato === 'nonIstituito') {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: t('comunale.regola.non-istituita'),
      spiegazione: t('comunale.spiegazione.non-istituita'),
      esito: {
        stato: 'nonDovuto',
        ragione: t('comunale.ragione.non-istituita', { ente: ente.nome }),
      },
    }
  }

  if (!gateAperto) {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: t('comunale.regola.gate'),
      spiegazione: t('addizionale.spiegazione.gate'),
      fonti: fontiGate,
      esito: { stato: 'nonDovuto', ragione: t('addizionale.ragione.gate') },
    }
  }

  const { aliquota: forma, sogliaEsenzione } = ente.parametri
  const esente = sogliaEsenzione !== null && rc <= sogliaEsenzione

  const passoSoglia: Passo | undefined =
    sogliaEsenzione === null
      ? undefined
      : {
          id: 'soglia-esenzione-comunale',
          etichetta: t('soglia-esenzione.etichetta', { soglia: f(sogliaEsenzione) }),
          regola: t('soglia-esenzione.regola'),
          spiegazione: esente
            ? t('soglia-esenzione.spiegazione.esente', { soglia: f(sogliaEsenzione) })
            : t('soglia-esenzione.spiegazione.dovuta'),
          fonti: fontiEsenzione,
          parametro: { tipo: 'soglia', valore: sogliaEsenzione, fonte: ente.fonte },
          esito: {
            stato: 'verifica',
            superata: !esente,
            grandezzaLetta: euro(rc),
            ragione: esente
              ? t('soglia-esenzione.ragione.esente', { rc: f(rc), soglia: f(sogliaEsenzione) })
              : t('soglia-esenzione.ragione.dovuta', { rc: f(rc), soglia: f(sogliaEsenzione) }),
          },
        }

  if (esente) {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: t('comunale.regola.esente'),
      spiegazione: t('comunale.spiegazione.esente'),
      fonti: fontiEsenzione,
      esito: {
        stato: 'nonDovuto',
        ragione: t('comunale.ragione.esente', {
          rc: f(rc),
          soglia: f(sogliaEsenzione!),
          ente: ente.nome,
        }),
      },
      dettaglio: passoSoglia ? [passoSoglia] : undefined,
    }
  }

  const importo = totaleAddizionale(rc, forma)
  const dettaglio: Passo[] = []
  if (passoSoglia) dettaglio.push(passoSoglia)
  const perScaglione = dettaglioScaglioni(
    rc,
    forma.forma === 'unica' ? undefined : forma.scaglioni,
    'addizionale-comunale',
    ente.fonte,
    prosa,
  )
  if (perScaglione) dettaglio.push(...perScaglione)

  return {
    id: 'addizionale-comunale',
    etichetta,
    natura: 'locale',
    regola: t('comunale.regola'),
    spiegazione:
      ente.stato === 'ereditato'
        ? t('comunale.spiegazione.ereditato', { anno: String(ente.annoDiProvenienza) })
        : t('comunale.spiegazione.deliberato'),
    fonti: ente.stato === 'ereditato' ? [ente.normaDiFallback] : undefined,
    parametro:
      forma.forma === 'unica'
        ? { tipo: 'aliquota', valore: forma.aliquota, fonte: ente.fonte }
        : { tipo: 'scaglioni', valore: forma, fonte: ente.fonte },
    esito: {
      stato: 'applicato',
      entra: euro(rc),
      esce: euro(importo),
      effettoSulNetto: euro(-importo),
      segno: 'sottrae',
    },
    dettaglio: dettaglio.length > 0 ? dettaglio : undefined,
  }
}
