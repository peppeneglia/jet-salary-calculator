/**
 * L'arrotondamento della presentazione — D-066.
 *
 * Il difetto che chiude
 *
 * Su RAL 30.000 a Milano la pagina mostrava questo:
 *
 * ```
 *   30.000,00 − 2.757,00 − 3.221,63 − 377,94 − 217,94 = 23.425,49
 *   testata: 23.425,48
 * ```
 *
 * Il motore aveva ragione: il netto esatto è 23.425,4846, e arrotondato fa
 * 23.425,48. Ma ogni voce era arrotondata per conto proprio, e i resti si
 * accumulavano: la somma di ciò che si legge non faceva il totale che si legge.
 *
 * ⚠️ D-024 è un'affermazione sulla pagina, non sul motore. La garanzia è
 * *«i numeri mostrati sommano al totale»*, e nel motore era una tautologia
 * verificata — il netto è la somma degli effetti, non un secondo conto che
 * si spera coincida. In presentazione quella tautologia si rompe, perché
 * arrotondare è una funzione che non commuta con la somma.
 *
 * La regola che ne discende è una sola, e vale a ogni livello: il totale
 * mostrato è la somma dei valori mostrati che gli stanno sotto, mai
 * l'arrotondamento del totale esatto.
 *
 * Lo scarto rispetto al valore esatto resta 0,0054, dentro la tolleranza di
 * un centesimo che D-025 aveva dichiarato prima che i test esistessero.
 *
 * Perché qui e non in `core/`
 *
 * Il motore lavora a precisione piena e tronca alla quarta cifra solo dove lo
 * impone la norma, che è logica di dominio. L'arrotondamento a due decimali è
 * presentazione (D-025), e un motore che arrotondasse per far tornare la pagina
 * starebbe cambiando un numero per una ragione grafica.
 *
 * Questo modulo non calcola: prende un `Risultato` e ne restituisce uno con
 * gli stessi passi nello stesso ordine, dove ogni importo è quello che la pagina
 * scriverà. Nessun passo entra o esce, nessun segno cambia.
 */

import { euro, type Esito, type Mensilita, type Passo, type Risultato } from '../../core/types'

/** Due decimali, che è quanto la pagina scrive. */
const cent = (n: number): number => Math.round(n * 100) / 100

/**
 * Tolleranza per riconoscere una relazione fra numeri esatti, non per
 * arrotondare. Serve a decidere se i figli di un passo sono addendi di un
 * totale o anelli di una catena, e la decisione si prende sui valori del
 * motore — dove la relazione è esatta a meno dell'errore in virgola mobile.
 */
const uguali = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6

const usciteApplicate = (passi: readonly Passo[]): number[] =>
  passi.flatMap((p) => (p.esito.stato === 'applicato' ? [p.esito.esce] : []))

/**
 * Da quali figli discende il valore del padre.
 *
 * ⚠️ Le due forme non si indovinano: si riconoscono sui numeri esatti, e se
 * non se ne riconosce nessuna il padre resta il proprio valore arrotondato.
 * Inventare una relazione che il motore non ha usato produrrebbe un numero
 * plausibile e sbagliato, che è la forma di errore che questo progetto rifiuta.
 *
 * - somma — i figli sono addendi: gli scaglioni di un'addizionale, dove il
 *   totale è la somma delle quote per aliquota.
 * - catena — i figli sono passaggi successivi e l'ultimo *è* il risultato:
 *   il blocco IRPEF di D-018, dove lorda, detrazioni e pavimento a zero portano
 *   all'imposta netta.
 */
type Relazione = 'somma' | 'catena' | 'nessuna'

function relazione(esce: number, figli: readonly Passo[]): Relazione {
  const uscite = usciteApplicate(figli)
  if (uscite.length === 0) return 'nessuna'
  if (uguali(uscite.reduce((a, b) => a + b, 0), esce)) return 'somma'
  if (uguali(uscite[uscite.length - 1], esce)) return 'catena'
  return 'nessuna'
}

function esitoArrotondato(esito: Esito, originali: readonly Passo[] | undefined, arrotondati: readonly Passo[] | undefined): Esito {
  if (esito.stato === 'nonDovuto') return esito
  if (esito.stato === 'verifica') {
    return { ...esito, grandezzaLetta: euro(cent(esito.grandezzaLetta)) }
  }

  const quale = originali === undefined ? 'nessuna' : relazione(esito.esce, originali)
  const usciteMostrate = arrotondati === undefined ? [] : usciteApplicate(arrotondati)

  const esce =
    quale === 'somma'
      ? cent(usciteMostrate.reduce((a, b) => a + b, 0))
      : quale === 'catena'
        ? usciteMostrate[usciteMostrate.length - 1]
        : cent(esito.esce)

  /*
   * L'effetto sul netto discende dal valore mostrato, non si arrotonda a
   * parte: se restassero indipendenti, la voce e il suo effetto potrebbero
   * differire di un centesimo pur descrivendo la stessa cosa.
   *
   * Il segno resta quello del motore. `esce === 0` va reso `0` e non `-0`,
   * che `Intl` stamperebbe come «−0,00».
   */
  const effettoSulNetto =
    esito.segno === 'neutro' ? 0 : esito.segno === 'aggiunge' ? esce : esce === 0 ? 0 : -esce

  return {
    ...esito,
    entra: euro(cent(esito.entra)),
    esce: euro(esce),
    effettoSulNetto: euro(effettoSulNetto),
  }
}

function passoArrotondato(passo: Passo): Passo {
  const figli = passo.dettaglio?.map(passoArrotondato)
  return {
    ...passo,
    esito: esitoArrotondato(passo.esito, passo.dettaglio, figli),
    ...(figli === undefined ? {} : { dettaglio: figli }),
  }
}

/**
 * Il `Risultato` come la pagina lo scrive.
 *
 * ⚠️ Non si applica dentro l'handler: `POST /api/calcola` restituisce il
 * risultato del motore, a precisione piena, perché quello è il contratto e chi
 * lo consuma da fuori non deve ricevere numeri già arrotondati per una pagina.
 * L'arrotondamento vive dove il numero diventa testo.
 */
export function perLaPagina(risultato: Risultato): Risultato {
  const passi = risultato.passi.map(passoArrotondato)

  // Il netto è la RAL più la somma degli effetti mostrati dei passi di
  // primo livello. È la stessa identità del motore, ricalcolata sui valori che
  // la pagina scrive — così resta una tautologia verificata anche qui.
  const nettoAnnuo = cent(
    passi.reduce(
      (acc, p) => acc + (p.esito.stato === 'applicato' ? p.esito.effettoSulNetto : 0),
      risultato.input.ral as number,
    ),
  )

  // ⚠️ Le divisioni mensili dividono il totale mostrato, non quello esatto:
  // sono viste dello stesso numero, e devono restare viste di quello che si
  // legge sopra (D-022).
  const mensilita = Object.keys(risultato.nettoMensile).map(Number) as Mensilita[]
  const nettoMensile = Object.fromEntries(
    mensilita.map((m) => [m, euro(cent(nettoAnnuo / m))]),
  ) as Risultato['nettoMensile']

  return { ...risultato, passi, nettoAnnuo: euro(nettoAnnuo), nettoMensile }
}
