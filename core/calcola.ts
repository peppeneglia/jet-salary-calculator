/**
 * Il motore di calcolo.
 *
 * TypeScript puro: nessun React, nessun Next, **nessun parametro normativo**.
 * Ogni numero che viene da una legge arriva dal `Regime` o dagli enti risolti,
 * che il motore riceve come argomenti.
 *
 * Il netto **non si calcola due volte**: è la RAL più la somma degli effetti dei
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
  type FormaAliquota,
  type FormulaDetrazione,
  type Input,
  type Mensilita,
  type ParametriComunali,
  type Passo,
  type Regime,
  type Risultato,
  type Scaglione,
} from './types'

// ---------------------------------------------------------------------------
// Helper puri
// ---------------------------------------------------------------------------

const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/** Formattazione dei numeri dentro i testi della traccia. Non tocca i valori. */
const formatta = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const f = (n: number): string => formatta.format(n)

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

/**
 * Estremo inferiore **escluso**, superiore **incluso**.
 *
 * Non è una convenzione arbitraria: riproduce gli operatori delle norme.
 * L'art. 13 c. 1 lett. a) dice *non superiore a 15.000*, la lett. b) *superiore
 * a 15.000 e non superiore a 28.000*. Lo stesso vale per la partizione fra il
 * c. 4 e il c. 6 della L. 207/2024, dove a esattamente 20.000 spetta la somma e
 * non la detrazione. Usare operatori diversi da quelli della norma, sulle
 * soglie, eroga due benefici o nessuno.
 */
const trovaFascia = <T extends { readonly redditoDa: number; readonly redditoA: number | null }>(
  fasce: readonly T[],
  reddito: number,
): T | undefined =>
  fasce.find((fascia) => reddito > fascia.redditoDa && (fascia.redditoA === null || reddito <= fascia.redditoA))

/**
 * Valuta una detrazione a tratti.
 *
 * `troncamento` si passa **solo** dove la norma lo impone. L'art. 13 c. 6 lo
 * prevede; la detrazione da cuneo vive fuori dal TUIR e non porta una clausola
 * equivalente, quindi lì il rapporto non si tronca.
 */
const valutaFormula = (formula: FormulaDetrazione, reddito: number, troncamento?: number): number => {
  if (formula.forma === 'costante') return formula.importo
  const rapporto = (formula.riferimento - reddito) / formula.ampiezza
  const usato = troncamento === undefined ? rapporto : tronca(rapporto, troncamento)
  return formula.base + formula.quota * usato
}

/** Descrive una forma di aliquota in linguaggio da mostrare. */
const descriviScaglione = (s: Scaglione): string =>
  s.a === null
    ? `Oltre ${f(s.da)} — ${s.aliquota}%`
    : `Da ${f(s.da)} a ${f(s.a)} — ${s.aliquota}%`

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
  effettoSulNetto: euro(-esce),
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
): boolean => {
  switch (condizione.tipo) {
    case 'sempre':
      return true
    case 'ral-supera':
      return ral > condizione.soglia.valore
    case 'contratto-diverso-da':
      return input.tipoContratto !== condizione.contratto
  }
}

/** L'effetto sul netto di un passo di primo livello. I passi annidati valgono zero. */
const effetto = (passo: Passo): number =>
  passo.esito.stato === 'applicato' ? passo.esito.effettoSulNetto : 0

// ---------------------------------------------------------------------------
// Addizionali: la parte che dipende dall'ente risolto
// ---------------------------------------------------------------------------

const totaleAddizionale = (base: number, forma: FormaAliquota): number =>
  forma.forma === 'unica' ? (base * forma.aliquota) / 100 : applicaScaglioni(base, forma.scaglioni)

