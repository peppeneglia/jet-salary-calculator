'use client'

/**
 * L'Italia in piccolo, con acceso l'ente che ti riguarda.
 *
 * ⚠️ **Che cosa aggiunge, visto che il nome è già scritto due righe sopra.**
 * L'addizionale regionale è l'unica voce del calcolo che dipende da *dove
 * vivi*, e quel fatto in una riga di testo si legge senza vederlo. Una sagoma
 * accesa dentro il paese lo rende immediato: *questa cifra viene da qui, e
 * altrove sarebbe un'altra*. È la stessa cosa che dice la frase della voce
 * regionale — l'aliquota la decide la tua Regione — mostrata invece che
 * ripetuta.
 *
 * ⚠️ **Qui il verde non significa «quello che resta».** La regola del progetto
 * lo riserva a quello, e un'addizionale è il contrario; ma qui non è il dato,
 * è **il puntatore**: dice *sei tu questo*, come l'anello di fuoco dice *sei
 * qui*. Le altre venti sagome restano inchiostro tenue, e nessuna intensità
 * codifica un'aliquota — la mappa non è una scala, è una posizione.
 *
 * ⚠️ **`aria-hidden`, e non è una scorciatoia.** Non c'è un solo dato in
 * questa figura che il testo intorno non porti già: il nome dell'ente è
 * l'etichetta della voce, l'aliquota è la sua cifra. Annunciarla
 * aggiungerebbe una descrizione di ventun poligoni per ridire un nome. È lo
 * stesso criterio degli altri grafici — il disegno non è mai l'unica copia del
 * dato — applicato al caso in cui la copia testuale esisteva già.
 *
 * ⚠️ **Le geometrie arrivano da `GET /api/geo`, non dal documento.** Pesano
 * 51 KiB e questa è una figura di contorno: farle pagare a ogni calcolo
 * sarebbe la cosa che D-058 ha già rifiutato per l'elenco dei comuni. Finché
 * non arrivano non si mostra niente e non si lascia un buco: il blocco intorno
 * è completo anche senza.
 */

import { useEffect, useRef, useState } from 'react'

interface Geometrie {
  readonly viewBox: string
  readonly enti: readonly { readonly nome: string; readonly path: string }[]
}

/**
 * Chiesta una volta per sessione, con la memoria nel modulo e non in uno stato
 * React — che si azzererebbe a ogni ricalcolo, cioè proprio quando la sezione
 * si ricompone. Stesso impianto di `scelta-comune.tsx`.
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

export function MappaRegione({ ente }: { ente: string }) {
  const [geo, setGeo] = useState<Geometrie | null>(null)

  /*
    ⚠️ Il corpo dell'effetto rialza la bandiera, e non è ridondante: in
    sviluppo React monta, smonta e rimonta, e con la sola pulizia il flag
    resterebbe a `false` per sempre. È il difetto che il campo dei comuni ha
    avuto davvero, e che si vedeva solo guardando la pagina.
  */
  const montato = useRef(true)
  useEffect(() => {
    montato.current = true
    chiediGeometrie().then(
      (g) => {
        if (montato.current) setGeo(g)
      },
      () => {
        /* Una mappa che non arriva non è un errore da mostrare: è una figura in meno. */
      },
    )
    return () => {
      montato.current = false
    }
  }, [])

  if (geo === null) return null

  return (
    <svg
      aria-hidden
      viewBox={geo.viewBox}
      /*
        ⚠️ Larghezza fissa, non `w-full`: la mappa vive dentro una riga
        flex accanto al testo, e una figura elastica lì dentro si
        contenderebbe lo spazio con il paragrafo a ogni ridimensionamento.
        `shrink-0` la protegge dallo schiacciamento; le proporzioni le tiene il
        `viewBox`, quindi l'altezza segue da sé (1000 × 1304).

        Più grande sul telefono che accanto al testo, e non è un refuso: sotto
        `sm` la mappa è impilata e centrata, quindi ha tutta la colonna e può
        permettersi di essere leggibile; affiancata deve lasciare al paragrafo
        una misura di riga che si legga.

        ⚠️ **La misura affiancata è legata all'altezza dell'intestazione, non
        scelta a occhio.** A 5rem la sagoma è alta circa 104px, cioè quanto
        titolo, destinazione e spiegazione messi insieme: le due colonne
        finiscono alla stessa quota e sotto non avanza la fascia vuota che si
        vedeva con la mappa più grande. Se un giorno quella spiegazione si
        allungasse, è questo numero a doversi muovere.
      */
      className="h-auto w-28 shrink-0 sm:w-20"
      role="presentation"
    >
      {geo.enti.map((e) => {
        const acceso = e.nome === ente
        return (
          <path
            key={e.nome}
            d={e.path}
            fill={acceso ? 'var(--color-verde)' : 'var(--color-bordo-decorativo-forte)'}
            stroke="var(--color-carta)"
            strokeWidth={2}
          />
        )
      })}
    </svg>
  )
}
