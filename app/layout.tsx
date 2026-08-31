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
            ⚠️ Questa riga resta selezionabile, ed è una scelta. È la
            descrizione di cosa fa il prodotto e di come va letto il numero:
            la sola cosa del piede che qualcuno possa voler citare a qualcun
            altro. Un piede che non si copia va bene per il marchio e per la
            nav, non per la spiegazione di cosa si ha davanti.
          */}
          <p className="max-w-prose text-sm leading-relaxed text-su-verde-tenue select-text">
            {t('piede.notaAnnuale')}
          </p>
          {/*
            ⚠️ **I due link hanno ora lo stesso bottone, e questo emenda
            D-070.**

            D-070 li teneva di rango diverso: riempimento verde a *Cosa non
            copre questo calcolatore*, testo sottolineato a *Che progetto è
            Jet Salary Calculator*, perché la prima domanda qualifica il numero
            appena letto e la seconda si chiede dopo, o non si chiede affatto.

            L'argomento era buono e resta vero sul contenuto; a cadere è la sua
            resa. Due destinazioni dello stesso piede rese con due controlli
            diversi si leggono come due cose di natura diversa — un'azione e una
            nota a margine — mentre sono due pagine dello stesso sito, lunghe
            uguale e scritte con lo stesso registro. La gerarchia che D-070
            voleva resta affidata all'ordine: la prima sta sopra.

            ⚠️ E da qui sono tre, non due. *Come è fatta tecnicamente l'app*
            sta in fondo perché è la domanda che si fa per ultima, e per la
            stessa ragione per cui la seconda sta sotto la prima: chi arriva
            vuole il proprio netto, chi resta vuole sapere chi glielo sta
            dicendo, e soltanto chi resta ancora vuole sapere com'è costruito.
            Con tre voci l'elenco diventa una tabella invece di tre blocchi
            ricopiati: l'ordine è la gerarchia, e va letto in un posto solo.

            ⚠️ **`/cifre-chiave` è stata qui, e ora non esiste più (D-079).**
            Era in cima, con l'argomento che risponde alla domanda che viene
            prima — *da dove esce questo numero* — ma quattro bottoni impilati
            nell'angolo del piede non sono una gerarchia: sono un elenco, e un
            elenco di quattro voci di pari peso non dice a nessuno da dove
            cominciare. Le tre che restano rispondono tutte alla stessa specie
            di domanda, sul prodotto; quella parlava dei valori di legge.

            **Toglierla dal piede l'aveva lasciata orfana** — una pagina a cui
            non arrivava nessuna voce, che è il difetto opposto a quello che
            `nav.tsx` descrive. La risposta non è stata rimetterla nel piede: è
            stata accorparla a `/spiegazione`, che quei valori li spiegava già
            senza mostrarli, e che dalla testata si raggiunge. Il piede resta di
            tre voci, e non c'è più nessuna pagina senza porta.
          */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {(
              [
                ['/cosa-non-copre', 'piede.linkNonCopre'],
                ['/che-progetto-e', 'piede.linkProgetto'],
                ['/come-e-fatta', 'piede.linkTecnica'],
              ] as const
            ).map(([href, chiave]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-voce bg-su-verde px-4 py-2 text-sm font-semibold text-su-verde-contro transition-opacity hover:opacity-90 active:opacity-75"
              >
                {t(chiave)}
              </Link>
            ))}
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
          ⚠️ La dichiarazione di non affiliazione non è più in questa riga, e
          va detto invece che lasciato dedurre dal diff.

          La riga diceva anche *«Non è un prodotto Jet HR e non è affiliato
          all'azienda»*, ed era la resa di D-035 nel piede. È stata tolta su
          richiesta dell'autore: la frase resta in pagina — nel riquadro
          *Non è un prodotto Jet HR* dentro `/che-progetto-e`, che è la pagina
          che nomina l'azienda tre volte di fila e quindi il punto in cui
          l'equivoco si forma — e resta nelle due descrizioni `meta` che i
          motori di ricerca e le anteprime dei link leggono. Quello che cambia
          è che non compare più su **ogni** pagina.

          ⚠️ Va portato al Decision log come emendamento a D-035, e non lo
          scrive il codice: la convenzione del progetto è che le voci le scriva
          l'autore.

          Il nome è in grassetto perché è l'unica cosa della riga che identifica
          qualcuno: il resto qualifica il lavoro, e senza un rilievo la firma si
          legge come parte della qualificazione.

          ⚠️ **E da qui il nome è anche l'unica via per `/chi-sono`.** Non è un
          quinto bottone accanto agli altri quattro, ed è una distinzione di
          natura: quelli sono pagine del prodotto — che cosa non copre, che
          progetto è, com'è fatto, quali cifre applica — mentre questa parla di
          una persona. Un bottone la arruolerebbe fra le altre; il nome che
          diventa cliccabile dice *questo l'ha scritto qualcuno, ed eccolo*.

          Il sottolineato serve, e non è decorazione: dentro una frase, un testo
          che cambia soltanto di peso non si distingue da un'enfasi, e qui il
          peso c'era già per un'altra ragione. Chi legge deve poter capire che
          è un link senza passarci sopra il puntatore — che su un telefono non
          esiste.

          Resta selezionabile per la ragione della riga qui sopra: è la
          rivendicazione di paternità, ed è esattamente il genere di frase che
          qualcuno riporta altrove per intero.
        */}
        <div className="mt-5 border-t border-su-verde/15 pt-5 text-sm text-su-verde-tenue">
          <p className="leading-relaxed select-text">
            {t('piede.indipendenteApertura')}{' '}
            <Link
              href="/chi-sono"
              className="rounded-voce font-medium text-su-verde underline decoration-su-verde/40 underline-offset-2 transition-colors hover:decoration-su-verde"
            >
              Giuseppe Neglia
            </Link>
            . {t('piede.indipendenteChiusura')}
          </p>
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
