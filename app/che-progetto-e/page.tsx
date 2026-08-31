/**
 * «Che progetto è questo».
 *
 * ⚠️ È la pagina che dice da dove viene tutto il resto, e sta nel piede
 * accanto a *Cosa questo calcolatore non copre* per la stessa ragione per cui
 * quella ci sta: sono le due domande che un lettore si fa dopo aver visto
 * un numero, non prima. Chi arriva vuole il proprio netto; chi resta vuole
 * sapere chi glielo sta dicendo.
 *
 * ⚠️ Il nome di Jet HR compare, e la non affiliazione va detta nella stessa
 * pagina (D-035). Il progetto adotta un registro visivo prossimo al loro e
 * porta il loro nome nel titolo: una pagina che spiega il legame con l'azienda
 * senza dichiarare di non esserne un prodotto peggiorerebbe l'equivoco
 * invece di scioglierlo. Per questo il riquadro *Non è un prodotto Jet HR* sta
 * dentro la sezione che parla dell'azienda, non in fondo.
 *
 * ⚠️ I numeri di copertura non sono scritti in prosa (D-070). Comuni ed
 * enti si contano su `coperturaComuni`, che li deriva dall'import, e la data di
 * estrazione arriva dal dato — è la regola di D-005 applicata alla pagina che
 * più di ogni altra è tentata di vantarsi: una copertura dichiarata con un
 * numero riscritto a mano diventa falsa al primo import e nessuno se ne
 * accorge.
 *
 * Resta un server component: `coperturaComuni` vive in `app/_lib/comuni.ts`,
 * che legge i JSON del MEF e non deve mai attraversare il confine verso il
 * client. Qui ne escono quattro interi, non il catalogo.
 *
 * ⚠️ E la prosa non attraversa il confine nemmeno lei. Sta in
 * `_lib/testi-progetto.ts` e non in `risorse.ts`, che è nel pacchetto
 * JavaScript di ogni pagina: la misura e il ragionamento stanno in
 * `_lib/testi-spiegazione.ts` (D-069).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { traduzione } from '../_i18n/server'
import { coperturaComuni } from '../_lib/comuni'
import { formato } from '../_lib/formato'
import { PROGETTO, coperturaComuniNota } from '../_lib/testi-progetto'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloProgetto'),
    description: t('meta.descrizioneProgetto'),
  }
}

/**
 * Una cifra della copertura.
 *
 * Il numero grande e la sua glossa sotto: senza la seconda riga *7.897* non
 * dice niente, e *comuni in elenco* da solo è un'affermazione senza prova.
 */
function Cifra({ valore, etichetta, nota }: { valore: string; etichetta: string; nota: string }) {
  return (
    <div className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
      <p className="cifre text-2xl font-semibold tracking-tight text-inchiostro sm:text-3xl">
        {valore}
      </p>
      <p className="mt-1 text-sm font-medium text-inchiostro">{etichetta}</p>
      <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">{nota}</p>
    </div>
  )
}

