/**
 * «Come è fatta tecnicamente l'app».
 *
 * ⚠️ È la terza pagina del piede, e sta lì e non in testata per la stessa
 * ragione delle altre due: chi arriva vuole il proprio netto. Questa però è
 * ancora un gradino più in là di *Che progetto è* — quella risponde a *chi ha
 * fatto questa cosa*, questa a *com'è costruita* — e per questo sta dopo,
 * nell'ordine che regge la gerarchia da quando i tre link hanno lo stesso
 * bottone.
 *
 * ⚠️ **Le versioni e i comandi non sono scritti qui: si leggono da
 * `package.json`.** È la regola di D-005 e D-070 portata dove serve di più. Una
 * pagina che dichiara *Next 16.3.3* con la stringa scritta a mano dice il falso
 * al primo aggiornamento, e lo dice proprio sulla pagina che promette di
 * spiegare com'è fatta l'app: sarebbe il posto peggiore in cui avere un numero
 * che nessuno rinfresca.
 *
 * Il verso dell'attraversamento è quello giusto, e non è un dettaglio: si
 * percorrono **le dipendenze vere** e per ognuna si cerca la ragione in
 * `PERCHE_PACCHETTO`. Il contrario — percorrere l'elenco delle ragioni — non
 * mostrerebbe mai un pacchetto entrato senza motivazione, che è esattamente il
 * caso da far vedere.
 *
 * Resta un server component. `package.json` non deve attraversare il confine
 * verso il client, e non c'è ragione perché lo faccia: qui ne escono due
 * elenchi di nomi e versioni, resi una volta sul server. La prosa sta in
 * `_lib/testi-tecnica.ts` come quella delle altre due pagine lunghe (D-069).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import pacchetto from '../../package.json'
import type { CodiceLingua, Multilingua } from '../../core/types'
import { traduzione } from '../_i18n/server'
import { CopiaLink } from '../_components/copia-link'
import { COMANDI, PERCHE_PACCHETTO, TECNICA, URL_REPO, URL_SITO } from '../_lib/testi-tecnica'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloTecnica'),
    description: t('meta.descrizioneTecnica'),
  }
}

/**
 * Il monospazio per i nomi di file, di pacchetto e di comando.
 *
 * ⚠️ Non è decorazione: distingue una cosa che si può digitare o cercare da
 * una che si può soltanto leggere. `test:run` scritto come il resto della frase
 * sembrerebbe un modo di dire, non un comando.
 *
 * Il colore è `inchiostro` e non una tinta derivata: la regola di progetto
 * `jsc/niente-alpha-sul-testo` lo impone, ed è la stessa regola che questa
 * pagina descrive più sotto.
 */
function Mono({ children }: { children: string }) {
  return <span className="font-mono text-[0.9em] text-inchiostro">{children}</span>
}

/** Un paragrafo della prosa, nella lingua della richiesta. */
function P({ testo, lingua }: { testo: Multilingua; lingua: CodiceLingua }) {
  return <p className="max-w-2xl leading-relaxed text-inchiostro-tenue">{testo[lingua]}</p>
}

/**
 * Un blocco con un titolo proprio dentro una sezione.
 *
 * Lo stesso riquadro usato in `/che-progetto-e` per *Come è fatto*: qui i
 * blocchi sono molti di più, quindi diventa un componente invece di essere
 * ricopiato.
 */
function Blocco({
  titolo,
  children,
}: {
  titolo: string
  children: React.ReactNode
}) {
  return (
    <li className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
      <p className="font-semibold tracking-tight text-inchiostro">{titolo}</p>
      <div className="mt-1 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">{children}</div>
    </li>
  )
}

/**
 * Una riga dell'elenco delle dipendenze.
 *
 * ⚠️ Nome e versione arrivano da `package.json`, la ragione da
 * `PERCHE_PACCHETTO`. Se la ragione manca, la riga resta e lo spazio resta
 * vuoto: è il segnale che un pacchetto è entrato senza che nessuno abbia
 * scritto perché, e nasconderlo vorrebbe dire perdere l'unica occasione di
 * accorgersene.
 */
