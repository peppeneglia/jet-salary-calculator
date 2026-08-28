/**
 * Il calcolo non avviene nel client.
 *
 * L'handler riceve RAL, comune e tipo di contratto, e restituisce il
 * `Risultato` intero — traccia, enti e assunzioni compresi. È la ragione per
 * cui il progetto ha scelto Next (D-004): il dataset dei comuni non deve
 * finire nel bundle, e quando i 7.897 comuni del MEF arriveranno si
 * innesteranno dietro questa rotta senza toccare la pagina.
 *
 * Il file è sottile per costruzione: sa parlare HTTP e nient'altro. Validare,
 * risolvere il comune e chiamare il motore sta in `_lib/calcolo`, che è la
 * stessa funzione con cui la pagina rende il caso di partenza server-side.
 */

import { eseguiCalcolo } from '../../_lib/calcolo'

export async function POST(request: Request): Promise<Response> {
  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return Response.json(
      {
        errore: {
          codice: 'richiesta-non-valida',
          messaggio: 'La richiesta non contiene un corpo JSON leggibile.',
        },
      },
      { status: 400 },
    )
  }

  const esito = eseguiCalcolo(corpo)

  return esito.stato === 'ok'
    ? Response.json(esito.risultato)
    : Response.json({ errore: esito.errore }, { status: esito.http })
}
