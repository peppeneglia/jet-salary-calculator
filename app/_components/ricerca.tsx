/**
 * La barra di ricerca per parole chiave di `/norme` e `/spiegazione`.
 *
 * ⚠️ **Un `<form method="get">` e non un campo con `useState`, ed è la stessa
 * decisione che ha già scelto le chip di `/norme` (D-067).**
 *
 * Un filtro con stato React obbligherebbe a rendere la pagina da un client
 * component, e con essa **tutta la prosa su cui si cerca**: trentaquattro
 * schede di archivio o nove sezioni di spiegazione, bilingui, scaricate da
 * chiunque apra la pagina e per metà in una lingua che non legge. È il costo
 * misurato che D-069 ha già rifiutato di pagare, e cercare fra quelle parole è
 * esattamente il caso in cui bisognerebbe pagarlo tutto.
 *
 * Con un form GET la ricerca è un indirizzo: la pagina resta un server
 * component, il filtro si può mandare a qualcuno, e funziona con JavaScript
 * spento. Il prezzo è che si cerca premendo Invio invece che a ogni tasto, e su
 * una pagina di consultazione è un prezzo che si paga volentieri.
 *
 * ⚠️ **`type="search"` e non `type="text"`**: sui browser che lo rendono porta
 * la crocetta per svuotare il campo, ed è annunciato come campo di ricerca
 * invece che come casella generica.
 *
 * ⚠️ Gli altri parametri dell'URL vanno conservati, ed è la ragione di
 * `altri`: su `/norme` la ricerca convive con il filtro per sezione, e un form
 * che non li riportasse cancellerebbe la selezione a ogni Invio.
 */

export function Ricerca({
  azione,
  valore,
  etichetta,
  segnaposto,
  bottone,
  altri = [],
}: {
  /** La pagina su cui il form torna. */
  azione: string
  /** La ricerca in corso, per riempire il campo dopo l'invio. */
  valore: string
  etichetta: string
  segnaposto: string
  bottone: string
  /** Coppie nome/valore da riportare invariate nell'URL. */
  altri?: readonly (readonly [string, string])[]
}) {
  return (
    <form action={azione} method="get" role="search" className="mt-6 flex flex-wrap gap-2">
      {altri.map(([nome, v]) => (
        <input key={nome} type="hidden" name={nome} value={v} />
      ))}

      <label className="sr-only" htmlFor="q">
        {etichetta}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={valore}
        placeholder={segnaposto}
        autoComplete="off"
        className="fuoco-dentro min-h-11 min-w-0 flex-1 rounded-voce border border-bordo-controllo bg-carta px-3 py-2 text-base text-inchiostro transition-colors placeholder:text-inchiostro-tenue hover:border-bordo-controllo-forte sm:max-w-md"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-voce border border-inchiostro bg-inchiostro px-4 py-2 text-sm font-medium text-carta transition-opacity hover:opacity-90 active:opacity-75"
      >
        {bottone}
      </button>
    </form>
  )
}

/**
 * La normalizzazione con cui si confronta: accenti via, tutto minuscolo.
 *
 * È la stessa di `scelta-comune.tsx`, e per la stessa ragione: chi cerca
 * *addizionale* deve trovare *addizionale* anche scrivendolo senza pensare agli
 * accenti, e chi cerca *IRPEF* deve trovarlo scritto in minuscolo.
 */
export const normalizza = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * Vero se **tutte** le parole cercate compaiono nel testo.
 *
 * ⚠️ Tutte e non almeno una: chi scrive *detrazione cuneo* sta restringendo,
 * non allargando. Con l'alternativa otterrebbe ogni scheda che nomina una
 * detrazione più ogni scheda che nomina il cuneo, cioè quasi l'archivio intero,
 * e la ricerca sembrerebbe rotta proprio quando si prova a essere precisi.
 */
export const combacia = (testo: string, ricerca: string): boolean => {
  const parole = normalizza(ricerca).split(/\s+/u).filter(Boolean)
  if (parole.length === 0) return true
  const dove = normalizza(testo)
  return parole.every((p) => dove.includes(p))
}
