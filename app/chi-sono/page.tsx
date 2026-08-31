/**
 * «Chi sono».
 *
 * ⚠️ **Non è un quinto bottone nel piede, ed è la sua definizione.** Ci si
 * arriva da un solo posto: il nome nella riga di chiusura, che era già in
 * grassetto perché è l'unica cosa di quella frase che identifica qualcuno.
 * Un bottone accanto agli altri quattro direbbe *questa pagina è parte del
 * prodotto*; il nome che diventa cliccabile dice *questo l'ha scritto una
 * persona, ed eccola* — che è quello che è.
 *
 * ⚠️ E per la stessa ragione **non ha un link di ritorno in cima**, come non
 * ce l'hanno più le altre quattro: il marchio in testata riporta al
 * calcolatore da ogni pagina del sito, e una terza via per lo stesso gesto
 * occuperebbe la riga che spetta al titolo.
 *
 * È l'unica pagina in prima persona del sito. Altrove il soggetto è il calcolo
 * e parla il prodotto; qui il soggetto è chi l'ha scritto, e la terza persona
 * suonerebbe come una nota biografica firmata da qualcun altro.
 *
 * Server component come le altre pagine lunghe: la prosa sta in
 * `_lib/testi-chi-sono.ts` e non attraversa il confine verso il client (D-069).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import type { CodiceLingua, Multilingua } from '../../core/types'
import { traduzione } from '../_i18n/server'
import { CHI_SONO, ESPERIENZA, FORMAZIONE, type Voce } from '../_lib/testi-chi-sono'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloChiSono'),
    description: t('meta.descrizioneChiSono'),
  }
}

/**
 * Una voce di esperienza o di formazione.
 *
 * Il periodo è una `<dd>`-come-didascalia e non un `<time>`: `giu 2025 – oggi`
 * non è un istante e non ha una forma leggibile da una macchina, quindi
 * marcarlo come tale prometterebbe una precisione che non c'è.
 *
 * ⚠️ Il periodo sta **sotto** il ruolo e non a destra. Affiancati, su uno
 * schermo stretto le due colonne finivano a due altezze diverse — è lo stesso
 * difetto che la sesta revisione ha tolto dalla sezione 1 del calcolatore.
 */
function Riga({ voce, lingua }: { voce: Voce; lingua: CodiceLingua }) {
  return (
    <li className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5">
      <p className="font-semibold tracking-tight text-inchiostro">{voce.ruolo[lingua]}</p>
      <p className="mt-0.5 text-sm text-inchiostro-tenue">
        {voce.luogo[lingua]}
        <span aria-hidden className="mx-1.5 text-inchiostro-nota">
          ·
        </span>
        <span className="cifre">{voce.periodo[lingua]}</span>
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-inchiostro-tenue">
        {voce.nota[lingua]}
      </p>
    </li>
  )
}

/** Un paragrafo della prosa, nella lingua della richiesta. */
function P({ testo, lingua }: { testo: Multilingua; lingua: CodiceLingua }) {
  return <p className="max-w-2xl leading-relaxed text-inchiostro-tenue">{testo[lingua]}</p>
}

export default async function ChiSono() {
  const { lingua } = await traduzione()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {CHI_SONO.titolo[lingua]}
        </h1>
        {/*
          ⚠️ Niente occhiello sotto il titolo: la presentazione la fa il primo
          riquadro, che si apre con il nome. Vedi la nota in
          `_lib/testi-chi-sono.ts`.
        */}
      </div>

      <main className="space-y-4 sm:space-y-6">
        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <div className="space-y-3">
            <P testo={CHI_SONO.introP1} lingua={lingua} />
            <P testo={CHI_SONO.introP2} lingua={lingua} />
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {CHI_SONO.filoTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={CHI_SONO.filoP1} lingua={lingua} />
            <P testo={CHI_SONO.filoP2} lingua={lingua} />
            <P testo={CHI_SONO.filoP3} lingua={lingua} />
          </div>
        </section>

        {/*
          Esperienza e formazione affiancate sopra i 640px e impilate sotto.
          Sono due elenchi corti dello stesso genere: separarli in due sezioni
          a piena larghezza avrebbe fatto scorrere una pagina che deve restare
          breve.
        */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {(
            [
              [CHI_SONO.esperienzaTitolo, ESPERIENZA],
              [CHI_SONO.formazioneTitolo, FORMAZIONE],
            ] as const
          ).map(([intestazione, voci]) => (
            <section
              key={intestazione.it}
              className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8"
            >
              <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
                {intestazione[lingua]}
              </h2>
              <ul className="mt-5 space-y-3">
                {voci.map((voce) => (
                  <Riga key={voce.ruolo.it} voce={voce} lingua={lingua} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="rounded-sezione border border-bordo-decorativo bg-carta p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {CHI_SONO.perchePTitolo[lingua]}
          </h2>
          <div className="mt-4 space-y-3">
            <P testo={CHI_SONO.percheP1} lingua={lingua} />
            <P testo={CHI_SONO.percheP2} lingua={lingua} />
          </div>
        </section>

        <section className="rounded-sezione border border-bordo-decorativo bg-fondo p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {CHI_SONO.chiusuraTitolo[lingua]}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-inchiostro-tenue">
            {CHI_SONO.chiusuraTesto[lingua]}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ['/che-progetto-e', 'linkProgetto'],
                ['/come-e-fatta', 'linkTecnica'],
              ] as const
            ).map(([href, chiave]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
              >
                {CHI_SONO[chiave][lingua]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
