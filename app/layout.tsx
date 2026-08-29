import type { Metadata } from 'next'
import Link from 'next/link'
import { Wix_Madefor_Display } from 'next/font/google'
import { Nav } from './_components/nav'
import { Preferenze } from './_components/preferenze'
import { ProviderLingua } from './_i18n/provider'
import { traduzione } from './_i18n/server'
import { preferenze } from './_lib/preferenze-server'
import { attributoLingua, attributoTema } from './_lib/preferenze'
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

/**
 * Titolo e descrizione seguono la lingua di chi apre la pagina.
 *
 * `generateMetadata` e non una costante: la costante era scritta in italiano, e
 * una scheda del browser in una lingua mentre la pagina è in un'altra è la
 * stessa incoerenza che D-041 esiste per togliere.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titolo'),
    description: t('meta.descrizione'),
  }
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
 * ⚠️ **La cornice non cambia con il tema, ed è una scelta** (D-042). Il verde
 * del marchio resta identico e il testo che ci sta sopra resta scuro: #14181A
 * su #66C239 vale 7,95 in entrambi i temi. Per questo dentro la cornice si usa
 * `su-verde` e mai `inchiostro`, che sul tema scuro diventa quasi bianco e
 * scenderebbe a 2,25.
 */
function Marchio({ grande }: { grande?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-voce">
      <span aria-hidden className="flex items-end gap-0.75">
        <span className="h-5 w-1.5 rounded-full bg-su-verde" />
        <span className="h-3.5 w-1.5 rounded-full bg-su-verde" />
        <span className="h-2 w-1.5 rounded-full bg-su-verde" />
      </span>
      <span
        className={`font-semibold tracking-tight text-su-verde ${grande ? 'text-lg' : 'text-base'}`}
      >
        Jet Salary Calculator
      </span>
    </Link>
  )
}

function Intestazione() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 pt-3 sm:px-4 sm:pt-4">
      <header className="su-verde flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-sezione bg-verde px-5 py-4 sm:px-6">
        <Marchio grande />
        <Nav posizione="testa" />
      </header>
    </div>
  )
}

async function Chiusura() {
  const { t } = await traduzione()
  const { tema } = await preferenze()

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-4 sm:pb-4">
      <footer className="su-verde rounded-sezione bg-verde px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Marchio />
          <Nav posizione="piede" />
        </div>

        <div className="mt-6 grid gap-6 border-t border-su-verde/15 pt-6 sm:grid-cols-2">
          <p className="text-sm leading-relaxed text-su-verde/80">{t('piede.notaAnnuale')}</p>
          <div>
            <p className="text-sm leading-relaxed text-su-verde/80">{t('piede.invito')}</p>
            <Link
              href="/cosa-non-copre"
              className="mt-3 inline-block rounded-voce bg-su-verde px-4 py-2 text-sm font-semibold text-su-verde-contro transition-opacity hover:opacity-90"
            >
              {t('piede.linkNonCopre')}
            </Link>
          </div>
        </div>

        {/*
          I due selettori. In fondo e non in testa: chi arriva vuole calcolare
          il proprio netto, non scegliere una lingua (D-041, D-042).
        */}
        <div className="mt-6 border-t border-su-verde/15 pt-5">
          <Preferenze temaIniziale={tema} />
        </div>

        {/*
          D-035. Il progetto adotta un registro visivo prossimo a quello di Jet
          HR e porta il loro nome nel titolo: senza questa riga può leggersi
          come un loro prodotto. Sta in pagina e non nell'email, perché chi apre
          il link l'email non la legge.
        */}
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-su-verde/15 pt-5 text-sm text-su-verde/75">
          <p className="leading-relaxed">{t('piede.indipendente')}</p>
          <p className="font-medium whitespace-nowrap">{t('piede.annoPaese')}</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * ⚠️ **`lang` e `data-theme` li scrive il server, ed è tutto l'impianto.**
 *
 * `lang` cambia con la lingua scelta, perché è la dichiarazione su cui un
 * lettore di schermo decide come pronunciare il testo: lasciarlo a `it` con la
 * pagina in inglese non è un dettaglio di markup, è una pagina che si fa
 * leggere male.
 *
 * `data-theme` è presente solo quando la scelta è esplicita. **La sua assenza è
 * lo stato «come il sistema»**, e il CSS la interpreta con
 * `prefers-color-scheme`: nessuno script, nessun momento in cui la pagina è del
 * colore sbagliato.
 */
export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const { lingua, tema } = await preferenze()
  const temaEsplicito = attributoTema(tema)

  return (
    <html
      lang={attributoLingua(lingua)}
      data-theme={temaEsplicito}
      className={`${wixMadefor.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ProviderLingua lingua={lingua}>
          <Intestazione />
          <div className="flex-1">{children}</div>
          <Chiusura />
        </ProviderLingua>
      </body>
    </html>
  )
}
