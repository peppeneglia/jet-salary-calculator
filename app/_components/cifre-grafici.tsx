/**
 * I grafici di `/spiegazione`.
 *
 * ⚠️ **Server component, e non è un dettaglio di configurazione.** Sono
 * disegni statici: la geometria si calcola una volta sul server e arriva come
 * SVG dentro il documento. Non c'è niente da idratare, nessuna libreria di
 * grafici nel pacchetto, e la pagina resta leggibile con JavaScript spento —
 * che per una pagina di cifre è il minimo.
 *
 * ⚠️ **Nessun colore scritto qui.** Vale la regola di `globals.css`: i due
 * soli inchiostri sono `inchiostro`, per ciò che viene tolto, e `verde-testo`
 * per ciò che si aggiunge al netto. È la stessa distinzione che il dettaglio
 * del risultato usa sulle quattro nature, non una tavolozza inventata per
 * questa pagina.
 *
 * ⚠️ **Accessibilità: il grafico non è mai l'unica copia del dato.** Ogni
 * SVG porta `role="img"` con la propria descrizione, e accanto — in pagina —
 * gli stessi valori stanno scritti. Un lettore di schermo che ignorasse il
 * disegno non perderebbe nulla, ed è la ragione per cui le etichette dentro il
 * disegno sono `aria-hidden`: ripeterle sarebbe rumore, non informazione.
 */

import type { Curva } from '../_lib/cifre'

/** Una tacca sull'asse: dove sta, e cosa c'è scritto sotto. */
export interface Tacca {
  readonly a: number
  readonly testo: string
}

// ── Barre orizzontali ───────────────────────────────────────────────────────

export interface Barra {
  readonly etichetta: string
  readonly valore: number
  readonly scritto: string
  readonly nota?: string
  /** Vero per ciò che si aggiunge al netto invece di toglierlo. */
  readonly aggiunge?: boolean
}

/**
 * Barre orizzontali su scala comune.
 *
 * ⚠️ La scala parte da zero e non dal minimo, ed è l'unica scelta onesta:
 * un asse troncato fa sembrare doppia una differenza di un punto. Su tre
 * aliquote contributive, dove la distanza vera è quello che si vuole mostrare,
 * sarebbe una bugia disegnata.
 */
export function Barre({
  barre,
  massimo,
  descrizione,
}: {
  barre: readonly Barra[]
  massimo: number
  descrizione: string
}) {
  return (
    <ul role="img" aria-label={descrizione} className="space-y-3">
      {barre.map((b) => (
        <li key={b.etichetta}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-sm font-medium text-inchiostro">{b.etichetta}</span>
            <span
              className={`cifre text-sm font-semibold ${b.aggiunge ? 'text-verde-testo' : 'text-inchiostro'}`}
            >
              {b.scritto}
            </span>
          </div>
          {/*
            La traccia sotto la barra rende leggibile quanto manca al massimo:
            senza, una barra corta e una lunga si confrontano a occhio contro il
            nulla.
          */}
          <div
            aria-hidden
            className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-bordo-decorativo"
          >
            <div
              className={`h-full rounded-full ${b.aggiunge ? 'bg-verde' : 'bg-inchiostro'}`}
              style={{ width: `${Math.max(1, (b.valore / massimo) * 100)}%` }}
            />
          </div>
          {b.nota ? <p className="mt-1.5 text-sm leading-relaxed text-inchiostro-tenue">{b.nota}</p> : null}
        </li>
      ))}
    </ul>
  )
}

// ── Gli scaglioni ───────────────────────────────────────────────────────────

export interface BloccoScaglione {
  readonly da: number
  readonly a: number | null
  readonly aliquota: number
  readonly fascia: string
  readonly percentuale: string
}

/**
 * La scala a gradini delle aliquote per scaglioni.
 *
 * ⚠️ **La larghezza di ogni gradino è l'ampiezza del suo scaglione**, e
 * questo è tutto il punto del disegno: il primo scaglione è largo quanto i
 * ventottomila euro che copre, il terzo è aperto e si mostra sfumato. Un
 * grafico a barre uguali direbbe *tre aliquote* e nasconderebbe la cosa che
 * conta, cioè che quasi tutti stanno quasi sempre dentro il primo.
 */
