/**
 * La citazione di una fonte, come dato e non come nota a piè di pagina.
 *
 * Ogni voce dell'output mostra da dove viene: il criterio di valutazione
 * numero uno è la ricerca, e va dimostrata **dentro l'artefatto**, non in un
 * README. Provenienza e data di consultazione arrivano dal dato — se un
 * domani cambiano, la pagina cambia da sola.
 */

import type { Fonte } from '../../core/types'
import { inData } from '../_lib/formato'

function Citazione({ fonte }: { fonte: Fonte }) {
  const testo = fonte.riferimento ? `${fonte.atto}, ${fonte.riferimento}` : fonte.atto

  return (
    <li className="leading-snug">
      <span className="text-inchiostro-tenue">
        {fonte.url ? (
          <a
            href={fonte.url}
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-bordo-forte underline-offset-2 hover:decoration-inchiostro"
          >
            {testo}
          </a>
        ) : (
          testo
        )}
      </span>{' '}
      <span className="whitespace-nowrap text-inchiostro-tenue/70">
        {/*
          Le due provenienze non sono un dettaglio di import: sono una
          decisione di prodotto (D-005). Milano e Lombardia sono verificate
          sulle delibere, il resto arriverà importato a una data dichiarata.
        */}
        {fonte.provenienza === 'verificata'
          ? `· verificata il ${inData(fonte.consultataIl)}`
          : `· importata${fonte.estrattoIl ? `, estratta il ${inData(fonte.estrattoIl)}` : ''}, consultata il ${inData(fonte.consultataIl)}`}
      </span>
      {fonte.nonVerificato ? (
        <span className="mt-1 block rounded-voce bg-amber-50 px-2 py-1 text-amber-900">
          Riserva sulla fonte: {fonte.nonVerificato}
        </span>
      ) : null}
    </li>
  )
}

export function Fonti({ fonti, titolo }: { fonti: readonly Fonte[]; titolo: string }) {
  if (fonti.length === 0) return null

  return (
    <div className="text-xs">
      <p className="font-medium text-inchiostro-tenue/80">{titolo}</p>
      <ul className="mt-1 space-y-1">
        {fonti.map((f, i) => (
          <Citazione key={`${f.atto}-${f.riferimento ?? ''}-${i}`} fonte={f} />
        ))}
      </ul>
    </div>
  )
}
