/**
 * «Norme sul calcolo dello stipendio» — l'archivio.
 *
 * ⚠️ Non deriva dal calcolo, e non deve fingere di farlo. Non importa il
 * motore, non importa il regime, non chiama `calcolaNetto`. È un archivio
 * consultabile delle norme che determinano la retribuzione netta in Italia,
 * leggibile anche da chi non ha calcolato niente.
 *
 * Le citazioni del calcolo restano dove servono: accanto alle voci del
 * risultato, sul passo che applica la regola e sul valore che ne viene.
 *
 * Il contenuto sta in `_lib/norme`, trascritto dalla pagina *Fonti*. Dove
 * *Fonti* non riporta una vigenza o un URL, il campo resta vuoto: su una
 * pagina intitolata alle norme, un dato inventato costa più di un dato assente.
 *
 * ⚠️ In inglese cambia la prosa, non la citazione (D-041). Atto,
 * riferimento e portale restano identici: sono le chiavi con cui si ritrova il
 * testo su Normattiva, e tradurle renderebbe l'archivio inservibile proprio a
 * chi volesse verificarlo.
 *
 * ⚠️ Il filtro sta nell'URL, e la pagina resta un server component.
 *
 * La ragione è misurata, non stilistica. L'archivio è prosa bilingue per
 * trenta schede: un filtro con `useState` obbliga a importarlo da un client
 * component, e quella prosa attraversa il confine. Misurato su `next start`:
 * +76.190 byte grezzi, +25.612 gzip in un chunk che porta dentro tutte e
 * due le lingue — pagati da ogni lettore, e per metà in una lingua che non
 * legge. È la stessa disciplina di D-049 e D-058, dove l'elenco dei comuni è
 * stato differito proprio per non farlo pagare a tutti.
 *
 * Con `searchParams` l'archivio non attraversa niente: le chip sono link,
 * lo stato è l'URL, e un filtro si può mandare a qualcuno.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
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

/** Il nome del parametro, scritto una volta: lo leggono il parser e le chip. */
const PARAMETRO = 'sezioni'

/**
 * Gli id chiesti nell'URL, ridotti a quelli che esistono davvero.
 *
 * Accetta due forme, perché entrambe arrivano da una barra degli indirizzi
 * scritta a mano: `?sezioni=irpef,addizionali` e `?sezioni=irpef&sezioni=addizionali`.
 *
 * ⚠️ Un id sconosciuto si ignora, non svuota la pagina. Un URL storpiato
 * — un refuso, una sezione rinominata dopo che qualcuno ha salvato il link —
 * deve degradare verso *tutte*, che è lo stato in cui l'archivio si legge
 * comunque. Una pagina vuota lascerebbe credere che l'archivio sia vuoto.
 */
function sezioniChieste(grezzo: string | string[] | undefined): readonly string[] {
  const validi = new Set(SEZIONI.map((s) => s.id))
  const pezzi = (Array.isArray(grezzo) ? grezzo : [grezzo ?? ''])
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
  return SEZIONI.map((s) => s.id).filter((id) => pezzi.includes(id) && validi.has(id))
}

/**
 * L'indirizzo di una chip: la selezione corrente con questo id acceso o spento.
 *
 * L'ordine è sempre quello di `SEZIONI`, cioè quello della catena di calcolo:
 * due percorsi diversi che accendono le stesse sezioni producono lo stesso
 * URL, e non due link che mostrano la stessa pagina.
 */
function indirizzoChip(attive: readonly string[], id: string): string {
  const dopo = attive.includes(id)
    ? attive.filter((x) => x !== id)
    : SEZIONI.map((s) => s.id).filter((x) => attive.includes(x) || x === id)
  return dopo.length === 0 ? '/norme' : `/norme?${PARAMETRO}=${dopo.join(',')}`
}

/**
 * Una chip.
 *
 * ⚠️ `aria-current` e non `aria-pressed`. In ARIA 1.2 `aria-pressed` è
 * ammesso sul solo `role="button"`: su un link è fuori specifica, i lettori di
 * schermo possono ignorarlo e un audit automatico lo segnala. Il gruppo prende
 * il nome dal `<nav aria-label>` che le contiene, e lo stato attivo lo dice
 * `aria-current="true"`, che sul ruolo link è valido e convenzionale.
 *
 * Il fuoco è quello globale di `:focus-visible`: qui l'elemento visibile è
 * il link, quindi non serve la coppia `fuoco-dentro`/`fuoco-delegato`.
 */
function Chip({ href, attiva, children }: { href: string; attiva: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={attiva ? 'true' : undefined}
      className={`rounded-voce border px-3 py-1.5 text-sm font-medium transition-colors ${
        attiva
          ? 'border-inchiostro bg-inchiostro text-carta'
          : 'border-bordo-controllo bg-carta text-inchiostro-tenue hover:border-bordo-controllo-forte hover:text-inchiostro'
      }`}
    >
      {children}
    </Link>
  )
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
              <dt className="text-xs font-medium text-inchiostro-nota">{etichette.inVigore}</dt>
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
      </div>
    </li>
  )
}

export default async function Norme({ searchParams }: PageProps<'/norme'>) {
  const { t, lingua } = await traduzione()
  const { inData } = formato(lingua)

  const attive = sezioniChieste((await searchParams)[PARAMETRO])
  const visibili = attive.length === 0 ? SEZIONI : SEZIONI.filter((s) => attive.includes(s.id))

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

        {/*
          Le chip sostituiscono l'indice ad àncore. Un'àncora porta più in
          basso nella stessa pagina; una chip decide cosa c'è in pagina, e
          il suo stato si può mandare a qualcuno.
        */}
        <nav aria-label={t('norme.filtro')} className="mt-6 flex flex-wrap gap-2">
          <Chip href="/norme" attiva={attive.length === 0}>
            {t('norme.tutte')}
          </Chip>
          {SEZIONI.map((s) => (
            <Chip
              key={s.id}
              href={indirizzoChip(attive, s.id)}
              attiva={attive.includes(s.id)}
            >
              {s.titolo[lingua]}
            </Chip>
          ))}
        </nav>
      </div>

      <main className="space-y-6">
        {visibili.map((sezione) => (
          <section
            key={sezione.id}
            className="rounded-sezione border border-bordo-decorativo bg-fondo p-5 sm:p-6"
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
