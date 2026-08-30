/**
 * Le preferenze lette dalla richiesta.
 *
 * Sta in un file suo, separato da `preferenze.ts`, per una ragione precisa:
 * `next/headers` è codice di server, e importarlo nello stesso modulo che il
 * client usa per scrivere il cookie porterebbe quel modulo nel bundle
 * sbagliato. Costanti e parser stanno di là, dove li leggono entrambi; la
 * lettura della richiesta sta qui.
 *
 * ⚠️ Chiamarla rende la rotta dinamica, ed è corretto: la pagina dipende dalla
 * richiesta, perché lingua e tema sono nella richiesta.
 */

import { cookies } from 'next/headers'
import type { CodiceLingua } from '../../core/types'
import { COOKIE_LINGUA, COOKIE_TEMA, risolviLingua, risolviTema, type Tema } from './preferenze'

export interface Preferenze {
  readonly lingua: CodiceLingua
  readonly tema: Tema
}

export async function preferenze(): Promise<Preferenze> {
  const biscotti = await cookies()
  return {
    lingua: risolviLingua(biscotti.get(COOKIE_LINGUA)?.value),
    tema: risolviTema(biscotti.get(COOKIE_TEMA)?.value),
  }
}

/** Quando serve la sola lingua, che è il caso più frequente. */
export async function linguaCorrente(): Promise<CodiceLingua> {
  return (await preferenze()).lingua
}
