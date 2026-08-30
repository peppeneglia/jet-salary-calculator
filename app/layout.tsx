import type { Metadata, Viewport } from 'next'
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
 * Il viewport, dichiarato e non lasciato al default.
 *
 * `maximumScale` e `userScalable` restano fuori di proposito: bloccare lo
 * zoom su un telefono è la violazione di accessibilità più comune del web
 * mobile (WCAG 1.4.4), e su una pagina che contiene citazioni normative a 12px
 * sarebbe indifendibile.
 *
 * `viewportFit: 'cover'` più i padding in `safe-area-inset` servono ai
 * telefoni con notch o barra gestuale: senza, la cornice verde finirebbe sotto
 * gli angoli arrotondati dello schermo.
 *
 * `themeColor` è il verde del marchio in entrambi i temi, perché la cornice
 * non cambia con il tema: la barra del browser diventa la continuazione della
 * testata invece di interromperla.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#66C239',
}

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
 * Header e footer sono rettangoli arrotondati con margine dal bordo, non
 * fasce a tutta pagina: nessun angolo vivo, nemmeno contro il viewport (D-035).
 * Larghezza allineata alla colonna del contenuto, così le tre cose — testata,
 * sezioni, chiusura — stanno sullo stesso asse.
 *
 * ⚠️ Il verde qui non significa «quello che resta al dipendente». Fino a
 * ieri quella era la regola: verde solo sul netto, nient'altro. La cornice
 * verde la supera, e per non perdere il segnale il numero resta l'unica cosa
 * verde dentro il contenuto: la cornice è struttura, il netto è dato.
 *
 * ⚠️ La cornice non cambia con il tema, ed è una scelta (D-042). Il verde
 * del marchio resta identico e il testo che ci sta sopra resta scuro: #14181A
 * su #66C239 vale 7,95 in entrambi i temi. Per questo dentro la cornice si usa
 * `su-verde` e mai `inchiostro`, che sul tema scuro diventa quasi bianco e
 * scenderebbe a 2,25.
 */
