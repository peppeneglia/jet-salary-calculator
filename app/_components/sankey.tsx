'use client'

/**
 * Il calcolo come flusso: dal lordo al netto, con ciò che esce a ogni stadio.
 *
 * ⚠️ **Che cosa aggiunge rispetto alla barra in cima alla sezione.** Quella
 * dice *in quante parti si divide il lordo*; questo dice *in che ordine*, ed è
 * l'informazione che nessun'altra figura della pagina porta. La differenza si
 * vede in un punto preciso: le imposte non si calcolano sul lordo ma sul
 * reddito complessivo, cioè su ciò che resta **dopo** i contributi. Il tronco
 * che si assottiglia prima di arrivare alle imposte è quel fatto, disegnato —
 * ed è anche l'errore più comune dei calcolatori fatti in casa, che le
 * applicano al lordo.
 *
 * Sta in fondo, dopo la spiegazione, perché è una sintesi: si legge quando si
 * sa già che cosa sono le voci.
 *
 * ⚠️ **Nessun numero nasce qui.** Gli stadi si costruiscono sommando gli
 * importi che `ripartizione()` ha letto dalla traccia, e l'identità che li
 * chiude è quella del motore. L'unica aritmetica di questo file è la
 * conversione da euro a pixel.
 *
 * ⚠️ **L'SVG è `aria-hidden` e sotto c'è il suo equivalente in testo.** Un
 * diagramma di flusso non si annuncia: le etichette dentro il disegno servono
 * a chi lo guarda, e chi ascolta trova sotto la stessa cosa in una frase più
 * la legenda della barra in cima, che porta gli stessi importi.
 */

import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import {
  etichettaBreve,
  riempimentoUscita,
  type Ripartizione,
  type VoceRipartizione,
} from '../_lib/uscite'
import { Scorrevole } from './scorrevole'

/* Geometria, in unità del viewBox. Il disegno scala, i rapporti no. */
const LARGHEZZA = 900
const NODO = 12
const X = [0, 330, 660] as const
const ALTEZZA_FLUSSO = 420
const STACCO = 14
const MARGINE_ALTO = 22
const MARGINE_BASSO = 12
/**
 * Larghezza media di un carattere a corpo 12, in unità del viewBox.
 *
 * Serve a sapere **quanti caratteri ci stanno** a destra di una foglia. È una
 * stima, e va bene che lo sia: sbagliarla di poco sposta di un carattere il
 * punto in cui il nome si tronca, mentre non averla lascia il nome uscire
 * dal disegno — che l'SVG ritaglia, quindi senza nemmeno i puntini a dire che
 * manca qualcosa.
 */
const PASSO_CARATTERE = 6.3

/** Una banda fra due nodi: stessa altezza a sinistra e a destra, curva in mezzo. */
function nastro(x1: number, y1: number, x2: number, y2: number, spessore: number): string {
  const c = (x1 + x2) / 2
  return [
    `M ${x1} ${y1}`,
    `C ${c} ${y1}, ${c} ${y2}, ${x2} ${y2}`,
    `L ${x2} ${y2 + spessore}`,
    `C ${c} ${y2 + spessore}, ${c} ${y1 + spessore}, ${x1} ${y1 + spessore}`,
    'Z',
  ].join(' ')
}

interface Foglia {
  readonly voce: VoceRipartizione
  /** Il riempimento, già risolto: le foglie di colonne diverse non condividono l'indice. */
  readonly tinta: string
  /** Dove sta il rettangolo della foglia. */
  readonly y: number
  readonly h: number
  /** Da dove esce il nastro, sul nodo di partenza. */
  readonly yPartenza: number
}

