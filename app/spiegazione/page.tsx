/**
 * «Come si passa dallo stipendio lordo al netto» — la spiegazione generale.
 *
 * ⚠️ È la pagina del meccanismo, non di un caso. Non chiama `calcolaNetto`,
 * non conosce un comune, non mostra un netto. Racconta la catena che *Dominio
 * normativo* descrive — contributi, imponibile, i due rami con la stessa base,
 * il ramo che aggiunge — e vale identica per chiunque la legga.
 *
 * La differenza rispetto alle altre tre pagine, e va tenuta ferma:
 *
 * - `/` calcola — un numero per i dati che hai inserito;
 * - `/norme` cita — un archivio di atti, senza catena;
 * - `/cosa-non-copre` delimita — cosa resta fuori;
 * - qui si spiega, e la spiegazione è generale per costruzione.
 *
 * ⚠️ Le due cifre in pagina arrivano da `data/`, non dalla prosa
 * (D-069). L'aliquota dei contributi e gli scaglioni IRPEF si leggono da
 * `regime2026` con la loro `Fonte`, e il grafico delle fasce si disegna sui
 * valori letti: il numero di scaglioni non è scritto da nessuna parte, la
 * pagina rende quelli che trova. Se la Legge di Bilancio ne aggiunge uno, il
 * grafico cresce da solo. Una percentuale scritta a mano qui sarebbe un
 * parametro normativo nascosto in una pagina di testo — esattamente ciò che la
 * separazione in tre livelli esiste per impedire.
 *
 * Tutto il resto della pagina è senza numeri, di proposito: dire «il primo
 * scaglione arriva a ventottomila» in prosa creerebbe una seconda verità
 * accanto a `data/`, e le due divergerebbero al primo gennaio utile.
 *
 * ⚠️ Resta un server component, e la prosa non attraversa il confine. Le
 * frasi stanno in `_lib/testi-spiegazione.ts` e non in `risorse.ts`, che è nel
 * pacchetto JavaScript di ogni pagina: da lì costavano 30.209 byte grezzi e
 * 10,4 KB gzip a ogni visitatore del sito, misurati, per una pagina che al
 * client non serve mai. È la disciplina di D-058 e D-067, e il pattern è
 * quello di `_lib/norme.ts` (D-069). L'unica cosa che attraversa il confine è
 * `<Fonti>`, che è già nel pacchetto di ogni pagina.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import type { Fonte, Scaglione } from '../../core/types'
import { regime2026 } from '../../data/regime-2026'
import { Fonti } from '../_components/fonte'
import { Sezione } from '../_components/sezione'
import { traduzione } from '../_i18n/server'
import { formato } from '../_lib/formato'
import { SPIEGAZIONE, fasciaDa, fasciaFino, fasciaOltre } from '../_lib/testi-spiegazione'

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
 * Il grafico delle fasce.
 *
 * ⚠️ La barra misura l'aliquota, non l'ampiezza della fascia, ed è una
 * scelta di significato. Una barra lunga quanto la fascia direbbe *questo
 * scaglione è largo*, che non interessa a nessuno; una barra lunga quanto
 * l'aliquota dice *di ogni euro che cade qui dentro, questa parte va allo
 * Stato* — che è esattamente la frase che il paragrafo accanto deve smontare.
 *
 * La scala è sull'aliquota massima trovata nei dati, non su cento: le tre
 * aliquote italiane stanno fra 23 e 43, e su una scala 0–100 le barre
 * sarebbero tre trattini quasi uguali. Nessun asse numerato, perché la
 * grandezza è scritta accanto a ogni barra in cifre.
 */