function Marchio({ grande }: { grande?: boolean }) {
  return (
    <Link
      href="/"
      className="-mx-1 flex min-h-11 items-center gap-2.5 rounded-voce px-1 transition-opacity active:opacity-70"
    >
      {/*
        ⚠️ Le barre salgono. Scendevano, ed è la stessa figura letta al
        contrario: un grafico che cala accanto al nome di un calcolatore di
        stipendi dice *il tuo stipendio scende*, che è il messaggio opposto a
        quello del prodotto. La direzione di un grafico è contenuto, non
        decorazione.
      */}
      <span aria-hidden className="flex items-end gap-0.75">
        <span className="h-2 w-1.5 rounded-full bg-su-verde" />
        <span className="h-3.5 w-1.5 rounded-full bg-su-verde" />
        <span className="h-5 w-1.5 rounded-full bg-su-verde" />
      </span>
      <span
        className={`font-semibold tracking-tight text-su-verde ${grande ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}
      >
        Jet Salary Calculator
      </span>
    </Link>
  )
}

function Intestazione() {
  return (
    <div className="mx-auto w-full max-w-4xl px-2.5 pt-2.5 sm:px-4 sm:pt-4">
      {/*
        ⚠️ La cornice non si seleziona, il testo sì.

        Testata e piede sono infissi: chi trascina il puntatore sopra la pagina
        vuole prendere un numero o una frase, non il marchio e le voci di
        navigazione, che finiscono nella selezione solo per errore e sporcano
        quello che si incolla.

        `select-none` sta sui due contenitori, non su tutto ciò che
        contengono: nel piede due paragrafi se lo riprendono con `select-text`
        — vedi `Chiusura`.
      */}
      <header className="su-verde flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-sezione bg-verde px-4 py-3 select-none sm:px-6 sm:py-4">
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
    <div className="mx-auto w-full max-w-4xl px-2.5 pb-2.5 sm:px-4 sm:pb-4">
      <footer className="su-verde rounded-sezione bg-verde px-4 py-6 select-none sm:px-6 sm:py-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Marchio />
          <Nav posizione="piede" />
        </div>

        {/*
          ⚠️ Due righe tolte, e non è una potatura estetica.

          *«Ci sono cose che questo calcolatore non tiene in conto…»* era
          un'introduzione al bottone che le sta accanto — e il bottone dice già
          *Cosa questo calcolatore non copre*. Due frasi per un solo gesto: la
          prima non aggiungeva niente che la seconda non dicesse.

          *Anno d'imposta 2026 · Italia* se n'è andato dal piede perché lì
          qualificava la pagina, mentre qualifica un numero: ora sta
          accanto al netto, dove chi legge la cifra lo vede senza scorrere. E
          l'anno non è più scritto nella stringa: arriva da
          `risultato.annoImposta`, quindi non può restare indietro rispetto al
          regime che il motore ha applicato.
        */}
        <div className="mt-6 grid items-start gap-x-6 gap-y-5 border-t border-su-verde/15 pt-6 sm:grid-cols-[1fr_auto]">
          {/*
            ⚠️ Questa riga resta selezionabile, ed è una scelta. Non è
            cromatura: dice che il numero in pagina è il netto di un anno e non
            quello di una busta paga, cioè la sola cosa del piede che qualcuno
            possa voler citare a qualcun altro. Un piede che non si copia va
            bene per il marchio e per la nav, non per un chiarimento sul
            significato della cifra.
          */}
          <p className="max-w-prose text-sm leading-relaxed text-su-verde-tenue select-text">
            {t('piede.notaAnnuale')}
          </p>
          {/*
            ⚠️ Due link, e il secondo non è un secondo bottone (D-070).

            *Che progetto è questo* sta sotto *Cosa questo calcolatore non
            copre* e non accanto: sono due domande di rango diverso. La prima
            qualifica il numero che si ha appena letto ed è la ragione per cui
            il piede esiste; la seconda risponde a *chi ha fatto questa cosa*,
            che si chiede dopo, o non si chiede affatto.

            Due riempimenti verdi identici direbbero che le due domande pesano
            uguale, e chi arriva in fondo dovrebbe scegliere fra due bottoni
            invece di leggerne uno. Il secondo resta testo, con l'area di tocco
            piena — `min-h-11` — perché la gerarchia è visiva e non tattile.
          */}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Link
              href="/cosa-non-copre"
              className="inline-flex min-h-11 items-center rounded-voce bg-su-verde px-4 py-2 text-sm font-semibold text-su-verde-contro transition-opacity hover:opacity-90 active:opacity-75"
            >
              {t('piede.linkNonCopre')}
            </Link>
            <Link
              href="/che-progetto-e"
              className="-mx-1 inline-flex min-h-11 items-center rounded-voce px-1 text-sm font-medium text-su-verde-tenue underline decoration-su-verde-tenue underline-offset-4 transition-colors hover:text-su-verde hover:decoration-su-verde"
            >
              {t('piede.linkProgetto')}
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
        {/*
          Selezionabile per la stessa ragione della riga qui sopra: è la
          dichiarazione di non affiliazione, ed è esattamente il genere di
          frase che qualcuno riporta altrove per intero.
        */}
        <div className="mt-5 border-t border-su-verde/15 pt-5 text-sm text-su-verde-tenue">
          <p className="leading-relaxed select-text">{t('piede.indipendente')}</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * ⚠️ `lang` e `data-theme` li scrive il server, ed è tutto l'impianto.
 *
 * `lang` cambia con la lingua scelta, perché è la dichiarazione su cui un
 * lettore di schermo decide come pronunciare il testo: lasciarlo a `it` con la
 * pagina in inglese non è un dettaglio di markup, è una pagina che si fa
 * leggere male.
 *
 * `data-theme` è presente solo quando la scelta è esplicita. La sua assenza è
 * lo stato «come il sistema», e il CSS la interpreta con
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
      <body className="flex min-h-full flex-col font-sans [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]">
        <ProviderLingua lingua={lingua}>
          <Intestazione />
          <div className="flex-1">{children}</div>
          <Chiusura />
        </ProviderLingua>
      </body>
    </html>
  )
}
