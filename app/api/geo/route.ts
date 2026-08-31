/**
 * Le sagome dei ventuno enti impositori regionali, servite a richiesta.
 *
 * ⚠️ **Perché una rotta e non un import.** `data/geo/enti-2026.json` pesa
 * 51 KiB di sole coordinate. La mappa in sezione 3 è una figura di contorno —
 * dice *dove sei*, non quanto paghi — e farla pagare nel documento a ogni
 * calcolo, a chiunque, anche a chi non arriva mai in fondo alla pagina, è
 * esattamente ciò che D-058 ha già rifiutato per l'elenco dei comuni e D-069
 * per la prosa delle pagine statiche. Stessa disciplina, stesso rimedio: si
 * chiede quando serve, una volta per sessione.
 *
 * ⚠️ **I nomi escono già risolti.** Il file porta le chiavi del prospetto MEF
 * — `REGIONE LOMBARDIA`, tutto maiuscolo — e il client deve poterle
 * confrontare con il nome che il motore gli ha messo nella traccia, che è
 * quello reso da `data/nomi-enti.ts`. La risoluzione la fa il server, dove
 * quella tabella già vive: mandare le chiavi grezze costringerebbe il client a
 * importarla per riderivare qualcosa che di là era già noto.
 *
 * ⚠️ **Nessuna aliquota attraversa il confine**, come per l'elenco dei comuni
 * (D-049): di qui passano un nome e una sagoma.
 */

import { gzipSync } from 'node:zlib'

import geometrie from '../../../data/geo/enti-2026.json'
import { nomeEnte } from '../../../data/nomi-enti'

/*
 * Le sagome cambiano quando cambiano i confini amministrativi, cioè quasi mai:
 * si serializza e si comprime una volta per processo, non a ogni richiesta.
 */
const corpo = JSON.stringify({
  viewBox: geometrie.viewBox,
  enti: geometrie.enti.map((e) => ({ nome: nomeEnte(e.nome), path: e.path })),
})
const corpoCompresso = gzipSync(corpo)

const CACHE = 'public, max-age=86400, stale-while-revalidate=604800'

export async function GET(request: Request): Promise<Response> {
  /*
   * La compressione si fa qui per la stessa ragione misurata su `/api/comuni`:
   * `next start` non comprime le risposte di un route handler, e un file di
   * coordinate è il caso in cui la differenza è più grande.
   */
  if ((request.headers.get('accept-encoding') ?? '').includes('gzip')) {
    return new Response(corpoCompresso, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Cache-Control': CACHE,
        Vary: 'Accept-Encoding',
      },
    })
  }

  return new Response(corpo, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': CACHE, Vary: 'Accept-Encoding' },
  })
}