export function Scaglioni({
  blocchi,
  xMax,
  tacche,
  descrizione,
}: {
  blocchi: readonly BloccoScaglione[]
  xMax: number
  tacche: readonly Tacca[]
  descrizione: string
}) {
  const L = 1000
  const H = 300
  const bassa = H - 34
  const massimo = Math.max(...blocchi.map((b) => b.aliquota))
  const x = (v: number) => (Math.min(v, xMax) / xMax) * L
  const altezza = (a: number) => (a / massimo) * (bassa - 30)

  return (
    <svg
      viewBox={`0 0 ${L} ${H}`}
      role="img"
      aria-label={descrizione}
      className="h-auto w-full"
    >
      {/*
        Lo scaglione aperto sfuma invece di finire con un taglio netto: un
        bordo verticale a destra direbbe che l'aliquota si ferma lì, e non si
        ferma.
      */}
      <defs>
        <linearGradient id="scaglione-aperto" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <g className="text-inchiostro">
        {blocchi.map((b) => {
          const sinistra = x(b.da)
          const destra = x(b.a ?? xMax)
          const alto = bassa - altezza(b.aliquota)
          return (
            <g key={`${b.da}`}>
              <rect
                x={sinistra}
                y={alto}
                width={Math.max(2, destra - sinistra)}
                height={bassa - alto}
                fill={b.a === null ? 'url(#scaglione-aperto)' : 'currentColor'}
                fillOpacity={b.a === null ? 1 : 0.75}
              />
              <text
                aria-hidden
                x={sinistra + Math.max(2, destra - sinistra) / 2}
                y={alto - 10}
                textAnchor="middle"
                fill="currentColor"
                className="cifre"
                style={{ fontSize: '30px', fontWeight: 600 }}
              >
                {b.percentuale}
              </text>
            </g>
          )
        })}

        <line x1="0" y1={bassa} x2={L} y2={bassa} stroke="currentColor" strokeWidth="1.5" />

        {tacche.map((t) => (
          <g key={t.a}>
            <line
              x1={x(t.a)}
              y1={bassa}
              x2={x(t.a)}
              y2={bassa + 7}
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text
              aria-hidden
              x={x(t.a)}
              y={bassa + 28}
              textAnchor={t.a === 0 ? 'start' : 'middle'}
              fill="currentColor"
              fillOpacity="0.7"
              className="cifre"
              style={{ fontSize: '22px' }}
            >
              {t.testo}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ── La spezzata ─────────────────────────────────────────────────────────────

/**
 * Una funzione a tratti, disegnata dai suoi vertici.
 *
 * ⚠️ **Nessuna curva morbida, e nessuno stiramento.** I vertici
 * arrivano già dai confini delle fasce (`_lib/cifre.ts`), e fra due vertici la
 * norma è lineare: unirli con segmenti è esatto, mentre una spline
 * inventerebbe valori che nessuna formula produce. Dove due vertici distano un
 * centesimo, il segmento è verticale — ed è così che un gradino di legge si
 * vede come un gradino.
 *
 * L'SVG mantiene le proporzioni del proprio `viewBox`: `preserveAspectRatio`
 * resta al valore predefinito, perché stirare la tela stirerebbe anche le
 * etichette dentro, e un `22px` diventerebbe una larghezza diversa a ogni
 * dimensione di finestra.
 */
export function Spezzata({
  curve,
  tacche,
  tacchePerAsseY,
  descrizione,
}: {
  curve: readonly {
    readonly curva: Curva
    readonly etichetta: string
    readonly aggiunge?: boolean
  }[]
  tacche: readonly Tacca[]
  tacchePerAsseY: readonly Tacca[]
  descrizione: string
}) {
  const L = 1000
  const H = 420
  const bassa = H - 44
  const alta = 16

  const xMax = Math.max(...curve.map((c) => c.curva.xMax))
  const yMax = Math.max(...curve.map((c) => c.curva.yMax), ...tacchePerAsseY.map((t) => t.a))

  const x = (v: number) => (v / xMax) * L
  const y = (v: number) => bassa - (v / yMax) * (bassa - alta)

  return (
    <svg
      viewBox={`0 0 ${L} ${H}`}
      role="img"
      aria-label={descrizione}
      className="h-auto w-full"
    >
      <g className="text-inchiostro">
        {/* Le orizzontali di riferimento, tenui: servono a leggere un'altezza, non a decorare. */}
        {tacchePerAsseY.map((t) => (
          <line
            key={`y-${t.a}`}
            x1="0"
            y1={y(t.a)}
            x2={L}
            y2={y(t.a)}
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1.5"
          />
        ))}

        {/* Le verticali sulle soglie: sono i punti in cui la norma cambia. */}
        {tacche.map((t) => (
          <line
            key={`x-${t.a}`}
            x1={x(t.a)}
            y1={alta}
            x2={x(t.a)}
            y2={bassa}
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
        ))}

        <line x1="0" y1={bassa} x2={L} y2={bassa} stroke="currentColor" strokeWidth="1.5" />
      </g>

      {curve.map(({ curva, etichetta, aggiunge }) => {
        const punti = curva.punti.map((p) => `${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ')
        return (
          <g key={etichetta} className={aggiunge ? 'text-verde-testo' : 'text-inchiostro'}>
            <polygon
              points={`${x(curva.punti[0]?.x ?? 0).toFixed(1)},${bassa} ${punti} ${x(curva.punti[curva.punti.length - 1]?.x ?? 0).toFixed(1)},${bassa}`}
              fill="currentColor"
              fillOpacity="0.08"
            />
            <polyline
              points={punti}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )
      })}

      <g className="text-inchiostro">
        {tacche.map((t) => (
          <g key={`t-${t.a}`}>
            <line
              x1={x(t.a)}
              y1={bassa}
              x2={x(t.a)}
              y2={bassa + 7}
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text
              aria-hidden
              x={x(t.a)}
              y={bassa + 30}
              textAnchor="middle"
              fill="currentColor"
              fillOpacity="0.7"
              className="cifre"
              style={{ fontSize: '22px' }}
            >
              {t.testo}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

/**
 * La legenda di una spezzata a più curve.
 *
 * Sta fuori dall'SVG e non dentro: dentro sarebbe testo che non si
 * ridimensiona con la pagina e che un lettore di schermo troverebbe due volte.
 */
export function Legenda({
  voci,
}: {
  voci: readonly { readonly etichetta: string; readonly aggiunge?: boolean }[]
}) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
      {voci.map((v) => (
        <li key={v.etichetta} className="flex items-center gap-2 text-sm text-inchiostro-tenue">
          <span
            aria-hidden
            className={`h-0.5 w-5 rounded-full ${v.aggiunge ? 'bg-verde-testo' : 'bg-inchiostro'}`}
          />
          {v.etichetta}
        </li>
      ))}
    </ul>
  )
}
