/**
 * Le due preferenze di chi legge: la lingua e il tema.
 *
 * ⚠️ **Nessuna delle due è una decisione di prodotto**: il prodotto ha una
 * lingua di default (italiano) e una direzione visiva (chiaro, D-035). Queste
 * sono scelte di chi guarda, e vivono dove vive chi guarda — in un cookie.
 *
 * **Cookie e non `localStorage`, ed è la ragione per cui non c'è sfarfallio.**
 * Il tema e la lingua devono essere noti **prima** del primo disegno: la lingua
 * perché la pagina è renderizzata sul server, il tema perché una pagina chiara
 * che diventa scura dopo un istante è un difetto visibile. Con `localStorage`
 * il server non sa nulla e servirebbe uno script che corregge il DOM dopo il
 * primo paint. Con un cookie il server sa già, e stampa `lang` e `data-theme`
 * corretti nella prima risposta.
 *
 * Il cookie non è `httpOnly` per costruzione: lo scrive il client quando si usa
 * il selettore, e non contiene niente di riservato — è una preferenza, non
 * un'identità.
 */

import type { CodiceLingua } from '../../core/types'

export type Tema = 'chiaro' | 'scuro' | 'sistema'

/** L'ordine è quello del selettore. */
export const LINGUE: readonly CodiceLingua[] = ['it', 'en']
export const TEMI: readonly Tema[] = ['chiaro', 'scuro', 'sistema']

/** Italiano resta il default: il calcolatore calcola imposte italiane. */
export const LINGUA_PREDEFINITA: CodiceLingua = 'it'

/**
 * *Come il sistema* è il valore iniziale, non *chiaro*.
 *
 * Non contraddice D-035, che fissa la direzione visiva sul chiaro: senza
 * `data-theme` la pagina **è** chiara, e diventa scura solo per chi ha già
 * dichiarato al proprio sistema operativo di preferirla così. Partire da
 * *chiaro* significherebbe ignorare quella dichiarazione.
 */
export const TEMA_PREDEFINITO: Tema = 'sistema'

export const COOKIE_LINGUA = 'jsc_lingua'
export const COOKIE_TEMA = 'jsc_tema'

/** Un anno: la preferenza sopravvive alla sessione, non alla memoria del browser. */
const DURATA_SECONDI = 60 * 60 * 24 * 365

const eLingua = (v: string): v is CodiceLingua => (LINGUE as readonly string[]).includes(v)
const eTema = (v: string): v is Tema => (TEMI as readonly string[]).includes(v)

/**
 * Un valore che non riconosciamo non è un errore da mostrare: è un cookie
 * vecchio, modificato a mano o di un'altra versione dell'app. Si torna al
 * default in silenzio, perché su una preferenza non c'è niente da dire.
 */
export const risolviLingua = (valore: string | undefined): CodiceLingua =>
  valore !== undefined && eLingua(valore) ? valore : LINGUA_PREDEFINITA

export const risolviTema = (valore: string | undefined): Tema =>
  valore !== undefined && eTema(valore) ? valore : TEMA_PREDEFINITO

/**
 * L'attributo `data-theme` da stampare sull'html.
 *
 * `undefined` per *come il sistema*: **l'assenza dell'attributo è essa stessa
 * lo stato**, ed è ciò che lascia decidere a `prefers-color-scheme` nel CSS,
 * senza una riga di JavaScript.
 */
export const attributoTema = (tema: Tema): 'light' | 'dark' | undefined => {
  switch (tema) {
    case 'chiaro':
      return 'light'
    case 'scuro':
      return 'dark'
    case 'sistema':
      return undefined
  }
}

/**
 * L'attributo `lang` dell'html.
 *
 * Il tag BCP 47 completo — `it-IT`, `en-GB` — vive in `data/testi.ts`, perché lì
 * serve a formattare numeri e date. Qui basta la lingua: `lang` dichiara in che
 * lingua è scritto il testo, non con quale convenzione si scrivono le cifre.
 */
export const attributoLingua = (lingua: CodiceLingua): string => lingua

/**
 * Scrive la preferenza. Client-side per necessità: un cookie si può impostare
 * dal server solo in una server function o in un route handler, e per una
 * preferenza sarebbe un giro inutile.
 */
export const ricorda = (nome: string, valore: string): void => {
  document.cookie = `${nome}=${valore}; path=/; max-age=${DURATA_SECONDI}; samesite=lax`
}
