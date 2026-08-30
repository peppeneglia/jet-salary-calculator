/**
 * La traduzione nei server component.
 *
 * Le tre pagine sono server component, e devono restare tali: `/` legge il
 * catalogo dei comuni senza farlo attraversare il confine (D-004). Quindi la
 * traduzione serve anche fuori da React lato client.
 *
 * ⚠️ Istanza senza il plugin React, ed è obbligatorio. `react-i18next`
 * chiama `createContext` quando viene caricato, e in un server component quella
 * funzione non esiste: importarlo qui fa fallire la build, non il runtime. Le
 * opzioni sono le stesse del client — vivono in `istanza.ts` — così i due lati
 * non possono divergere.
 *
 * `getFixedT` e non `changeLanguage`: la lingua è fissata sull'istanza, e la
 * funzione che ne esce non porta stato globale con sé.
 */

import { createInstance, type TFunction, type i18n } from 'i18next'
import type { CodiceLingua } from '../../core/types'
import { linguaCorrente } from '../_lib/preferenze-server'
import { opzioni, SPAZIO } from './istanza'

const istanze = new Map<CodiceLingua, i18n>()

const istanzaPer = (lingua: CodiceLingua): i18n => {
  const esistente = istanze.get(lingua)
  if (esistente !== undefined) return esistente
  const nuova = createInstance()
  void nuova.init(opzioni(lingua))
  istanze.set(lingua, nuova)
  return nuova
}

export interface Traduzione {
  readonly lingua: CodiceLingua
  readonly t: TFunction<typeof SPAZIO>
}

export const traduzionePer = (lingua: CodiceLingua): Traduzione => ({
  lingua,
  t: istanzaPer(lingua).getFixedT(lingua, SPAZIO),
})

/** La lingua della richiesta, già risolta, con la sua funzione di traduzione. */
export async function traduzione(): Promise<Traduzione> {
  return traduzionePer(await linguaCorrente())
}