/**
 * Impila le foglie di una colonna, e restituisce anche dove finisce la pila.
 *
 * ⚠️ **Sta fuori dal componente, e non è organizzazione del codice.** Con
 * l'accumulo scritto come `let` mutato dentro una `.map` nel corpo del
 * componente, il compilatore React lo rifiuta — *cannot reassign variable
 * after render completes* — e ha ragione: una variabile di render mutata da un
 * callback è esattamente la forma che si rompe quando il render viene ripetuto
 * o interrotto. Qui l'accumulo è locale a una funzione pura che riceve tutto
 * ciò che le serve e non tocca nulla di fuori.
 *
 * `passo` dice di quanto avanza il punto di partenza sul nodo sorgente: per i
 * nastri che *escono* è lo spessore della foglia, per quelli che *entrano* è
 * zero, perché partono dalla foglia stessa.
 */
function impila(
  voci: readonly VoceRipartizione[],
  inizioY: number,
  inizioPartenza: number,
  h: (v: number) => number,
  partenzaSegueLaPila: boolean,
  tinta: (i: number) => string,
): { readonly foglie: readonly Foglia[]; readonly fine: number } {
  const foglie: Foglia[] = []
  let y = inizioY
  let partenza = inizioPartenza
  let i = 0
  for (const voce of voci) {
    const altezza = h(voce.importo)
    foglie.push({
      voce,
      tinta: tinta(i),
      y,
      h: altezza,
      yPartenza: partenzaSegueLaPila ? y : partenza,
    })
    i += 1
    y += altezza + STACCO
    partenza += altezza
  }
  return { foglie, fine: y }
}

/** Dove ogni nastro entrante atterra sul nodo di destinazione, impilati in ordine. */
function atterraggi(voci: readonly Foglia[], inizio: number): readonly number[] {
  const out: number[] = []
  let y = inizio
  for (const f of voci) {
    out.push(y)
    y += f.h
  }
  return out
}

