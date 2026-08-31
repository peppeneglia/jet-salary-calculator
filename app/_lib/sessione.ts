/**
 * Il modulo compilato, ricordato per la durata della sessione.
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
 * ⚠️ **`sessionStorage` e non `localStorage`, ed è la scelta che regge tutto.**
 *
 * Le due si somigliano e decidono cose opposte. `localStorage` sopravvive alla
 * chiusura del browser: chi riapre il sito domani si troverebbe davanti il
 * proprio stipendio senza averlo chiesto, su un computer che può non essere
 * solo suo. `sessionStorage` vive quanto la scheda: **al riavvio
 * dell'applicazione il calcolatore riparte vuoto**, che è il comportamento
 * chiesto, e non è ottenuto con del codice che pulisce ma con la semantica
 * dello strumento giusto.
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

export const ricordaModulo = (modulo: ModuloRicordato): void => {
  try {
    sessionStorage.setItem(CHIAVE, JSON.stringify(modulo))
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

export const dimenticaModulo = (): void => {
  try {
    sessionStorage.removeItem(CHIAVE)
  } catch {
    /* Come sopra. */
  }
}
