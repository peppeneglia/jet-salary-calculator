/**
 * Formattazione, e nient'altro.
 *
 * L'arrotondamento a due decimali è **presentazione** (D-025): la catena di
 * calcolo lavora a precisione piena e tronca alla quarta cifra solo dove lo
 * impone la norma, che è logica di `core/`. Qui si decide come si scrive un
 * numero, mai quanto vale.
 *
 * ⚠️ **La lingua entra qui come entra nel motore.** Non esiste una funzione
 * `inEuro(n)` senza lingua: `1.234,56 €` e `€1,234.56` sono lo stesso importo
 * scritto due volte, e quale delle due si scriva non è una costante del modulo.
 * `formato(lingua)` restituisce l'insieme coerente — importi, aliquote e date
 * nella stessa convenzione — perché la regola di D-038 vale anche qui: una
 * riga non può avere due separatori decimali diversi.
 *
 * Il tag BCP 47 arriva da `data/tag-lingua.ts`, che è la sua unica sede:
 * scriverlo anche qui creerebbe due posti che devono restare d'accordo.
 */

import type { CodiceLingua } from '../../core/types'
import { TAG } from '../../data/tag-lingua'

export interface Formato {
  /** Un importo con il simbolo di valuta. */
  readonly inEuro: (n: number) => string
  /**
   * Il segno è dato dal motore, non ricostruito qui: `effettoSulNetto` è già
   * negativo per le voci che sottraggono. `signDisplay` lo rende visibile anche
   * quando è positivo, che è il punto delle voci del ramo che aggiunge.
   */
  readonly inEuroConSegno: (n: number) => string
  /**
   * Le aliquote sono in punti percentuali, non in frazione: 9,19% è il numero
   * 9.19. Va scritto con il separatore della lingua, come ogni altro numero.
   */
  readonly inPercentuale: (n: number) => string
  /** Le date arrivano in ISO 8601 e si mostrano nella forma della lingua. */
  readonly inData: (iso: string) => string
  /** Il tag BCP 47 in uso, per chi deve costruirsi un formattatore proprio. */
  readonly tag: string
}

const cache = new Map<CodiceLingua, Formato>()

const monta = (lingua: CodiceLingua): Formato => {
  const tag = TAG[lingua]

/**
   * ⚠️ **`useGrouping: 'always'`, e non è una preferenza tipografica.**
   *
   * Il valore predefinito è `'auto'`, che delega la scelta a
   * `minimumGroupingDigits` del CLDR: per l'italiano quel valore è **2** nelle
   * versioni recenti, quindi `1952,12` si scrive senza il punto delle migliaia
   * e `12.345,00` con. Ma la versione di CLDR è quella **compilata dentro
   * l'ICU del runtime**, e non è la stessa fra il Node che rende la pagina e il
   * browser che la riprende: lo stesso numero può uscire scritto in due modi
   * nello stesso documento.
   *
   * Un numero il cui aspetto dipende da come è stato compilato Node non è una
   * scelta di presentazione: è un difetto che si manifesta solo in produzione.
   * `'always'` lo rende deterministico.
   *
   * ⚠️ **E chiude un'asimmetria che nessuno aveva deciso.** In inglese
   * `minimumGroupingDigits` vale 1, quindi `1,952.12` il separatore lo ha
   * sempre avuto. Le due lingue si comportavano diversamente per un default,
   * non per una scelta.
   */
  const importo = new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })

  const importoConSegno = new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
    useGrouping: 'always',
  })

  const percentuale = new Intl.NumberFormat(tag, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })

  /**
   * `28/08/2026` in italiano, `28 Aug 2026` in inglese. Il mese scritto a
   * lettere non è vezzo: `08/09` è ambiguo fra due convenzioni, e su una pagina
   * che dichiara quando una fonte è stata letta l'ambiguità costa.
   */
  const data = new Intl.DateTimeFormat(
    tag,
    lingua === 'it'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' },
  )

  return {
    tag,
    inEuro: (n) => importo.format(n),
    inEuroConSegno: (n) => importoConSegno.format(n),
    inPercentuale: (n) => `${percentuale.format(n)}%`,
    inData: (iso) => {
      const d = new Date(`${iso}T00:00:00Z`)
      return Number.isNaN(d.getTime()) ? iso : data.format(d)
    },
  }
}

export const formato = (lingua: CodiceLingua): Formato => {
  const esistente = cache.get(lingua)
  if (esistente !== undefined) return esistente
  const nuovo = monta(lingua)
  cache.set(lingua, nuovo)
  return nuovo
}

/**
 * Legge un importo scritto a mano.
 *
 * ⚠️ **Non è validazione, è lettura**: dice quale numero ha scritto chi digita,
 * non se quel numero vada bene. Il giudizio sta in `validazione.ts`.
 *
 * Chi scrive uno stipendio in italiano scrive `30.000`, e in inglese `30,000`:
 * sono lo stesso importo, e rifiutarli entrambi perché contengono un separatore
 * sarebbe pedanteria. Si tolgono spazi e separatore delle migliaia della
 * lingua, si porta il separatore decimale a punto, e si legge. Tutto ciò che
 * resta non numerico fa fallire la lettura, e a quel punto c'è un messaggio che
 * dice cosa scrivere.
 */
export const leggiImporto = (testo: string, lingua: CodiceLingua): number | undefined => {
  const grezzo = testo.trim()
  if (grezzo === '') return undefined

  const migliaia = lingua === 'it' ? '.' : ','
  const decimale = lingua === 'it' ? ',' : '.'

  const normalizzato = grezzo
    .replace(/[\s  ]/g, '')
    .replace(/€/g, '')
    .split(migliaia)
    .join('')
    .replace(decimale, '.')

  if (!/^-?\d*\.?\d*$/.test(normalizzato) || normalizzato === '' || normalizzato === '-') {
    return undefined
  }

  const n = Number(normalizzato)
  return Number.isFinite(n) ? n : undefined
}
