/**
 * Il contratto fra la pagina e l'handler.
 *
 * Sta in un file suo perché lo leggono in due — il route handler che lo
 * produce e il client che lo consuma — e un contratto scritto due volte è un
 * contratto che diverge.
 */

import type { CodiceLingua, Mensilita, Multilingua, Risultato, TipoContratto } from '../../core/types'

export interface RichiestaCalcolo {
  readonly ral: number
  readonly codiceCatastale: string
  readonly tipoContratto: TipoContratto
  /** Facoltativo: in assenza vale 13. Il default lo risolve il motore. */
  readonly mensilita?: Mensilita
  /**
   * La lingua in cui si vuole la traccia.
   *
   * Sta nella richiesta e non in un cookie letto dall'handler perché è **parte
   * di ciò che si chiede**: il motore la riceve come riceve l'anno d'imposta
   * (D-041), e un handler che la indovinasse da sé renderebbe la richiesta non
   * riproducibile. Facoltativa: in assenza vale l'italiano.
   */
  readonly lingua?: CodiceLingua
}

/**
 * Gli errori sono un'unione chiusa, non una stringa libera — e dal 29/08/2026
 * **non portano più il proprio messaggio** (D-043).
 *
 * `Risultato` non sa dire *non so*: non ha una variante di errore, ed è giusto
 * così — è il tipo di un calcolo riuscito. Il *non so* vive qui, sopra il
 * motore.
 *
 * ⚠️ **Perché il messaggio non è qui.** Fino a ieri ogni errore portava una
 * `messaggio` già scritta, prodotta dal server. Con due lingue quella stringa
 * costringerebbe il server a sapere in che lingua parlare all'utente, e
 * soprattutto renderebbe impossibile riusare lo stesso errore per la
 * validazione **nel client**, dove il server non è nemmeno stato interpellato.
 * Qui viaggia il **fatto**; la frase la compone chi rende la pagina, da una
 * tabella sola per entrambe le provenienze.
 *
 * Le varianti sono più di prima perché *la RAL non va bene* erano quattro cose
 * diverse dette con una frase sola, e il registro dei messaggi chiede di dire
 * **cosa fare**: cosa fare è diverso in ciascuno dei quattro casi.
 */
export type Errore =
  /** Il campo è vuoto. */
  | { readonly codice: 'ral-mancante' }
  /** C'è qualcosa scritto, ma non è un numero leggibile. */
  | { readonly codice: 'ral-non-numerica' }
  /** È un numero, ma zero o negativo. */
  | { readonly codice: 'ral-non-positiva' }
  /** È un numero positivo fuori scala per uno stipendio. */
  | { readonly codice: 'ral-implausibile'; readonly ral: number; readonly soglia: number }
  /** Nessun comune selezionato. */
  | { readonly codice: 'comune-mancante' }
  /** Il codice catastale non è nel catalogo dei comuni disponibili. */
  | { readonly codice: 'comune-sconosciuto' }
  /**
   * Il comune è nel catalogo ma un ente impositore manca: riconosciuto, non
   * calcolabile. Porta con sé la propria ragione, che è **dato** e non
   * messaggio: è la stessa che l'elenco mostra prima della selezione (D-037).
   */
  | {
      readonly codice: 'comune-non-calcolabile'
      readonly nome: string
      readonly ragione: Multilingua
    }
  | { readonly codice: 'contratto-non-valido' }
  | { readonly codice: 'mensilita-non-valida' }
  /** La richiesta non è arrivata, o è tornata illeggibile. Non è colpa dei dati. */
  | { readonly codice: 'rete' }

export type CodiceErrore = Errore['codice']

/**
 * Il campo che l'errore riguarda, quando è uno solo.
 *
 * Serve a due cose insieme: mettere il messaggio **accanto** al campo e
 * collegarcelo con `aria-describedby`, e spostarci il fuoco. Un errore che
 * riguarda l'intera richiesta non ha campo, e si mostra dove si mostrerebbe il
 * risultato.
 */
export const campoDi = (errore: Errore): 'ral' | 'codiceCatastale' | undefined => {
  switch (errore.codice) {
    case 'ral-mancante':
    case 'ral-non-numerica':
    case 'ral-non-positiva':
    case 'ral-implausibile':
      return 'ral'
    case 'comune-mancante':
    case 'comune-sconosciuto':
    case 'comune-non-calcolabile':
      return 'codiceCatastale'
    default:
      return undefined
  }
}

export type RispostaCalcolo = { readonly errore: Errore } | Risultato

export const eErrore = (r: RispostaCalcolo): r is { readonly errore: Errore } => 'errore' in r
