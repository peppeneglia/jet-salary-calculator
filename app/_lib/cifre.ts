/**
 * Le cifre di `/spiegazione`, derivate e non riscritte.
 *
 * ⚠️ **Qui non c'è nessun numero.** È la regola che regge la pagina: ogni
 * valore mostrato arriva da `data/regime-2026.ts` o da `data/mef/`, con la
 * `Fonte` che ci viaggia insieme. Una pagina intitolata *le cifre* è la prima
 * che verrebbe la tentazione di scrivere a mano — ed è l'ultima su cui si
 * possa farlo: sarebbe una terza copia degli stessi parametri, che diverge in
 * silenzio dal motore e dalla propria citazione al primo aggiornamento.
 *
 * Cosa fa questo modulo, allora
 *
 * Tre cose, tutte derivazioni:
 *
 * 1. **Le curve.** Una detrazione a tratti è una spezzata, e i suoi vertici
 *    sono i confini delle fasce. Qui si costruiscono i vertici e si valuta la
 *    formula **con le funzioni del motore** (`trovaFascia`, `valutaFormula`),
 *    non con una seconda implementazione: la curva disegnata e il numero
 *    calcolato non possono divergere (D-077).
 * 2. **La mappa.** I ventuno enti regionali risolti, appaiati per nome alla
 *    propria sagoma di `data/geo/enti-2026.json`, con le stringhe già nella
 *    lingua di chi legge.
 * 3. **Le distribuzioni.** Quanti enti a ciascuna aliquota, quanti sopra il
 *    tetto: conteggi sui dati, mai affermazioni in prosa (D-070).
 *
 * ⚠️ **Il confine verso il client passa da qui, e vale la pena dire cosa
 * lo attraversa.** `mappa-enti.tsx` è un client component, e riceve i parametri
 * dei **ventun enti** — non i 7.897 comuni, che restano server-side come
 * sempre. Le **sagome no**: pesano 51 KiB e arrivano da `GET /api/geo`, una
 * volta per sessione, perché `/spiegazione` è in testata e non deve farle
 * pagare a chi non scorre fin laggiù (D-049, D-058). Le frasi nemmeno:
 * arrivano già risolte nella lingua giusta (D-069).
 */

import { trovaFascia, valutaFormula } from '../../core/calcola'
import type {
  CodiceLingua,
  Euro,
  FasciaSuIntero,
  Fonte,
  FormaAliquotaRegionale,
  Scaglione,
} from '../../core/types'
import geometrie from '../../data/geo/enti-2026.json'
import { regime2026, tettiAddizionali } from '../../data/regime-2026'
import { entiRegionaliRisolti } from './comuni'
import { formato } from './formato'
import { fasciaDa, fasciaFino, fasciaOltre } from './testi-spiegazione'

// ── Le curve ────────────────────────────────────────────────────────────────

export interface Punto {
  readonly x: number
  readonly y: number
}

export interface Curva {
  readonly punti: readonly Punto[]
  /** L'estremo dell'asse orizzontale: la curva è definita da 0 a qui. */
  readonly xMax: number
  /** Il valore più alto raggiunto, per scalare l'asse verticale. */
  readonly yMax: number
}

/**
 * Il centesimo con cui si attraversa una soglia.
 *
 * ⚠️ Non è un espediente di disegno: è il modo di rendere visibile un
 * **gradino**. Le fasce hanno estremo inferiore escluso e superiore incluso —
 * a 15.000 vale la lettera a), a 15.000,01 la lettera b) — e una spezzata che
 * toccasse la soglia una volta sola disegnerebbe una rampa dove la norma ha un
 * salto. Con due vertici a un centesimo di distanza il salto è verticale, come
 * nei fatti.
 */
const CENTESIMO = 0.01

/**
 * I vertici di una spezzata: gli estremi di ogni fascia, presi da entrambi i
 * lati, più i punti che il chiamante aggiunge.
 */
const vertici = (
  confini: readonly number[],
  xMax: number,
): readonly number[] => {
  const punti = new Set<number>([CENTESIMO, xMax])
  for (const c of confini) {
    if (c <= 0 || c > xMax) continue
    punti.add(c)
    punti.add(c + CENTESIMO)
  }
  return [...punti].sort((a, b) => a - b)
}

const curva = (xs: readonly number[], y: (x: number) => number, xMax: number): Curva => {
  const punti = xs.map((x) => ({ x, y: y(x) }))
  return { punti, xMax, yMax: Math.max(...punti.map((p) => p.y)) }
}

