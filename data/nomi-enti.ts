/**
 * Il nome leggibile dei ventuno enti impositori regionali.
 *
 * Non è un parametro normativo e non porta una `Fonte`: la stringa che fa fede
 * resta quella del prospetto (`REGIONE LOMBARDIA`), che è la chiave dell'import.
 * Qui c'è solo la forma con cui si legge in pagina — senza il classificatore
 * `REGIONE`, che in prosa sarebbe di troppo, e con quello delle Province
 * autonome, che invece è parte del nome.
 *
 * Non si traduce (D-041).
 */

/** Unione chiusa: se l'import cambiasse una stringa, il file non compila. */
export type NomeEnteMef =
  | 'PROVINCIA AUTONOMA DI BOLZANO'
  | 'PROVINCIA AUTONOMA DI TRENTO'
  | 'REGIONE ABRUZZO'
  | 'REGIONE BASILICATA'
  | 'REGIONE CALABRIA'
  | 'REGIONE CAMPANIA'
  | 'REGIONE EMILIA-ROMAGNA'
  | 'REGIONE FRIULI VENEZIA GIULIA'
  | 'REGIONE LAZIO'
  | 'REGIONE LIGURIA'
  | 'REGIONE LOMBARDIA'
  | 'REGIONE MARCHE'
  | 'REGIONE MOLISE'
  | 'REGIONE PIEMONTE'
  | 'REGIONE PUGLIA'
  | 'REGIONE SARDEGNA'
  | 'REGIONE SICILIA'
  | 'REGIONE TOSCANA'
  | 'REGIONE UMBRIA'
  | "REGIONE VALLE D'AOSTA"
  | 'REGIONE VENETO'

/** `Record` pieno: un ente senza nome leggibile non compila. */
export const NOMI_ENTI: Readonly<Record<NomeEnteMef, string>> = {
  'PROVINCIA AUTONOMA DI BOLZANO': 'Provincia autonoma di Bolzano',
  'PROVINCIA AUTONOMA DI TRENTO': 'Provincia autonoma di Trento',
  'REGIONE ABRUZZO': 'Abruzzo',
  'REGIONE BASILICATA': 'Basilicata',
  'REGIONE CALABRIA': 'Calabria',
  'REGIONE CAMPANIA': 'Campania',
  'REGIONE EMILIA-ROMAGNA': 'Emilia-Romagna',
  'REGIONE FRIULI VENEZIA GIULIA': 'Friuli Venezia Giulia',
  'REGIONE LAZIO': 'Lazio',
  'REGIONE LIGURIA': 'Liguria',
  'REGIONE LOMBARDIA': 'Lombardia',
  'REGIONE MARCHE': 'Marche',
  'REGIONE MOLISE': 'Molise',
  'REGIONE PIEMONTE': 'Piemonte',
  'REGIONE PUGLIA': 'Puglia',
  'REGIONE SARDEGNA': 'Sardegna',
  'REGIONE SICILIA': 'Sicilia',
  'REGIONE TOSCANA': 'Toscana',
  'REGIONE UMBRIA': 'Umbria',
  "REGIONE VALLE D'AOSTA": 'Valle d’Aosta',
  'REGIONE VENETO': 'Veneto',
}

/**
 * Fallisce invece di ripiegare sulla stringa grezza: un ripiego silenzioso
 * rimetterebbe in pagina il `REGIONE MOLISE` che questo file esiste per
 * togliere. Il disallineamento nasce solo da un import rieseguito a mano.
 */
export const nomeEnte = (nomeMef: string): string => {
  const leggibile = NOMI_ENTI[nomeMef as NomeEnteMef]
  if (leggibile === undefined) {
    throw new Error(`Ente «${nomeMef}» senza nome leggibile in data/nomi-enti.ts`)
  }
  return leggibile
}
