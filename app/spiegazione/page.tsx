/**
 * «Come si passa dallo stipendio lordo al netto» — il meccanismo e le sue cifre.
 *
 * ⚠️ **Questa pagina era due pagine, e sono state accorpate (D-079).**
 * `/spiegazione` raccontava la catena senza numeri; `/cifre-chiave` mostrava i
 * numeri senza la catena. Avevano **la stessa spina dorsale** — entrambe
 * seguivano l'ordine in cui il motore emette i passi — quindi non erano due
 * pagine diverse: erano la stessa pagina scritta due volte, una in parole e
 * una in cifre. Ora ogni passaggio porta sotto di sé le proprie cifre, e il
 * principio d'ordine è uno solo: **prima la regola in parole, poi la stessa
 * regola in cifra.**
 *
 * ⚠️ **L'ordine dei passaggi non è un'opinione: è quello della traccia del
 * motore** — `ral → contributi → imponibile → IRPEF → gate → addizionali →
 * somme che aggiungono → netto`. Sul punto in cui le due pagine divergevano —
 * `/cifre-chiave` metteva le somme prima delle addizionali — decide il motore,
 * non l'estetica.
 *
 * ⚠️ **Non deriva dal calcolo, e resta vero anche ora.** Non chiama
 * `calcolaNetto`, non conosce una RAL, non mostra un netto. Usa però **due
 * funzioni del motore** — `trovaFascia` e `valutaFormula`, attraverso
 * `_lib/cifre.ts` — per disegnare le curve: sono le stesse con cui il calcolo
 * valuta quelle formule, ed è il senso di D-077 (la curva mostrata non può
 * discostarsi dal numero calcolato).
 *
 * ⚠️ **Nessun numero è scritto in questa pagina.** Ogni cifra arriva da
 * `data/regime-2026.ts` con la propria `Fonte`, o dagli elenchi MEF attraverso
 * `_lib/comuni.ts`. La prosa sta in `_lib/testi-spiegazione.ts` e non ne
 * contiene: dove una frase ha bisogno di una cifra, è una funzione che la
 * riceve già formattata.
 *
 * ⚠️ **Resta un server component salvo la mappa**, che ha uno stato — quale
 * ente è scelto — e riceve stringhe già risolte nella lingua di chi legge
 * (D-069). Le sagome non stanno nel documento: la mappa le chiede a
 * `GET /api/geo`, perché questa pagina è in testata e 51 KiB di coordinate non
 * si fanno pagare a chi non scorre fin laggiù (D-049, D-058).
 *
 * ⚠️ **Il grafico a barre delle fasce IRPEF non c'è più**, ed è l'unica cosa
 * uscita dall'accorpamento. Misurava l'aliquota; la scala a gradini che l'ha
 * sostituito misura **aliquota e ampiezza** insieme, cioè dice anche che quasi
 * tutti stanno quasi sempre dentro il primo scaglione. L'argomento che il
 * vecchio grafico difendeva — *l'aliquota non si applica a tutto lo stipendio*
 * — nella scala a gradini si legge meglio, perché si vede che ogni gradino
 * copre solo la propria fetta.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { euro, type Euro, type Fonte } from '../../core/types'
import { regime2026, tettiAddizionali } from '../../data/regime-2026'
import { Barre, Legenda, Scaglioni, Spezzata, type Barra, type Tacca } from '../_components/cifre-grafici'
import { Fonti } from '../_components/fonte'
import { MappaEnti } from '../_components/mappa-enti'
import { Sezione } from '../_components/sezione'
import { traduzione } from '../_i18n/server'
import {
  bandaMarginaleAlta,
  curvaDetrazioneArt13,
  curvaDetrazioneCuneo,
  curvaSommaCuneo,
  detrazioneMassimaArt13,
  differenzaAliquoteContributive,
  distribuzioneRegionale,
  entiPerLaMappa,
  gradiniSommaCuneo,
  provenienzaGeometrie,
  raccordoCuneo,
  sagomeControRegioniIstat,
  saltoDetrazione,
} from '../_lib/cifre'
import {
  CODICE_COMUNE_INIZIALE,
  coperturaComuni,
  distribuzioneComunale,
  risolviComune,
} from '../_lib/comuni'
import { formato } from '../_lib/formato'
import {
  SPIEGAZIONE,
  confiniIstat,
  contaEnti,
  contributiCondizione,
  contributiOltre,
  contributiPrimaFascia,
  cuneoMarginale,
  cuneoRaccordo,
  detrazioneSaltoTesto,
  differenzaApprendista,
  enteMenoEPiu,
  estrazioneEnti,
  fasciaDa,
  fasciaFino,
  fasciaOltre,
  gradinoComunale,
  gradinoSale,
  gradinoScende,
  gradiniRaccordoEscluso,
  milanoRegola,
  minimoDeterminato,
  minimoGenerale,
  sagomeControRegioni,
  tettoComunale,
  tettoRegionale,
} from '../_lib/testi-spiegazione'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloSpiegazione'),
    description: t('meta.descrizioneSpiegazione'),
  }
}

/**
 * Un anello della catena.
 *
 * Il segno è decorativo e basta: `aria-hidden`, perché «meno» letto ad alta
 * voce prima del nome di una voce non aggiunge niente a una frase che già dice
 * *escono per primi*. Chi legge con gli occhi lo usa per seguire il verso.
 */
