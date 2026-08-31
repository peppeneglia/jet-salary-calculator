'use client'

/**
 * La mappa dei ventuno enti che fissano l'addizionale regionale.
 *
 * ⚠️ **Nessuna libreria di mappe, e la scelta è D-078.** Le sagome
 * arrivano già proiettate da `scripts/importa-geometrie.mjs`: qui c'è un
 * `<svg>` e ventun `<path>`. Una libreria avrebbe portato con sé una
 * proiezione da eseguire nel browser e un file di coordinate geografiche da
 * scaricare, per disegnare esattamente le stesse ventun forme — che non
 * cambiano mai, perché i confini regionali non dipendono da chi guarda la
 * pagina. Il lavoro che si può fare una volta, offline, non si rifà a ogni
 * visita.
 *
 * ⚠️ **Le coordinate non stanno nel documento: si chiedono a `GET /api/geo`.**
 * Sono 51 KiB, e `/spiegazione` è in testata — cioè la pagina più visitata
 * dopo il calcolatore. Farle scaricare a chiunque la apra, anche a chi non
 * arriva mai alla sezione 4, è ciò che D-058 ha già rifiutato per l'elenco dei
 * comuni. La rotta esiste già e la usa anche la mappina del risultato: **una
 * sorgente, due lettori**.
 *
 * ⚠️ **Finché non arrivano, la sezione non è rotta.** I ventun bottoni e il
 * pannello di dettaglio non dipendono dalla geometria: sono già completi al
 * primo disegno, e la mappa compare quando può. Una figura in meno non è un
 * errore da mostrare.
 *
 * ⚠️ **La mappa non è l'unico modo di scegliere un ente, ed è la
 * condizione perché possa esistere.** Una sagoma cliccabile non si raggiunge
 * con la tastiera e un lettore di schermo non sa che farsene di un poligono;
 * i ventun bottoni sotto la mappa fanno la stessa cosa, sono nel flusso di
 * tabulazione e dicono nome e aliquota. L'SVG è quindi `aria-hidden`:
 * annunciarlo aggiungerebbe ventun voci che ripetono quelle sotto. È lo stesso
 * criterio dei grafici — il disegno non è mai l'unica copia del dato.
 *
 * ⚠️ **Il verde qui è stato interattivo, non contenuto.** La regola del
 * progetto riserva il verde a *quello che resta al dipendente*, e
 * un'addizionale è il contrario; ma la sagoma scelta si contorna dello stesso
 * verde dell'anello di fuoco di `globals.css`, perché dice *questa è quella
 * selezionata* e non *questa costa poco*. Il dato — quanto è alta l'aliquota —
 * resta affidato all'intensità dell'inchiostro, che è l'unica scala che la
 * tavolozza ammette.
 */

import { useEffect, useRef, useState } from 'react'
import type { EnteInMappa } from '../_lib/cifre'
import { Fonti } from './fonte'

interface Geometrie {
  readonly viewBox: string
  readonly enti: readonly { readonly nome: string; readonly path: string }[]
}

/**
 * Chiesta una volta per sessione, con la memoria nel modulo e non in uno stato
 * React — che si azzererebbe a ogni rimontaggio. È lo stesso impianto di
 * `mappa-regione.tsx` e di `scelta-comune.tsx`, e la promessa condivisa fa sì
 * che le due mappe della stessa sessione paghino una richiesta sola.
 */
let inCorso: Promise<Geometrie> | null = null

const chiediGeometrie = (): Promise<Geometrie> => {
  inCorso ??= fetch('/api/geo')
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.json() as Promise<Geometrie>
    })
    .catch((e: unknown) => {
      inCorso = null
      throw e
    })
  return inCorso
}

export interface EtichetteMappa {
  readonly scegli: string
  readonly aliquotaMassima: string
  readonly bande: string
  readonly regoleProprie: string
  readonly fonte: string
  readonly sopraIlTetto: string
  readonly legenda: string
}

