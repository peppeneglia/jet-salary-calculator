'use client'

/**
 * Un contenitore che scorre in orizzontale, e che lo dice prima di scorrere.
 *
 * ⚠️ **Esiste perché l'unico segnale che c'era arrivava troppo tardi.** La
 * barra di scorrimento del sistema compare **mentre** si scorre: chi non prova
 * a trascinare non scopre mai che sotto il bordo destro c'è dell'altro, e su
 * un telefono la tabella dei numeri e il diagramma di flusso sono più larghi
 * dello schermo per costruzione — cinque colonne di cifre e un flusso a tre
 * colonne non stanno in 375 pixel, e comprimerli li renderebbe illeggibili.
 * Il rimedio non è togliere una colonna: è **far sapere** che si può spostare.
 *
 * Due segnali, e sono complementari:
 *
 * - **la sfumatura sul bordo**, che dice *il contenuto continua di là*. Compare
 *   solo dal lato verso cui si può ancora andare, quindi sparisce da sé quando
 *   si arriva in fondo;
 * - **l'indicazione sopra**, una riga sola, che dice cosa fare. Sparisce
 *   quando non serve più.
 *
 * ⚠️ **La sfumatura è una maschera, non un velo colorato.** Un rettangolo in
 * sfumatura sopra il contenuto va dipinto del colore che ha dietro, e dietro
 * ci sono righe di tinte diverse — `carta`, `fondo`, `verde-velo` — in due
 * temi. `mask-image` invece **dissolve il contenuto stesso**: non ha un
 * colore, quindi non può sbagliarlo, e funziona identica sul chiaro e sullo
 * scuro. Sta in `globals.css` e non in un attributo `style`, perché la CSP
 * concede `style-src-attr` per le larghezze calcolate a runtime (D-073) e
 * questa non lo è: allargare quella concessione per una sfumatura fissa
 * sarebbe pagarla due volte.
 *
 * ⚠️ **La pista è raggiungibile da tastiera, e prima non lo era.** Un
 * contenitore che scorre e non riceve il fuoco è contenuto irraggiungibile per
 * chi non usa il puntatore (WCAG 2.1.1): `tabIndex={0}` più `role="region"` e
 * un nome è il modo previsto di renderlo navigabile. L'anello di fuoco sta
 * sulla cornice e non sulla pista, con la coppia `fuoco-delegato` /
 * `fuoco-dentro` già in uso altrove: sulla pista lo mangerebbe la maschera,
 * che dissolve tutto ciò che l'elemento dipinge, anello compreso.
 */

import { useEffect, useRef, useState } from 'react'

interface Bordi {
  readonly sinistra: boolean
  readonly destra: boolean
  /** Se ci sia qualcosa da scorrere: senza, non si occupa spazio per dirlo. */
  readonly trabocca: boolean
}

const FERMO: Bordi = { sinistra: false, destra: false, trabocca: false }

export function Scorrevole({
  etichetta,
  indicazione,
  cornice = true,
  className,
  children,
}: {
  /** Il nome della regione, per chi ascolta. Di norma il titolo della figura. */
  etichetta: string
  /** La riga che dice cosa fare, mostrata solo finché serve. */
  indicazione: string
  /** Il bordo arrotondato. La tabella ce l'ha, il diagramma no. */
  cornice?: boolean
  className?: string
  children: React.ReactNode
}) {
  const pista = useRef<HTMLDivElement>(null)
  const [bordi, setBordi] = useState<Bordi>(FERMO)

  useEffect(() => {
    const el = pista.current
    if (el === null) return

    const misura = () => {
      const massimo = el.scrollWidth - el.clientWidth
      /* Un pixel di tolleranza: le larghezze frazionarie non tornano mai esatte. */
      const trabocca = massimo > 1
      const sinistra = trabocca && el.scrollLeft > 1
      const destra = trabocca && el.scrollLeft < massimo - 1
      setBordi((p) =>
        p.sinistra === sinistra && p.destra === destra && p.trabocca === trabocca
          ? p
          : { sinistra, destra, trabocca },
      )
    }

    /*
      ⚠️ **La prima misura la fa l'osservatore, non una chiamata qui.**
      `misura()` scritta nel corpo dell'effetto è `setState` in un effetto, che
      questo progetto ha già sbagliato una volta e che il linter rifiuta.
      `ResizeObserver` invoca la propria callback subito dopo `observe`, quindi
      lo stato iniziale arriva comunque — e arriva **dopo** il primo disegno,
      che è quando le larghezze esistono davvero.

      Si osservano anche i figli: la tabella cambia larghezza quando cambia il
      contenuto, non quando cambia la pista.
    */
    el.addEventListener('scroll', misura, { passive: true })
    const osservatore = new ResizeObserver(misura)
    osservatore.observe(el)
    for (const figlio of el.children) osservatore.observe(figlio)

    return () => {
      el.removeEventListener('scroll', misura)
      osservatore.disconnect()
    }
  }, [])

  return (
    <div className={className}>
      {/*
        Occupa spazio solo quando c'è qualcosa da scorrere, e si smorza quando
        si è arrivati in fondo invece di sparire: togliere la riga a metà
        scorrimento farebbe saltare in su tutto ciò che sta sotto.
      */}
      {bordi.trabocca ? (
        <p
          aria-hidden
          className={`mb-1.5 flex items-center justify-end gap-1.5 text-xs text-inchiostro-nota transition-opacity select-none ${
            bordi.destra ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {indicazione}
          <span aria-hidden>→</span>
        </p>
      ) : null}

      <div
        className={`fuoco-dentro ${cornice ? 'rounded-blocco border border-bordo-decorativo' : ''}`}
      >
        <div
          ref={pista}
          role="region"
          aria-label={etichetta}
          tabIndex={0}
          data-sinistra={bordi.sinistra ? 'si' : undefined}
          data-destra={bordi.destra ? 'si' : undefined}
          className="scorrevole-pista fuoco-delegato overflow-x-auto"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