/** Fin dove arrivano gli assi: poco oltre l'ultima soglia che qualcosa attraversa. */
const REDDITO_MASSIMO_IN_GRAFICO = 55_000

/**
 * La detrazione dell'art. 13, comma 1 più comma 1.1.
 *
 * ⚠️ La condizione del +65 non è riscritta: si esprime come una fascia e si
 * passa a `trovaFascia`. Il rischio, su una soglia, non è sbagliare il numero —
 * è sbagliare l'operatore, e usare *maggiore* dove la norma dice *non
 * inferiore*. Un solo posto sa quali sono gli operatori giusti, ed è il motore.
 */
export const curvaDetrazioneArt13: Curva = (() => {
  const { fasce, incrementoFasciaIntermedia } = regime2026.detrazioneLavoroDipendente
  const incremento = incrementoFasciaIntermedia.valore
  const troncamento = regime2026.troncamentoRapportiDetrazione.valore

  const fasciaIncremento = [
    { redditoDa: incremento.redditoDa, redditoA: incremento.redditoA },
  ]

  const confini = [
    ...fasce.valore.flatMap((f) => [f.redditoDa as number, ...(f.redditoA === null ? [] : [f.redditoA as number])]),
    incremento.redditoDa as number,
    incremento.redditoA as number,
  ]

  return curva(
    vertici(confini, REDDITO_MASSIMO_IN_GRAFICO),
    (rc) => {
      const fascia = trovaFascia(fasce.valore, rc)
      const comma1 = fascia ? valutaFormula(fascia.formula, rc, troncamento) : 0
      const piu65 = trovaFascia(fasciaIncremento, rc) ? (incremento.importo as number) : 0
      return comma1 + piu65
    },
    REDDITO_MASSIMO_IN_GRAFICO,
  )
})()

/** La detrazione da cuneo: piena fra 20.000 e 32.000, poi in discesa fino a 40.000. */
export const curvaDetrazioneCuneo: Curva = (() => {
  const { fasce } = regime2026.cuneo.detrazione
  const confini = fasce.valore.flatMap((f) => [
    f.redditoDa as number,
    ...(f.redditoA === null ? [] : [f.redditoA as number]),
  ])

  return curva(
    vertici(confini, REDDITO_MASSIMO_IN_GRAFICO),
    (rc) => {
      const fascia = trovaFascia(fasce.valore, rc)
      // Il rapporto non si tronca: la clausola delle quattro cifre è dell'art.
      // 13 c. 6, e questa detrazione vive fuori dal TUIR.
      return fascia ? valutaFormula(fascia.formula, rc) : 0
    },
    REDDITO_MASSIMO_IN_GRAFICO,
  )
})()

/**
 * La somma del cuneo: percentuale sull'**intero** reddito, non sulla parte
 * eccedente. Ogni confine è quindi un salto secco verso il basso, e a 20.000
 * la somma sparisce del tutto.
 */
export const curvaSommaCuneo: Curva = (() => {
  const { somma } = regime2026.cuneo
  const soglia: number = somma.sogliaAccesso.valore
  const confini = [
    ...somma.fasce.valore.flatMap((f: FasciaSuIntero) => [
      f.redditoDa as number,
      ...(f.redditoA === null ? [] : [f.redditoA as number]),
    ]),
    soglia,
  ]

  return curva(
    vertici(confini, REDDITO_MASSIMO_IN_GRAFICO),
    (reddito) => {
      if (reddito > soglia) return 0
      const fascia = trovaFascia(somma.fasce.valore, reddito)
      return fascia ? (reddito * (fascia.percentuale as number)) / 100 : 0
    },
    REDDITO_MASSIMO_IN_GRAFICO,
  )
})()

// ── Gli enti regionali ──────────────────────────────────────────────────────

/** Una banda di aliquota, già scritta: «Da 15.000 € a 28.000 €» · «1,23%». */
export interface Banda {
  readonly fascia: string
  readonly aliquota: string
  /** Vero se questa banda supera il tetto dell'art. 50 c. 3. */
  readonly sopraIlTetto: boolean
}

/** Una regola dell'ente che non è un'aliquota: esenzione, deduzione, detrazione. */
export interface RegolaPropria {
  readonly etichetta: string
  readonly valore: string
}

