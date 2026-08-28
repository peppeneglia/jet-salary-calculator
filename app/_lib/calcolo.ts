/**
 * Il punto in cui una richiesta diventa un risultato.
 *
 * **Non è logica di calcolo.** Valida l'input, risolve il comune nel catalogo
 * e passa la palla a `calcolaNetto`: tutto ciò che riguarda la norma sta in
 * `core/`, tutto ciò che riguarda i suoi parametri sta in `data/`. Se un
 * giorno una riga di questo file dovesse fare aritmetica su un imponibile, è
 * nel posto sbagliato.
 *
 * Sta in un file suo, e non dentro il route handler, perché lo chiamano in
 * due: l'handler quando la pagina ricalcola, e la pagina stessa quando rende
 * il caso di partenza server-side. Una funzione e due chiamanti, non due
 * implementazioni che possono divergere.
 *
 * **È anche il punto di innesto del dataset MEF**: quando i 7.897 comuni
 * entreranno nel repo cambierà `risolviComune`, e né l'handler né la pagina se
 * ne accorgeranno.
 */

import { calcolaNetto } from '../../core/calcola'
import { euro, type Mensilita, type Risultato, type TipoContratto } from '../../core/types'
import { assunzioni } from '../../data/assunzioni'
import { regime2026 } from '../../data/regime-2026'
import type { ErroreCalcolo } from './api'
import { risolviComune } from './comuni'

const CONTRATTI: readonly TipoContratto[] = ['indeterminato', 'determinato', 'apprendistato']
const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/**
 * L'esito porta con sé lo stato HTTP, così l'handler non deve ridecidere cosa
 * significa un errore: i tre codici sono tre cose diverse e meritano tre
 * risposte diverse.
 */
export type EsitoCalcolo =
  | { readonly stato: 'ok'; readonly risultato: Risultato }
  | { readonly stato: 'errore'; readonly errore: ErroreCalcolo; readonly http: 400 | 404 | 422 }

const ko = (errore: ErroreCalcolo, http: 400 | 404 | 422): EsitoCalcolo => ({
  stato: 'errore',
  errore,
  http,
})

export function eseguiCalcolo(corpo: unknown): EsitoCalcolo {
  if (typeof corpo !== 'object' || corpo === null) {
    return ko(
      {
        codice: 'richiesta-non-valida',
        messaggio: 'La richiesta deve essere un oggetto con RAL, comune e tipo di contratto.',
      },
      400,
    )
  }

  const campi = corpo as Record<string, unknown>

  // RAL
  const ral = campi.ral
  if (typeof ral !== 'number' || !Number.isFinite(ral) || ral <= 0) {
    return ko(
      {
        codice: 'richiesta-non-valida',
        campo: 'ral',
        messaggio: 'Inserisci la retribuzione annua lorda: un importo in euro maggiore di zero.',
      },
      400,
    )
  }

  // Tipo di contratto
  const tipoContratto = campi.tipoContratto
  if (typeof tipoContratto !== 'string' || !CONTRATTI.includes(tipoContratto as TipoContratto)) {
    return ko(
      {
        codice: 'richiesta-non-valida',
        campo: 'tipoContratto',
        messaggio: `Scegli un tipo di contratto fra: ${CONTRATTI.join(', ')}.`,
      },
      400,
    )
  }

  // Mensilità: facoltativa. Assente significa «usa il default», non «zero» —
  // e il default lo risolve il motore, non questa funzione.
  const mensilitaGrezza = campi.mensilita
  let mensilita: Mensilita | undefined
  if (mensilitaGrezza !== undefined && mensilitaGrezza !== null) {
    if (typeof mensilitaGrezza !== 'number' || !MENSILITA.includes(mensilitaGrezza as Mensilita)) {
      return ko(
        {
          codice: 'richiesta-non-valida',
          campo: 'mensilita',
          messaggio: 'Le mensilità possono essere 12, 13 o 14.',
        },
        400,
      )
    }
    mensilita = mensilitaGrezza as Mensilita
  }

  // Comune
  const codiceCatastale = campi.codiceCatastale
  if (typeof codiceCatastale !== 'string' || codiceCatastale.trim() === '') {
    return ko(
      {
        codice: 'richiesta-non-valida',
        campo: 'codiceCatastale',
        messaggio: 'Scegli il comune in cui avevi il domicilio fiscale al 1° gennaio.',
      },
      400,
    )
  }

  const comune = risolviComune(codiceCatastale)

  // Un comune fuori catalogo non produce un risultato a zero: produce un
  // errore leggibile. Un numero mancante senza spiegazione è la forma peggiore
  // di errore, perché è plausibile (D-033).
  if (comune === undefined) {
    return ko(
      {
        codice: 'comune-sconosciuto',
        campo: 'codiceCatastale',
        messaggio: `Non conosciamo il comune con codice «${codiceCatastale}». Per ora il calcolatore copre solo i comuni che abbiamo verificato uno per uno: l'elenco completo dei comuni italiani arriverà più avanti.`,
      },
      404,
    )
  }

  if (comune.stato === 'nonCalcolabile') {
    return ko(
      {
        codice: 'comune-non-calcolabile',
        campo: 'codiceCatastale',
        messaggio: `Per ${comune.nome} il calcolo non è disponibile. ${comune.ragione}`,
      },
      422,
    )
  }

  return {
    stato: 'ok',
    risultato: calcolaNetto(
      {
        ral: euro(ral),
        codiceCatastale: comune.codiceCatastale,
        tipoContratto: tipoContratto as TipoContratto,
        mensilita,
      },
      regime2026,
      comune.enti,
      assunzioni,
    ),
  }
}