function Anello({
  segno,
  nome,
  nota,
  esito,
  children,
}: {
  segno?: string
  nome: string
  nota: string
  esito?: boolean
  children?: React.ReactNode
}) {
  return (
    <li
      className={`rounded-blocco border p-4 sm:p-5 ${
        esito ? 'border-verde-bordo bg-verde-velo' : 'border-bordo-decorativo bg-fondo'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`cifre mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
            esito
              ? 'border-verde-bordo bg-carta text-verde-testo'
              : 'border-bordo-decorativo bg-carta text-inchiostro-tenue'
          }`}
        >
          {segno ?? '·'}
        </span>
        <div>
          <p
            className={`font-semibold tracking-tight ${esito ? 'text-verde-testo' : 'text-inchiostro'}`}
          >
            {nome}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">{nota}</p>
        </div>
      </div>
      {children}
    </li>
  )
}

/** Uno dei due rami che partono dall'imponibile. */
function Ramo({ nome, nota }: { nome: string; nota: string }) {
  return (
    <div className="rounded-voce border border-bordo-decorativo bg-carta p-4">
      <p className="text-sm font-semibold tracking-tight text-inchiostro">
        <span aria-hidden className="mr-1.5 text-inchiostro-nota">
          −
        </span>
        {nome}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">{nota}</p>
    </div>
  )
}

/**
 * Una cifra grande con la sua glossa.
 *
 * Il numero da solo non dice niente: *2.841* è un conteggio di che cosa, e
 * *Comuni con una soglia di esenzione* senza il numero è un'affermazione senza
 * prova. La terza riga porta la conseguenza, dove ce n'è una.
 */
function Cifra({
  valore,
  etichetta,
  nota,
  avviso,
}: {
  valore: string
  etichetta: string
  nota?: string
  avviso?: boolean
}) {
  return (
    <div
      className={`rounded-blocco border p-4 sm:p-5 ${avviso ? 'border-avviso-bordo bg-avviso' : 'border-bordo-decorativo bg-fondo'}`}
    >
      <p
        className={`cifre text-2xl font-semibold tracking-tight sm:text-3xl ${avviso ? 'text-avviso-testo' : 'text-inchiostro'}`}
      >
        {valore}
      </p>
      <p className={`mt-1 text-sm font-medium ${avviso ? 'text-avviso-testo' : 'text-inchiostro'}`}>
        {etichetta}
      </p>
      {nota ? (
        <p
          className={`mt-1 text-sm leading-relaxed ${avviso ? 'text-avviso-testo' : 'text-inchiostro-tenue'}`}
        >
          {nota}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Il riquadro che ospita un grafico, con la sua didascalia e la sua fonte.
 *
 * Esiste per la stessa ragione di `Sezione`: le figure di questa pagina sono
 * sei, e senza un contenitore unico divergerebbero di qualche pixel l'una
 * dall'altra.
 */
function Figura({
  titolo,
  didascalia,
  fonti,
  etichettaFonte,
  children,
}: {
  titolo: string
  didascalia?: string
  fonti?: readonly Fonte[]
  etichettaFonte: string
  children: React.ReactNode
}) {
  return (
    <figure className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
      <p className="text-xs font-medium text-inchiostro-nota">{titolo}</p>
      <div className="mt-4">{children}</div>
      {didascalia ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-inchiostro-tenue">
          {didascalia}
        </figcaption>
      ) : null}
      {fonti && fonti.length > 0 ? (
        <div className="mt-4 border-t border-bordo-decorativo pt-3">
          <Fonti fonti={fonti} titolo={etichettaFonte} />
        </div>
      ) : null}
    </figure>
  )
}

/**
 * Lo schema del gradino.
 *
 * ⚠️ Nessun numero, e nessun asse graduato: è una forma, non una misura. I
 * gradini veri stanno nell'elenco accanto, misurati sulle curve di questa
 * stessa pagina; questo disegno dice **che forma ha** il fenomeno, ed è il
 * motivo per cui è sopravvissuto all'accorpamento invece di essere sostituito
 * da una delle curve.
 *
 * Il testo alternativo dice la forma, non gli elementi: chi non vede il
 * disegno ha già i due paragrafi sopra e l'elenco sotto.
 */
function SchemaGradino({ descrizione }: { descrizione: string }) {
  return (
    <svg
      viewBox="0 0 320 150"
      role="img"
      aria-label={descrizione}
      className="h-auto w-full max-w-lg"
    >
      <path
        d="M 32 12 V 126 H 308"
        fill="none"
        className="stroke-bordo-decorativo-forte"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M 32 116 L 96 88 L 150 66"
        fill="none"
        className="stroke-inchiostro-tenue"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 150 66 L 150 92"
        fill="none"
        className="stroke-avviso-testo"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M 150 92 L 232 56 L 300 26"
        fill="none"
        className="stroke-inchiostro-tenue"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={150} cy={66} r={3.5} className="fill-avviso-testo" />
      <circle cx={150} cy={92} r={3.5} className="fill-avviso-testo" />
    </svg>
  )
}

export default async function Spiegazione() {
  const { lingua } = await traduzione()
  const { inEuro, inEuroTondo, inPercentuale, inData, tag } = formato(lingua)

  const conta = new Intl.NumberFormat(tag, { useGrouping: 'always' })
  /*
   * I punti percentuali si scrivono senza il simbolo, ed è il motivo per cui
   * `formato(lingua)` espone il proprio tag BCP 47: la differenza fra due
   * aliquote non è una percentuale, e `inPercentuale` la scriverebbe come tale.
   */
  const punti = new Intl.NumberFormat(tag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const { contributi, irpef, detrazioneLavoroDipendente, cuneo, trattamentoIntegrativo, fontiRegola } =
    regime2026
  const { quotaAggiuntiva } = contributi
  const scaglioni = irpef.scaglioni

  const enti = entiPerLaMappa(lingua)
  const regionale = distribuzioneRegionale(lingua)

  /**
   * Il Comune da cui parte il calcolatore, letto dal catalogo come lo legge il
   * calcolatore.
   *
   * ⚠️ Non si riscrivono i suoi parametri: è il caso di cui la documentazione
   * conosce il netto a quattro decimali, e vederlo qui con un'aliquota diversa
   * da quella che il motore applica sarebbe il difetto peggiore che questa
   * pagina possa avere. **E dà anche l'ente da cui la mappa parte**, invece di
   * aprirsi sul primo in ordine alfabetico, che non c'entra niente.
   */
  const comuneIniziale = risolviComune(CODICE_COMUNE_INIZIALE)
  const enti0 = comuneIniziale?.stato === 'calcolabile' ? comuneIniziale.enti : undefined
  const comunale = enti0 && enti0.comunale.stato !== 'nonIstituito' ? enti0.comunale : undefined
  const enteInizialeMappa = enti0?.regionale.nome ?? enti[0]?.nome ?? ''

  /**
   * L'etichetta di una fascia di reddito, scelta dagli estremi: la prima non ha
   * un limite inferiore da dire, l'ultima non ha un limite superiore.
   *
   * ⚠️ `inEuroTondo` e non `inEuro`, ed è D-071: è una soglia di legge, non un
   * importo calcolato. La norma scrive *oltre 28.000 euro*, e `28.000,00 €`
   * aggiungerebbe due cifre che il testo non ha.
   */
  const etichettaBanda = (da: Euro, a: Euro | null): string =>
    a === null
      ? fasciaOltre(inEuroTondo(da))[lingua]
      : da === 0
        ? fasciaFino(inEuroTondo(a))[lingua]
        : fasciaDa(inEuroTondo(da), inEuroTondo(a))[lingua]

  const tacche = (valori: readonly number[]): readonly Tacca[] =>
    [...new Set(valori)]
      .sort((a, b) => a - b)
      .map((a) => ({ a, testo: inEuroTondo(euro(a)) }))

  // Le soglie che meritano una tacca sono i confini delle fasce, letti dai
  // parametri: nessuna è scritta qui.
  const confiniDetrazione = detrazioneLavoroDipendente.fasce.valore.flatMap((f) =>
    f.redditoA === null ? [] : [f.redditoA as number],
  )
  const confiniCuneo = [
    ...cuneo.somma.fasce.valore.flatMap((f) => (f.redditoA === null ? [] : [f.redditoA as number])),
    cuneo.somma.sogliaAccesso.valore as number,
    ...cuneo.detrazione.fasce.valore.flatMap((f) =>
      f.redditoA === null ? [] : [f.redditoA as number],
    ),
  ]

  const barreContributive: readonly Barra[] = [
    {
      etichetta: SPIEGAZIONE.contributiOrdinaria[lingua],
      valore: contributi.aliquotaOrdinaria.valore,
      scritto: inPercentuale(contributi.aliquotaOrdinaria.valore),
    },
    {
      etichetta: SPIEGAZIONE.contributiApprendista[lingua],
      valore: contributi.aliquotaApprendista.valore,
      scritto: inPercentuale(contributi.aliquotaApprendista.valore),
      nota: differenzaApprendista(punti.format(differenzaAliquoteContributive))[lingua],
    },
    {
      etichetta: SPIEGAZIONE.contributiQuota[lingua],
      valore: quotaAggiuntiva.aliquota.valore,
      scritto: `${inPercentuale(quotaAggiuntiva.aliquota.valore)} ${contributiOltre(inEuroTondo(quotaAggiuntiva.sogliaPrimaFascia.valore))[lingua]}`,
      nota: SPIEGAZIONE.contributiQuotaNota[lingua],
    },
  ]

  /**
   * L'inventario dei gradini, misurato e non dichiarato.
   *
   * ⚠️ È la sezione che l'accorpamento ha reso possibile: la spiegazione
   * diceva *in qualche punto il netto scende* senza mai dire dove, e le cifre
   * mostravano i punti senza mai nominarli come famiglia. Le tre righe
   * arrivano dalle stesse curve disegnate qui sopra — se una riforma togliesse
   * un gradino, la riga sparirebbe da sé invece di restare a raccontare un
   * fatto che non c'è più.
   */
  const gradini: readonly { readonly voce: string; readonly effetto: string }[] = [
    {
      voce: SPIEGAZIONE.gradiniVoceDetrazione[lingua],
      effetto: gradinoSale(
        inEuroTondo(euro(saltoDetrazione.soglia)),
        inEuro(euro(saltoDetrazione.salto)),
      )[lingua],
    },
    /*
      ⚠️ **La soglia di accesso esce dall'elenco, e la ragione è nel numero.**
      Sulla curva della somma il salto più grande cade lì: un centesimo sopra,
      la somma sparisce tutta insieme. Ma un salto della *voce* non è un salto
      del *netto* — sopra quella soglia la detrazione la sostituisce, e vale
      qualcosa in più. Tenerlo fra i punti in cui il netto scende
      contraddirebbe il riquadro del cuneo, che con gli stessi due numeri
      dimostra il contrario. Il filtro confronta la soglia, non l'indice: se
      una riforma spostasse il raccordo, si sposterebbe anche l'esclusione.
    */
    ...gradiniSommaCuneo
      .filter((g) => g.soglia !== raccordoCuneo.soglia)
      .map((g) => ({
        voce: SPIEGAZIONE.gradiniVoceSomma[lingua],
        effetto: gradinoScende(inEuroTondo(euro(g.soglia)), inEuro(euro(g.salto)))[lingua],
      })),
    {
      voce: SPIEGAZIONE.gradiniVoceComune[lingua],
      effetto: gradinoComunale(conta.format(distribuzioneComunale.conSogliaEsenzione))[lingua],
    },
  ]

  /** Le voci dell'indice: le sei sezioni più i due riquadri che hanno un titolo proprio. */
  const indice = [
    ['catena', SPIEGAZIONE.catenaTitolo[lingua]],
    ['contributi', SPIEGAZIONE.primoTitolo[lingua]],
    ['irpef', SPIEGAZIONE.scaglioniTitolo[lingua]],
    ['detrazioni', SPIEGAZIONE.detrazioniTitolo[lingua]],
    ['locali', SPIEGAZIONE.localiTitolo[lingua]],
    ['aggiunge', SPIEGAZIONE.aggiungeTitolo[lingua]],
    ['cuneo', SPIEGAZIONE.cuneoTitolo[lingua]],
    ['netto', SPIEGAZIONE.nettoTitolo[lingua]],
    ['gradini', SPIEGAZIONE.gradiniTitolo[lingua]],
  ] as const

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {SPIEGAZIONE.titolo[lingua]}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {SPIEGAZIONE.occhiello[lingua]}
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {SPIEGAZIONE.occhielloCifre[lingua]}
        </p>

        {/*
          L'anno non è scritto in una stringa: arriva dal regime che il motore
          applica, quindi non può restare indietro rispetto ai parametri che la
          pagina mostra.
        */}
        <p className="mt-4 inline-flex items-center rounded-voce border border-bordo-decorativo bg-fondo px-3 py-1.5 text-sm text-inchiostro-tenue">
          {SPIEGAZIONE.anno[lingua]}
          <span className="cifre ml-1.5 font-semibold text-inchiostro">{regime2026.anno}</span>
        </p>

        {/*
          ⚠️ L'indice esiste perché la pagina è diventata lunga il doppio, e
          una pagina lunga senza indice si legge una volta sola. Sono link ad
          àncore e non uno stato: si possono mandare a qualcuno, e funzionano
          con JavaScript spento — che su una pagina di sole cifre e prosa è il
          minimo.
        */}
        <nav aria-label={SPIEGAZIONE.indice[lingua]} className="mt-6 flex flex-wrap gap-1.5">
          {indice.map(([id, testo]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-voce border border-bordo-controllo bg-carta px-2.5 py-1 text-xs font-medium text-inchiostro-tenue transition-colors hover:border-bordo-controllo-forte hover:text-inchiostro"
            >
              {testo}
            </a>
          ))}
        </nav>
      </div>

      <main className="space-y-4 sm:space-y-6">
        {/*
          Il diagramma prima delle sei sezioni, e non dopo: chi arriva qui non
          sa ancora quante cose ci sono. La mappa va data prima del percorso,
          altrimenti le sezioni si leggono come sei fatti scollegati.
        */}
        <section
          id="catena"
          className="scroll-mt-4 rounded-sezione border border-bordo-decorativo bg-carta p-4 sm:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {SPIEGAZIONE.catenaTitolo[lingua]}
          </h2>
          <p className="mt-1 text-sm text-inchiostro-tenue">{SPIEGAZIONE.catenaOcchiello[lingua]}</p>

          {/*
            ⚠️ È una lista ordinata, non un disegno. La catena ha un ordine
            che è la sostanza della pagina — «i contributi escono per primi,
            quindi tutto il resto si calcola più in basso» — e un `<ol>` lo dice
            a chi legge con gli occhi e a chi ascolta. Un SVG avrebbe dato la
            stessa figura a metà dei lettori e una stringa alternativa
            all'altra metà.
          */}
          <ol className="mt-6 space-y-3">
            <Anello nome={SPIEGAZIONE.catenaRal[lingua]} nota={SPIEGAZIONE.catenaRalNota[lingua]} />
            <Anello
              segno="−"
              nome={SPIEGAZIONE.catenaContributi[lingua]}
              nota={SPIEGAZIONE.catenaContributiNota[lingua]}
            />
            <Anello
              segno="="
              nome={SPIEGAZIONE.catenaImponibile[lingua]}
              nota={SPIEGAZIONE.catenaImponibileNota[lingua]}
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:pl-10">
                <Ramo
                  nome={SPIEGAZIONE.catenaIrpef[lingua]}
                  nota={SPIEGAZIONE.catenaIrpefNota[lingua]}
                />
                <Ramo
                  nome={SPIEGAZIONE.catenaLocali[lingua]}
                  nota={SPIEGAZIONE.catenaLocaliNota[lingua]}
                />
              </div>
              {/*
                La nota sulla base comune sta dentro l'anello dell'imponibile
                e non in fondo al diagramma: è una proprietà di quel nodo, cioè
                del punto in cui la catena si biforca. In fondo si leggerebbe
                come una postilla sull'intera pagina.
              */}
              <p className="mt-4 rounded-voce border border-avviso-bordo bg-avviso px-4 py-3 text-sm leading-relaxed text-avviso-testo sm:ml-10">
                {SPIEGAZIONE.catenaStessaBase[lingua]}
              </p>
            </Anello>
            <Anello
              segno="+"
              nome={SPIEGAZIONE.catenaAggiunge[lingua]}
              nota={SPIEGAZIONE.catenaAggiungeNota[lingua]}
            />
            <Anello
              esito
              segno="="
              nome={SPIEGAZIONE.catenaNetto[lingua]}
              nota={SPIEGAZIONE.catenaNettoNota[lingua]}
            />
          </ol>
        </section>

        {/* ── 1 · I contributi ── */}
        <div id="contributi" className="scroll-mt-4">
          <Sezione
            numero="1"
            titolo={SPIEGAZIONE.primoTitolo[lingua]}
            occhiello={SPIEGAZIONE.primoOcchiello[lingua]}
          >
            <div className="max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.primoP1[lingua]}</p>
              <p>{SPIEGAZIONE.primoP2[lingua]}</p>
              <p>{SPIEGAZIONE.primoP3[lingua]}</p>
            </div>

            <div className="mt-6">
              <Figura
                titolo={SPIEGAZIONE.primoAliquota[lingua]}
                etichettaFonte={SPIEGAZIONE.fonteEtichetta[lingua]}
                /*
                  Tre citazioni e non una: le tre aliquote vengono da tre atti
                  diversi, e quella dell'apprendista porta con sé una riserva
                  che `<Fonti>` mostra come avviso. Citare solo l'ordinaria
                  avrebbe presentato come pacifico un valore che non lo è.
                */
                fonti={[
                  contributi.aliquotaOrdinaria.fonte,
                  contributi.aliquotaApprendista.fonte,
                  quotaAggiuntiva.aliquota.fonte,
                ]}
              >
                <Barre
                  barre={barreContributive}
                  massimo={contributi.aliquotaOrdinaria.valore}
                  descrizione={SPIEGAZIONE.primoAliquota[lingua]}
                />
              </Figura>
            </div>

            <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.contributiApprendistaNota[lingua]}</p>
              <p>
                {contributiCondizione(inPercentuale(quotaAggiuntiva.aliquotaMassimaRegime.valore))[lingua]}
              </p>
              <p>
                {contributiPrimaFascia(inEuroTondo(quotaAggiuntiva.sogliaPrimaFascia.valore))[lingua]}
              </p>
            </div>
          </Sezione>
        </div>

        {/* ── 2 · L'IRPEF ── */}
        <div id="irpef" className="scroll-mt-4">
          <Sezione
            numero="2"
            titolo={SPIEGAZIONE.scaglioniTitolo[lingua]}
            occhiello={SPIEGAZIONE.scaglioniOcchiello[lingua]}
          >
            <p className="max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.scaglioniP1[lingua]}
            </p>

            <div className="mt-6">
              <Figura
                titolo={SPIEGAZIONE.scaglioniGraficoTitolo[lingua]}
                etichettaFonte={SPIEGAZIONE.fonteEtichetta[lingua]}
                fonti={[scaglioni.fonte]}
              >
                <Scaglioni
                  blocchi={scaglioni.valore.map((s) => ({
                    da: s.da,
                    a: s.a,
                    aliquota: s.aliquota,
                    fascia: etichettaBanda(s.da, s.a),
                    percentuale: inPercentuale(s.aliquota),
                  }))}
                  /*
                    L'asse arriva un po' oltre l'ultimo confine, perché lo
                    scaglione aperto deve avere spazio per sfumare: senza,
                    sembrerebbe che finisca dove finisce il disegno.
                  */
                  xMax={(scaglioni.valore[scaglioni.valore.length - 2]?.a ?? euro(0)) * 1.3}
                  tacche={tacche(scaglioni.valore.flatMap((s) => (s.a === null ? [] : [s.a as number])))}
                  descrizione={SPIEGAZIONE.scaglioniGraficoTitolo[lingua]}
                />

                <ul className="mt-5 space-y-1">
                  {scaglioni.valore.map((s) => (
                    <li
                      key={s.da}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-bordo-decorativo pb-1.5 text-sm last:border-0"
                    >
                      <span className="text-inchiostro-tenue">{etichettaBanda(s.da, s.a)}</span>
                      <span className="cifre font-semibold text-inchiostro">
                        {inPercentuale(s.aliquota)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Figura>
            </div>

            <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.scaglioniP2[lingua]}</p>
              <p>{SPIEGAZIONE.irpefCambio[lingua]}</p>
            </div>
          </Sezione>
        </div>

        {/* ── 3 · Le detrazioni ── */}
        <div id="detrazioni" className="scroll-mt-4">
          <Sezione
            numero="3"
            titolo={SPIEGAZIONE.detrazioniTitolo[lingua]}
            occhiello={SPIEGAZIONE.detrazioniOcchiello[lingua]}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
                <p className="font-semibold tracking-tight text-inchiostro">
                  {SPIEGAZIONE.detrazioniDeduzioneTitolo[lingua]}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                  {SPIEGAZIONE.detrazioniDeduzioneTesto[lingua]}
                </p>
              </div>
              <div className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
                <p className="font-semibold tracking-tight text-inchiostro">
                  {SPIEGAZIONE.detrazioniDetrazioneTitolo[lingua]}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                  {SPIEGAZIONE.detrazioniDetrazioneTesto[lingua]}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.detrazioniP1[lingua]}
            </p>

            <div className="mt-6">
              <Figura
                titolo={SPIEGAZIONE.detrazioneCurvaTitolo[lingua]}
                didascalia={SPIEGAZIONE.detrazioneAssi[lingua]}
                etichettaFonte={SPIEGAZIONE.fonteEtichetta[lingua]}
                fonti={[
                  detrazioneLavoroDipendente.fasce.fonte,
                  ...fontiRegola['troncamento-rapporti'],
                ]}
              >
                <Spezzata
                  curve={[
                    { curva: curvaDetrazioneArt13, etichetta: SPIEGAZIONE.detrazioniTitolo[lingua] },
                  ]}
                  tacche={tacche(confiniDetrazione)}
                  tacchePerAsseY={[{ a: detrazioneMassimaArt13, testo: '' }]}
                  descrizione={SPIEGAZIONE.detrazioneCurvaTitolo[lingua]}
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Cifra
                    valore={inEuro(euro(detrazioneMassimaArt13))}
                    etichetta={SPIEGAZIONE.detrazionePiuAlta[lingua]}
                    nota={SPIEGAZIONE.detrazioneIncremento[lingua]}
                  />
                  <Cifra
                    valore={`+ ${inEuro(euro(saltoDetrazione.salto))}`}
                    etichetta={SPIEGAZIONE.detrazioneGradino[lingua]}
                    nota={
                      detrazioneSaltoTesto(
                        inEuroTondo(euro(saltoDetrazione.soglia)),
                        inEuro(euro(saltoDetrazione.salto)),
                      )[lingua]
                    }
                  />
                </div>

                <p className="mt-5 text-xs font-medium text-inchiostro-nota">
                  {SPIEGAZIONE.detrazioneFormule[lingua]}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {detrazioneLavoroDipendente.fasce.valore.map((f) => (
                    <li
                      key={f.redditoDa}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-bordo-decorativo pb-1.5 text-sm last:border-0"
                    >
                      <span className="text-inchiostro-tenue">
                        {etichettaBanda(f.redditoDa, f.redditoA)}
                      </span>
                      {/*
                        L'espressione della formula viene dal dato — è il campo
                        `espressione` che il motore usa per scrivere la regola
                        accanto al passo — e non è ritrascritta qui.
                      */}
                      <span className="cifre font-semibold text-inchiostro">
                        {f.formula.forma === 'costante'
                          ? inEuro(f.formula.importo)
                          : f.formula.espressione}
                      </span>
                    </li>
                  ))}
                </ul>
              </Figura>
            </div>

            <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.detrazioneTroncamento[lingua]}</p>
              <p>{SPIEGAZIONE.detrazioneMinimi[lingua]}</p>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-inchiostro-tenue">
              <span>
                {minimoGenerale(inEuroTondo(detrazioneLavoroDipendente.minimi.valore.generale))[lingua]}
              </span>
              <span>
                {
                  minimoDeterminato(
                    inEuroTondo(detrazioneLavoroDipendente.minimi.valore.tempoDeterminato),
                  )[lingua]
                }
              </span>
            </p>
          </Sezione>
        </div>

        {/* ── 4 · Regione e Comune ── */}
        <div id="locali" className="scroll-mt-4">
          <Sezione
            numero="4"
            titolo={SPIEGAZIONE.localiTitolo[lingua]}
            occhiello={SPIEGAZIONE.localiOcchiello[lingua]}
          >
            <p className="max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.localiP1[lingua]}
            </p>

            <ul className="mt-6 space-y-3">
              {(
                [
                  ['localiPunto1Titolo', 'localiPunto1'],
                  ['localiPunto2Titolo', 'localiPunto2'],
                  ['localiPunto3Titolo', 'localiPunto3'],
                ] as const
              ).map(([titolo, corpo]) => (
                <li
                  key={titolo}
                  className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5"
                >
                  <p className="font-semibold tracking-tight text-inchiostro">
                    {SPIEGAZIONE[titolo][lingua]}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                    {SPIEGAZIONE[corpo][lingua]}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <Fonti
                fonti={[...fontiRegola['gate-addizionali'], ...fontiRegola['soglia-esenzione-comunale']]}
                titolo={SPIEGAZIONE.fonteEtichetta[lingua]}
              />
            </div>

            <p className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.localiP2[lingua]}
            </p>

            {/* La Regione */}
            <h3 className="mt-8 text-lg font-semibold tracking-tight text-inchiostro">
              {SPIEGAZIONE.mappaTitolo[lingua]}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.mappaOcchiello[lingua]}{' '}
              {
                enteMenoEPiu(
                  regionale.gruppi[0]?.aliquota ?? '',
                  regionale.gruppi[regionale.gruppi.length - 1]?.aliquota ?? '',
                )[lingua]
              }
              .
            </p>

            <div className="mt-6">
              <MappaEnti
                enti={enti}
                iniziale={enteInizialeMappa}
                etichette={{
                  scegli: SPIEGAZIONE.mappaScegli[lingua],
                  aliquotaMassima: SPIEGAZIONE.mappaAliquotaMassima[lingua],
                  bande: SPIEGAZIONE.mappaBande[lingua],
                  regoleProprie: SPIEGAZIONE.mappaRegoleProprie[lingua],
                  fonte: SPIEGAZIONE.fonteEtichetta[lingua],
                  sopraIlTetto: SPIEGAZIONE.mappaSopraIlTetto[lingua],
                  legenda: SPIEGAZIONE.mappaLegenda[lingua],
                }}
              />
            </div>

            <p className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.regionaleVentuno[lingua]}
            </p>
            <p className="mt-2 text-sm text-inchiostro-nota">
              {
                sagomeControRegioni(
                  conta.format(sagomeControRegioniIstat.sagome),
                  conta.format(sagomeControRegioniIstat.regioni),
                )[lingua]
              }
              {' · '}
              {confiniIstat(inData(provenienzaGeometrie.estrattoIl))[lingua]}
            </p>

            <p className="mt-6 text-xs font-medium text-inchiostro-nota">
              {SPIEGAZIONE.regionaleGruppiTitolo[lingua]}
            </p>
            <ul className="mt-2 space-y-2">
              {regionale.gruppi.map((g) => (
                <li
                  key={g.aliquota}
                  className="rounded-blocco border border-bordo-decorativo bg-fondo p-3 sm:p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="cifre text-lg font-semibold text-inchiostro">{g.aliquota}</span>
                    <span className="text-sm text-inchiostro-nota">
                      {contaEnti(g.enti.length)[lingua]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                    {g.enti.join(' · ')}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.regionaleAddensamento[lingua]}</p>
              <p>{SPIEGAZIONE.regionaleTetto[lingua]}</p>
            </div>

            <div className="mt-4 rounded-blocco border border-avviso-bordo bg-avviso p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-avviso-testo">
                {
                  tettoRegionale(
                    regionale.tetto,
                    conta.format(regionale.sopraIlTetto),
                    conta.format(regionale.totale),
                  )[lingua]
                }
              </p>
            </div>
            <div className="mt-4">
              <Fonti
                fonti={[tettiAddizionali.regionale.fonte]}
                titolo={SPIEGAZIONE.fonteEtichetta[lingua]}
                accanto
              />
            </div>

            {/* Il Comune */}
            <h3 className="mt-10 text-lg font-semibold tracking-tight text-inchiostro">
              {SPIEGAZIONE.comunaleTitolo[lingua]}
            </h3>
            <p className="mt-1 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.comunaleOcchiello[lingua]}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Cifra
                valore={conta.format(distribuzioneComunale.conAddizionale)}
                etichetta={SPIEGAZIONE.comunaleConAddizionale[lingua]}
                nota={`${conta.format(distribuzioneComunale.aliquotaUnica)} ${SPIEGAZIONE.comunaleUnica[lingua]}, ${conta.format(distribuzioneComunale.aScaglioni)} ${SPIEGAZIONE.comunaleScaglioni[lingua]}`}
              />
              <Cifra
                valore={conta.format(distribuzioneComunale.senzaAddizionale)}
                etichetta={SPIEGAZIONE.comunaleSenza[lingua]}
                nota={SPIEGAZIONE.comunaleSenzaNota[lingua]}
              />
              <Cifra
                valore={conta.format(distribuzioneComunale.conSogliaEsenzione)}
                etichetta={SPIEGAZIONE.comunaleSoglia[lingua]}
                nota={SPIEGAZIONE.comunaleSogliaNota[lingua]}
              />
              <Cifra
                valore={conta.format(distribuzioneComunale.alTetto)}
                etichetta={SPIEGAZIONE.comunaleTettoEtichetta[lingua]}
                nota={tettoComunale(inPercentuale(distribuzioneComunale.tetto))[lingua]}
              />
            </div>

            <div className="mt-3">
              <Cifra
                avviso
                valore={conta.format(distribuzioneComunale.sopraIlTetto)}
                etichetta={SPIEGAZIONE.comunaleSopraIlTetto[lingua]}
                nota={SPIEGAZIONE.comunaleSopraNota[lingua]}
              />
            </div>

            {comunale && comunale.parametri.aliquota.forma === 'unica' ? (
              <div className="mt-6 rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
                <p className="font-semibold tracking-tight text-inchiostro">
                  {SPIEGAZIONE.comunaleMilano[lingua]} · {comunale.nome}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-inchiostro">
                  {
                    milanoRegola(
                      inPercentuale(comunale.parametri.aliquota.aliquota),
                      inEuroTondo(comunale.parametri.sogliaEsenzione ?? euro(0)),
                    )[lingua]
                  }
                </p>
                <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
                  {SPIEGAZIONE.comunaleMilanoTesto[lingua]}
                </p>
                <div className="mt-4 border-t border-bordo-decorativo pt-3">
                  <Fonti fonti={[comunale.fonte]} titolo={SPIEGAZIONE.fonteEtichetta[lingua]} />
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <Fonti
                fonti={[tettiAddizionali.comunale.fonte]}
                titolo={SPIEGAZIONE.fonteEtichetta[lingua]}
                accanto
              />
            </div>
          </Sezione>
        </div>

        {/* ── 5 · Le somme che aggiungono ── */}
        <div id="aggiunge" className="scroll-mt-4">
          <Sezione
            numero="5"
            titolo={SPIEGAZIONE.aggiungeTitolo[lingua]}
            occhiello={SPIEGAZIONE.aggiungeOcchiello[lingua]}
          >
            <div className="max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.aggiungeP1[lingua]}</p>
              <p>{SPIEGAZIONE.aggiungeP2[lingua]}</p>
              <p>{SPIEGAZIONE.aggiungeP3[lingua]}</p>
            </div>

            <h3 className="mt-8 text-lg font-semibold tracking-tight text-inchiostro">
              {SPIEGAZIONE.tiTitolo[lingua]}
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Cifra
                valore={inEuro(trattamentoIntegrativo.importo.valore)}
                etichetta={SPIEGAZIONE.tiImporto[lingua]}
              />
              <Cifra
                valore={inEuroTondo(trattamentoIntegrativo.sogliaRedditoComplessivo.valore)}
                etichetta={SPIEGAZIONE.tiSoglia[lingua]}
              />
              <Cifra
                valore={inEuroTondo(trattamentoIntegrativo.scartoSulGate.valore)}
                etichetta={SPIEGAZIONE.tiScartoEtichetta[lingua]}
              />
            </div>

            <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.tiCondizione[lingua]}</p>
              <p>{SPIEGAZIONE.tiScarto[lingua]}</p>
            </div>

            <div className="mt-4">
              <Fonti
                fonti={[
                  trattamentoIntegrativo.importo.fonte,
                  trattamentoIntegrativo.scartoSulGate.fonte,
                ]}
                titolo={SPIEGAZIONE.fonteEtichetta[lingua]}
              />
            </div>
          </Sezione>
        </div>

        {/*
          ⚠️ Il cuneo sta qui, dopo la 5, e non fra la 3 e la 4 dov'era su
          `/cifre-chiave`. Ha bisogno di **entrambe** le nature per essere
          capito — una detrazione dall'imposta e una somma che non concorre al
          reddito — e la seconda la spiega la sezione appena letta. Non è un
          anello della catena, quindi non ha numero: è la stessa convenzione dei
          due riquadri in fondo.
        */}
        <section
          id="cuneo"
          className="scroll-mt-4 rounded-sezione border border-bordo-decorativo bg-fondo p-4 sm:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {SPIEGAZIONE.cuneoTitolo[lingua]}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {SPIEGAZIONE.cuneoOcchiello[lingua]}
          </p>

          <div className="mt-6">
            <Figura
              titolo={SPIEGAZIONE.cuneoTitolo[lingua]}
              etichettaFonte={SPIEGAZIONE.fonteEtichetta[lingua]}
              fonti={[cuneo.somma.fasce.fonte, cuneo.detrazione.fasce.fonte]}
            >
              <Spezzata
                curve={[
                  { curva: curvaSommaCuneo, etichetta: SPIEGAZIONE.cuneoSomma[lingua], aggiunge: true },
                  { curva: curvaDetrazioneCuneo, etichetta: SPIEGAZIONE.cuneoDetrazione[lingua] },
                ]}
                tacche={tacche(confiniCuneo)}
                tacchePerAsseY={[]}
                descrizione={SPIEGAZIONE.cuneoTitolo[lingua]}
              />
              <Legenda
                voci={[
                  { etichetta: SPIEGAZIONE.cuneoSomma[lingua], aggiunge: true },
                  { etichetta: SPIEGAZIONE.cuneoDetrazione[lingua] },
                ]}
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-voce border border-bordo-decorativo bg-carta p-4">
                  <p className="font-semibold tracking-tight text-verde-testo">
                    {SPIEGAZIONE.cuneoSomma[lingua]} ·{' '}
                    {fasciaFino(inEuroTondo(cuneo.somma.sogliaAccesso.valore))[lingua].toLowerCase()}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {cuneo.somma.fasce.valore.map((f) => (
                      <li
                        key={f.redditoDa}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm"
                      >
                        <span className="text-inchiostro-tenue">
                          {etichettaBanda(f.redditoDa, f.redditoA)}
                        </span>
                        <span className="cifre font-semibold text-verde-testo">
                          {inPercentuale(f.percentuale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-relaxed text-inchiostro-tenue">
                    {SPIEGAZIONE.cuneoSommaTesto[lingua]}
                  </p>
                </div>

                <div className="rounded-voce border border-bordo-decorativo bg-carta p-4">
                  <p className="font-semibold tracking-tight text-inchiostro">
                    {SPIEGAZIONE.cuneoDetrazione[lingua]} ·{' '}
                    {fasciaDa(
                      inEuroTondo(cuneo.detrazione.fasce.valore[0]?.redditoDa ?? euro(0)),
                      inEuroTondo(azzeramentoCuneo(cuneo.detrazione.fasce.valore)),
                    )[lingua].toLowerCase()}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {cuneo.detrazione.fasce.valore.map((f) => (
                      <li
                        key={f.redditoDa}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm"
                      >
                        <span className="text-inchiostro-tenue">
                          {etichettaBanda(f.redditoDa, f.redditoA)}
                        </span>
                        <span className="cifre font-semibold text-inchiostro">
                          {f.formula.forma === 'costante'
                            ? inEuro(f.formula.importo)
                            : f.formula.espressione}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm leading-relaxed text-inchiostro-tenue">
                    {SPIEGAZIONE.cuneoDetrazioneTesto[lingua]}
                  </p>
                </div>
              </div>
            </Figura>
          </div>

          <div className="mt-6 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>
              {
                cuneoRaccordo(
                  inEuroTondo(euro(raccordoCuneo.soglia)),
                  inEuro(euro(raccordoCuneo.somma)),
                  inEuro(euro(raccordoCuneo.detrazione)),
                )[lingua]
              }
            </p>
            {bandaMarginaleAlta ? (
              <p>
                {
                  cuneoMarginale(
                    inEuroTondo(euro(bandaMarginaleAlta.da)),
                    inEuroTondo(euro(bandaMarginaleAlta.a)),
                    inPercentuale(bandaMarginaleAlta.aliquota),
                  )[lingua]
                }
              </p>
            ) : null}
          </div>
        </section>

        {/* ── 6 · Il netto ── */}
        <div id="netto" className="scroll-mt-4">
          <Sezione
            numero="6"
            titolo={SPIEGAZIONE.nettoTitolo[lingua]}
            occhiello={SPIEGAZIONE.nettoOcchiello[lingua]}
          >
            <div className="max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.nettoP1[lingua]}</p>
              <p>{SPIEGAZIONE.nettoP2[lingua]}</p>
            </div>
          </Sezione>
        </div>

        {/*
          I riquadri finali non sono una settima e ottava sezione: non
          descrivono un passaggio della catena. Il primo dice come si comporta
          la curva che la catena produce, il secondo perché quella curva non è
          una busta paga, il terzo da dove vengono le cifre. Restano senza
          numero per questo.
        */}
        <section
          id="gradini"
          className="scroll-mt-4 rounded-sezione border border-bordo-decorativo bg-fondo p-4 sm:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {SPIEGAZIONE.gradiniTitolo[lingua]}
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{SPIEGAZIONE.gradiniP1[lingua]}</p>
            <p>{SPIEGAZIONE.gradiniP2[lingua]}</p>
          </div>

          <figure className="mt-6 rounded-blocco border border-bordo-decorativo bg-carta p-4 sm:p-5">
            <p className="text-xs font-medium text-inchiostro-nota">
              {SPIEGAZIONE.gradiniAsseY[lingua]}
            </p>
            <div className="mt-2">
              <SchemaGradino descrizione={SPIEGAZIONE.gradiniSchema[lingua]} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="flex items-center gap-2 text-xs text-avviso-testo">
                <span aria-hidden className="h-0.5 w-5 rounded-full bg-avviso-testo" />
                {SPIEGAZIONE.gradiniEtichetta[lingua]}
              </p>
              <p className="text-xs font-medium text-inchiostro-nota">
                {SPIEGAZIONE.gradiniAsseX[lingua]}
              </p>
            </div>
            <figcaption className="mt-4 border-t border-bordo-decorativo pt-3 text-sm leading-relaxed text-inchiostro-tenue">
              {SPIEGAZIONE.gradiniNota[lingua]}
            </figcaption>
          </figure>

          {/*
            ⚠️ L'elenco è il pezzo che l'accorpamento ha reso possibile.
            Prima, questa sezione diceva *in qualche punto il netto scende* e si
            fermava lì, perché i punti veri stavano su un'altra pagina. Ora
            stanno sopra, disegnati, e qui si nominano uno per uno — misurati
            sulle stesse curve, non dichiarati.
          */}
          <div className="mt-6">
            <p className="text-xs font-medium text-inchiostro-nota">
              {SPIEGAZIONE.gradiniElencoTitolo[lingua]}
            </p>
            <ul className="mt-2 space-y-1">
              {gradini.map((g) => (
                <li
                  key={`${g.voce}-${g.effetto}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-bordo-decorativo pb-1.5 text-sm last:border-0"
                >
                  <span className="text-inchiostro-tenue">{g.voce}</span>
                  <span className="cifre font-medium text-inchiostro">{g.effetto}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 max-w-2xl space-y-2 text-sm leading-relaxed text-inchiostro-tenue">
              <p>{SPIEGAZIONE.gradiniElencoNota[lingua]}</p>
              <p>{gradiniRaccordoEscluso(inEuroTondo(euro(raccordoCuneo.soglia)))[lingua]}</p>
            </div>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-4 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {SPIEGAZIONE.bustaTitolo[lingua]}
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{SPIEGAZIONE.bustaP1[lingua]}</p>
            <p>{SPIEGAZIONE.bustaP2[lingua]}</p>
            <p>{SPIEGAZIONE.bustaP3[lingua]}</p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-4 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {SPIEGAZIONE.provenienzaTitolo[lingua]}
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{SPIEGAZIONE.provenienzaP1[lingua]}</p>
            <p>{estrazioneEnti(inData(coperturaComuni.estrattoIl))[lingua]}</p>
            <p>{SPIEGAZIONE.provenienzaP2[lingua]}</p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {SPIEGAZIONE.chiusuraTitolo[lingua]}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {SPIEGAZIONE.chiusuraTesto[lingua]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ['/', 'chiusuraCalcolatore'],
                ['/norme', 'chiusuraNorme'],
                ['/cosa-non-copre', 'chiusuraNonCopre'],
              ] as const
            ).map(([href, chiave]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
              >
                {SPIEGAZIONE[chiave][lingua]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

/**
 * Dove la detrazione da cuneo si azzera.
 *
 * ⚠️ Derivato e non scritto: è l'estremo superiore dell'ultima fascia che
 * *non* è già a zero, cioè il punto in cui la discesa tocca il fondo. Scriverlo
 * a mano significherebbe che una riforma della fascia lascia in pagina un
 * titolo che nomina una soglia inesistente.
 */
function azzeramentoCuneo(
  fasce: (typeof regime2026)['cuneo']['detrazione']['fasce']['valore'],
): Euro {
  const inDiscesa = [...fasce].reverse().find((f) => f.formula.forma === 'lineare-decrescente')
  return inDiscesa?.redditoA ?? euro(0)
}
