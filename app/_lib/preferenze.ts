/**
 * Le due preferenze di chi legge: la lingua e il tema.
 *
 * ⚠️ Nessuna delle due è una decisione di prodotto: il prodotto ha una
 * lingua di default (italiano) e una direzione visiva (chiaro, D-035). Queste
 * sono scelte di chi guarda, e vivono dove vive chi guarda — in un cookie.
 *
 * Cookie e non `localStorage`, ed è la ragione per cui non c'è sfarfallio.
 * Il tema e la lingua devono essere noti prima del primo disegno: la lingua
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

/**
 * L'ordine è quello del selettore, e in tutti e due i gruppi **la prima voce è
 * il valore predefinito**.
 *
 * ⚠️ Per il tema non era così: l'ordine era *chiaro · scuro · come il
 * sistema*, con il default in fondo. Un gruppo a segmenti si legge da sinistra,
 * e la voce accesa all'arrivo era la terza: chi guardava leggeva due opzioni
 * prima di trovare quella su cui si trovava già. Ora *Come il sistema* apre il
 * gruppo, e le due scelte esplicite seguono nell'ordine in cui si nominano.
 *
 * Per la lingua l'ordine coincideva già: italiano è la prima voce ed è il
 * default.
 */
export const LINGUE: readonly CodiceLingua[] = ['it', 'en']
export const TEMI: readonly Tema[] = ['sistema', 'chiaro', 'scuro']

/**
 * Italiano, e **non** la lingua del computer di chi apre la pagina.
 *
 * ⚠️ Vale la pena dirlo perché è una scelta e non un'omissione: non c'è
 * nessuna negoziazione su `Accept-Language`, e `navigator.language` non viene
 * letto da nessuna parte. Chi arriva senza cookie riceve la pagina in italiano,
 * chiunque sia. Il calcolatore calcola imposte italiane su comuni italiani: la
 * lingua del prodotto è quella del dominio, e l'inglese è una traduzione che si
 * chiede, non uno stato in cui si può finire per caso.
 *
 * L'effetto pratico: un revisore con il sistema operativo in inglese vede
 * l'italiano, che è la lingua in cui il prodotto è scritto e in cui le
 * citazioni normative sono citabili.
 */
export const LINGUA_PREDEFINITA: CodiceLingua = 'it'

/**
 * *Come il sistema* è il valore iniziale, non *chiaro*.
 *
 * Non contraddice D-035, che fissa la direzione visiva sul chiaro: senza
 * `data-theme` la pagina è chiara, e diventa scura solo per chi ha già
 * dichiarato al proprio sistema operativo di preferirla così. Partire da
 * *chiaro* significherebbe ignorare quella dichiarazione.
 *
 * ⚠️ Ed è la sola preferenza che guarda al sistema, mentre la lingua no —
 * un'asimmetria voluta. Il tema è una condizione di lettura di chi guarda; la
 * lingua è una proprietà del prodotto.
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
 * `undefined` per *come il sistema*: l'assenza dell'attributo è essa stessa
 * lo stato, ed è ciò che lascia decidere a `prefers-color-scheme` nel CSS,
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
 *
 * ⚠️ La firma è stretta di proposito, e la codifica non è formalità
 *
 * `document.cookie` non è un'API strutturata: è una stringa che si concatena,
 * e il punto e virgola dentro un valore non viene sfuggito — apre un attributo
 * nuovo. Un `valore` che contenesse `; domain=…` o `; path=/` scriverebbe un
 * cookie diverso da quello chiesto.
 *
 * Oggi i due argomenti sono costanti di questo file, quindi non è
 * sfruttabile. Ma una funzione che accetta `(nome: string, valore: string)`
 * è una primitiva di iniezione a una chiamata distratta di distanza, e il costo
 * di chiuderla adesso è due tipi e una chiamata a `encodeURIComponent`. Il
 * compilatore rifiuta ora ciò che altrimenti rifiuterebbe soltanto una
 * rilettura attenta.
 *
 * ⚠️ `Secure` solo su https, e la condizione serve: aggiungerlo sempre
 * significherebbe che in sviluppo, su `http://localhost`, il cookie non viene
 * scritto affatto e il selettore smette di funzionare senza dire perché.
 */
type CookiePreferenza = typeof COOKIE_LINGUA | typeof COOKIE_TEMA

export const ricorda = (nome: CookiePreferenza, valore: CodiceLingua | Tema): void => {
  const sicuro = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${nome}=${encodeURIComponent(valore)}; path=/; max-age=${DURATA_SECONDI}; samesite=lax${sicuro}`
}
