'use client'

/**
 * La forma «FAQ»: una domanda in chiaro, la risposta sotto a richiesta.
 *
 * ⚠️ **Un componente e non tre `<details>` sparsi**, perché il progetto la usa
 * ormai in tre posti — il blocco «Cosa vuol dire esattamente questa cifra», la
 * regola in linguaggio normativo su ogni voce, la nota sul tipo di contratto —
 * e tre copie della stessa meccanica divergono al primo ritocco. È la stessa
 * ragione per cui `CLASSI_ETICHETTA` sta in una costante e i colori stanno in
 * `globals.css`.
 *
 * ⚠️ **`<details>` nativo, e non un accordion costruito a mano.** Si apre
 * senza JavaScript, si annuncia da sé come gruppo espandibile, e il testo
 * dentro resta trovabile dalla ricerca del browser — che su una pagina piena
 * di citazioni normative non è un dettaglio. Un accordion con `useState` e
 * `aria-expanded` costerebbe codice per riprodurre male tre cose che l'HTML fa
 * già bene.
 *
 * ⚠️ **La chiusura è onesta solo se il riassunto dice cosa c'è sotto.**
 * Nascondere del testo dietro un'etichetta generica — *Dettagli*, *Altro* —
 * sposta il costo su chi legge, che deve aprire per sapere se gli interessa.
 * Per questo `titolo` è sempre la domanda intera, mai un'etichetta di servizio.
 *
 * Due misure, perché i contenuti sono di due specie:
 *
 * - `blocco` — una domanda che chiunque può farsi. Ha una cornice, sta nel
 *   flusso della pagina e si vede;
 * - `riga` — materiale per chi verifica: il testo di legge, una nota tecnica.
 *   Non ha cornice ed è più piccola, perché chi non la cerca non deve
 *   inciamparci.
 */

export function Apribile({
  titolo,
  misura = 'blocco',
  children,
}: {
  titolo: string
  misura?: 'blocco' | 'riga'
  children: React.ReactNode
}) {
  if (misura === 'riga') {
    return (
      <details className="group">
        <summary className="fuoco-dentro inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-voce text-xs font-medium text-inchiostro-nota select-none hover:text-inchiostro">
          <Freccia verso="destra" />
          {titolo}
        </summary>
        {/* La barra a sinistra è la convenzione della citazione. */}
        <div className="mt-1.5 border-l-2 border-bordo-decorativo-forte pl-3 text-xs leading-relaxed text-inchiostro-tenue">
          {children}
        </div>
      </details>
    )
  }

  return (
    <details className="group rounded-blocco border border-bordo-decorativo bg-fondo">
      <summary className="fuoco-dentro flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-blocco px-4 py-3 select-none">
        <span className="text-sm font-semibold tracking-tight text-inchiostro">{titolo}</span>
        <Freccia verso="giu" />
      </summary>
      <div className="px-4 pt-1 pb-4">{children}</div>
    </details>
  )
}

function Freccia({ verso }: { verso: 'giu' | 'destra' }) {
  return (
    <span
      aria-hidden
      className={`shrink-0 text-inchiostro-tenue transition-transform ${
        verso === 'giu' ? 'group-open:rotate-180' : 'group-open:rotate-90'
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        className={verso === 'giu' ? 'h-4 w-4' : 'h-3 w-3'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={verso === 'giu' ? 'M4 6.5 8 10.5 12 6.5' : 'M6 4l4 4-4 4'} />
      </svg>
    </span>
  )
}