export interface EnteInMappa {
  /** Il nome del prospetto MEF: è la chiave, e non si mostra. */
  readonly chiave: string
  /**
   * Il nome leggibile, ed è **anche la chiave con cui la sagoma si ritrova**.
   *
   * ⚠️ La geometria non è qui. Arriva al client da `GET /api/geo`, che
   * espone `{ nome, path }` con il nome già risolto da `data/nomi-enti.ts`:
   * l'appaiamento avviene lì, su questa stringa. È la ragione per cui il nome
   * leggibile non è solo presentazione.
   */
  readonly nome: string
  /**
   * Quanto è carico il grigio della sagoma, da 0 a 1.
   *
   * ⚠️ **Una scala di un solo inchiostro, e non è una rinuncia
   * cromatica.** Il verde di questo progetto ha un significato solo — quello
   * che resta al dipendente — e una mappa colorata per aliquota lo
   * spenderebbe per dire un'altra cosa. Restano l'inchiostro e la sua
   * intensità, che è esattamente ciò che una mappa di intensità deve variare.
   */
  readonly tono: number
  readonly forma: FormaAliquotaRegionale['forma']
  readonly bande: readonly Banda[]
  readonly aliquotaMassima: string
  readonly aliquotaMassimaValore: number
  readonly sopraIlTetto: boolean
  readonly regoleProprie: readonly RegolaPropria[]
  /**
   * La `Fonte` intera, non appiattita.
   *
   * ⚠️ Era un oggetto di stringhe già scritte — atto, data resa in parole,
   * `verificata: boolean`, riserva estratta a mano — e riscriveva in piccolo
   * ciò che `<Fonti>` fa in grande. Quel componente è già nel pacchetto di ogni
   * pagina, sa rendere le due provenienze e sa mostrare `nonVerificato` come
   * avviso: passargli il dato invece di una sua parafrasi toglie una seconda
   * sede in cui la stessa citazione può essere resa diversamente.
   */
  readonly fonte: Fonte
}

/** Tutte le aliquote di un ente, qualunque forma abbia. */
const aliquoteDi = (forma: FormaAliquotaRegionale): readonly number[] => {
  switch (forma.forma) {
    case 'unica':
      return [forma.aliquota]
    case 'fasce-intere':
      return [
        ...forma.fasce.map((f) => f.percentuale as number),
        ...(forma.progressioneOltre ?? []).map((s) => s.aliquota as number),
      ]
    default:
      return forma.scaglioni.map((s) => s.aliquota as number)
  }
}

/**
 * Le sagome esistenti, per nome MEF.
 *
 * ⚠️ **Qui si verifica soltanto, non si spedisce.** Le coordinate al client
 * arrivano da `GET /api/geo` — 51 KiB che si chiedono una volta per sessione,
 * invece di stare nel documento di una pagina che è in testata. La disciplina
 * è quella di D-049 e D-058 sull'elenco dei comuni, e la rotta esiste già.
 *
 * ⚠️ **Il controllo però resta, e non è ridondanza.**
 * `scripts/importa-geometrie.mjs` verifica l'appaiamento **quando lo si
 * esegue**, cioè una volta e offline: se qualcuno modificasse a mano uno dei
 * due file, quel controllo non si riaccenderebbe. Questo sì, a ogni render — e
 * costa un `Set` di ventun stringhe.
 */
const conSagoma = new Set(geometrie.enti.map((e) => e.nome))

export const provenienzaGeometrie = geometrie.provenienza
export const semplificazioneGeometrie = geometrie.semplificazione

/**
 * I ventuno enti, pronti da rendere.
 *
 * Riceve la lingua perché ogni cifra qui dentro esce già scritta: `1,23%` o
 * `1.23%`, `15.000 €` o `€15,000`. È la regola di `formato(lingua)` — la
 * convenzione di scrittura di un numero non è una costante del modulo — e
 * serve doppiamente qui, perché il componente che le mostra è un client
 * component e le frasi non devono attraversare il confine (D-069).
 */
