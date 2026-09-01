/**
 * Il modulo compilato, ricordato **solo** per andare a leggere una fonte.
 *
 * ⚠️ **Perché serve, in una riga: seguire una fonte non deve costare il
 * calcolo.**
 *
 * Le citazioni accanto a ogni voce ora portano a `/norme`, che è una pagina del
 * sito. Chi le segue fa esattamente il gesto che il progetto gli chiede di
 * fare — *verifica da dove viene questo numero* — e tornando indietro trovava
 * il modulo vuoto e il risultato sparito. Il calcolatore puniva la verifica: è
 * il contrario di quello che questo prodotto dichiara di voler essere.
 *
 * ⚠️ **Ma la memoria non nasce dal calcolo: nasce dal gesto di seguire una
 * fonte. È la correzione di un difetto, e vale la pena dire quale.**
 *
 * Prima si scriveva su `sessionStorage` **a ogni calcolo**, e da lì si
 * riprendeva a ogni montaggio della pagina. Il risultato è che il calcolatore
 * non si azzerava più: ricaricando la pagina, o uscendo e rientrando da un
 * link qualsiasi, il modulo tornava pieno. Chi ricarica una pagina chiede di
 * ricominciare, e trovarsi davanti i numeri di prima — su un computer che può
 * non essere solo suo — è il contrario di quello che ha chiesto.
 *
 * **La regola, adesso:** si scrive **solo** quando si preme una citazione che
 * porta a `/norme`, e si legge **una volta sola**, cioè al primo ritorno sul
 * calcolatore. In ogni altro caso — ricaricare, cambiare pagina di proposito e
 * tornare — non c'è niente da riprendere e il modulo riparte vuoto.
 *
 * Da qui la forma dei due livelli, che è il punto di questo file:
 *
 * - **`segnaModuloCorrente`** tiene il modulo **in memoria**, e basta. Muore
 *   con il caricamento della pagina, quindi non può resuscitare niente dopo un
 *   ricaricamento: è solo *cosa c'è in pagina in questo momento*;
 * - **`ricordaPerLaFonte`** è **l'unico punto che scrive su disco**, e lo
 *   chiama il link della citazione. Se non c'è un calcolo in pagina non fa
 *   nulla, quindi una citazione premuta su `/spiegazione` non salva niente.
 *
 * ⚠️ **`sessionStorage` e non `localStorage`, e resta vero.**
 *
 * Le due si somigliano e decidono cose opposte. `localStorage` sopravvive alla
 * chiusura del browser: chi riapre il sito domani si troverebbe davanti il
 * proprio stipendio senza averlo chiesto. `sessionStorage` vive quanto la
 * scheda, quindi al riavvio non resta comunque niente — ed è la seconda rete,
 * sotto la prima: adesso a non lasciare traccia è già la regola di scrittura.
 *
 * ⚠️ **Che cosa si ricorda: il modulo, non il risultato.**
 *
 * Si potrebbe salvare la traccia intera e ridisegnarla senza ricalcolare. Non
 * si fa, per due ragioni. La prima è che la traccia porta prosa nella lingua di
 * quel momento: chi cambia lingua mentre è su `/norme` e torna indietro
 * troverebbe un risultato nella lingua vecchia. La seconda è che sarebbe una
 * **seconda copia** di ciò che il motore produce, che invecchia da sola al
 * primo cambio di parametri. Qui si ricorda la domanda e si rifà il calcolo:
 * costa una POST senza accessi al disco, e la risposta è per costruzione quella
 * giusta.
 *
 * ⚠️ **Ogni accesso è protetto, e non è pignoleria.** In una finestra privata,
 * con i dati di sito bloccati, o dentro certi contesti incorporati, il solo
 * fatto di *leggere* `sessionStorage` solleva un'eccezione. Un calcolatore che
 * non parte perché non ha potuto ricordare un modulo sarebbe un difetto molto
 * peggiore di quello che questo file esiste per chiudere.
 */

import type { Mensilita, TipoContratto } from '../../core/types'
import type { ComuneSelezionabile } from './comuni'

const CHIAVE = 'jsc_modulo'