function Dipendenza({
  nome,
  versione,
  perche,
  lingua,
}: {
  nome: string
  versione: string
  perche: Multilingua | undefined
  lingua: CodiceLingua
}) {
  return (
    <li className="border-t border-bordo-decorativo py-3 first:border-t-0 first:pt-0">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <Mono>{nome}</Mono>
        <span className="cifre font-mono text-xs text-inchiostro-nota">{versione}</span>
      </p>
      {perche ? (
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
          {perche[lingua]}
        </p>
      ) : null}
    </li>
  )
}

export default async function ComeEFatta() {
  const { lingua } = await traduzione()

  /**
   * Le due liste, prese dal file vero e non riscritte.
   *
   * `Object.entries` invece di un elenco letterale: l'ordine è quello in cui
   * stanno nel file, che è alfabetico perché lo tiene tale chi installa, e non
   * un ordine deciso qui che divergerebbe al primo pacchetto nuovo.
   */
  /**
   * ⚠️ **L'ordine non è più quello alfabetico del file, ed è una scelta.**
   *
   * `Object.entries` restituisce le dipendenze nell'ordine in cui stanno in
   * `package.json`, che npm tiene alfabetico. Il risultato era che la prima
   * riga della lista a runtime — la più letta, quella che dà il tono a tutta
   * la sezione — era `i18next`, cioè la libreria delle traduzioni, mentre
   * `react` compariva terza. Chi legge per capire su cosa è costruita l'app si
   * trova davanti come cosa principale un dettaglio di internazionalizzazione.
   *
   * L'ordine ora lo dà `PERCHE_PACCHETTO`, cioè l'elenco delle ragioni: chi ha
   * scritto perché un pacchetto è entrato ha anche deciso quanto conta. Le
   * dipendenze **restano quelle vere** e il verso dell'attraversamento non
   * cambia — si percorrono i pacchetti installati, non le ragioni — quindi un
   * pacchetto entrato senza motivazione continua a comparire, in fondo e con
   * lo spazio della ragione vuoto. Cambia solo dove si guarda per l'ordine.
   */
  const perRilevanza = (a: [string, string], b: [string, string]): number => {
    const ordine = Object.keys(PERCHE_PACCHETTO)
    const posizione = (n: string) => {
      const i = ordine.indexOf(n)
      return i === -1 ? Number.MAX_SAFE_INTEGER : i
    }
    return posizione(a[0]) - posizione(b[0]) || a[0].localeCompare(b[0])
  }

  const runtime = Object.entries(pacchetto.dependencies).sort(perRilevanza)
  const sviluppo = Object.entries(pacchetto.devDependencies).sort(perRilevanza)
  const script = Object.entries(pacchetto.scripts)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {TECNICA.titolo[lingua]}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {TECNICA.occhiello[lingua]}
        </p>
      </div>

      <main className="space-y-4 sm:space-y-6">
        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.premessaTitolo[lingua]}
          </h2>
          <div className="mt-4">
            <P testo={TECNICA.premessaTesto} lingua={lingua} />
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.stackTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={TECNICA.stackP1} lingua={lingua} />
            <P testo={TECNICA.stackP2} lingua={lingua} />
          </div>

          {/*
            ⚠️ **Il nome tecnico resta, e sotto c'è che cosa vuol dire.**

            Le due liste si intitolavano *A runtime* e *In sviluppo*: chi sa
            già cosa significa non ha bisogno di leggerle, chi non lo sa non lo
            ricava. Sostituirle con una parafrasi le avrebbe rese comprensibili
            e irriconoscibili, perché sono i termini con cui quelle due liste si
            chiamano ovunque, `package.json` compreso.

            Restano quindi il nome e la glossa, che è la stessa forma di
            `Dipendenza` qui sotto: la cosa, e perché c'è.
          */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(
              [
                [TECNICA.stackRuntime, TECNICA.stackRuntimeNota, runtime],
                [TECNICA.stackSviluppo, TECNICA.stackSviluppoNota, sviluppo],
              ] as const
            ).map(([intestazione, nota, voci]) => (
              <div
                key={intestazione.it}
                className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5"
              >
                <p className="text-sm font-semibold tracking-tight text-inchiostro">
                  {intestazione[lingua]}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                  {nota[lingua]}
                </p>
                <ul className="mt-3">
                  {voci.map(([nome, versione]) => (
                    <Dipendenza
                      key={nome}
                      nome={nome}
                      versione={versione}
                      perche={PERCHE_PACCHETTO[nome]}
                      lingua={lingua}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.cartelleTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={TECNICA.cartelleP1} lingua={lingua} />
            <P testo={TECNICA.cartelleP2} lingua={lingua} />
          </div>

          <ul className="mt-6 space-y-3">
            <Blocco titolo={TECNICA.cartelleImportTitolo[lingua]}>
              {TECNICA.cartelleImportTesto[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.cartelleProvaTitolo[lingua]}>
              {TECNICA.cartelleProvaTesto[lingua]}
            </Blocco>
          </ul>

          {/*
            La riserva dentro la sezione che fa la promessa, non in fondo alla
            pagina. Una promessa e la sua attenuazione separate da tre schermate
            sono, in pratica, la promessa da sola.
          */}
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.importTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={TECNICA.importP1} lingua={lingua} />
            <P testo={TECNICA.importP2} lingua={lingua} />
            <P testo={TECNICA.importP3} lingua={lingua} />
          </div>

        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.confineTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={TECNICA.confineP1} lingua={lingua} />
            <P testo={TECNICA.confineP2} lingua={lingua} />
            <P testo={TECNICA.confineP3} lingua={lingua} />
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.verificheTitolo[lingua]}
          </h2>
          <div className="mt-4">
            <P testo={TECNICA.verificheP1} lingua={lingua} />
          </div>

          {/*
            ⚠️ La riga di comando viene dal file, non da questa pagina.
            `npm run build` qui dentro fa girare il linter e poi la
            compilazione, e la stringa che lo dimostra è quella vera: se domani
            qualcuno togliesse il linter dallo script, la pagina mostrerebbe la
            riga nuova invece di continuare a promettere la vecchia.

            ⚠️ **Su schermo stretto il corpo scende invece di far scorrere.**
            Un comando non si manda a capo senza diventare illeggibile, quindi
            l'unica alternativa allo scorrimento è rimpicciolirlo: il più lungo
            — `npm run build` con i suoi due passaggi — a corpo normale usciva
            di una trentina di pixel, e chi non provava a trascinare vedeva la
            riga tagliata a metà. Il contenitore resta scorrevole come rete,
            perché la riga la porta `package.json` e domani può allungarsi.
          */}
          <ul className="mt-5 space-y-3">
            {script.map(([nome, riga]) => (
              <li
                key={nome}
                className="rounded-blocco border border-bordo-decorativo bg-fondo p-3 sm:p-5"
              >
                <div className="overflow-x-auto">
                  <p className="text-xs whitespace-nowrap sm:text-base">
                    <Mono>{`npm run ${nome}`}</Mono>
                    <span aria-hidden className="mx-1 text-inchiostro-nota sm:mx-2">
                      →
                    </span>
                    <span className="font-mono text-[0.9em] text-inchiostro-tenue">{riga}</span>
                  </p>
                </div>
                {COMANDI[nome] ? (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
                    {COMANDI[nome][lingua]}
                  </p>
                ) : null}
              </li>
            ))}
            <li className="rounded-blocco border border-bordo-decorativo bg-fondo p-3 sm:p-5">
              <p className="max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
                <Mono>npx tsc --noEmit</Mono>
                <span aria-hidden className="mx-2 text-inchiostro-nota">
                  →
                </span>
                {TECNICA.verificheTipi[lingua]}
              </p>
            </li>
          </ul>

          {/*
            ⚠️ **Quattro blocchi tolti da questa sezione, e uno di essi era
            anche diventato falso.**

            Erano: il comando di build che non è quello del framework, la regola
            di lint scritta per il progetto, il fatto che le verifiche stiano
            sul motore e non sui componenti, e il riquadro sul *limite più
            grande che resta*. Le prime tre sono note di cucina interna: dicono
            a chi legge come è organizzato il nostro lavoro, non che cosa può
            aspettarsi dal calcolatore.

            La quarta è il caso che vale la pena registrare. Diceva che
            **nessuna verifica confronta il motore con un numero derivato a mano
            dalla norma**, e al 31/08 non era più vero: `derivati-dalla-norma`
            fa esattamente quel confronto su quattro casi più quattro gemelli,
            con valori attesi prodotti fuori da questo codice. Una riserva
            sopravvissuta alla propria chiusura dichiara il prodotto più debole
            di quanto sia — è lo stesso difetto che ha fatto cadere S-011 e
            S-016, qui su una pagina che parla di verifiche.

            Resta `verificheCi`, che è ancora vera: nessuna integrazione
            continua, i comandi si lanciano a mano.
          */}
          <div className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
            <p>{TECNICA.verificheCi[lingua]}</p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.sicurezzaTitolo[lingua]}
          </h2>
          <div className="mt-4">
            <P testo={TECNICA.sicurezzaP1} lingua={lingua} />
          </div>

          <ul className="mt-6 space-y-3">
            <Blocco titolo={TECNICA.sicurezzaCspTitolo[lingua]}>
              {TECNICA.sicurezzaCsp[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.sicurezzaConcessioneTitolo[lingua]}>
              {TECNICA.sicurezzaConcessione[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.sicurezzaTettoTitolo[lingua]}>
              {TECNICA.sicurezzaTetto[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.sicurezzaLimiteTitolo[lingua]}>
              {TECNICA.sicurezzaLimite[lingua]}
            </Blocco>
          </ul>

        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {TECNICA.deployTitolo[lingua]}
          </h2>

          <ul className="mt-5 space-y-3">
            <Blocco titolo={TECNICA.deployGithubTitolo[lingua]}>
              {TECNICA.deployGithub[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.deployVercelTitolo[lingua]}>
              {TECNICA.deployVercel[lingua]}
            </Blocco>
            <Blocco titolo={TECNICA.deployRuntimeTitolo[lingua]}>
              {TECNICA.deployRuntime[lingua]}
            </Blocco>
          </ul>

          {/*
            `noopener` accanto a `noreferrer` come per ogni link esterno del
            sito: si aprono in una scheda nuova perché sono gli unici link che
            portano fuori, e chi li segue non deve perdere la pagina che stava
            leggendo.

            ⚠️ **I due indirizzi non sono la stessa specie di cosa, e non
            possono avere lo stesso controllo.** Il repository sta altrove:
            *aprilo* è il gesto giusto, e il link porta fuori. Il sito invece è
            **questa pagina** — un bottone che dice *apri il sito* a chi il
            sito ce l'ha già davanti offre l'unico gesto che non serve a
            niente. Quello che manca a chi legge non è arrivarci: è
            **portarsi via l'indirizzo**, per mandarlo a qualcuno. Quindi da un
            lato un link, dall'altro una copia — e l'indirizzo scritto in
            chiaro, che è anche il ripiego quando la copia non è disponibile.
          */}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <a
              href={URL_REPO}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
            >
              {TECNICA.deployRepoLink[lingua]}
            </a>
            <CopiaLink
              url={URL_SITO}
              etichetta={TECNICA.deploySitoCopia[lingua]}
              conferma={TECNICA.deploySitoCopiato[lingua]}
            />
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {TECNICA.chiusuraTitolo[lingua]}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {TECNICA.chiusuraTesto[lingua]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ['/che-progetto-e', 'linkProgetto'],
                ['/spiegazione', 'linkSpiegazione'],
                ['/norme', 'linkNorme'],
              ] as const
            ).map(([href, chiave]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
              >
                {TECNICA[chiave][lingua]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
