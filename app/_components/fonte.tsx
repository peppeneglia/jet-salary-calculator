'use client'

/**
 * La citazione di una fonte, come dato e non come nota a piè di pagina.
 *
 * Ogni voce dell'output mostra da dove viene: il criterio di valutazione
 * numero uno è la ricerca, e va dimostrata dentro l'artefatto, non in un
 * README. Provenienza e data di consultazione arrivano dal dato — se un
 * domani cambiano, la pagina cambia da sola.
 *
 * ⚠️ Cosa non si traduce, ed è sostanza (D-041): `atto` e `riferimento`
 * restano in italiano in entrambe le lingue. *L. 30/12/2024 n. 207, art. 1
 * c. 6* è la chiave con cui si cerca il testo su Normattiva; tradurla la
 * renderebbe inservibile proprio a chi volesse verificarla. Cambia la cornice
 * — *verificata il*, *importata* — non la citazione.
 *
 * La data invece segue la lingua: la stessa consultazione si scrive
 * `28/08/2026` o `28 Aug 2026`, e la fonte la porta in ISO 8601 proprio perché
 * la forma non sia decisa nel dato.
 */

import type { Fonte } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { Avviso } from './avviso'

function Citazione({ fonte }: { fonte: Fonte }) {
  const { t, lingua } = useTraduzione()
  const { inData } = formato(lingua)
  const testo = fonte.riferimento ? `${fonte.atto}, ${fonte.riferimento}` : fonte.atto

  return (
    <li className="leading-snug">
      <span className="text-inchiostro-tenue">
        {fonte.url ? (
          <a
            href={fonte.url}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-bordo-decorativo-forte underline-offset-2 hover:decoration-inchiostro"
          >
            {testo}
          </a>
        ) : (
          testo
        )}
      </span>{' '}
      <span className="text-inchiostro-nota">
        {/*
          Le due provenienze non sono un dettaglio di import: sono una
          decisione di prodotto (D-005). Milano e Lombardia sono verificate
          sulle delibere, il resto arriverà importato a una data dichiarata.
        */}
        {fonte.provenienza === 'verificata'
          ? t('fonte.verificata', { data: inData(fonte.consultataIl) })
          : fonte.estrattoIl
            ? t('fonte.importataConEstrazione', {
                estratta: inData(fonte.estrattoIl),
                data: inData(fonte.consultataIl),
              })
            : t('fonte.importata', { data: inData(fonte.consultataIl) })}
      </span>
      {fonte.nonVerificato ? (
        <Avviso misura="compatta">
          {t('fonte.riserva')} {fonte.nonVerificato[lingua]}
        </Avviso>
      ) : null}
    </li>
  )
}

export function Fonti({ fonti, titolo }: { fonti: readonly Fonte[]; titolo: string }) {
  if (fonti.length === 0) return null

  return (
    <div className="text-xs">
      <p className="font-medium text-inchiostro-nota">{titolo}</p>
      <ul className="mt-1 space-y-1">
        {fonti.map((f, i) => (
          <Citazione key={`${f.atto}-${f.riferimento ?? ''}-${i}`} fonte={f} />
        ))}
      </ul>
    </div>
  )
}
