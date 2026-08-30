/**
 * La configurazione di i18next, condivisa dai due lati.
 *
 * ⚠️ Qui non si importa React, e non è pignoleria: senza questa regola la
 * build non passa. `react-i18next` chiama `createContext` al caricamento del
 * modulo, e nell'ambiente dei server component quella funzione non esiste. Un
 * modulo che monta l'istanza *con* il plugin React non può quindi essere letto
 * dal server, nemmeno per una traduzione che React non tocca mai.
 *
 * Da qui la forma: le opzioni stanno qui, l'istanza la costruisce chi la
 * usa — `server.ts` senza plugin, `provider.tsx` con `initReactI18next`. La
 * configurazione resta una sola, e i due lati non possono divergere su
 * fallback, spazio dei nomi o interpolazione.
 *
 * ⚠️ Una istanza per lingua e non una sola con `changeLanguage`. La pagina
 * è renderizzata sul server: `changeLanguage` è uno stato globale mutabile, e
 * su un server che serve più richieste insieme due lettori con lingue diverse
 * si sovrascriverebbero a vicenda. Istanze separate e immutabili non hanno
 * quel problema, e sul client il costo è nullo — le risorse sono già nel
 * bundle.
 */

import type { InitOptions } from 'i18next'
import type { CodiceLingua } from '../../core/types'
import { LINGUA_PREDEFINITA } from '../_lib/preferenze'
import { RISORSE } from './risorse'

export const SPAZIO = 'app'

/**
 * Le due tabelle pesano poche decine di kilobyte e non si caricano a runtime:
 * niente `i18next-http-backend`, niente richiesta di rete per un testo. È la
 * stessa ragione per cui il dataset dei comuni non sta nel bundle client ma i
 * testi sì — sono due grandezze diverse di due ordini di grandezza.
 */
export const opzioni = (lingua: CodiceLingua): InitOptions => ({
  lng: lingua,
  fallbackLng: LINGUA_PREDEFINITA,
  ns: [SPAZIO],
  defaultNS: SPAZIO,
  resources: {
    it: { [SPAZIO]: RISORSE.it },
    en: { [SPAZIO]: RISORSE.en },
  },
  // React fa già l'escape: farlo due volte trasformerebbe una `&` in `&amp;`
  // dentro il testo visibile.
  interpolation: { escapeValue: false },
})
