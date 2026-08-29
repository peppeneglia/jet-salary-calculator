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
 *
 * ⚠️ **Nessun messaggio d'errore qui dentro** (D-043). Questa funzione decide
 * *cosa non va*, non *come dirlo*: la frase la compone chi rende la pagina,
 * nella lingua di chi legge, dalla stessa tabella che serve la validazione
 * fatta nel client. Le soglie che giudicano una RAL stanno in `validazione.ts`,
 * una volta sola per i due chiamanti.
 */

import { calcolaNetto } from '../../core/calcola'
import { euro, type CodiceLingua, type Mensilita, type Risultato, type TipoContratto } from '../../core/types'
import { assunzioni } from '../../data/assunzioni'
import { regime2026 } from '../../data/regime-2026'
import { LINGUE } from '../../data/testi'
import type { Errore } from './api'
import { risolviComune } from './comuni'
import { LINGUA_PREDEFINITA, risolviLingua } from './preferenze'
import { validaImporto } from './validazione'

const CONTRATTI: readonly TipoContratto[] = ['indeterminato', 'determinato', 'apprendistato']
const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/**
 * L'esito porta con sé lo stato HTTP, così l'handler non deve ridecidere cosa
 * significa un errore: le tre famiglie di codici sono tre cose diverse e
 * meritano tre risposte diverse.
 */
export type EsitoCalcolo =
  | { readonly stato: 'ok'; readonly risultato: Risultato }
  | { readonly stato: 'errore'; readonly errore: Errore; readonly http: 400 | 404 | 422 }

const ko = (errore: Errore, http: 400 | 404 | 422): EsitoCalcolo => ({
  stato: 'errore',
  errore,
  http,
})

export function eseguiCalcolo(corpo: unknown, linguaRichiesta?: CodiceLingua): EsitoCalcolo {
  if (typeof corpo !== 'object' || corpo === null) {
    return ko({ codice: 'rete' }, 400)
  }

  const campi = corpo as Record<string, unknown>

  // La lingua della richiesta ha la precedenza; l'argomento è il ripiego per
  // chi chiama questa funzione senza passare da HTTP.
  const lingua: CodiceLingua =
    typeof campi.lingua === 'string'
      ? risolviLingua(campi.lingua)
      : (linguaRichiesta ?? LINGUA_PREDEFINITA)

  // RAL
  const ral = campi.ral
  if (typeof ral !== 'number') {
    return ko({ codice: ral === undefined || ral === null ? 'ral-mancante' : 'ral-non-numerica' }, 400)
  }
  const erroreRal = validaImporto(ral)
  if (erroreRal !== undefined) return ko(erroreRal, 400)

  // Tipo di contratto
  const tipoContratto = campi.tipoContratto
  if (typeof tipoContratto !== 'string' || !CONTRATTI.includes(tipoContratto as TipoContratto)) {
    return ko({ codice: 'contratto-non-valido' }, 400)
  }

  // Mensilità: facoltativa. Assente significa «usa il default», non «zero» —
  // e il default lo risolve il motore, non questa funzione.
  const mensilitaGrezza = campi.mensilita
  let mensilita: Mensilita | undefined
  if (mensilitaGrezza !== undefined && mensilitaGrezza !== null) {
    if (typeof mensilitaGrezza !== 'number' || !MENSILITA.includes(mensilitaGrezza as Mensilita)) {
      return ko({ codice: 'mensilita-non-valida' }, 400)
    }
    mensilita = mensilitaGrezza as Mensilita
  }

  // Comune
  const codiceCatastale = campi.codiceCatastale
  if (typeof codiceCatastale !== 'string' || codiceCatastale.trim() === '') {
    return ko({ codice: 'comune-mancante' }, 400)
  }

  const comune = risolviComune(codiceCatastale)

  // Un comune fuori catalogo non produce un risultato a zero: produce un
  // errore leggibile. Un numero mancante senza spiegazione è la forma peggiore
  // di errore, perché è plausibile (D-033).
  if (comune === undefined) {
    return ko({ codice: 'comune-sconosciuto' }, 404)
  }

  if (comune.stato === 'nonCalcolabile') {
    return ko(
      { codice: 'comune-non-calcolabile', nome: comune.nome, ragione: comune.ragione },
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
      LINGUE[lingua],
    ),
  }
}
