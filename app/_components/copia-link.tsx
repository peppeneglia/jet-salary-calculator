'use client'

/**
 * Copia un indirizzo negli appunti, e lo mostra comunque.
 *
 * ⚠️ **Nasce perché il bottone che c'era prima non serviva a chi lo vedeva.**
 * Diceva *apri il sito*, e chi lo leggeva era già dentro il sito: l'unico
 * gesto che quel link permetteva era ricaricare la pagina da cui si stava
 * partendo. Quello che serve davvero, su una pagina che spiega dov'è
 * pubblicata la cosa, è **portarsi via l'indirizzo** — mandarlo a qualcuno,
 * incollarlo altrove.
 *
 * ⚠️ **L'indirizzo resta scritto accanto al bottone, e non è ridondanza.**
 * `navigator.clipboard` non esiste ovunque e non funziona fuori da un contesto
 * sicuro: se la copia fallisce, senza il testo in chiaro non resterebbe alcun
 * modo di prendere l'indirizzo. Scritto, si seleziona a mano — ed è anche
 * l'unica forma che funziona con JavaScript spento, dove il bottone non fa
 * nulla e la riga accanto continua a dire tutto quello che serve.
 *
 * ⚠️ **La conferma è una regione viva accanto al bottone, non l'etichetta del
 * bottone che cambia.** Scrivere *Copiato* dentro il bottone lo farebbe
 * cambiare larghezza sotto il dito, e per chi ascolta il cambio di nome di un
 * controllo appena premuto si annuncia male. `role="status"` dice la stessa
 * cosa a tutti e due, senza toccare il controllo.
 */

import { useEffect, useRef, useState } from 'react'

export function CopiaLink({
  url,
  etichetta,
  conferma,
}: {
  url: string
  etichetta: string
  conferma: string
}) {
  const [copiato, setCopiato] = useState(false)
  const scadenza = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Il timer va spento allo smontaggio, o scriverebbe su un componente sparito. */
  useEffect(
    () => () => {
      if (scadenza.current !== null) clearTimeout(scadenza.current)
    },
    [],
  )

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /*
        Niente messaggio d'errore, e non è pigrizia: l'indirizzo è già in
        pagina, quindi il ripiego non va spiegato — si vede. Un avviso rosso
        direbbe *è andato storto qualcosa* a chi ha davanti la cosa che voleva.
      */
      return
    }
    setCopiato(true)
    if (scadenza.current !== null) clearTimeout(scadenza.current)
    scadenza.current = setTimeout(() => setCopiato(false), 2500)
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <button
        type="button"
        onClick={copia}
        className="inline-flex min-h-11 items-center rounded-voce border border-bordo-controllo bg-carta px-4 py-2 text-sm font-medium text-inchiostro transition-colors hover:border-bordo-controllo-forte"
      >
        {etichetta}
      </button>
      <span className="font-mono text-xs break-all text-inchiostro-tenue select-text">{url}</span>
      <span role="status" className="text-sm font-medium text-verde-testo">
        {copiato ? conferma : ''}
      </span>
    </span>
  )
}
