/**
 * L'elenco dei comuni, servito a richiesta — D-058.
 *
 * ⚠️ Perché esiste questa rotta, e perché non serve a filtrare. La lista
 * leggera dei 7.897 comuni pesa 648 KiB grezzi, 83 KiB compressi: nel documento
 * era il 78% del trasferimento, pagato da tutti e usato da pochi, perché il
 * valore iniziale è Milano e chi consulta il proprio caso spesso non apre
 * nemmeno il campo. Ma un filtro *sul server* costerebbe una richiesta a ogni
 * battuta, dentro un campo di ricerca, con un ritardo da rendere e un
 * annuncio che cambia mentre si digita.
 *
 * Il caricamento differito prende il meglio dei due: una richiesta sola, al
 * primo fuoco sul campo, e da lì la ricerca resta locale e istantanea.
 * L'elenco è lo stesso di prima — cambia soltanto quando viene chiesto.
 *
 * ⚠️ Cosa attraversa il confine, e non è cambiato (D-049): codice
 * catastale, nome, provincia, calcolabilità, più la ragione per chi non è
 * calcolabile. Nessuna aliquota, nessuno scaglione, nessuna citazione. Il
 * dataset completo resta server-side, ed è la ragione per cui il progetto ha
 * scelto Next (D-004).
 */

import { gzipSync } from 'node:zlib'

import { comuniSelezionabili } from '../../_lib/comuni'

/*
 * L'elenco cambia quando cambia l'import, cioè una volta l'anno: si serializza
 * e si comprime una volta per processo, non a ogni richiesta.
 */
const corpo = JSON.stringify(comuniSelezionabili())
const corpoCompresso = gzipSync(corpo)

/*
 * L'elenco è immutabile per la durata di una sessione e ben oltre: la cache lo
 * dice, così una seconda scheda non ripaga il trasferimento.
 */
const CACHE = 'public, max-age=3600, stale-while-revalidate=86400'

export async function GET(request: Request): Promise<Response> {
  /**
   * ⚠️ La compressione si fa qui, e il motivo è misurato.
   *
   * `next start` comprime il documento HTML ma non la risposta di un route
   * handler: senza questo blocco l'elenco viaggia a 664 KB invece di 83
   * KiB, cioè otto volte tanto, e la premessa di D-058 — *chi apre il campo
   * attende una volta sola 83 KiB* — sarebbe falsa proprio nel punto che la
   * decisione ha misurato.
   *
   * Dietro un CDN la compressione arriverebbe da sola, ma un numero che dipende
   * da dove si distribuisce non è un numero: è una speranza. Comprimere alla
   * sorgente lo rende vero ovunque, e chi non dichiara `gzip` riceve comunque
   * la risposta in chiaro.
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