export const entiPerLaMappa = (lingua: CodiceLingua): readonly EnteInMappa[] => {
  const { inPercentuale, inEuroTondo } = formato(lingua)
  const tetto: number = tettiAddizionali.regionale.valore

  const risolti = [...entiRegionaliRisolti().entries()]

  const massime = risolti.map(([, ente]) =>
    ente.stato === 'deliberato' ? Math.max(...aliquoteDi(ente.parametri.aliquota)) : 0,
  )
  const minima = Math.min(...massime)
  const massima = Math.max(...massime)

  /**
   * Le tre forme di `testi-spiegazione.ts`, scelte dagli estremi: la prima
   * banda non ha un limite inferiore da dire, l'ultima non ha un limite
   * superiore.
   */
  const descriviBanda = (da: Euro, a: Euro | null): string =>
    a === null
      ? fasciaOltre(inEuroTondo(da))[lingua]
      : da === 0
        ? fasciaFino(inEuroTondo(a))[lingua]
        : fasciaDa(inEuroTondo(da), inEuroTondo(a))[lingua]

  const descriviScaglione = (s: Scaglione): string => descriviBanda(s.da, s.a)

  const descriviFasciaIntera = (f: FasciaSuIntero): string =>
    descriviBanda(f.redditoDa, f.redditoA)

  const banda = (fascia: string, valore: number): Banda => ({
    fascia,
    aliquota: inPercentuale(valore),
    sopraIlTetto: valore > tetto,
  })

  return risolti.flatMap(([chiave, ente], indice) => {
    if (!conSagoma.has(chiave)) {
      throw new Error(`Ente «${chiave}» senza sagoma in data/geo/enti-2026.json`)
    }
    // Tutti e ventuno gli enti hanno deliberato per il 2026 (D-053): il ramo
    // non deliberato non esiste sul lato regionale, ma il tipo lo ammette.
    if (ente.stato !== 'deliberato') return []

    const forma = ente.parametri.aliquota
    const bande: readonly Banda[] =
      forma.forma === 'unica'
        ? [banda(ETICHETTA_UNICA[lingua], forma.aliquota)]
        : forma.forma === 'fasce-intere'
          ? [
              ...forma.fasce.map((f) => banda(descriviFasciaIntera(f), f.percentuale)),
              ...(forma.progressioneOltre ?? []).map((s) => banda(descriviScaglione(s), s.aliquota)),
            ]
          : forma.scaglioni.map((s) => banda(descriviScaglione(s), s.aliquota))

    const puntaAliquota = massime[indice] ?? 0

    const regoleProprie: RegolaPropria[] = []
    const { sogliaEsenzione, deduzione, detrazioni } = ente.parametri
    if (sogliaEsenzione) {
      regoleProprie.push({
        etichetta: ETICHETTA_ESENZIONE[lingua],
        valore: inEuroTondo(sogliaEsenzione.valore),
      })
    }
    if (deduzione) {
      regoleProprie.push({
        etichetta: ETICHETTA_DEDUZIONE[lingua],
        valore: `${inEuroTondo(deduzione.importo)} · ${fasciaFino(inEuroTondo(deduzione.redditoMassimo))[lingua].toLowerCase()}`,
      })
    }
    for (const d of detrazioni) {
      /*
       * ⚠️ Una detrazione può essere un importo o una formula: Bolzano ne ha
       * una che cresce col reddito. Della formula si mostra l'espressione come
       * la scrive l'atto — ridurla al solo tetto direbbe un numero che spetta
       * a un reddito solo.
       */
      const quanto =
        d.formula.forma === 'costante' ? inEuroTondo(d.formula.importo) : d.formula.espressione
      regoleProprie.push({
        etichetta: ETICHETTA_DETRAZIONE[lingua],
        valore:
          d.redditoA === null
            ? quanto
            : `${quanto} · ${fasciaFino(inEuroTondo(d.redditoA))[lingua].toLowerCase()}`,
      })
    }

    return [
      {
        chiave,
        nome: ente.nome,
        /*
         * Il tono cresce con l'aliquota massima, normalizzato fra la più bassa
         * e la più alta dei ventuno. Non parte da zero: una sagoma quasi
         * bianca non si distinguerebbe dal fondo, e l'ente meno tassato
         * sembrerebbe un buco nella mappa invece di un dato.
         */
        tono:
          massima === minima ? 0.5 : 0.12 + (0.74 * (puntaAliquota - minima)) / (massima - minima),
        forma: forma.forma,
        bande,
        aliquotaMassima: inPercentuale(puntaAliquota),
        aliquotaMassimaValore: puntaAliquota,
        sopraIlTetto: puntaAliquota > tetto,
        regoleProprie,
        fonte: ente.fonte,
      },
    ]
  })
}

const ETICHETTA_UNICA: Record<CodiceLingua, string> = {
  it: 'Aliquota unica, su tutto il reddito',
  en: 'Single rate, on all income',
}

