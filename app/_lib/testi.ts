/**
 * Le etichette che la traccia non porta.
 *
 * Il motore emette `natura`, che è un identificatore di dominio: `previdenza`,
 * `erariale`, `locale`, `aggiunge`. Come si chiamano in pagina è una scelta di
 * prodotto, e sta qui — cioè in `app/`, perché è vocabolario di interfaccia e
 * non del calcolo.
 *
 * Le quattro nature sono quattro destinazioni — la pensione futura, lo
 * Stato, Regione e Comune, e il lavoratore stesso. È ciò che rende coerente il
 * titolo della sezione (D-034), e per questo ogni gruppo porta entrambi i
 * nomi: quello tecnico e quello che risponde alla domanda «dove vanno».
 *
 * ⚠️ Dal 29/08/2026 le frasi non sono più qui: qui c'è la mappa. I testi
 * stanno in `_i18n/risorse.ts`, in due lingue; questo file dice quale chiave
 * corrisponde a quale natura. È la stessa divisione che il motore ha con
 * `data/testi.ts`: la struttura da una parte, la prosa dall'altra.
 *
 * I titoli dei quattro gruppi sono la prima occorrenza in pagina dei nomi
 * degli istituti italiani, ed è lì che l'inglese porta la glossa fra parentesi
 * (D-041). Le voci sotto usano il nome nudo.
 */

import type { TFunction } from 'i18next'
import type { Natura, TipoContratto } from '../../core/types'
import type { SPAZIO } from '../_i18n/istanza'

export interface EtichettaNatura {
  /** Il nome della categoria, in linguaggio tecnico. */
  readonly titolo: string
  /** La destinazione, che è la risposta alla domanda del titolo di sezione. */
  readonly destinazione: string
  readonly spiegazione: string
}

/**
 * L'ordine è quello della catena, ed è anche quello in cui il motore emette i
 * passi. `aggiunge` sta in fondo perché è l'unico gruppo di segno positivo.
 */
export const ORDINE_NATURE: readonly Natura[] = ['previdenza', 'erariale', 'locale', 'aggiunge']

type T = TFunction<typeof SPAZIO>

export const etichettaNatura = (natura: Natura, t: T): EtichettaNatura => {
  switch (natura) {
    case 'previdenza':
      return {
        titolo: t('nature.previdenzaTitolo'),
        destinazione: t('nature.previdenzaDestinazione'),
        spiegazione: t('nature.previdenzaSpiegazione'),
      }
    case 'erariale':
      return {
        titolo: t('nature.erarialeTitolo'),
        destinazione: t('nature.erarialeDestinazione'),
        spiegazione: t('nature.erarialeSpiegazione'),
      }
    case 'locale':
      return {
        titolo: t('nature.localeTitolo'),
        destinazione: t('nature.localeDestinazione'),
        spiegazione: t('nature.localeSpiegazione'),
      }
    case 'aggiunge':
      return {
        titolo: t('nature.aggiungeTitolo'),
        destinazione: t('nature.aggiungeDestinazione'),
        spiegazione: t('nature.aggiungeSpiegazione'),
      }
  }
}

export const etichettaContratto = (tipo: TipoContratto, t: T): string => {
  switch (tipo) {
    case 'indeterminato':
      return t('contratti.indeterminato')
    case 'determinato':
      return t('contratti.determinato')
    case 'apprendistato':
      return t('contratti.apprendistato')
  }
}