/** Il dettaglio per scaglione, che esiste solo se l'ente non è ad aliquota unica. */
const dettaglioScaglioni = (
  base: number,
  forma: FormaAliquota,
  idPrefisso: string,
  fonte: Fonte,
): readonly Passo[] | undefined => {
  if (forma.forma === 'unica') return undefined
  const passi: Passo[] = []
  forma.scaglioni.forEach((s, i) => {
    const da: number = s.da
    const a: number = s.a ?? Number.POSITIVE_INFINITY
    if (base <= da) return
    const quota = Math.min(base, a) - da
    passi.push({
      id: `${idPrefisso}-scaglione-${i + 1}`,
      etichetta: descriviScaglione(s),
      regola: `Applicabile a scaglione di reddito da euro ${f(da)}${s.a === null ? '' : ` fino a euro ${f(s.a)}`}.`,
      spiegazione: `L'aliquota si applica alla sola quota di reddito compresa nella fascia: ${f(quota)}.`,
      parametro: { tipo: 'aliquota', valore: s.aliquota, fonte },
      esito: esitoNeutro(quota, (quota * s.aliquota) / 100),
    })
  })
  return passi
}

// ---------------------------------------------------------------------------
// Il motore
// ---------------------------------------------------------------------------

export function calcolaNetto(
  input: Input,
  regime: Regime,
  enti: EntiRisolti,
  assunzioni: readonly AssunzioneDichiarata[],
): Risultato {
  const regole = regime.fontiRegola
  const passi: Passo[] = []

  const ral: number = input.ral
  const mensilita: Mensilita = input.mensilita ?? 13

  // -------------------------------------------------------------------------
  // 1. RAL
  // -------------------------------------------------------------------------

  passi.push({
    id: 'ral',
    etichetta: 'Retribuzione annua lorda',
    // Nessuna `fonti`: la RAL è un input, non l'applicazione di una norma.
    regola: 'Punto di partenza dichiarato dall\'utente.',
    spiegazione:
      'La RAL comprende già le mensilità aggiuntive: il netto annuo non cambia con 12, 13 o 14 mensilità, cambia solo il divisore.',
    esito: esitoNeutro(ral, ral),
  })

  // -------------------------------------------------------------------------
  // 2. Ramo contributivo
  // -------------------------------------------------------------------------

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
    etichetta: 'Contributi previdenziali IVS',
    natura: 'previdenza',
    regola:
      'Aliquota a carico del lavoratore sulla retribuzione imponibile, assunta al lordo di qualsiasi contributo e trattenuta.',
    spiegazione: apprendista
      ? 'Non è una tassa: è contribuzione che genera un diritto pensionistico. L\'aliquota dell\'apprendista è ridotta rispetto a quella ordinaria, ed è l\'unico valore del tipo di contratto che muove il netto.'
      : 'Non è una tassa: è contribuzione che genera un diritto pensionistico. Esce dalla busta e torna come prestazione futura.',
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
        etichetta: 'Base contributiva',
        regola:
          'Le somme si assumono al lordo di qualsiasi contributo e trattenuta: la base è la retribuzione lorda.',
        spiegazione:
          'Nel caso standard coincide con la RAL, e non per approssimazione: tutte le voci che la legge esclude sono già fuori dal perimetro del calcolatore.',
        fonti: regole['base-contributiva'],
        esito: esitoNeutro(ral, retribuzioneImponibile),
      },
    ],
  })

  // Quota aggiuntiva 1%.
  //
  // ⚠️ La condizione del 10% è riferita al **regime pensionistico**, non al
  // lavoratore: l'art. 3-ter si applica ai regimi «che prevedano aliquote
  // contributive a carico del lavoratore inferiori al 10 per cento». Si
  // verifica quindi l'aliquota ordinaria anche quando il contribuente è un
  // apprendista, che è iscritto allo stesso regime di tutti gli altri.
  const { quotaAggiuntiva } = regime.contributi
  const regimeSottoLimite =
    regime.contributi.aliquotaOrdinaria.valore < quotaAggiuntiva.aliquotaMassimaRegime.valore
  const soglia: number = quotaAggiuntiva.sogliaPrimaFascia.valore
  const eccedenza = retribuzioneImponibile - soglia

  const parametroSoglia = {
    tipo: 'soglia',
    valore: quotaAggiuntiva.sogliaPrimaFascia.valore,
    fonte: quotaAggiuntiva.sogliaPrimaFascia.fonte,
  } as const

  if (!regimeSottoLimite) {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: 'Quota aggiuntiva 1%',
      natura: 'previdenza',
      regola:
        'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile, per i regimi con aliquote a carico del lavoratore inferiori al 10 per cento.',
      spiegazione:
        'Il presupposto è del regime pensionistico, non del singolo lavoratore: qui l\'aliquota ordinaria non sta sotto il limite, quindi il contributo si spegne per effetto della legge stessa.',
      fonti: regole['quota-aggiuntiva'],
      parametro: parametroSoglia,
      esito: {
        stato: 'nonDovuto',
        ragione: `L'aliquota ordinaria a carico del lavoratore (${regime.contributi.aliquotaOrdinaria.valore}%) non è inferiore al limite del ${quotaAggiuntiva.aliquotaMassimaRegime.valore}% previsto dalla norma.`,
      },
    })
  } else if (eccedenza <= 0) {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: 'Quota aggiuntiva 1%',
      natura: 'previdenza',
      regola:
        'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile.',
      spiegazione:
        'È l\'unica soglia del ramo contributivo. Sotto la prima fascia non si applica.',
      fonti: regole['quota-aggiuntiva'],
      parametro: parametroSoglia,
      esito: {
        stato: 'nonDovuto',
        ragione: `La retribuzione imponibile (${f(retribuzioneImponibile)}) non supera la prima fascia di retribuzione pensionabile, pari a ${f(soglia)}.`,
      },
    })
  } else {
    passi.push({
      id: 'quota-aggiuntiva-1',
      etichetta: 'Quota aggiuntiva 1%',
      natura: 'previdenza',
      regola:
        'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile.',
      spiegazione: `Si applica solo alla parte di retribuzione oltre ${f(soglia)}, non all'intera retribuzione.`,
      fonti: regole['quota-aggiuntiva'],
      parametro: {
        tipo: 'aliquota',
        valore: quotaAggiuntiva.aliquota.valore,
        fonte: quotaAggiuntiva.aliquota.fonte,
      },
      esito: esitoSottrae(eccedenza, (eccedenza * quotaAggiuntiva.aliquota.valore) / 100),
    })
  }

  const contributiTotali =
    contributi + (regimeSottoLimite && eccedenza > 0 ? (eccedenza * quotaAggiuntiva.aliquota.valore) / 100 : 0)

  // -------------------------------------------------------------------------
  // 3. Dal lordo all'imponibile fiscale
  // -------------------------------------------------------------------------

  // Art. 51 c. 2 lett. a): i contributi obbligatori **non concorrono a formare
  // il reddito**. È un'esclusione, non una deduzione ex art. 10 — per questo il
  // reddito complessivo nasce già al netto e la catena resta lineare.
  const rc = ral - contributiTotali
  const rld = rc

  passi.push({
    id: 'reddito-complessivo',
    etichetta: 'Reddito complessivo',
    regola:
      'I contributi previdenziali obbligatori non concorrono a formare il reddito: è un\'esclusione, non una deduzione.',
    spiegazione:
      'Il reddito su cui si calcolano le imposte nasce già al netto dei contributi. Per questo il loro impatto sul netto è maggiore del loro valore nominale: abbassano anche l\'imposta.',
    fonti: regole['esclusione-contributi-dal-reddito'],
    esito: esitoNeutro(ral, rc),
  })

  // -------------------------------------------------------------------------
  // 4. Ramo erariale
  // -------------------------------------------------------------------------

  const lorda = applicaScaglioni(rc, regime.irpef.scaglioni.valore)

  const dettaglioIrpef: Passo[] = [
    {
      id: 'irpef-lorda',
      etichetta: 'IRPEF lorda',
      regola: 'Aliquote per scaglioni di reddito.',
      spiegazione:
        'Ogni scaglione è tassato alla propria aliquota: solo la parte di reddito che supera una soglia sconta l\'aliquota più alta.',
      fonti: regole['scaglioni-irpef'],
      parametro: {
        tipo: 'scaglioni',
        valore: { forma: 'scaglioni-vigenti', scaglioni: regime.irpef.scaglioni.valore },
        fonte: regime.irpef.scaglioni.fonte,
      },
      esito: esitoNeutro(rc, lorda),
      dettaglio: dettaglioScaglioni(rc, {
        forma: 'scaglioni-vigenti',
        scaglioni: regime.irpef.scaglioni.valore,
      }, 'irpef-lorda', regime.irpef.scaglioni.fonte),
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
    etichetta: 'Detrazione per lavoro dipendente',
    regola:
      'Detrazione a tratti sul reddito complessivo; dove è una formula, il risultato del rapporto si assume nelle prime quattro cifre decimali.',
    spiegazione:
      'Non è una trattenuta: è uno sconto sull\'imposta. Nella fascia in cui decresce, ogni euro in più di reddito viene tassato e riduce anche la detrazione.',
    // Due regole in un passo solo: la detrazione e il troncamento del suo rapporto.
    fonti: [...regole['detrazione-lavoro-dipendente'], ...regole['troncamento-rapporti']],
    parametro:
      fasciaDetrazione && fasciaDetrazione.formula.forma === 'lineare-decrescente'
        ? {
            tipo: 'formula',
            espressione: fasciaDetrazione.formula.espressione,
            applicata: `${f(fasciaDetrazione.formula.base)} + ${f(fasciaDetrazione.formula.quota)} × ${tronca(
              (fasciaDetrazione.formula.riferimento - rc) / fasciaDetrazione.formula.ampiezza,
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
            etichetta: `Incremento fascia ${f(incremento.redditoDa)}–${f(incremento.redditoA)}`,
            regola: 'La detrazione spettante ai sensi del comma 1 è aumentata di un importo fisso.',
            spiegazione:
              'Un importo fisso che compare a una soglia e sparisce a un\'altra: è un gradino, non una curva.',
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

  // ⚠️ Il gate del trattamento integrativo si valuta **qui**, prima di sommare
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
      etichetta: 'Ulteriore detrazione (cuneo)',
      regola: 'Ulteriore detrazione dall\'imposta lorda, decrescente per fasce di reddito complessivo.',
      spiegazione:
        'La seconda gamba del taglio del cuneo fiscale: sotto la soglia di accesso è una somma erogata, sopra diventa una detrazione.',
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
    etichetta: 'IRPEF netta',
    regola: 'Le detrazioni si operano sull\'imposta lorda fino alla concorrenza del suo ammontare.',
    spiegazione:
      netta > 0
        ? 'Le detrazioni non generano credito: l\'imposta ha un pavimento a zero. Qui la capienza c\'è.'
        : 'Le detrazioni superano l\'imposta lorda, ma non generano credito: l\'imposta si ferma a zero e l\'eccedenza si perde.',
    fonti: regole['pavimento-imposta-netta'],
    parametro: { tipo: 'importo', valore: euro(detrazioniTotali), fonte: regime.irpef.scaglioni.fonte },
    esito: esitoNeutro(lorda, netta),
  })

  passi.push({
    id: 'irpef',
    etichetta: 'IRPEF',
    natura: 'erariale',
    regola:
      'Imposta progressiva per scaglioni sul reddito complessivo al netto degli oneri deducibili, ridotta dalle detrazioni fino alla concorrenza dell\'imposta lorda.',
    spiegazione:
      'L\'imposta erariale, quella che va allo Stato. Le detrazioni non sono una trattenuta: riducono l\'imposta già calcolata, e non possono portarla sotto zero.',
    esito: esitoSottrae(rc, netta),
    dettaglio: dettaglioIrpef,
  })

  // -------------------------------------------------------------------------
  // 5. Ramo locale
  // -------------------------------------------------------------------------

  // Le addizionali dipendono dall'**esito** del ramo IRPEF, non solo dalla sua
  // base. Il gate è binario: o si applica sull'intera base, o non si applica
  // affatto. Non esiste una riduzione parziale.
  const gateAperto = netta > 0

  passi.push({
    id: 'gate-addizionali',
    etichetta: gateAperto ? 'Le addizionali sono dovute' : 'Le addizionali non sono dovute',
    regola:
      'Le addizionali sono dovute se, per lo stesso anno, l\'IRPEF al netto delle detrazioni e dei crediti risulta dovuta.',
    spiegazione:
      'Il presupposto è binario: se l\'imposta è dovuta, le addizionali si applicano sull\'intera base; se non lo è, non si applicano affatto.',
    // Il gate è due norme, una per tributo.
    fonti: regole['gate-addizionali'],
    esito: {
      stato: 'verifica',
      superata: gateAperto,
      grandezzaLetta: euro(netta),
      ragione: gateAperto
        ? `L'IRPEF netta è ${f(netta)} e risulta dovuta: il presupposto delle addizionali è soddisfatto, quindi si applicano sull'intera base imponibile.`
        : 'L\'IRPEF netta è zero perché le detrazioni superano l\'imposta lorda: il presupposto non è soddisfatto e nessuna delle due addizionali è dovuta.',
    },
  })

  // Addizionale regionale.
  //
  // ⚠️ Le detrazioni regionali NON sono applicate. Il tipo `ParametriRegionali`
  // le ammette e i dati MEF le mostrano (Umbria, Lazio), ma la norma statale
  // che le autorizza non è stata reperita, e con essa restano aperte tre
  // domande: se abbiano un pavimento proprio, se siano a cliff o continue, e
  // come interagiscano con il gate. Finché non si chiudono, un ente con
  // detrazioni popolate riceve un'addizionale **più alta del reale**.
  const { regionale, comunale } = enti

  if (regionale.stato === 'nonIstituito') {
    passi.push({
      id: 'addizionale-regionale',
      etichetta: `Addizionale regionale — ${regionale.nome}`,
      natura: 'locale',
      regola: 'L\'addizionale è dovuta all\'ente impositore che l\'ha istituita.',
      spiegazione: 'Non è un\'aliquota pari a zero: il tributo non esiste per questo ente.',
      esito: {
        stato: 'nonDovuto',
        ragione: `L'addizionale regionale non è istituita per ${regionale.nome}.`,
      },
    })
  } else if (!gateAperto) {
    passi.push({
      id: 'addizionale-regionale',
      etichetta: `Addizionale regionale — ${regionale.nome}`,
      natura: 'locale',
      regola: 'L\'addizionale regionale è dovuta se per lo stesso anno l\'IRPEF risulta dovuta.',
      spiegazione: 'Il presupposto dipende dall\'esito del ramo IRPEF, non dalla sua base.',
      fonti: regole['gate-addizionali'],
      esito: {
        stato: 'nonDovuto',
        ragione: 'L\'IRPEF netta è zero, quindi il presupposto delle addizionali non è soddisfatto.',
      },
    })
  } else {
    const forma = regionale.parametri.aliquota
    const importo = totaleAddizionale(rc, forma)
    passi.push({
      id: 'addizionale-regionale',
      etichetta: `Addizionale regionale — ${regionale.nome}`,
      natura: 'locale',
      regola:
        'Aliquota deliberata dall\'ente impositore, applicata al reddito complessivo al netto degli oneri deducibili.',
      spiegazione:
        'Si calcola sulla stessa base dell\'IRPEF, non su quello che resta dopo averla pagata. E le detrazioni non la toccano.',
      parametro:
        forma.forma === 'unica'
          ? { tipo: 'aliquota', valore: forma.aliquota, fonte: regionale.fonte }
          : { tipo: 'scaglioni', valore: forma, fonte: regionale.fonte },
      esito: esitoSottrae(rc, importo),
      dettaglio: dettaglioScaglioni(rc, forma, 'addizionale-regionale', regionale.fonte),
    })

    // ⚠️ Ciò che il motore non modella non sparisce in silenzio (D-033).
    //
    // Il tipo ammette detrazioni regionali proprie e i dati MEF le mostrano, ma
    // la norma statale che le autorizza è un punto aperto: senza, restano
    // indecise tre cose — se abbiano un pavimento proprio, se siano a cliff o
    // continue, e come interagiscano con il gate. Il motore non le applica, e
    // deve dirlo: un numero mancante senza spiegazione è la forma peggiore di
    // errore, perché è plausibile.
    if (regionale.parametri.detrazioni.length > 0) {
      const totaleDetrazioni = regionale.parametri.detrazioni.reduce((t, d) => t + d.importo, 0)
      passi.push({
        id: 'detrazioni-regionali-non-applicate',
        etichetta: 'Detrazioni regionali non applicate',
        natura: 'locale',
        regola:
          'L\'ente impositore prevede detrazioni proprie dall\'addizionale regionale, con base giuridica in legge regionale.',
        spiegazione: `${regionale.nome} prevede detrazioni dall'addizionale regionale che questo calcolatore non applica. L'addizionale mostrata è quindi più alta di quella reale per chi vi ha diritto.`,
        parametro: { tipo: 'importo', valore: euro(totaleDetrazioni), fonte: regionale.fonte },
        esito: {
          stato: 'nonDovuto',
          ragione: `${regionale.nome} prevede ${regionale.parametri.detrazioni.length === 1 ? 'una detrazione propria' : `${regionale.parametri.detrazioni.length} detrazioni proprie`} dall'addizionale regionale, per un massimo di ${f(totaleDetrazioni)}. Il calcolatore non le applica: la norma statale che autorizza le regioni a concederle non è stata reperita, e senza di essa non è determinato se abbiano un pavimento proprio, se spettino per intero entro una banda di reddito o in modo continuo, e come si combinino con il presupposto dell'addizionale. Dove spettano, l'addizionale regionale qui calcolata è più alta del reale.`,
        },
      })
    }
  }

  // Addizionale comunale: due gate in cascata, non uno.
  passi.push(costruisciAddizionaleComunale(comunale, rc, gateAperto, regole['gate-addizionali'], regole['soglia-esenzione-comunale']))

  // -------------------------------------------------------------------------
  // 6. Ramo che aggiunge
  //
  // Somme che per legge non concorrono a formare il reddito: non riducono
  // l'imponibile, non hanno effetti a cascata sulla detrazione, si sommano al
  // netto. Restano due voci distinte e mai aggregate in un unico «bonus»:
  // una dipende solo dal reddito, l'altra dall'esito del ramo fiscale.
  // -------------------------------------------------------------------------

  // ⚠️ A esattamente la soglia di accesso spetta la somma e **non** la
  // detrazione: il c. 4 dice «non superiore a», il c. 6 «superiore a». Gli
  // operatori sono quelli della norma.
  const somma = regime.cuneo.somma
  const sottoSogliaCuneo = rc <= somma.sogliaAccesso.valore
  const fasciaSomma: FasciaSuIntero | undefined = trovaFascia(somma.fasce.valore, rld)

  if (!sottoSogliaCuneo) {
    passi.push({
      id: 'somma-cuneo',
      etichetta: 'Somma per il taglio del cuneo',
      natura: 'aggiunge',
      regola:
        'Somma che non concorre alla formazione del reddito, in percentuale sul reddito di lavoro dipendente, per reddito complessivo non superiore alla soglia di accesso.',
      spiegazione:
        'Sopra la soglia il beneficio non sparisce: cambia forma e diventa la detrazione applicata sull\'IRPEF.',
      fonti: regole['somma-cuneo'],
      parametro: {
        tipo: 'soglia',
        valore: somma.sogliaAccesso.valore,
        fonte: somma.sogliaAccesso.fonte,
      },
      esito: {
        stato: 'nonDovuto',
        ragione: `Il reddito complessivo (${f(rc)}) supera la soglia di accesso di ${f(somma.sogliaAccesso.valore)}. Sopra questa soglia opera l'ulteriore detrazione, non la somma.`,
      },
    })
  } else {
    // ⚠️ Le fasce non sono scaglioni: la percentuale si applica all'**intero**
    // reddito di lavoro dipendente, non alla parte eccedente. Ogni confine è
    // quindi un salto secco verso il basso.
    const percentuale = fasciaSomma ? fasciaSomma.percentuale : aliquota(0)
    const importo = (rld * percentuale) / 100
    passi.push({
      id: 'somma-cuneo',
      etichetta: 'Somma per il taglio del cuneo',
      natura: 'aggiunge',
      regola:
        'Somma che non concorre alla formazione del reddito, pari a una percentuale dell\'intero reddito di lavoro dipendente.',
      spiegazione:
        'Non è una detrazione e non passa dalle imposte: è denaro erogato che si somma al netto. La percentuale colpisce tutto il reddito, non la parte eccedente la soglia della fascia.',
      fonti: regole['somma-cuneo'],
      parametro: { tipo: 'aliquota', valore: percentuale, fonte: somma.fasce.fonte },
      esito: esitoAggiunge(rld, importo),
    })
  }

  if (spettaTi) {
    passi.push({
      id: 'trattamento-integrativo',
      etichetta: 'Trattamento integrativo',
      natura: 'aggiunge',
      regola:
        'Somma che non concorre alla formazione del reddito, a condizione che l\'imposta lorda superi la detrazione dell\'art. 13 c. 1 diminuita di un importo fisso.',
      spiegazione:
        'È denaro che si somma al netto senza passare dalle imposte. Spetta a chi ha imposta da pagare, e la soglia non coincide con il punto in cui l\'IRPEF netta diventa positiva.',
      fonti: regole['trattamento-integrativo'],
      parametro: { tipo: 'importo', valore: ti.importo.valore, fonte: ti.importo.fonte },
      esito: esitoAggiunge(rc, ti.importo.valore),
    })
  } else {
    passi.push({
      id: 'trattamento-integrativo',
      etichetta: 'Trattamento integrativo',
      natura: 'aggiunge',
      regola:
        'Somma che non concorre alla formazione del reddito per reddito complessivo non superiore alla soglia, e a condizione che l\'imposta lorda superi la detrazione dell\'art. 13 c. 1 diminuita di un importo fisso.',
      spiegazione:
        'Quando spetta, è denaro che si somma al netto senza passare dalle imposte.',
      fonti: regole['trattamento-integrativo'],
      parametro: {
        tipo: 'soglia',
        valore: ti.sogliaRedditoComplessivo.valore,
        fonte: ti.sogliaRedditoComplessivo.fonte,
      },
      esito: {
        stato: 'nonDovuto',
        ragione: !sottoSogliaTi
          ? `Il reddito complessivo (${f(rc)}) supera il limite di ${f(ti.sogliaRedditoComplessivo.valore)} previsto per il trattamento integrativo.`
          : `L'imposta lorda (${f(lorda)}) non supera la detrazione per lavoro dipendente diminuita di ${f(ti.scartoSulGate.valore)}, pari a ${f(sogliaGateTi)}: il trattamento integrativo non spetta.`,
      },
    })
  }

  // -------------------------------------------------------------------------
  // 7. Il netto è derivato, non calcolato
  // -------------------------------------------------------------------------

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
      .filter((a) => assunzioneApplicabile(a.condizione, input, ral))
      .map((a) => a.assunzione) as readonly Assunzione[],
  }
}