const ETICHETTA_ESENZIONE: Record<CodiceLingua, string> = {
  it: 'Esenzione fino a',
  en: 'Exempt up to',
}

const ETICHETTA_DEDUZIONE: Record<CodiceLingua, string> = {
  it: 'Deduzione dalla base',
  en: 'Deduction from the base',
}

const ETICHETTA_DETRAZIONE: Record<CodiceLingua, string> = {
  it: 'Detrazione dall’imposta',
  en: 'Credit against the tax',
}

/**
 * Su quali valori si posano le ventuno aliquote massime, e in quanti enti.
 *
 * ⚠️ **È il conteggio che regge l'osservazione più interessante del ramo
 * regionale**, e per questo è un conteggio e non una frase. Regioni senza
 * alcun rapporto fra loro atterrano sullo stesso identico secondo decimale, e
 * le differenze sono regolari — 1,23 → 1,73 è +0,50, 1,23 → 3,33 è +2,10. È la
 * firma di incrementi imposti da norma statale, non di scelte discrezionali
 * [Fonti §11]. La norma non è stata letta: l'osservazione resta strutturale, e
 * la pagina la dice così.
 */
export const distribuzioneRegionale = (lingua: CodiceLingua) => {
  const { inPercentuale } = formato(lingua)
  const enti = entiPerLaMappa(lingua)
  const tetto: number = tettiAddizionali.regionale.valore

  const per = new Map<number, string[]>()
  for (const e of enti) {
    const gruppo = per.get(e.aliquotaMassimaValore) ?? []
    gruppo.push(e.nome)
    per.set(e.aliquotaMassimaValore, gruppo)
  }

  /**
   * ⚠️ **I nomi, non solo il conteggio.**
   *
   * La pagina diceva *«il tetto è 3,33%, e lo superano 1 enti su 21»*: una
   * frase scritta per il plurale, davanti a un numero che dopo la correzione
   * sul tetto applicabile è sceso a **uno**. Quando l'insieme ha un elemento
   * solo, contarlo non dice niente e dirne il nome dice tutto.
   *
   * Il conteggio resta perché la frase deve reggere anche se domani gli enti
   * sopra il tetto tornassero a essere molti: chi la scrive sceglie in base a
   * quanti sono, e ha bisogno di entrambi.
   */
  const oltre = enti.filter((e) => e.sopraIlTetto)

  return {
    totale: enti.length,
    tetto: inPercentuale(tetto),
    sopraIlTetto: oltre.length,
    nomiSopraIlTetto: oltre.map((e) => e.nome).sort((a, b) => a.localeCompare(b, lingua)),
    gruppi: [...per.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([valore, nomi]) => ({
        aliquota: inPercentuale(valore),
        valore,
        enti: nomi.sort((a, b) => a.localeCompare(b, lingua)),
      })),
  }
}

// ── Le derivazioni che la prosa chiede ──────────────────────────────────────
//
// ⚠️ Sono qui e non dentro una frase, ed è la regola di `testi-cifre.ts`:
// «il gradino a 15.000 vale circa 1.145 euro» scritto in prosa è un numero che
// nessuno ricalcolerà mai. Scritto così, se una legge cambia la formula, la
// frase cambia con lei — o smette di comparire, se il gradino sparisce.

/**
 * Di quanto l'aliquota dell'apprendista sta sotto quella ordinaria.
 *
 * ⚠️ **Non sono i tre punti che dispone la norma, e la differenza è il
 * punto.** L'art. 21 della L. 41/1986 riduce di tre punti la *relativa aliquota
 * contributiva*, ma quei tre punti cadono su una base al netto della componente
 * ex GESCAL: la distanza che si vede in busta paga è più grande. Il numero qui
 * si ottiene sottraendo i due valori di `data/`, che è l'unico modo di non
 * scrivere a mano né il minuendo né il risultato.
 */
export const differenzaAliquoteContributive: number =
  (regime2026.contributi.aliquotaOrdinaria.valore as number) -
  (regime2026.contributi.aliquotaApprendista.valore as number)

/**
 * Il salto più grande della curva della detrazione, misurato sulla curva.
 *
 * ⚠️ Si cerca invece di dichiararlo. Due vertici a un centesimo di distanza
 * sono un gradino, e il più alto di quei gradini è quello dell'art. 13 fra la
 * lettera a) e la lettera b) — il salto *verso l'alto* attraversando una
 * soglia, che è la cosa meno intuitiva dell'intera detrazione. Se una riforma
 * lo togliesse, questo valore diventerebbe zero e la frase sparirebbe dalla
 * pagina invece di restare a raccontare un fatto che non c'è più.
 */
