import type { Metadata } from 'next'
import Link from 'next/link'
import { Wix_Madefor_Display } from 'next/font/google'
import './globals.css'

/**
 * Wix Madefor Display, servito da next/font (D-035). Il font è self-hosted in
 * build: nessuna richiesta a Google a runtime, nessun layout shift.
 */
const wixMadefor = Wix_Madefor_Display({
  variable: '--font-wix-madefor',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jet Salary Calculator',
  description:
    'Quanto resta davvero di uno stipendio lordo: netto annuo e mensile, con il dettaglio di ogni voce e la norma che la determina. Progetto indipendente, non un prodotto Jet HR.',
}

/**
 * Header e footer sono **fasce verdi a tutta larghezza**, e stanno nel layout
 * perché sono la cornice di tutte le pagine — la home e «Cosa non copre».
 *
 * ⚠️ Il verde qui **non** significa «quello che resta al dipendente». Fino a
 * ieri quella era la regola: verde solo sul netto, nient'altro. La cornice
 * verde la supera, e per non perdere il segnale il numero resta l'unica cosa
 * verde **dentro** il contenuto: le fasce sono struttura, il netto è dato.
 *
 * Testo scuro sul verde e non bianco: `#14181A` su `#66C239` supera il
 * rapporto di contrasto richiesto, il bianco no.
 */
function Intestazione() {
  return (
    <header className="bg-verde">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-voce">
          <span aria-hidden className="flex items-end gap-0.75">
            <span className="h-5 w-1.5 rounded-full bg-inchiostro" />
            <span className="h-3.5 w-1.5 rounded-full bg-inchiostro" />
            <span className="h-2 w-1.5 rounded-full bg-inchiostro" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-inchiostro">
            Jet Salary Calculator
          </span>
        </Link>
        <p className="text-sm font-medium text-inchiostro/75">Anno d’imposta 2026 · Italia</p>
      </div>
    </header>
  )
}

function Chiusura() {
  return (
    <footer className="mt-12 bg-verde">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-base font-semibold tracking-tight text-inchiostro">
              Jet Salary Calculator
            </p>
            <p className="mt-2 text-sm leading-relaxed text-inchiostro/80">
              Il risultato è il netto di un anno intero, per uno stipendio percepito tutto
              nell’anno. Non è l’importo di una singola busta paga: quella risponde a una domanda
              diversa, e il numero che ci leggi sarà un altro.
            </p>
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-inchiostro">
              Prima di fidarti del numero
            </p>
            <p className="mt-2 text-sm leading-relaxed text-inchiostro/80">
              Ci sono cose che questo calcolatore non tiene in conto, e preferiamo dirtele.
            </p>
            <Link
              href="/cosa-non-copre"
              className="mt-3 inline-block rounded-voce bg-inchiostro px-4 py-2 text-sm font-semibold text-carta transition-opacity hover:opacity-90"
            >
              Cosa questo calcolatore non copre
            </Link>
          </div>
        </div>

        {/*
          D-035. Il progetto adotta un registro visivo prossimo a quello di Jet
          HR e porta il loro nome nel titolo: senza questa riga può leggersi
          come un loro prodotto. Sta in pagina e non nell'email, perché chi apre
          il link l'email non la legge.
        */}
        <p className="mt-8 border-t border-inchiostro/15 pt-5 text-sm leading-relaxed text-inchiostro/75">
          Progetto indipendente. Non è un prodotto Jet HR e non è affiliato all’azienda.
        </p>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="it" className={`${wixMadefor.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Intestazione />
        <div className="flex-1">{children}</div>
        <Chiusura />
      </body>
    </html>
  )
}
