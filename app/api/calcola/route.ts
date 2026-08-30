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
 * ⚠️ La risposta d'errore non contiene una frase (D-043): contiene un
 * fatto, e la frase la compone la pagina. Un handler che scrivesse il
 * messaggio dovrebbe sapere in che lingua parlare a chi ha aperto il browser,
 * e la stessa frase esisterebbe una seconda volta nel client, per gli errori
 * che l'handler non vede nemmeno.
 */

import { eseguiCalcolo } from '../../_lib/calcolo'

/**
 * Quanto può pesare una richiesta legittima, con abbondanza.
 *
 * ⚠️ Il corpo più grande che l'interfaccia sappia produrre sta sotto i 200
 * byte — una RAL, un codice catastale di cinque caratteri, un tipo di
 * contratto, un intero e due lettere di lingua. Quattro kilobyte sono venti
 * volte tanto: nessuna richiesta vera viene rifiutata, e il tetto resta di
 * ordini di grandezza sotto la soglia oltre la quale la memoria diventa un
 * problema.
 */
const LIMITE_CORPO = 4 * 1024

/**
 * Legge il corpo contando i byte mentre arrivano, e si ferma appena sfora.
 *
 * ⚠️ Perché non basta guardare `Content-Length`. Quell'intestazione può
 * mancare del tutto — una richiesta a pezzi non la porta — e comunque la
 * dichiara il chiamante, che è la parte di cui non ci si fida. Un controllo
 * sull'intestazione rifiuta chi è onesto e sbaglia, non chi mente.
 *
 * ⚠️ E `request.json()` non ha un tetto. Dietro un CDN il limite di
 * piattaforma arriverebbe comunque, ma con `next start` self-hosted no: il
 * corpo verrebbe accumulato per intero in memoria prima che la validazione
 * possa vederlo. Un numero che dipende da dove si distribuisce non è un numero.
 *
 * `null` significa *troppo grande*, distinto da `''` che è *vuoto*.
 */
async function corpoEntroIlLimite(request: Request): Promise<string | null> {
  if (request.body === null) return ''

  const lettore = request.body.getReader()
  const decodificatore = new TextDecoder()
  let byte = 0
  let testo = ''

  for (;;) {
    const { done, value } = await lettore.read()
    if (done) break

    byte += value.byteLength
    if (byte > LIMITE_CORPO) {
      // Si chiude la lettura invece di lasciarla scorrere: rifiutare senza
      // smettere di leggere non risparmierebbe nulla.
      await lettore.cancel()
      return null
    }
    testo += decodificatore.decode(value, { stream: true })
  }

  return testo + decodificatore.decode()
}

export async function POST(request: Request): Promise<Response> {
  const testo = await corpoEntroIlLimite(request)

  /*
   * ⚠️ 413 con il codice `rete`, e non un codice d'errore nuovo.
   *
   * D-043 tiene un registro di errori che la pagina sa tradurre in una frase
   * che dice *cosa fare*. Qui non c'è niente da fare e nessuno da avvisare:
   * l'interfaccia non può produrre un corpo di quattro kilobyte, quindi chi
   * arriva qui non sta usando la pagina. Aggiungere una variante al registro
   * significherebbe scrivere in due lingue un messaggio che nessun utente
   * vedrà mai, e allargare un'unione chiusa per un caso fuori dal prodotto.
   * Lo stato HTTP dice già la cosa giusta a chi la sa leggere.
   */
  if (testo === null) {
    return Response.json({ errore: { codice: 'rete' } }, { status: 413 })
  }

  let corpo: unknown
  try {
    corpo = JSON.parse(testo)
  } catch {
    return Response.json({ errore: { codice: 'rete' } }, { status: 400 })
  }

  const esito = eseguiCalcolo(corpo)

  return esito.stato === 'ok'
    ? Response.json(esito.risultato)
    : Response.json({ errore: esito.errore }, { status: esito.http })
}
