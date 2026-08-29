/**
 * Il calcolo non avviene nel client.
 *
 * L'handler riceve RAL, comune, tipo di contratto e lingua, e restituisce il
 * `Risultato` intero — traccia, enti e assunzioni compresi. È la ragione per
 * cui il progetto ha scelto Next (D-004): il dataset dei comuni non deve
 * finire nel bundle, e quando i 7.897 comuni del MEF arriveranno si
 * innesteranno dietro questa rotta senza toccare la pagina.
 *
 * Il file è sottile per costruzione: sa parlare HTTP e nient'altro. Validare,
 * risolvere il comune e chiamare il motore sta in `_lib/calcolo`, che è la
 * stessa funzione con cui la pagina rende il caso di partenza server-side.
 *
 * ⚠️ **La risposta d'errore non contiene una frase** (D-043): contiene un
 * fatto, e la frase la compone la pagina. Un handler che scrivesse il
 * messaggio dovrebbe sapere in che lingua parlare a chi ha aperto il browser,
 * e la stessa frase esisterebbe una seconda volta nel client, per gli errori
 * che l'handler non vede nemmeno.
 */

import { eseguiCalcolo } from '../../_lib/calcolo'

export async function POST(request: Request): Promise<Response> {
  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return Response.json({ errore: { codice: 'rete' } }, { status: 400 })
  }

  const esito = eseguiCalcolo(corpo)

  return esito.stato === 'ok'
    ? Response.json(esito.risultato)
    : Response.json({ errore: esito.errore }, { status: esito.http })
}