/**
 * Quello che si ricorda: i quattro campi della sezione 1, come l'utente li ha
 * lasciati.
 *
 * Il comune per intero e non il solo codice, per la ragione di D-058 già scritta
 * in `sezione-input.tsx`: l'elenco arriva differito, e con il solo codice il
 * campo mostrerebbe `F205` finché non arriva, invece di *Milano (MI)*.
 */
export interface ModuloRicordato {
  readonly ral: string
  readonly comune: ComuneSelezionabile
  readonly tipoContratto: TipoContratto
  readonly mensilita: Mensilita
}

const CONTRATTI: readonly TipoContratto[] = ['indeterminato', 'determinato', 'apprendistato']
const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/**
 * ⚠️ Quello che si rilegge si valida, campo per campo.
 *
 * `sessionStorage` è scrivibile da chiunque abbia la console aperta, e questo
 * oggetto finisce dritto in una richiesta di calcolo. Fidarsi della forma
 * perché l'abbiamo scritta noi è l'assunzione che rende sfruttabile un dato
 * che non viene più da noi. Il costo è una funzione di venti righe; il
 * guadagno è che un valore storpiato produce un modulo vuoto invece di un
 * comportamento indefinito.
 */
const valido = (v: unknown): v is ModuloRicordato => {
  if (v === null || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.ral !== 'string') return false
  if (!CONTRATTI.includes(o.tipoContratto as TipoContratto)) return false
  if (!MENSILITA.includes(o.mensilita as Mensilita)) return false

  const c = o.comune
  if (c === null || typeof c !== 'object') return false
  const comune = c as Record<string, unknown>
  return (
    typeof comune.codiceCatastale === 'string' &&
    typeof comune.nome === 'string' &&
    typeof comune.provincia === 'string'
  )
}

/**
 * Il modulo che il calcolatore sta mostrando adesso.
 *
 * ⚠️ **In memoria e non su disco, ed è tutta la differenza.** Una variabile di
 * modulo muore con il caricamento della pagina: dopo un ricaricamento vale
 * `null`, quindi non c'è modo che un calcolo di prima ricompaia. Serve a una
 * cosa sola — sapere che cosa scrivere se, e solo se, qualcuno preme una
 * citazione.
 */
let corrente: ModuloRicordato | null = null

/** Lo chiama il calcolatore a ogni calcolo. Non scrive niente da nessuna parte. */
export const segnaModuloCorrente = (modulo: ModuloRicordato): void => {
  corrente = modulo
}

/**
 * Lo chiama il calcolatore quando smonta, cioè quando si lascia la pagina.
 *
 * Senza, una citazione premuta **su un'altra pagina** — `/spiegazione` ne ha —
 * salverebbe un calcolo che chi legge si era già lasciato alle spalle, e al
 * ritorno se lo ritroverebbe davanti.
 */
export const scordaModuloCorrente = (): void => {
  corrente = null
}

/**
 * L'unico punto che scrive, e lo chiama il link di una citazione.
 *
 * Fuori dal calcolatore `corrente` è `null` e la funzione non fa nulla: non
 * c'è un caso da conservare, quindi non se ne conserva uno.
 */
export const ricordaPerLaFonte = (): void => {
  if (corrente === null) return
  try {
    sessionStorage.setItem(CHIAVE, JSON.stringify(corrente))
  } catch {
    /* Niente da fare e niente da dire: si perde una comodità, non un calcolo. */
  }
}

export const moduloRicordato = (): ModuloRicordato | null => {
  try {
    const grezzo = sessionStorage.getItem(CHIAVE)
    if (grezzo === null) return null
    const letto: unknown = JSON.parse(grezzo)
    return valido(letto) ? letto : null
  } catch {
    return null
  }
}

/**
 * Si legge una volta sola: ripreso il modulo, la traccia su disco si cancella.
 *
 * ⚠️ **È ciò che rende il ritorno un'eccezione invece di uno stato.** Senza,
 * il modulo resterebbe scritto per tutta la scheda e ricomparirebbe a ogni
 * ricaricamento — cioè il difetto che questo file esiste per chiudere. Per
 * riaverlo bisogna premere di nuovo una citazione, che è esattamente il caso
 * in cui serve.
 */
export const dimenticaModulo = (): void => {
  try {
    sessionStorage.removeItem(CHIAVE)
  } catch {
    /* Come sopra. */
  }
}
