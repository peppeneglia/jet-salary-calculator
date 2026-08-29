/**
 * Le chiavi dei testi sono controllate dal compilatore.
 *
 * Senza questa dichiarazione `t('input.titol')` compilerebbe e renderebbe la
 * chiave stessa in pagina — un difetto che si scopre guardando, cioè tardi. È
 * la stessa proprietà del `Record` pieno su `TestiTraccia` e su `FontiRegola`:
 * il vincolo sta nel tipo, non in una convenzione.
 */

import type { RISORSE } from './risorse'
import type { SPAZIO } from './istanza'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof SPAZIO
    resources: { app: (typeof RISORSE)['it'] }
  }
}
