'use client'

/**
 * La scelta del comune, come combobox e non come `<select>`.
 *
 * ⚠️ **Non è una questione di gusto grafico, anche se è così che è nata.** Una
 * `<select>` nativa disegna il proprio elenco con il tema del sistema
 * operativo: rettangoli ad angolo vivo, il font di Windows, i colori di
 * Windows. È l'unico punto in cui la pagina smetteva di essere la pagina — e
 * su tema scuro il salto era tale da sembrare un difetto.
 *
 * Ma la ragione che la rende una scelta e non una preferenza è **il dataset
 * MEF**. Il catalogo oggi ha tre comuni; ne avrà 7.897. Una `<select>` con
 * ottomila `<option>` non è lenta, è **inutilizzabile**: non si cerca, si
 * scorre. Il campo di ricerca qui sopra non serve a tre comuni, serve al
 * catalogo che arriverà — e va costruito prima dell'import, non dopo, perché
 * dopo sarebbe una riscrittura sotto pressione.
 *
 * ⚠️ **Quello che si perde va detto.** La `<select>` nativa su telefono apre la
 * ruota di sistema, che è un ottimo controllo e che qui non si ha più. In
 * cambio si ha la ricerca, che con ottomila voci vale più della ruota. È lo
 * scambio, dichiarato.
 *
 * L'impianto ARIA è il pattern *combobox with listbox popup* (WAI-ARIA
 * Authoring Practices 1.2): l'input porta `role="combobox"`, `aria-expanded` e
 * `aria-activedescendant`; **il fuoco non lascia mai l'input**, e l'opzione
 * corrente si comunica per riferimento. È la ragione per cui le opzioni non
 * sono focalizzabili e non hanno `tabIndex`.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTraduzione } from '../_i18n/provider'
import type { ComuneSelezionabile } from '../_lib/comuni'

/**
 * L'accento non deve impedire di trovare un comune.
 *
 * Chi cerca *Forli* deve trovare *Forlì*, e chi cerca *Reggio nell'Emilia*
 * deve trovarla scrivendo *reggio emilia*. La normalizzazione è NFD più
 * rimozione dei segni diacritici: è il minimo che rende la ricerca usabile su
 * una tastiera che gli accenti li ha scomodi.
 */