export function Sankey({ dati }: { dati: Ripartizione }) {
  const { t, lingua } = useTraduzione()
  const { inEuro } = formato(lingua)

  /*
    Gli stadi. `previdenza` esce dal lordo; tutto il resto esce dal reddito
    complessivo. È la catena del dominio, non un raggruppamento grafico: i
    contributi non concorrono a formare il reddito, quindi le imposte partono
    da una base già ridotta.
  */
  const previdenza = dati.uscite.filter((v) => v.natura === 'previdenza')
  const imposte = dati.uscite.filter((v) => v.natura !== 'previdenza')

  const somma = (v: readonly VoceRipartizione[]) => v.reduce((a, x) => a + x.importo, 0)

  const redditoComplessivo = dati.lordo - somma(previdenza)
  const resto = redditoComplessivo - somma(imposte)

  /*
    La colonna più alta è la seconda — reddito complessivo, più i contributi,
    più le somme che entrano — e vale `totale`. La scala si prende da lì, così
    nessuna colonna sfora.
  */
  const k = dati.totale > 0 ? ALTEZZA_FLUSSO / dati.totale : 0
  const h = (v: number) => v * k

  // Colonna 1: il tronco in alto, le foglie sotto.
  const sottoIlTronco = MARGINE_ALTO + h(redditoComplessivo)
  const contributi = impila(previdenza, sottoIlTronco + STACCO, sottoIlTronco, h, false, (i) =>
    riempimentoUscita(i),
  )
  /* Le somme che si aggiungono sono verdi: vanno al lavoratore, come il netto. */
  const aggiunte = impila(dati.aggiunte, contributi.fine, 0, h, true, () =>
    'var(--color-grafico-aggiunge)',
  )

  // Colonna 2: il netto in alto, le imposte sotto.
  const altezzaNetto = h(resto) + aggiunte.foglie.reduce((a, f) => a + f.h, 0)
  const sottoIlNetto = MARGINE_ALTO + altezzaNetto
  /* Le imposte continuano la scala dopo i contributi: un gradino per voce. */
  const tasse = impila(imposte, sottoIlNetto + STACCO, MARGINE_ALTO + h(resto), h, false, (i) =>
    riempimentoUscita(previdenza.length + i),
  )

  const foglieContributi = contributi.foglie
  const foglieAggiunte = aggiunte.foglie
  const foglieImposte = tasse.foglie

  const altezza =
    Math.max(aggiunte.fine, tasse.fine, MARGINE_ALTO + h(dati.lordo)) + MARGINE_BASSO

  /* Dove i nastri delle aggiunte atterrano sul netto: sotto la banda del resto. */
  const dove = atterraggi(foglieAggiunte, MARGINE_ALTO + h(resto))

  return (
    <figure>
      {/*
        Scorre dentro il proprio contenitore invece di far scorrere la pagina:
        un flusso a tre colonne con le etichette non sta sotto i 380px, e
        comprimerlo lo renderebbe illeggibile per guadagnare una figura che
        nessuno può leggere.

        ⚠️ **Qui la larghezza non si riduce su telefono, a differenza della
        tabella, e la ragione è la differenza fra le due figure.** Una tabella
        stretta resta leggibile riga per riga; un flusso stretto perde
        esattamente la cosa che ha da dire, cioè i rapporti fra le bande. Quindi
        resta largo e si dichiara scorrevole — `Scorrevole` mette la sfumatura
        sul bordo e la riga che dice cosa fare, perché la barra del sistema
        arriva solo dopo il primo trascinamento.
      */}
      <Scorrevole
        cornice={false}
        className="mt-2"
        etichetta={t('dettaglio.sankeyTitolo')}
        indicazione={t('dettaglio.scorriFlusso')}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${LARGHEZZA} ${altezza}`}
          className="h-auto w-full min-w-[42rem]"
        >
          {/* I nastri stanno sotto i nodi: un nodo coperto da una banda sparirebbe. */}
          <g fillOpacity={0.55}>
            {/* Lordo → reddito complessivo */}
            <path
              d={nastro(X[0] + NODO, MARGINE_ALTO, X[1], MARGINE_ALTO, h(redditoComplessivo))}
              fill="var(--color-bordo-decorativo-forte)"
            />
            {/* Lordo → contributi */}
            {foglieContributi.map((f) => (
              <path
                key={`n-${f.voce.id}`}
                d={nastro(X[0] + NODO, f.yPartenza, X[1], f.y, f.h)}
                fill={f.tinta}
              />
            ))}
            {/* Reddito complessivo → netto */}
            <path
              d={nastro(X[1] + NODO, MARGINE_ALTO, X[2], MARGINE_ALTO, h(resto))}
              fill="var(--color-verde)"
            />
            {/* Reddito complessivo → imposte */}
            {foglieImposte.map((f) => (
              <path
                key={`n-${f.voce.id}`}
                d={nastro(X[1] + NODO, f.yPartenza, X[2], f.y, f.h)}
                fill={f.tinta}
              />
            ))}
            {/* Somme che si aggiungono → netto */}
            {foglieAggiunte.map((f, i) => (
              <path
                key={`n-${f.voce.id}`}
                d={nastro(X[1] + NODO, f.y, X[2], dove[i] ?? 0, f.h)}
                fill={f.tinta}
              />
            ))}
          </g>

          {/* I tre nodi della catena */}
          <Nodo
            x={X[0]}
            y={MARGINE_ALTO}
            h={h(dati.lordo)}
            fill="var(--color-inchiostro-tenue)"
            etichetta={t('dettaglio.sankeyLordo')}
            importo={inEuro(dati.lordo)}
            ancora="start"
          />
          <Nodo
            x={X[1]}
            y={MARGINE_ALTO}
            h={h(redditoComplessivo)}
            fill="var(--color-inchiostro-tenue)"
            etichetta={t('dettaglio.sankeyRedditoComplessivo')}
            importo={inEuro(redditoComplessivo)}
            ancora="middle"
          />
          <Nodo
            x={X[2]}
            y={MARGINE_ALTO}
            h={altezzaNetto}
            fill="var(--color-verde)"
            etichetta={t('dettaglio.sankeyNetto')}
            importo={inEuro(dati.netto)}
            ancora="end"
          />

          {/* Le foglie, ciascuna con il nome alla propria destra */}
          {[...foglieContributi, ...foglieAggiunte].map((f) => (
            <NodoFoglia
              key={f.voce.id}
              foglia={f}
              x={X[1]}
              importo={inEuro(f.voce.importo)}
              etichetta={etichettaBreve(f.voce.id, f.voce.etichetta, t)}
            />
          ))}
          {foglieImposte.map((f) => (
            <NodoFoglia
              key={f.voce.id}
              foglia={f}
              x={X[2]}
              importo={inEuro(f.voce.importo)}
              etichetta={etichettaBreve(f.voce.id, f.voce.etichetta, t)}
            />
          ))}
        </svg>
      </Scorrevole>

      <p className="mt-2 text-xs leading-relaxed text-inchiostro-tenue">
        {t('dettaglio.sankeyDescrizione', {
          lordo: inEuro(dati.lordo),
          rc: inEuro(redditoComplessivo),
          netto: inEuro(dati.netto),
        })}
      </p>
    </figure>
  )
}

function Nodo({
  x,
  y,
  h,
  fill,
  etichetta,
  importo,
  ancora,
}: {
  x: number
  y: number
  h: number
  fill: string
  etichetta: string
  importo: string
  ancora: 'start' | 'middle' | 'end'
}) {
  const tx = ancora === 'start' ? x : ancora === 'end' ? x + NODO : x + NODO / 2
  return (
    <g>
      <rect x={x} y={y} width={NODO} height={h} rx={2} fill={fill} />
      <text
        x={tx}
        y={y - 8}
        textAnchor={ancora}
        className="fill-inchiostro text-[13px] font-semibold"
      >
        {etichetta}
        <tspan className="fill-inchiostro-tenue font-normal"> {importo}</tspan>
      </text>
    </g>
  )
}

function NodoFoglia({
  foglia,
  x,
  importo,
  etichetta,
}: {
  foglia: Foglia
  x: number
  importo: string
  etichetta: string
}) {
  /*
    L'etichetta sta a destra del nodo e verticalmente al suo centro. Una foglia
    sottile — una voce che vale poche decine di euro — resta comunque
    etichettata: è il rettangolo a essere piccolo, non il testo.
  */
  const centro = foglia.y + foglia.h / 2

  /*
    ⚠️ **Il nome si tronca se non ci sta, e qui il vincolo non è lo schermo:
    è il viewBox.** Il disegno è largo 900 unità sempre, su qualunque
    dispositivo, e le foglie della terza colonna cominciano a 680: restano 220
    unità per nome e importo insieme. *Addizionale comunale · Salorno sulla
    Strada del Vino .Salurn an der Weinstraße* ne vuole quasi il quadruplo, e
    quello che avanza l'SVG **lo ritaglia in silenzio** — senza puntini, senza
    barra, senza alcun segno che lì mancasse del testo.

    Per questo qui il nome breve si usa sempre e non solo su telefono: a
    determinarlo non è la larghezza della finestra, che qui non conta, ma la
    geometria della figura, che è la stessa ovunque.
  */
  const inizio = x + NODO + 8
  const budget = Math.max(8, Math.floor((LARGHEZZA - inizio) / PASSO_CARATTERE) - importo.length - 1)
  const nome = etichetta.length > budget ? `${etichetta.slice(0, budget - 1).trimEnd()}…` : etichetta
  return (
    <g>
      <rect
        x={x}
        y={foglia.y}
        width={NODO}
        height={Math.max(foglia.h, 1.5)}
        rx={2}
        fill={foglia.tinta}
      />
      <text x={inizio} y={centro + 4} className="fill-inchiostro text-[12px]">
        {nome}
        <tspan className="fill-inchiostro-tenue"> {importo}</tspan>
      </text>
    </g>
  )
}
