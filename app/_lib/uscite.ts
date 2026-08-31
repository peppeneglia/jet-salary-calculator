/**
 * La ripartizione del lordo, letta dalla traccia.
 *
 * ⚠️ **Non calcola: legge.** Ogni importo qui viene da `effettoSulNetto` di
 * un passo di primo livello, con il segno che il motore gli ha dato. Non c'è
 * una sola sottrazione fiscale in questo file, e non deve essercene: sarebbe
 * la seconda porta d'uscita dalla traccia che D-003 esiste per impedire, e la
 * pagina potrebbe mostrare una ripartizione che non torna con le voci sotto.
 *
 * ⚠️ **Riceve il `Risultato` già passato per `perLaPagina`.** I grafici e la
 * tabella devono tornare con i numeri che si leggono, non con quelli a
 * precisione piena del motore (D-024, D-066): se la barra fosse disegnata sui
 * secondi e le cifre scritte sui primi, la somma dei segmenti potrebbe non
 * fare il totale scritto accanto.
 *
 * L'identità che regge tutto, ed è quella del motore:
 *
 *     netto = lordo − uscite + aggiunte     ⟺     lordo + aggiunte = netto + uscite
 *
 * Il secondo verso è quello che si disegna: **una barra lunga `lordo +
 * aggiunte` si divide esattamente in netto più le uscite**, senza avanzi. È il
 * motivo per cui il totale del grafico non è il lordo quando qualcosa si
 * aggiunge — e va detto in pagina invece che nascosto normalizzando.
 */

import type { Natura, Passo, Risultato } from '../../core/types'

export interface VoceRipartizione {
  readonly id: string
  readonly etichetta: string
  readonly natura: Natura
  /** Sempre positivo: il verso lo dice `aggiunge`. */
  readonly importo: number
  readonly aggiunge: boolean
}

export interface Ripartizione {
  readonly lordo: number
  readonly netto: number
  /** Le voci che sottraggono, nell'ordine della catena. */
  readonly uscite: readonly VoceRipartizione[]
  /** Le voci che si aggiungono al netto senza passare per l'imponibile. */
  readonly aggiunte: readonly VoceRipartizione[]
  /** `lordo + aggiunte`, cioè la lunghezza della barra. */
  readonly totale: number
}

/**
 * La scala dei grafici, per posizione e non per natura.
 *
 * ⚠️ **Una famiglia sola, più il verde**, ed è una scelta di prodotto prima
 * che di grafica: il verde significa *quello che resta al dipendente*, quindi
 * lo prendono il netto e le somme che si aggiungono, e nient'altro. Le voci
 * che escono si distinguono per **gradino di grigio**, nell'ordine della
 * catena, e il nome ce l'hanno scritto accanto in legenda: il colore le separa,
 * non le nomina.
 *
 * Quattro gradini bastano — nessun calcolo del caso standard produce più di
 * quattro voci in uscita — e il modulo fa ricominciare il quinto dal primo
 * invece di uscire dalla scala.
 *
 * I valori stanno in `globals.css` (D-046): qui ci sono solo i nomi, e stanno
 * qui perché li usano in tre — barra, legenda, Sankey.
 */
const GRADINI = 4

export const tintaUscita = (indice: number): string =>
  `bg-grafico-${(indice % GRADINI) + 1}`

export const riempimentoUscita = (indice: number): string =>
  `var(--color-grafico-${(indice % GRADINI) + 1})`

export const ripartizione = (risultato: Risultato): Ripartizione => {
  const uscite: VoceRipartizione[] = []
  const aggiunte: VoceRipartizione[] = []

  for (const passo of risultato.passi) {
    /*
      Solo i passi di primo livello che portano una natura e che hanno davvero
      mosso il netto. Restano fuori i passaggi — RAL, reddito complessivo, il
      gate — che espongono una grandezza senza spostare nulla, e le voci non
      dovute, che valgono zero: un segmento largo zero non si vede, e in
      legenda direbbe *IRPEF 0,00 €* accanto a un'IRPEF che non è dovuta. Che
      esistano e perché lo dice il dettaglio sotto, che le mostra tutte.
    */
    if (passo.natura === undefined) continue
    if (passo.esito.stato !== 'applicato') continue
    if (passo.esito.segno === 'neutro') continue

    const voce: VoceRipartizione = {
      id: passo.id,
      etichetta: passo.etichetta,
      natura: passo.natura,
      importo: Math.abs(passo.esito.effettoSulNetto),
      aggiunge: passo.esito.segno === 'aggiunge',
    }
    if (voce.aggiunge) aggiunte.push(voce)
    else uscite.push(voce)
  }

  const lordo = risultato.input.ral as number
  const sommaAggiunte = aggiunte.reduce((a, v) => a + v.importo, 0)

  return {
    lordo,
    netto: risultato.nettoAnnuo as number,
    uscite,
    aggiunte,
    totale: lordo + sommaAggiunte,
  }
}

/**
 * Le righe della tabella dei numeri: la traccia appiattita, con la profondità
 * accanto.
 *
 * ⚠️ Appiattisce e basta. L'ordine è quello del motore, la profondità è
 * quella dell'annidamento, e nessuna riga nasce qui: ogni riga è un `Passo`
 * che esiste già nella traccia.
 */
export interface RigaTabella {
  readonly passo: Passo
  readonly livello: number
}

export const righeTabella = (passi: readonly Passo[], livello = 0): readonly RigaTabella[] =>
  passi.flatMap((passo) => [
    { passo, livello },
    ...righeTabella(passo.dettaglio ?? [], livello + 1),
  ])
