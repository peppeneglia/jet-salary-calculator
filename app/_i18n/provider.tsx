'use client'

/**
 * La lingua, resa disponibile ai client component.
 *
 * Sta nel layout e avvolge tutto, così `useTraduzione()` funziona ovunque
 * senza che ogni componente riceva la lingua come prop attraverso tre livelli.
 *
 * La lingua **arriva dal server**: è il server che ha letto il cookie e che ha
 * già renderizzato la pagina in quella lingua. Se il client la ricavasse da sé
 * — da `navigator.language`, o rileggendo il cookie in un effetto — potrebbe
 * dissentire dal server per un istante, ed è esattamente lo sfarfallio che
 * questo impianto esiste per evitare.
 *
 * ⚠️ **È qui, e solo qui, che entra `initReactI18next`.** Il plugin tocca
 * `createContext`, che nei server component non esiste: montarlo nel modulo
 * condiviso farebbe fallire la build della pagina. Le opzioni restano comuni
 * ai due lati, il plugin no.
 */

import { createInstance, type i18n } from 'i18next'
import { I18nextProvider, initReactI18next, useTranslation } from 'react-i18next'
import type { CodiceLingua } from '../../core/types'
import { opzioni, SPAZIO } from './istanza'

const istanze = new Map<CodiceLingua, i18n>()

/** Memoizzata: l'istanza è immutabile, ricrearla a ogni render sarebbe spreco. */
const istanzaPer = (lingua: CodiceLingua): i18n => {
  const esistente = istanze.get(lingua)
  if (esistente !== undefined) return esistente
  const nuova = createInstance()
  void nuova.use(initReactI18next).init(opzioni(lingua))
  istanze.set(lingua, nuova)
  return nuova
}

export function ProviderLingua({
  lingua,
  children,
}: {
  lingua: CodiceLingua
  children: React.ReactNode
}) {
  return <I18nextProvider i18n={istanzaPer(lingua)}>{children}</I18nextProvider>
}

/**
 * L'accesso ai testi da un client component.
 *
 * Restituisce anche la lingua, perché non tutto è una stringa da tradurre:
 * importi e date si formattano, e la formattazione ha bisogno di sapere in che
 * lingua sta scrivendo.
 */
export function useTraduzione() {
  const { t, i18n: istanza } = useTranslation(SPAZIO)
  return { t, lingua: istanza.language as CodiceLingua }
}
