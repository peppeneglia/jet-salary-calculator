/**
 * Le etichette che la traccia non porta.
 *
 * Il motore emette `natura`, che è un identificatore di dominio: `previdenza`,
 * `erariale`, `locale`, `aggiunge`. Come si chiamano in pagina è una scelta di
 * prodotto, e sta qui.
 *
 * Le quattro nature **sono quattro destinazioni** — la pensione futura, lo
 * Stato, Regione e Comune, e il lavoratore stesso. È ciò che rende coerente il
 * titolo della sezione (D-034), e per questo ogni gruppo porta entrambi i
 * nomi: quello tecnico e quello che risponde alla domanda «dove vanno».
 */

import type { Natura, TipoContratto } from '../../core/types'

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

export const NATURE: Readonly<Record<Natura, EtichettaNatura>> = {
  previdenza: {
    titolo: 'Contributi previdenziali',
    destinazione: 'alla tua pensione futura',
    spiegazione:
      'Non sono tasse. Vanno all’INPS e costruiscono la tua pensione: escono dallo stipendio adesso e tornano dopo, sotto forma di assegno. È il motivo per cui li teniamo separati dalle imposte.',
  },
  erariale: {
    titolo: 'IRPEF',
    destinazione: 'allo Stato',
    spiegazione:
      'L’imposta sul reddito che va allo Stato. Cresce per scaglioni: la parte di reddito oltre una certa soglia è tassata di più, ma solo quella parte, non tutto. Le detrazioni la riducono, e non possono portarla sotto zero: se valgono più dell’imposta, l’eccedenza si perde.',
  },
  locale: {
    titolo: 'Addizionale regionale e comunale',
    destinazione: 'alla sanità regionale e al bilancio del tuo Comune',
    spiegazione:
      'Le stesse imposte, incassate da Regione e Comune. Si calcolano sullo stesso reddito dell’IRPEF, non su quello che resta dopo averla pagata. Le aliquote le decide ogni ente, quindi due persone con lo stesso stipendio in due comuni diversi pagano cifre diverse.',
  },
  aggiunge: {
    titolo: 'Voci che aggiungono',
    destinazione: 'restano a te',
    spiegazione:
      'Somme che il datore ti versa in busta e che non vengono tassate. Non sono uno sconto sulle imposte: sono soldi in più. Per questo qui il segno è positivo.',
  },
}

export const CONTRATTI: Readonly<Record<TipoContratto, string>> = {
  indeterminato: 'Tempo indeterminato',
  determinato: 'Tempo determinato',
  apprendistato: 'Apprendistato',
}
