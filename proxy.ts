/**
 * Le intestazioni che dipendono dalla richiesta: la Content-Security-Policy.
 *
 * ⚠️ **Il file si chiama `proxy.ts` e non `middleware.ts`, ed è una differenza
 * di Next 16.** La convenzione precedente è stata rinominata: chi cerca
 * `middleware.ts` in questo repo non lo trova perché non deve esserci. La
 * guida è in `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`.
 *
 * ---------------------------------------------------------------------------
 * Perché il nonce, e perché non basta un blocco statico in `next.config.ts`
 * ---------------------------------------------------------------------------
 *
 * Next inietta script inline nel documento — il payload di idratazione. Una
 * CSP statica può ammetterli in un modo solo, `'unsafe-inline'`, che **spegne
 * esattamente la protezione per cui la CSP esiste**: se un giorno una stringa
 * non fidata finisse nel markup, la policy non la fermerebbe. Un nonce diverso
 * a ogni richiesta ammette gli script del framework e nessun altro.
 *
 * Costa una funzione per richiesta, e qui non costa nemmeno una rotta statica:
 * **le tre pagine sono già dinamiche per costruzione**, perché lingua e tema
 * stanno nella richiesta. Non c'è niente da sacrificare.
 *
 * ⚠️ **Le altre intestazioni non stanno qui**: sono uguali per ogni richiesta e
 * vivono in `next.config.ts`, dove coprono anche gli asset statici che questo
 * file non attraversa.
 */

import { NextResponse, type NextRequest } from 'next/server'

/**
 * ⚠️ **`'unsafe-eval'` solo in sviluppo, ed è documentato da Next.** React lo
 * usa per ricostruire nel browser lo stack di un errore di server. In
 * produzione né React né Next lo richiedono, e lì non deve esserci.
 */
const inSviluppo = process.env.NODE_ENV === 'development'

/**
 * ⚠️ **`style-src-attr 'unsafe-inline'` è l'unica concessione, ed è mirata.**
 *
 * `style-src` governa due cose diverse: gli elementi `<style>` e l'attributo
 * `style` sui singoli tag. Senza questa direttiva ricadrebbero entrambi sulla
 * regola col nonce, e **il grafico degli scaglioni in `/spiegazione` smetterebbe
 * di disegnarsi**: la larghezza di ogni barra è una percentuale calcolata sui
 * valori di `data/`, quindi vive in un attributo `style` e non può stare in un
 * foglio di stile scritto prima di conoscerla.
 *
 * Dichiarandola a parte, l'allentamento riguarda **il solo attributo**: un
 * `<style>` iniettato in pagina resta bloccato, che è il vettore che conta.
 * L'alternativa — passare la percentuale con una variabile CSS — non cambierebbe
 * nulla, perché anche quella si scrive nell'attributo `style`.
 */
const politica = (nonce: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${inSviluppo ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    // I font sono self-hosted da `next/font` al momento della build: nessuna
    // richiesta esce verso Google, e la policy lo rende una garanzia invece di
    // una proprietà che si potrebbe perdere con un import distratto.
    "font-src 'self'",
    "img-src 'self' blob: data:",
    // Il progetto non ha immagini remote, iframe, plugin, né un backend terzo.
    // Ogni riga qui sotto chiude una porta che non è mai stata aperta.
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ')

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = politica(nonce)

  /*
   * Il nonce va **anche nella richiesta**, non solo nella risposta: è da lì che
   * Next lo legge per marcare i propri script inline. Scriverlo nella sola
   * risposta produrrebbe una policy corretta e una pagina bianca.
   */
  const intestazioniRichiesta = new Headers(request.headers)
  intestazioniRichiesta.set('x-nonce', nonce)
  intestazioniRichiesta.set('Content-Security-Policy', csp)

  const risposta = NextResponse.next({ request: { headers: intestazioniRichiesta } })
  risposta.headers.set('Content-Security-Policy', csp)
  return risposta
}

export const config = {
  /*
   * Fuori restano gli asset che non sono documenti: non hanno script da
   * autorizzare, e farli passare da qui significherebbe generare un nonce per
   * ogni immagine. `_next/static` è già coperto dalle intestazioni statiche di
   * `next.config.ts`.
   */
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