/**
 * L'addizionale comunale ha **due gate in cascata**: prima *l'imposta è
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
): Passo {
  const etichetta = `Addizionale comunale — ${ente.nome}`

  if (ente.stato === 'nonIstituito') {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: 'L\'addizionale è dovuta al comune che l\'ha istituita.',
      spiegazione:
        'Non è un\'aliquota pari a zero: il tributo non esiste in questo comune. Sono due modi diversi di non pagare nulla.',
      esito: {
        stato: 'nonDovuto',
        ragione: `L'addizionale comunale non è istituita nel comune di ${ente.nome}.`,
      },
    }
  }

  if (!gateAperto) {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: 'L\'addizionale comunale è dovuta se per lo stesso anno risulta dovuta l\'IRPEF.',
      spiegazione: 'Il presupposto dipende dall\'esito del ramo IRPEF, non dalla sua base.',
      fonti: fontiGate,
      esito: {
        stato: 'nonDovuto',
        ragione: 'L\'IRPEF netta è zero, quindi il presupposto delle addizionali non è soddisfatto.',
      },
    }
  }

  const { aliquota: forma, sogliaEsenzione } = ente.parametri
  const esente = sogliaEsenzione !== null && rc <= sogliaEsenzione

  const passoSoglia: Passo | undefined =
    sogliaEsenzione === null
      ? undefined
      : {
          id: 'soglia-esenzione-comunale',
          etichetta: `Soglia di esenzione: ${f(sogliaEsenzione)}`,
          regola:
            'Soglia di esenzione in ragione del possesso di specifici requisiti reddituali, stabilita con regolamento comunale.',
          spiegazione: esente
            ? `Il reddito complessivo non supera ${f(sogliaEsenzione)}: l'addizionale non è dovuta affatto.`
            : `È una soglia secca, non una franchigia: superata di un euro si paga sull'intero reddito, non sull'eccedenza. Qui il reddito la supera.`,
          fonti: fontiEsenzione,
          parametro: { tipo: 'soglia', valore: sogliaEsenzione, fonte: ente.fonte },
          esito: {
            stato: 'verifica',
            superata: !esente,
            grandezzaLetta: euro(rc),
            ragione: esente
              ? `Il reddito complessivo (${f(rc)}) non supera la soglia di esenzione di ${f(sogliaEsenzione)}.`
              : `Il reddito complessivo (${f(rc)}) supera la soglia di esenzione di ${f(sogliaEsenzione)}, quindi l'addizionale è dovuta sull'intera base.`,
          },
        }

  if (esente) {
    return {
      id: 'addizionale-comunale',
      etichetta,
      natura: 'locale',
      regola: 'L\'addizionale non è dovuta al di sotto della soglia di esenzione deliberata dal comune.',
      spiegazione:
        'Il secondo gate è indipendente dal primo: l\'IRPEF è dovuta, ma il comune esenta i redditi sotto una certa soglia.',
      fonti: fontiEsenzione,
      esito: {
        stato: 'nonDovuto',
        ragione: `Il reddito complessivo (${f(rc)}) non supera la soglia di esenzione di ${f(sogliaEsenzione!)} deliberata dal comune di ${ente.nome}.`,
      },
      dettaglio: passoSoglia ? [passoSoglia] : undefined,
    }
  }

  const importo = totaleAddizionale(rc, forma)
  const dettaglio: Passo[] = []
  if (passoSoglia) dettaglio.push(passoSoglia)
  const perScaglione = dettaglioScaglioni(rc, forma, 'addizionale-comunale', ente.fonte)
  if (perScaglione) dettaglio.push(...perScaglione)

  return {
    id: 'addizionale-comunale',
    etichetta,
    natura: 'locale',
    regola:
      'Aliquota deliberata dal comune, applicata al reddito complessivo al netto degli oneri deducibili, salva la soglia di esenzione.',
    spiegazione:
      ente.stato === 'ereditato'
        ? `Il comune non ha deliberato per l'anno d'imposta: per legge si applicano aliquota ed esenzione già vigenti nel ${ente.annoDiProvenienza}.`
        : 'Si calcola sulla stessa base dell\'IRPEF, e le detrazioni non la toccano.',
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