export default async function CheProgettoE() {
  const { lingua } = await traduzione()
  const { tag } = formato(lingua)

  /**
   * I conteggi vanno scritti con il separatore della lingua, come ogni altro
   * numero in pagina: `7.897` in italiano e `7,897` in inglese. `inEuro` non
   * serve — non sono importi — ma la convenzione di D-038 vale lo stesso: una
   * pagina non può avere due modi di scrivere le migliaia.
   */
  const conta = new Intl.NumberFormat(tag, { useGrouping: 'always' })

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {PROGETTO.titolo[lingua]}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {PROGETTO.occhiello[lingua]}
        </p>
      </div>

      <main className="space-y-4 sm:space-y-6">
        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {PROGETTO.nasceTitolo[lingua]}
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{PROGETTO.nasceP1[lingua]}</p>
            <p>{PROGETTO.nasceP2[lingua]}</p>
            <p>{PROGETTO.nasceP3[lingua]}</p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {PROGETTO.jetTitolo[lingua]}
          </h2>
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{PROGETTO.jetP1[lingua]}</p>
            <p>{PROGETTO.jetP2[lingua]}</p>
            <p>{PROGETTO.jetP3[lingua]}</p>
          </div>

          {/*
            La dichiarazione di non affiliazione dentro questa sezione, e
            non nel piede dove pure c'è già. Nel piede qualifica il sito; qui
            chiude il paragrafo che nomina l'azienda tre volte di fila, cioè
            il punto esatto in cui l'equivoco si forma.
          */}
          <div className="mt-6 rounded-blocco border border-avviso-bordo bg-avviso p-4 sm:p-5">
            <p className="font-semibold tracking-tight text-avviso-testo">
              {PROGETTO.indipendenteTitolo[lingua]}
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-avviso-testo">
              {PROGETTO.indipendenteTesto[lingua]}
            </p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {PROGETTO.coperturaTitolo[lingua]}
          </h2>
          {/*
            ⚠️ **Il «perché» arriva subito, e prima arrivava per ultimo.**

            Il titolo promette due cose — *quanto è ampio* e *perché più del
            necessario* — e la seconda risposta stava in fondo, dopo i quattro
            riquadri con i conteggi. Chi leggeva incontrava prima la
            rivendicazione (*tutta l'Italia*) e i numeri che la sostengono, e
            solo alla fine la ragione per cui quei numeri esistono: nell'ordine
            sbagliato, l'ampiezza si legge come vanto.

            Ora la ragione sta fra la rivendicazione e i conteggi, che è il
            punto in cui la domanda si forma.
          */}
          <div className="mt-4 max-w-2xl space-y-3 leading-relaxed text-inchiostro-tenue">
            <p>{PROGETTO.coperturaP1[lingua]}</p>
            <p>{PROGETTO.coperturaP2[lingua]}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Cifra
              valore={conta.format(coperturaComuni.totale)}
              etichetta={PROGETTO.coperturaComuni[lingua]}
              nota={coperturaComuniNota(conta.format(coperturaComuni.calcolabili))[lingua]}
            />
            <Cifra
              valore={conta.format(coperturaComuni.entiRegionali)}
              etichetta={PROGETTO.coperturaEnti[lingua]}
              nota={PROGETTO.coperturaEntiNota[lingua]}
            />
            {/*
              ⚠️ Questi due sono scritti a mano, e la differenza conta. Tre
              livelli d'imposta e tre divisioni dello stipendio non sono conteggi
              su un dataset: sono la forma del prodotto, decisa e non misurata.
              Fingere che arrivino da `data/` con un `.length` costruito apposta
              sarebbe una precisione finta.
            */}
            <Cifra
              valore={conta.format(3)}
              etichetta={PROGETTO.coperturaLivelli[lingua]}
              nota={PROGETTO.coperturaLivelliNota[lingua]}
            />
            <Cifra
              valore={conta.format(3)}
              etichetta={PROGETTO.coperturaMensilita[lingua]}
              nota={PROGETTO.coperturaMensilitaNota[lingua]}
            />
          </div>

          {/*
            ⚠️ Via la riga sugli elenchi ministeriali. Diceva da dove vengono i
            dati degli enti, ed era vera finché il prospetto MEF era la sola
            citazione del livello regionale: da quando diciannove enti su
            ventuno portano la propria legge regionale, quella frase descrive
            una parte del quadro come se fosse tutto. Dove i dati entrano è
            spiegato in `/come-e-fatta`, e ogni singola aliquota porta la
            propria fonte accanto al numero.
          */}
          <div className="mt-6 max-w-2xl leading-relaxed text-inchiostro-tenue">
            <p>{PROGETTO.coperturaP3[lingua]}</p>
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {PROGETTO.comeTitolo[lingua]}
          </h2>
          <ul className="mt-5 space-y-3">
            {(
              [
                ['comeUnoTitolo', 'comeUno'],
                ['comeDueTitolo', 'comeDue'],
                ['comeTreTitolo', 'comeTre'],
              ] as const
            ).map(([titolo, corpo]) => (
              <li
                key={titolo}
                className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5"
              >
                <p className="font-semibold tracking-tight text-inchiostro">
                  {PROGETTO[titolo][lingua]}
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
                  {PROGETTO[corpo][lingua]}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {PROGETTO.nonETitolo[lingua]}
          </h2>
          <ul className="mt-4 max-w-2xl space-y-2">
            {(['nonEUno', 'nonEDue', 'nonETre'] as const).map((chiave) => (
              <li key={chiave} className="leading-relaxed text-inchiostro-tenue">
                <span aria-hidden className="mr-2 text-inchiostro-nota">
                  —
                </span>
                {PROGETTO[chiave][lingua]}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {PROGETTO.chiusuraTitolo[lingua]}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {PROGETTO.chiusuraTesto[lingua]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ['/come-e-fatta', 'linkTecnica'],
                ['/spiegazione', 'linkSpiegazione'],
                ['/norme', 'linkNorme'],
                ['/cosa-non-copre', 'linkNonCopre'],
              ] as const
            ).map(([href, chiave]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
              >
                {PROGETTO[chiave][lingua]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
