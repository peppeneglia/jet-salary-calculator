/**
 * Il contenitore delle tre sezioni impilate (D-035).
 *
 * Esiste per una ragione sola: ritmo. Padding, raggio e spaziatura del
 * titolo si decidono qui una volta, e le tre sezioni non possono divergere di
 * qualche pixel l'una dall'altra.
 */

export function Sezione({
  numero,
  titolo,
  occhiello,
  children,
}: {
  numero: string
  titolo: string
  occhiello?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-sezione border border-bordo-decorativo bg-carta p-4 sm:p-8">
      <header className="flex items-baseline gap-3">
        <span
          aria-hidden
          className="cifre rounded-voce border border-bordo-decorativo px-2 py-0.5 text-xs font-medium text-inchiostro-tenue"
        >
          {numero}
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-inchiostro sm:text-2xl">
            {titolo}
          </h2>
          {occhiello ? (
            <p className="mt-1 text-sm text-inchiostro-tenue">{occhiello}</p>
          ) : null}
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}
