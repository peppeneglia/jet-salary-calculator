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
 *
 * ⚠️ **In inglese cambia la prosa, non la citazione** (D-041). Atto,
 * riferimento, portale e identificativo restano identici: sono le chiavi con
 * cui si ritrova il testo su Normattiva, e tradurle renderebbe l'archivio
 * inservibile proprio a chi volesse verificarlo.
 */

import type { Metadata } from 'next'
import type { CodiceLingua } from '../../core/types'
import { traduzione } from '../_i18n/server'
import { formato } from '../_lib/formato'
import type { Scheda } from '../_lib/norme'
import { SEZIONI } from '../_lib/norme'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloNorme'),
    description: t('meta.descrizioneNorme'),
  }
}

function Nota({ testo }: { testo: string }) {
  return (
    <li className="leading-relaxed text-inchiostro-tenue">
      <span aria-hidden className="mr-2 text-inchiostro-nota">
        —
      </span>
      {testo}
    </li>
  )
}

function SchedaNorma({
  scheda,
  lingua,
  etichette,
}: {
  scheda: Scheda
  lingua: CodiceLingua
  etichette: {
    cosaDetermina: string
    inVigore: string
    ultimaModifica: string
    ambiguita: string
    lettaIl: string
  }
}) {
  return (
    <li className="rounded-blocco border border-bordo-decorativo bg-carta px-5 py-5">
      <h3 className="text-base font-semibold tracking-tight text-inchiostro">
        {scheda.atto}
        {scheda.riferimento ? (
          <span className="font-medium text-inchiostro-tenue"> · {scheda.riferimento}</span>
        ) : null}
      </h3>

      <p className="mt-2 leading-relaxed text-inchiostro-tenue">{scheda.dispone[lingua]}</p>

      <div className="mt-4 rounded-voce border border-bordo-decorativo bg-fondo px-4 py-3">
        <p className="text-xs font-medium text-inchiostro-nota">{etichette.cosaDetermina}</p>
        <p className="mt-1 text-sm leading-relaxed text-inchiostro">{scheda.effetto[lingua]}</p>
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
              <dt className="text-xs font-medium text-inchiostro-nota">
                {etichette.inVigore}
              </dt>
              <dd className="text-inchiostro">{scheda.vigenza[lingua]}</dd>
            </div>
          ) : null}
          {scheda.ultimaModifica ? (
            <div>
              <dt className="text-xs font-medium text-inchiostro-nota">
                {etichette.ultimaModifica}
              </dt>
              <dd className="text-inchiostro">{scheda.ultimaModifica[lingua]}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {scheda.note && scheda.note.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-inchiostro-nota">{etichette.ambiguita}</p>
          <ul className="mt-2 space-y-2 text-sm">
            {scheda.note.map((n) => (
              <Nota key={n.it.slice(0, 48)} testo={n[lingua]} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-bordo-decorativo pt-3 text-xs text-inchiostro-tenue">
        <span>{etichette.lettaIl}</span>
        {scheda.portale ? (
          scheda.url ? (
            <a
              href={scheda.url}
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-bordo-decorativo-forte underline-offset-2 hover:decoration-inchiostro"
            >
              {scheda.portale}
            </a>
          ) : (
            <span>{scheda.portale}</span>
          )
        ) : null}
        {scheda.identificativo ? (
          <span className="text-inchiostro-nota">{scheda.identificativo}</span>
        ) : null}
      </div>
    </li>
  )
}

export default async function Norme() {
  const { t, lingua } = await traduzione()
  const { inData } = formato(lingua)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {t('norme.titolo')}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {t('norme.paragrafo1')}
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {t('norme.paragrafo2a')}{' '}
          <strong className="font-medium text-inchiostro">{t('norme.paragrafo2b')}</strong>
          {t('norme.paragrafo2c')}
        </p>

        <nav aria-label={t('norme.indice')} className="mt-6 flex flex-wrap gap-2">
          {SEZIONI.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-voce border border-bordo-decorativo bg-carta px-3 py-1.5 text-sm font-medium text-inchiostro-tenue transition-colors hover:border-bordo-decorativo-forte hover:text-inchiostro"
            >
              {s.titolo[lingua]}
            </a>
          ))}
        </nav>
      </div>

      <main className="space-y-6">
        {SEZIONI.map((sezione) => (
          <section
            key={sezione.id}
            id={sezione.id}
            className="scroll-mt-6 rounded-sezione border border-bordo-decorativo bg-fondo p-5 sm:p-6"
          >
            <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
              {sezione.titolo[lingua]}
            </h2>
            <p className="mt-1 max-w-2xl leading-relaxed text-inchiostro-tenue">
              {sezione.occhiello[lingua]}
            </p>
            <ul className="mt-5 space-y-4">
              {sezione.schede.map((scheda) => (
                <SchedaNorma
                  key={`${scheda.atto}-${scheda.riferimento ?? ''}`}
                  scheda={scheda}
                  lingua={lingua}
                  etichette={{
                    cosaDetermina: t('norme.cosaDetermina'),
                    inVigore: t('norme.inVigore'),
                    ultimaModifica: t('norme.ultimaModifica'),
                    ambiguita: t('norme.ambiguita'),
                    lettaIl: t('norme.lettaIl', { data: inData(scheda.consultata) }),
                  }}
                />
              ))}
            </ul>
          </section>
        ))}

        <div className="rounded-sezione border border-bordo-decorativo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {t('norme.vuotoTitolo')}
          </h2>
          <p className="mt-2 leading-relaxed text-inchiostro-tenue">{t('norme.vuotoTesto')}</p>
        </div>
      </main>
    </div>
  )
}
