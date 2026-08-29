/**
 * Il tag BCP 47 di ciascuna lingua.
 *
 * ⚠️ **Un file per due righe, e la ragione è il bundle.** Il tag serve in due
 * posti: al motore, che formatta i numeri dentro le frasi della traccia, e
 * all'interfaccia, che formatta gli importi in pagina. Se l'interfaccia lo
 * prendesse da `data/testi.ts` si porterebbe dietro **entrambe le tabelle di
 * prosa** nel bundle del client, per leggere due stringhe di cinque caratteri.
 * Scriverlo due volte creerebbe invece due posti che devono restare d'accordo,
 * e che a un certo punto non lo saranno.
 *
 * `en-GB` e non `en-US`: la valuta è l'euro e il pubblico è europeo. La
 * differenza si vede sulle date — `28 Aug 2026` invece di `Aug 28, 2026`.
 */

import type { CodiceLingua } from '../core/types'

export const TAG: Readonly<Record<CodiceLingua, string>> = {
  it: 'it-IT',
  en: 'en-GB',
}