const normalizza = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function SceltaComune({
  id,
  comuni,
  valore,
  invalido,
  descrittoDa,
  campo,
  onCambia,
}: {
  id: string
  comuni: readonly ComuneSelezionabile[]
  /** Il codice catastale scelto. È la chiave del dataset MEF, non il nome. */
  valore: string
  invalido: boolean
  descrittoDa: string
  /** Il riferimento all'input, perché chi invia il modulo possa portarci il fuoco. */
  campo: React.RefObject<HTMLInputElement | null>
  onCambia: (codiceCatastale: string) => void
}) {
  const { t } = useTraduzione()
  const idElenco = useId()

  const [aperto, setAperto] = useState(false)
  /**
   * Il testo digitato, oppure `null` quando non si sta cercando.
   *
   * `null` non è la stringa vuota: significa **mostra il comune scelto**. Con
   * un solo stato stringa non si distinguerebbe «ho cancellato tutto per
   * cercare» da «non ho ancora toccato niente», e nel secondo caso il campo
   * apparirebbe vuoto pur avendo un valore.
   */
  const [bozza, setBozza] = useState<string | null>(null)
  const [evidenziato, setEvidenziato] = useState(0)

  const contenitore = useRef<HTMLDivElement>(null)
  const pannello = useRef<HTMLUListElement>(null)

  const etichettaDi = (c: ComuneSelezionabile) => `${c.nome} (${c.provincia})`
  const scelto = comuni.find((c) => c.codiceCatastale === valore)

  const visibili = useMemo(() => {
    if (bozza === null || bozza.trim() === '') return comuni
    const q = normalizza(bozza)
    return comuni.filter(
      (c) => normalizza(c.nome).includes(q) || normalizza(c.provincia).includes(q),
    )
  }, [comuni, bozza])

  /* L'opzione evidenziata deve restare in vista quando ci si muove da tastiera. */
  useEffect(() => {
    if (!aperto) return
    pannello.current
      ?.querySelector(`[data-indice="${evidenziato}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [aperto, evidenziato])

  const apri = () => {
    if (aperto) return
    setAperto(true)
    const i = visibili.findIndex((c) => c.codiceCatastale === valore)
    setEvidenziato(i >= 0 ? i : 0)
  }

  const chiudi = () => {
    setAperto(false)
    setBozza(null)
  }

  const seleziona = (c: ComuneSelezionabile) => {
    onCambia(c.codiceCatastale)
    chiudi()
  }

  const muovi = (delta: number) => {
    if (visibili.length === 0) return
    setEvidenziato((i) => {
      const n = visibili.length
      // Ciclico: da fondo elenco si torna in cima. Con ottomila voci, arrivare
      // all'ultima e restare fermi sarebbe una trappola.
      return (i + delta + n) % n
    })
  }

  const tasto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!aperto) apri()
        else muovi(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        if (!aperto) apri()
        else muovi(-1)
        return
      case 'Home':
        if (!aperto) return
        e.preventDefault()
        setEvidenziato(0)
        return
      case 'End':
        if (!aperto) return
        e.preventDefault()
        setEvidenziato(Math.max(0, visibili.length - 1))
        return
      case 'Enter': {
        if (!aperto) return
        // ⚠️ Senza `preventDefault` l'Invio che sceglie il comune invierebbe
        // anche il modulo: si sceglierebbe e si calcolerebbe con un gesto solo,
        // e chi voleva solo cambiare comune si troverebbe il risultato rifatto.
        e.preventDefault()
        const c = visibili[evidenziato]
        if (c) seleziona(c)
        return
      }
      case 'Escape':
        if (!aperto) return
        e.preventDefault()
        chiudi()
        return
      case 'Tab':
        chiudi()
        return
    }
  }

  return (
    <div
      ref={contenitore}
      className="relative"
      onBlur={(e) => {
        // Il fuoco che esce dal gruppo chiude il pannello; quello che si muove
        // al suo interno no.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) chiudi()
      }}
    >
      <div
        className={`fuoco-dentro flex items-center rounded-voce border bg-carta transition-colors ${
          invalido
            ? 'border-avviso-bordo'
            : 'border-bordo-controllo hover:border-bordo-controllo-forte'
        }`}
      >
        <input
          ref={campo}
          id={id}
          role="combobox"
          type="text"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={aperto}
          aria-controls={idElenco}
          aria-autocomplete="list"
          aria-activedescendant={
            aperto && visibili[evidenziato] ? `${idElenco}-${evidenziato}` : undefined
          }
          aria-invalid={invalido ? true : undefined}
          aria-describedby={descrittoDa}
          value={bozza ?? (scelto ? etichettaDi(scelto) : '')}
          placeholder={t('input.comuneSegnaposto')}
          onChange={(e) => {
            setBozza(e.target.value)
            setEvidenziato(0)
            setAperto(true)
          }}
          onKeyDown={tasto}
          onMouseDown={() => {
            if (!aperto) apri()
          }}
          /*
            `text-base` e non meno: sotto i 16px iOS ingrandisce la pagina al
            fuoco del campo e non la rimpicciolisce più.
          */
          className="fuoco-delegato min-h-11 w-full rounded-voce bg-transparent px-3 py-2.5 text-base outline-none sm:text-lg"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onMouseDown={(e) => {
            // `onMouseDown` e non `onClick`: al click il campo avrebbe già
            // ricevuto il fuoco e il pannello si sarebbe già aperto, quindi il
            // gesto lo richiuderebbe subito.
            e.preventDefault()
            if (aperto) chiudi()
            else {
              campo.current?.focus()
              apri()
            }
          }}
          className="flex h-11 w-10 shrink-0 items-center justify-center text-inchiostro-tenue"
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-4 w-4 transition-transform ${aperto ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6.5 8 10.5 12 6.5" />
          </svg>
        </button>
      </div>

      {/*
        Il pannello. `rounded-blocco` fuori, `rounded-voce` sulle voci: sono i
        due gradini di raggio che il progetto usa già per contenitore e
        contenuto, e valgono qui come altrove.

        `max-h` più scorrimento e non un elenco lungo quanto serve: su telefono
        un pannello che copre lo schermo intero nasconde il campo da cui è
        uscito, e chi cerca non vede più cosa ha scritto.
      */}
      {aperto ? (
        <ul
          ref={pannello}
          id={idElenco}
          role="listbox"
          aria-label={t('input.comuneEtichetta')}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto overscroll-contain rounded-blocco border border-bordo-controllo bg-carta p-1.5"
        >
          {visibili.length === 0 ? (
            <li className="px-3 py-3 text-sm text-inchiostro-tenue">
              {t('input.comuneNessunRisultato')}
            </li>
          ) : (
            visibili.map((c, i) => {
              const corrente = i === evidenziato
              return (
                <li
                  key={c.codiceCatastale}
                  id={`${idElenco}-${i}`}
                  role="option"
                  data-indice={i}
                  aria-selected={c.codiceCatastale === valore}
                  onMouseEnter={() => setEvidenziato(i)}
                  onMouseDown={(e) => {
                    // Il pannello si chiude sul `blur`: senza questo, il campo
                    // perderebbe il fuoco prima che il click arrivi a segno.
                    e.preventDefault()
                    seleziona(c)
                  }}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-voce px-3 py-2.5 text-base transition-colors ${
                    corrente ? 'bg-verde-velo text-inchiostro' : 'text-inchiostro'
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className={c.codiceCatastale === valore ? 'font-medium' : undefined}>
                      {c.nome}
                    </span>
                    <span className="text-xs text-inchiostro-tenue">{c.provincia}</span>
                  </span>

                  {/*
                    D-037: il limite si vede **prima** di scegliere. Nella
                    `<select>` era un trattino appiccicato al nome, che è il
                    massimo che una `<option>` consenta; qui è un marcatore, e
                    si legge come tale.
                  */}
                  {c.calcolabile ? null : (
                    <span className="shrink-0 rounded-voce border border-avviso-bordo bg-avviso px-2 py-0.5 text-xs text-avviso-testo">
                      {t('input.comuneMarcatoreNonDisponibile')}
                    </span>
                  )}
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}
