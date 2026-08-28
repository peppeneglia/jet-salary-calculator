/**
 * Il contratto fra la pagina e l'handler.
 *
 * Sta in un file suo perché lo leggono in due — il route handler che lo
 * produce e il client che lo consuma — e un contratto scritto due volte è un
 * contratto che diverge.
 */

import type { Mensilita, Risultato, TipoContratto } from '../../core/types'

export interface RichiestaCalcolo {
  readonly ral: number
  readonly codiceCatastale: string
  readonly tipoContratto: TipoContratto
  /** Facoltativo: in assenza vale 13. Il default lo risolve il motore. */
  readonly mensilita?: Mensilita
}

/**
 * Gli errori sono un'unione chiusa, non una stringa libera.
 *
 * `Risultato` non sa dire *non so*: non ha una variante di errore, ed è
 * giusto così — è il tipo di un calcolo riuscito. Il *non so* vive qui, sopra
 * il motore, e ha tre forme diverse perché sono tre cose diverse da dire
 * all'utente.
 */
export type CodiceErrore =
  /** Il corpo della richiesta non è nella forma attesa. */
  | 'richiesta-non-valida'
  /** Il codice catastale non è nel catalogo dei comuni disponibili. */
  | 'comune-sconosciuto'
  /** Il comune è nel catalogo ma un ente impositore manca: riconosciuto, non calcolabile. */
  | 'comune-non-calcolabile'

export interface ErroreCalcolo {
  readonly codice: CodiceErrore
  /** Messaggio già pronto per la pagina: leggibile, non un codice tecnico. */
  readonly messaggio: string
  /** Il campo che ha causato l'errore, quando è uno solo. */
  readonly campo?: keyof RichiestaCalcolo
}

export type RispostaCalcolo = { readonly errore: ErroreCalcolo } | Risultato

export const eErrore = (r: RispostaCalcolo): r is { readonly errore: ErroreCalcolo } =>
  'errore' in r
