import type { Metadata } from 'next'
import Link from 'next/link'
import { Wix_Madefor_Display } from 'next/font/google'
import { Nav } from './_components/nav'
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
 * Header e footer sono **rettangoli arrotondati con margine dal bordo**, non
 * fasce a tutta pagina: nessun angolo vivo, nemmeno contro il viewport (D-035).
 * Larghezza allineata alla colonna del contenuto, così le tre cose — testata,
 * sezioni, chiusura — stanno sullo stesso asse.
 *
 * ⚠️ Il verde qui **non** significa «quello che resta al dipendente». Fino a
 * ieri quella era la regola: verde solo sul netto, nient'altro. La cornice
 * verde la supera, e per non perdere il segnale il numero resta l'unica cosa
 * verde **dentro** il contenuto: la cornice è struttura, il netto è dato.
 *
 * Testo scuro sul verde e non bianco: `#14181A` su `#66C239` supera il
 * rapporto di contrasto richiesto, il bianco no.
 */
function Marchio({ grande }: { grande?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-voce">
      <span aria-hidden className="flex items-end gap-0.75">
        <span className="h-5 w-1.5 rounded-full bg-inchiostro" />
        <span className="h-3.5 w-1.5 rounded-full bg-inchiostro" />
        <span className="h-2 w-1.5 rounded-full bg-inchiostro" />
      </span>
      <span
        className={`font-semibold tracking-tight text-inchiostro ${grande ? 'text-lg' : 'text-base'}`}
      >
        Jet Salary Calculator
      </span>
    </Link>
  )
}

function Intestazione() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 pt-3 sm:px-4 sm:pt-4">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-sezione bg-verde px-5 py-4 sm:px-6">
        <Marchio grande />
        <Nav etichetta="Sezioni del sito" />
      </header>
    </div>
  )
}

function Chiusura() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-4 sm:pb-4">
      <footer className="rounded-sezione bg-verde px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Marchio />
          <Nav etichetta="Sezioni del sito, in fondo" />
        </div>

        <div className="mt-6 grid gap-6 border-t border-inchiostro/15 pt-6 sm:grid-cols-2">
          <p className="text-sm leading-relaxed text-inchiostro/80">
            Il risultato è il netto di un anno intero, per uno stipendio percepito tutto nell’anno.
            Non è l’importo di una singola busta paga: quella risponde a una domanda diversa, e il
            numero che ci leggi sarà un altro.
          </p>
          <div>
            <p className="text-sm leading-relaxed text-inchiostro/80">
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
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-inchiostro/15 pt-5 text-sm text-inchiostro/75">
          <p className="leading-relaxed">
            Progetto indipendente. Non è un prodotto Jet HR e non è affiliato all’azienda.
          </p>
          <p className="font-medium whitespace-nowrap">Anno d’imposta 2026 · Italia</p>
        </div>
      </footer>
    </div>
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
