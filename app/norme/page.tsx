/**
 * «Norme sul calcolo dello stipendio» — l'archivio.
 *
 * ⚠️ **Non deriva dal calcolo, e non deve fingere di farlo.** Non importa il
 * motore, non importa il regime, non chiama `calcolaNetto`. È un archivio
 * consultabile delle norme che determinano la retribuzione netta in Italia,
 * leggibile anche da chi non ha calcolato niente — e comprende atti che il
 * calcolo non applica affatto, che quindi non potrebbe mai citare.
 *
 * Le citazioni del calcolo restano dove servono: accanto alle voci del
 * risultato, sul passo che applica la regola e sul valore che ne viene.
 *
 * Il contenuto sta in `_lib/norme`, trascritto dalla pagina *Fonti*. Dove
 * *Fonti* non riporta una vigenza o un URL, il campo resta vuoto: su una
 * pagina intitolata alle norme, un dato inventato costa più di un dato assente.
 */

import type { Metadata } from 'next'
import type { Scheda } from '../_lib/norme'
import { SEZIONI } from '../_lib/norme'

export const metadata: Metadata = {
  title: 'Norme sul calcolo dello stipendio — Jet Salary Calculator',
  description:
    'Archivio delle norme che determinano la retribuzione netta in Italia: cosa dispone ciascuna, cosa determina nel calcolo o perché resta fuori, con vigenza e fonte istituzionale.',
}

function Nota({ testo }: { testo: string }) {
  return (
    <li className="leading-relaxed text-inchiostro-tenue">
      <span aria-hidden className="mr-2 text-inchiostro-tenue/50">
        —
      </span>
      {testo}
    </li>
  )
}

function SchedaNorma({ scheda }: { scheda: Scheda }) {
  return (
    <li className="rounded-blocco border border-bordo bg-carta px-5 py-5">
      <h3 className="text-base font-semibold tracking-tight text-inchiostro">
        {scheda.atto}
        {scheda.riferimento ? (
          <span className="font-medium text-inchiostro-tenue"> · {scheda.riferimento}</span>
        ) : null}
      </h3>

      <p className="mt-2 leading-relaxed text-inchiostro-tenue">{scheda.dispone}</p>

      <div className="mt-4 rounded-voce border border-bordo bg-fondo px-4 py-3">
        <p className="text-xs font-medium text-inchiostro-tenue/80">Cosa determina nel netto</p>
        <p className="mt-1 text-sm leading-relaxed text-inchiostro">{scheda.effetto}</p>
      </div>

      {/*
        Vigenza e ultima modifica compaiono solo se *Fonti* le riporta. Il
        campo assente è informazione: dice che quella verifica non è stata
        fatta, invece di far credere che lo sia stata.
      */}
      {scheda.vigenza || scheda.ultimaModifica ? (
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {scheda.vigenza ? (
            <div>
              <dt className="text-xs font-medium text-inchiostro-tenue/80">In vigore</dt>
              <dd className="text-inchiostro">{scheda.vigenza}</dd>
            </div>
          ) : null}
          {scheda.ultimaModifica ? (
            <div>
              <dt className="text-xs font-medium text-inchiostro-tenue/80">Ultima modifica</dt>
              <dd className="text-inchiostro">{scheda.ultimaModifica}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {scheda.note && scheda.note.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-inchiostro-tenue/80">
            Ambiguità e cose da sapere
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {scheda.note.map((n) => (
              <Nota key={n.slice(0, 48)} testo={n} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-bordo pt-3 text-xs text-inchiostro-tenue">
        <span>Letta il {scheda.consultata}</span>
        {scheda.portale ? (
          scheda.url ? (
            <a
              href={scheda.url}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-bordo-forte underline-offset-2 hover:decoration-inchiostro"
            >
              {scheda.portale}
            </a>
          ) : (
            <span>{scheda.portale}</span>
          )
        ) : null}
        {scheda.identificativo ? (
          <span className="text-inchiostro-tenue/70">{scheda.identificativo}</span>
        ) : null}
      </div>
    </li>
  )
}

export default function Norme() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          Norme sul calcolo dello stipendio
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          Quanto arriva davvero in busta paga non lo decide una regola sola. Lo decidono decine di
          norme stratificate negli anni, che si rinviano a vicenda e che quasi nessuno legge insieme.
          Qui ci sono quelle che abbiamo aperto e letto, nell’ordine in cui incontrano una
          retribuzione: prima i contributi, poi l’imposta, poi Regione e Comune.
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          Di ciascuna trovi cosa dispone, cosa determina nel netto — o perché resta fuori dal nostro
          calcolo — e le{' '}
          <strong className="font-medium text-inchiostro">ambiguità che porta con sé</strong>:
          rinvii che non arrivano a destinazione, tetti che vengono derogati, articoli che citano
          numerazioni cambiate vent’anni fa. È la parte che di solito non si racconta.
        </p>

        <nav aria-label="Sezioni dell’archivio" className="mt-6 flex flex-wrap gap-2">
          {SEZIONI.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-voce border border-bordo bg-carta px-3 py-1.5 text-sm font-medium text-inchiostro-tenue transition-colors hover:border-bordo-forte hover:text-inchiostro"
            >
              {s.titolo}
            </a>
          ))}
        </nav>
      </div>

      <main className="space-y-6">
        {SEZIONI.map((sezione) => (
          <section
            key={sezione.id}
            id={sezione.id}
            className="scroll-mt-6 rounded-sezione border border-bordo bg-fondo p-5 sm:p-6"
          >
            <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
              {sezione.titolo}
            </h2>
            <p className="mt-1 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {sezione.occhiello}
            </p>
            <ul className="mt-5 space-y-4">
              {sezione.schede.map((scheda) => (
                <SchedaNorma
                  key={`${scheda.atto}-${scheda.riferimento ?? ''}`}
                  scheda={scheda}
                />
              ))}
            </ul>
          </section>
        ))}

        <div className="rounded-sezione border border-bordo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            Dove un campo è vuoto, è vuoto apposta
          </h2>
          <p className="mt-2 leading-relaxed text-inchiostro-tenue">
            Alcune schede non hanno la data di vigenza, e per alcune manca il link al portale
            istituzionale. Non è una dimenticanza: significa che quella verifica non è stata fatta,
            o che il documento è stato letto su un portale che non espone un indirizzo stabile. Su
            una pagina di norme un dato ricostruito a memoria vale meno di un campo lasciato in
            bianco, perché il primo sembra affidabile e non lo è.
          </p>
        </div>
      </main>
    </div>
  )
}
