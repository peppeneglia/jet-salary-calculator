/**
 * Il contenitore delle tre sezioni impilate (D-035).
 *
 * Esiste per una ragione sola: ritmo. Padding, raggio e spaziatura del
 * titolo si decidono qui una volta, e le tre sezioni non possono divergere di
 * qualche pixel l'una dall'altra.
 *
 * ⚠️ L'intestazione non si seleziona, il contenuto sì. È la stessa regola di
 * testata e piede: numero e titolo sono l'indice della pagina, non qualcosa
 * che qualcuno voglia copiare, e finiscono nella selezione solo per errore
 * quando si trascina il puntatore per prendere una cifra. Sta qui e non nella
 * sola sezione 1 perché è questo componente a esistere affinché le tre non
 * divergano.
 */

export function Sezione({
  numero,
  titolo,
  occhiello,
  children,
}: {
  numero: string
  titolo: string
  /**
   * La riga sotto il titolo.
   *
   * ⚠️ Resta, e la usano le sezioni di `/spiegazione`: lì qualifica il titolo
   * in mezza riga (*«E non sono una tassa»*) ed è esattamente ciò per cui un
   * occhiello esiste. Quella della sezione 3 del calcolatore è invece uscita di
   * qui, perché non qualificava il titolo: diceva che cosa si sarebbe trovato
   * scorrendo, cioè era il primo paragrafo del corpo scritto in corpo minore.
   */
  occhiello?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-sezione border border-bordo-decorativo bg-carta p-4 sm:p-8">
      {/*
        ⚠️ **`items-center` e non `items-baseline`, ed è il motivo per cui il
        numero sembrava sprofondato.**

        Allineare alla linea di base mette d'accordo il **testo** dei due
        elementi, ed è quasi sempre giusto. Qui non lo era, perché il numero non
        è testo nudo: è dentro una pastiglia con bordo e padding verticale.
        Con le basi allineate la pastiglia scende sotto la riga del titolo di
        tutto il proprio padding inferiore, e su un titolo `text-2xl` accanto a
        una cifra `text-xs` lo scarto si vede.

        A occhio si allineano le due **scatole**, non le due basi. `items-center`
        centra la pastiglia sulla riga del titolo, che è quello che chi guarda
        si aspetta.

        ⚠️ L'occhiello è uscito dalla riga del titolo e sta sotto, a piena
        larghezza. Prima era annidato accanto alla pastiglia e restava
        rientrato: un rientro che nessun altro elemento della sezione ripete, e
        che con il numero centrato sul titolo sarebbe diventato arbitrario.
      */}
      <header className="select-none">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="cifre rounded-voce border border-bordo-decorativo px-2 py-0.5 text-xs font-medium text-inchiostro-tenue"
          >
            {numero}
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {titolo}
          </h2>
        </div>
        {occhiello ? <p className="mt-2 text-sm text-inchiostro-tenue">{occhiello}</p> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}
