/**
 * Cosa rende accettabile una RAL, in un posto solo — D-043.
 *
 * ⚠️ Due chiamanti, una regola. Il client valida quello che si è digitato,
 * prima di chiamare l'handler: è la ragione per cui la validazione nativa del
 * browser è spenta — le sue bolle grigie stanno fuori dalla nostra grafica e
 * non parlano la nostra lingua. Il server valida quello che gli arriva, perché
 * un handler che si fida del client non è un handler.
 *
 * Se la soglia vivesse in due posti, un giorno il client accetterebbe un numero
 * che il server rifiuta, e chi legge vedrebbe un errore comparire dopo aver
 * premuto il bottone, senza capire perché. È la stessa forma della doppia
 * verità che D-003 esiste per impedire, spostata sull'input.
 */

import type { CodiceLingua } from '../../core/types'
import type { Errore } from './api'
import { leggiImporto } from './formato'

/**
 * Sopra questa cifra non calcoliamo.
 *
 * ⚠️ Non è un parametro normativo e non sta in `data/`: nessuna legge dice
 * che uno stipendio non possa superare dieci milioni. È una scelta di prodotto,
 * e la soglia è alta di proposito.
 *
 * Perché proprio dieci milioni. La soglia serve a intercettare un errore di
 * battitura — la RAL scritta in centesimi, uno zero di troppo, un incolla
 * andato male — non a giudicare quanto guadagna chi scrive. Il compenso da
 * lavoro dipendente più alto d'Italia sta ampiamente sotto: a dieci milioni
 * nessun caso reale viene rifiutato, e `3000000` scritto per `30000` viene
 * preso. Una soglia più bassa — un milione, cinquecentomila — comincerebbe a
 * rifiutare stipendi che esistono davvero, e rifiutare un dato vero è un errore
 * peggiore di accettarne uno assurdo: sopra il massimale il calcolatore
 * dichiara già la propria assunzione (S-002), quindi un numero alto ma reale
 * riceve comunque una risposta onesta.
 */
export const SOGLIA_RAL_IMPLAUSIBILE = 10_000_000

/**
 * Giudica un numero già letto. È il controllo che fa il server, e la seconda
 * metà di quello che fa il client.
 */
export const validaImporto = (n: number): Errore | undefined => {
  if (!Number.isFinite(n)) return { codice: 'ral-non-numerica' }
  if (n <= 0) return { codice: 'ral-non-positiva' }
  if (n > SOGLIA_RAL_IMPLAUSIBILE) {
    return { codice: 'ral-implausibile', ral: n, soglia: SOGLIA_RAL_IMPLAUSIBILE }
  }
  return undefined
}

export type Lettura =
  | { readonly ok: true; readonly valore: number }
  | { readonly ok: false; readonly errore: Errore }

/**
 * Legge e giudica quello che c'è nel campo.
 *
 * I quattro esiti negativi restano distinti fino alla fine: *vuoto*, *non è un
 * numero*, *è zero o negativo*, *è fuori scala* sono quattro cose da fare
 * diverse, e fonderle in «valore non valido» toglierebbe a chi legge l'unica
 * informazione utile.
 */
export const leggiRal = (testo: string, lingua: CodiceLingua): Lettura => {
  if (testo.trim() === '') return { ok: false, errore: { codice: 'ral-mancante' } }

  const n = leggiImporto(testo, lingua)
  if (n === undefined) return { ok: false, errore: { codice: 'ral-non-numerica' } }

  const errore = validaImporto(n)
  return errore === undefined ? { ok: true, valore: n } : { ok: false, errore }
}

export const validaComune = (codiceCatastale: string): Errore | undefined =>
  codiceCatastale.trim() === '' ? { codice: 'comune-mancante' } : undefined