function Fasce({
  scaglioni,
  etichetta,
  inPercentuale,
}: {
  scaglioni: readonly Scaglione[]
  etichetta: (s: Scaglione) => string
  inPercentuale: (n: number) => string
}) {
  const massima = Math.max(...scaglioni.map((s) => s.aliquota))

  return (
    <ul className="space-y-3">
      {scaglioni.map((s) => (
        <li key={`${s.da}-${s.a ?? 'oltre'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-sm font-medium text-inchiostro">{etichetta(s)}</span>
            <span className="cifre text-sm font-semibold text-inchiostro">
              {inPercentuale(s.aliquota)}
            </span>
          </div>
          <div
            aria-hidden
            className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-bordo-decorativo"
          >
            <div
              className="h-full rounded-full bg-verde"
              style={{ width: `${(s.aliquota / massima) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Lo schema del gradino.
 *
 * ⚠️ Nessun numero, e nessun asse graduato: è una forma, non una misura. I
 * gradini veri dipendono dal comune — la soglia di esenzione la fissa l'ente, e
 * migliaia di comuni ne hanno una, ciascuno alla propria altezza. Disegnarne
 * uno con le cifre di Milano su una pagina che dichiara di essere generale
 * sarebbe la cosa peggiore delle due: un numero vero nel posto sbagliato.
 *
 * Il testo alternativo dice la forma, non gli elementi: chi non vede il
 * disegno ha già i due paragrafi sopra, e un elenco di coordinate non
 * aggiungerebbe niente.
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
  const { inEuroTondo, inPercentuale } = formato(lingua)

  const contributi = regime2026.contributi.aliquotaOrdinaria
  const scaglioni = regime2026.irpef.scaglioni

  /**
   * L'etichetta di una fascia, scritta dai suoi estremi.
   *
   * ⚠️ `inEuroTondo` e non `inEuro` (D-071). Il confine di uno scaglione è
   * una soglia di legge, non un importo calcolato: la norma scrive *oltre
   * 28.000 euro*, e `28.000,00 €` aggiungerebbe due cifre che il testo non ha.
   */
  const etichettaFascia = (s: Scaglione): string =>
    s.a === null
      ? fasciaOltre(inEuroTondo(s.da))[lingua]
      : s.da === 0
        ? fasciaFino(inEuroTondo(s.a))[lingua]
        : fasciaDa(inEuroTondo(s.da), inEuroTondo(s.a))[lingua]

  const fonteContributi: readonly Fonte[] = [contributi.fonte]
  const fonteScaglioni: readonly Fonte[] = [scaglioni.fonte]

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {SPIEGAZIONE.titolo[lingua]}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {SPIEGAZIONE.occhiello[lingua]}
        </p>
      </div>

      <main className="space-y-4 sm:space-y-6">
        {/*
          Il diagramma prima delle sei sezioni, e non dopo: chi arriva qui non
          sa ancora quante cose ci sono. La mappa va data prima del percorso,
          altrimenti le sezioni si leggono come sei fatti scollegati.
        */}
        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-4 sm:p-8">
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

          <div className="mt-6 rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
            <p className="text-xs font-medium text-inchiostro-nota">
              {SPIEGAZIONE.primoAliquota[lingua]}
            </p>
            <p className="cifre mt-1 text-2xl font-semibold tracking-tight text-inchiostro">
              {inPercentuale(contributi.valore)}
            </p>
            <div className="mt-4 border-t border-bordo-decorativo pt-3">
              <Fonti fonti={fonteContributi} titolo={SPIEGAZIONE.fonteEtichetta[lingua]} />
            </div>
          </div>
        </Sezione>

        <Sezione
          numero="2"
          titolo={SPIEGAZIONE.scaglioniTitolo[lingua]}
          occhiello={SPIEGAZIONE.scaglioniOcchiello[lingua]}
        >
          <p className="max-w-2xl leading-relaxed text-inchiostro-tenue">
            {SPIEGAZIONE.scaglioniP1[lingua]}
          </p>

          <div className="mt-6 rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
            <p className="text-xs font-medium text-inchiostro-nota">
              {SPIEGAZIONE.scaglioniGraficoTitolo[lingua]}
            </p>
            <div className="mt-4">
              <Fasce
                scaglioni={scaglioni.valore}
                etichetta={etichettaFascia}
                inPercentuale={inPercentuale}
              />
            </div>
            <div className="mt-5 border-t border-bordo-decorativo pt-3">
              <Fonti fonti={fonteScaglioni} titolo={SPIEGAZIONE.fonteEtichetta[lingua]} />
            </div>
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {SPIEGAZIONE.scaglioniP2[lingua]}
          </p>
        </Sezione>

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
        </Sezione>

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

          <p className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {SPIEGAZIONE.localiP2[lingua]}
          </p>
        </Sezione>

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
        </Sezione>

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

        {/*
          I due riquadri finali non sono una settima e ottava sezione: non
          descrivono un passaggio della catena. Il primo dice come si comporta
          la curva che la catena produce, il secondo perché quella curva non è
          una busta paga. Restano senza numero per questo.
        */}
        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-4 sm:p-8">
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