export function MappaEnti({
  enti,
  iniziale,
  etichette,
}: {
  enti: readonly EnteInMappa[]
  /** Il nome leggibile dell'ente da cui la sezione parte. */
  iniziale: string
  etichette: EtichetteMappa
}) {
  const [scelto, setScelto] = useState(iniziale)
  /**
   * L'ente sotto il puntatore, che non è quello scelto.
   *
   * Serve perché su una mappa il bersaglio è una forma irregolare: senza un
   * ritorno visivo prima del clic, si scopre quale regione si stava per
   * scegliere solo dopo averla scelta.
   */
  const [sotto, setSotto] = useState<string | undefined>(undefined)
  const [geo, setGeo] = useState<Geometrie | null>(null)

  /*
    ⚠️ Il corpo dell'effetto rialza la bandiera, e non è ridondante: in
    sviluppo React monta, smonta e rimonta, e con la sola pulizia il flag
    resterebbe a `false` per sempre.
  */
  const montato = useRef(true)
  useEffect(() => {
    montato.current = true
    chiediGeometrie().then(
      (g) => {
        if (montato.current) setGeo(g)
      },
      () => {
        /* Una mappa che non arriva è una figura in meno, non un errore. */
      },
    )
    return () => {
      montato.current = false
    }
  }, [])

  const corrente = enti.find((e) => e.nome === scelto) ?? enti[0]
  if (corrente === undefined) return null

  const tonoDi = new Map(enti.map((e) => [e.nome, e.tono]))

  return (
    <div>
      <div className="grid gap-5 sm:gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,9fr)]">
        <div>
          {geo === null ? null : (
            <>
              <svg
                viewBox={geo.viewBox}
                aria-hidden
                className="mx-auto h-auto w-full max-w-xs text-inchiostro md:max-w-none"
              >
                {geo.enti.map((e) => {
                  const attivo = e.nome === scelto
                  const puntato = e.nome === sotto
                  const tono = tonoDi.get(e.nome) ?? 0.4
                  return (
                    <path
                      key={e.nome}
                      d={e.path}
                      fill="currentColor"
                      fillOpacity={
                        attivo ? Math.min(1, tono + 0.28) : puntato ? Math.min(1, tono + 0.14) : tono
                      }
                      className={`cursore-mano ${attivo ? 'stroke-verde-testo' : 'stroke-carta'}`}
                      strokeWidth={attivo ? 6 : 2}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      onClick={() => setScelto(e.nome)}
                      onPointerEnter={() => setSotto(e.nome)}
                      onPointerLeave={() => setSotto((v) => (v === e.nome ? undefined : v))}
                    />
                  )
                })}
              </svg>

              <p aria-hidden className="mt-3 flex items-center gap-2 text-xs text-inchiostro-nota">
                <span className="flex items-center gap-0.5">
                  {[0.14, 0.32, 0.5, 0.68, 0.86].map((t) => (
                    <span
                      key={t}
                      className="h-2.5 w-4 rounded-[2px] bg-inchiostro"
                      style={{ opacity: t }}
                    />
                  ))}
                </span>
                {etichette.legenda}
              </p>
            </>
          )}
        </div>

        {/* Il pannello del dettaglio. `aria-live` perché il suo contenuto
            cambia senza che la pagina si sposti: chi usa un lettore di schermo
            preme un bottone e deve sentire cos'è cambiato, non restare in
            silenzio. `polite` e non `assertive` — non è un allarme. */}
        <div
          aria-live="polite"
          className="rounded-blocco border border-bordo-decorativo bg-fondo p-4 sm:p-5"
        >
          <h4 className="text-lg font-semibold tracking-tight text-inchiostro">{corrente.nome}</h4>

          <p className="mt-1 text-xs font-medium text-inchiostro-nota">
            {etichette.aliquotaMassima}
          </p>
          <p className="cifre text-2xl font-semibold tracking-tight text-inchiostro sm:text-3xl">
            {corrente.aliquotaMassima}
            {corrente.sopraIlTetto ? (
              <span className="ml-2 align-middle text-xs font-medium text-avviso-testo">
                {etichette.sopraIlTetto}
              </span>
            ) : null}
          </p>

          <p className="mt-4 text-xs font-medium text-inchiostro-nota">{etichette.bande}</p>
          <ul className="mt-1.5 space-y-1">
            {corrente.bande.map((b) => (
              <li
                key={b.fascia}
                className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-bordo-decorativo pb-1 text-sm last:border-0"
              >
                <span className="text-inchiostro-tenue">{b.fascia}</span>
                <span
                  className={`cifre font-semibold ${b.sopraIlTetto ? 'text-avviso-testo' : 'text-inchiostro'}`}
                >
                  {b.aliquota}
                </span>
              </li>
            ))}
          </ul>

          {corrente.regoleProprie.length > 0 ? (
            <>
              <p className="mt-4 text-xs font-medium text-inchiostro-nota">
                {etichette.regoleProprie}
              </p>
              <ul className="mt-1.5 space-y-1">
                {corrente.regoleProprie.map((r) => (
                  <li
                    key={`${r.etichetta}-${r.valore}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm"
                  >
                    <span className="text-inchiostro-tenue">{r.etichetta}</span>
                    <span className="cifre font-semibold text-inchiostro">{r.valore}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {/* La citazione la rende `<Fonti>`, che sa già mostrare le due
              provenienze e la riserva di `nonVerificato` come avviso. Una
              seconda resa, scritta a mano qui, sarebbe la stessa cosa detta in
              un modo diverso nella stessa pagina. */}
          <div className="mt-4 border-t border-bordo-decorativo pt-3">
            <Fonti fonti={[corrente.fonte]} titolo={etichette.fonte} />
          </div>
        </div>
      </div>

      <div role="group" aria-label={etichette.scegli} className="mt-5 flex flex-wrap gap-1.5">
        {enti.map((e) => {
          const attivo = e.nome === scelto
          return (
            <button
              key={e.nome}
              type="button"
              aria-pressed={attivo}
              onClick={() => setScelto(e.nome)}
              onPointerEnter={() => setSotto(e.nome)}
              onPointerLeave={() => setSotto((v) => (v === e.nome ? undefined : v))}
              className={`flex min-h-9 items-center gap-2 rounded-voce border px-2.5 py-1 text-xs font-medium transition-colors ${
                attivo
                  ? 'border-inchiostro bg-inchiostro text-carta'
                  : 'border-bordo-controllo bg-carta text-inchiostro-tenue hover:border-bordo-controllo-forte hover:text-inchiostro'
              }`}
            >
              {/* Il quadratino ripete il tono della sagoma: è ciò che lega il
                  bottone alla forma sulla mappa senza scriverci sopra un nome. */}
              <span
                aria-hidden
                className={`h-2.5 w-2.5 rounded-[2px] ${attivo ? 'bg-carta' : 'bg-inchiostro'}`}
                style={{ opacity: attivo ? 1 : e.tono }}
              />
              {e.nome}
              <span className="cifre opacity-70">{e.aliquotaMassima}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