export const saltoDetrazione = (() => {
  const punti = curvaDetrazioneArt13.punti
  let soglia = 0
  let salto = 0
  for (let i = 1; i < punti.length; i += 1) {
    const precedente = punti[i - 1]
    const corrente = punti[i]
    if (precedente === undefined || corrente === undefined) continue
    if (corrente.x - precedente.x > CENTESIMO * 1.5) continue
    const differenza = corrente.y - precedente.y
    if (differenza > salto) {
      salto = differenza
      soglia = precedente.x
    }
  }
  return { soglia, salto }
})()

/** Il massimo che la detrazione dell'art. 13 raggiunge, incremento compreso. */
export const detrazioneMassimaArt13: number = curvaDetrazioneArt13.yMax

/**
 * Il raccordo fra i due istituti del cuneo, ai due lati della soglia.
 *
 * A ridosso della soglia vale la somma; un centesimo sopra vale la detrazione.
 * Che la seconda sia leggermente più alta della prima è una scelta del
 * legislatore, e si vede solo mettendo i due numeri accanto.
 */
export const raccordoCuneo = (() => {
  const soglia: number = regime2026.cuneo.somma.sogliaAccesso.valore
  const valore = (curva: Curva, x: number): number => {
    const punto = curva.punti.find((p) => p.x === x)
    return punto ? punto.y : 0
  }
  return {
    soglia,
    somma: valore(curvaSommaCuneo, soglia),
    detrazione: valore(curvaDetrazioneCuneo, soglia + CENTESIMO),
  }
})()

/**
 * La banda in cui tre riduzioni agiscono insieme, e l'aliquota IRPEF che ci
 * cade dentro.
 *
 * ⚠️ Tutto derivato: la banda è la fascia della detrazione da cuneo che
 * scende, l'aliquota è quella dello scaglione che la contiene. Scriverle a mano
 * significherebbe che una riforma degli scaglioni lascia in pagina una frase
 * che non descrive più niente.
 */
export const bandaMarginaleAlta = (() => {
  const inDiscesa = regime2026.cuneo.detrazione.fasce.valore.find(
    (f) => f.formula.forma === 'lineare-decrescente' && f.redditoA !== null,
  )
  if (!inDiscesa || inDiscesa.redditoA === null) return undefined

  const da: number = inDiscesa.redditoDa
  const a: number = inDiscesa.redditoA
  const dentro = (da + a) / 2
  const scaglione = regime2026.irpef.scaglioni.valore.find(
    (s) => dentro > s.da && (s.a === null || dentro <= s.a),
  )
  return scaglione ? { da, a, aliquota: scaglione.aliquota as number } : undefined
})()

/** Quante sagome disegna la mappa, e quante regioni ha l'Italia. */
export const sagomeControRegioniIstat = {
  sagome: geometrie.enti.length,
  regioni: geometrie.artefatti.regioni.righe,
} as const

/**
 * I gradini verso il basso della somma del cuneo, misurati sulla curva.
 *
 * ⚠️ **Stessa tecnica di `saltoDetrazione`, segno opposto.** Due vertici a un
 * centesimo di distanza sono un gradino; qui si tengono quelli che scendono, e
 * sono le discontinuità più violente del sistema: la percentuale si applica
 * all'intero reddito, non alla parte eccedente, quindi ogni confine di fascia
 * fa **perdere più di quell'euro in più**.
 *
 * Cercati e non dichiarati, per la ragione di sempre: se una riforma
 * trasformasse le fasce in scaglioni, questo elenco si svuoterebbe da sé
 * invece di restare a descrivere un sistema che non c'è più.
 */
export const gradiniSommaCuneo: readonly { readonly soglia: number; readonly salto: number }[] =
  (() => {
    const trovati: { soglia: number; salto: number }[] = []
    const punti = curvaSommaCuneo.punti
    for (let i = 1; i < punti.length; i += 1) {
      const precedente = punti[i - 1]
      const corrente = punti[i]
      if (precedente === undefined || corrente === undefined) continue
      if (corrente.x - precedente.x > CENTESIMO * 1.5) continue
      const differenza = precedente.y - corrente.y
      if (differenza > 0) trovati.push({ soglia: precedente.x, salto: differenza })
    }
    return trovati
  })()
