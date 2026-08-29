/**
 * Lettura grezza dei tre artefatti MEF: CSV, XLSX, e le due convenzioni numeriche.
 *
 * Sta separato da `importa-mef.mjs` perché qui non ci sono decisioni di dominio:
 * è solo il livello che trasforma byte in righe. Le regole normative — il
 * fallback del c. 752, la selezione fra due provvedimenti, i tre stati — stanno
 * tutte nell'altro file, dove si possono leggere senza attraversare un parser.
 *
 * ⚠️ **Nessuna dipendenza.** Lo XLSX è uno zip di XML e Node sa già fare
 * entrambe le cose (`node:zlib`). D-005 aveva scartato il parsing dell'Excel
 * *a runtime* perché avrebbe aggiunto una libreria; qui la conversione è
 * offline e una libreria resta comunque un costo che non serve pagare.
 */

import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Analizzatore CSV con campi fra virgolette, perché le colonne di testo libero
 * dei due file contengono `;` e a capo dentro il valore.
 */
export function analizzaCsv(testo, delimitatore = ';') {
  const righe = []
  let campo = ''
  let riga = []
  let fraVirgolette = false

  for (let i = 0; i < testo.length; i += 1) {
    const ch = testo[i]
    if (fraVirgolette) {
      if (ch !== '"') campo += ch
      else if (testo[i + 1] === '"') {
        campo += '"'
        i += 1
      } else fraVirgolette = false
    } else if (ch === '"') fraVirgolette = true
    else if (ch === delimitatore) {
      riga.push(campo)
      campo = ''
    } else if (ch === '\n') {
      riga.push(campo)
      righe.push(riga)
      riga = []
      campo = ''
    } else if (ch !== '\r') campo += ch
  }
  if (campo !== '' || riga.length > 0) {
    riga.push(campo)
    righe.push(riga)
  }
  return righe
}

/**
 * Le intestazioni vanno ripulite: nel file regionale l'ultima colonna si chiama
 * `'FASCIA '`, con lo spazio dentro il nome.
 */
export function leggiCsvComeOggetti(percorso, delimitatore = ';') {
  const testo = readFileSync(percorso, 'utf8').replace(/^﻿/, '')
  const righe = analizzaCsv(testo, delimitatore).filter((r) => r.some((c) => c.trim() !== ''))
  const intestazioni = righe[0].map((h) => h.trim())
  return righe.slice(1).map((r) => {
    const o = {}
    intestazioni.forEach((h, i) => {
      o[h] = r[i] ?? ''
    })
    return o
  })
}

// ---------------------------------------------------------------------------
// XLSX — zip + XML, senza librerie
// ---------------------------------------------------------------------------

const FIRMA_EOCD = 0x06054b50
const FIRMA_CENTRALE = 0x02014b50

function apriZip(percorso) {
  const buf = readFileSync(percorso)
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i -= 1) {
    if (buf.readUInt32LE(i) === FIRMA_EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error(`${percorso}: fine della directory centrale non trovata`)

  const numeroVoci = buf.readUInt16LE(eocd + 10)
  const voci = new Map()
  let off = buf.readUInt32LE(eocd + 16)

  for (let k = 0; k < numeroVoci; k += 1) {
    if (buf.readUInt32LE(off) !== FIRMA_CENTRALE) throw new Error(`${percorso}: directory centrale corrotta`)
    const metodo = buf.readUInt16LE(off + 10)
    const dimensioneCompressa = buf.readUInt32LE(off + 20)
    const lunNome = buf.readUInt16LE(off + 28)
    const lunExtra = buf.readUInt16LE(off + 30)
    const lunCommento = buf.readUInt16LE(off + 32)
    const offsetLocale = buf.readUInt32LE(off + 42)
    const nome = buf.toString('utf8', off + 46, off + 46 + lunNome)
    voci.set(nome, { metodo, dimensioneCompressa, offsetLocale })
    off += 46 + lunNome + lunExtra + lunCommento
  }

  return (nome) => {
    const v = voci.get(nome)
    if (!v) throw new Error(`${percorso}: voce ${nome} assente`)
    // Le dimensioni si leggono dalla directory centrale: l'intestazione locale
    // può portarle a zero quando lo zip usa un descrittore in coda al dato.
    const lunNome = buf.readUInt16LE(v.offsetLocale + 26)
    const lunExtra = buf.readUInt16LE(v.offsetLocale + 28)
    const inizio = v.offsetLocale + 30 + lunNome + lunExtra
    const dati = buf.subarray(inizio, inizio + v.dimensioneCompressa)
    return v.metodo === 0 ? dati : inflateRawSync(dati)
  }
}

/** `&amp;` per ultimo, altrimenti si decodifica due volte. */
function decodificaEntita(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
}

/**
 * ⚠️ La cella autochiusa `<c r="E3" s="1"/>` è la trappola di questo formato.
 * Un'espressione che cerchi solo `<c …>…</c>` la scavalca e attribuisce alla
 * colonna vuota il contenuto della colonna successiva — cioè **sposta di posto
 * le aliquote**. Le due forme vanno alternate nella stessa espressione.
 */
const CELLA = /<c\s+r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
const RIGA = /<row r="(\d+)"[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g

export function leggiFoglioXlsx(percorso, foglio = 'xl/worksheets/sheet1.xml') {
  const estrai = apriZip(percorso)

  const condivise = []
  const xmlStringhe = estrai('xl/sharedStrings.xml').toString('utf8')
  for (const [, si] of xmlStringhe.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const pezzi = [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1])
    condivise.push(decodificaEntita(pezzi.join('')))
  }

  const xmlFoglio = estrai(foglio).toString('utf8')
  const righe = []
  for (const [, numero, contenuto] of xmlFoglio.matchAll(RIGA)) {
    const celle = {}
    for (const [, colonna, attributi, interno] of (contenuto ?? '').matchAll(CELLA)) {
      const v = /<v>([\s\S]*?)<\/v>/.exec(interno ?? '')
      let valore = v ? decodificaEntita(v[1]) : ''
      if (attributi.includes('t="s"') && valore !== '') valore = condivise[Number(valore)] ?? ''
      celle[colonna] = valore
    }
    righe.push({ numero: Number(numero), celle })
  }
  return righe
}

// ---------------------------------------------------------------------------
// Le due convenzioni numeriche
//
// [Fonti §15, «Nota di formato»] Comunale: `0,8` con virgola decimale, soglie
// `28.000,00`. Regionale: `1.23` con punto, soglie `15000.00`. E dentro lo
// stesso elenco annuale 2025 convivono le due cose: le aliquote hanno il punto,
// la colonna Esenzione ha la virgola. Non esiste un normalizzatore unico che
// indovini: la convenzione si dichiara per colonna, come chiede §15.
// ---------------------------------------------------------------------------

/**
 * `0,8` · `,76` · `28.000,00` · `€ 0` · `50.000`
 *
 * ⚠️ L'alternativa `^,\d+$` non è una gentilezza: **1.279 valori del file 2026
 * sono scritti senza lo zero iniziale** — `,8` da solo compare 1.076 volte.
 * Un'espressione che pretenda una cifra prima della virgola non scarta un caso
 * limite, scarta un sesto delle aliquote deliberate.
 */
export function numeroVirgola(grezzo) {
  const t = String(grezzo ?? '').replace(/[€\s ]/g, '')
  if (t === '') return null
  // `0.8` qui sarebbe ambiguo: punto decimale in un file che usa la virgola.
  if (/^\d+\.\d{1,2}$/.test(t)) return { valore: Number(t), ambiguo: true }
  if (!/^\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^\d+(?:,\d+)?$|^,\d+$/.test(t)) return null
  const n = Number(t.replace(/\./g, '').replace(/^,/, '0,').replace(',', '.'))
  return Number.isFinite(n) ? { valore: n, ambiguo: false } : null
}

/** `1.23` · `15000.00` · `0` */
export function numeroPunto(grezzo) {
  const t = String(grezzo ?? '').replace(/[€\s ]/g, '')
  if (t === '') return null
  if (t.includes(',')) {
    const n = Number(t.replace(',', '.'))
    return Number.isFinite(n) ? { valore: n, ambiguo: true } : null
  }
  if (!/^\d+(?:\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? { valore: n, ambiguo: false } : null
}

/** Spazi doppi, ` `, `€` al posto di `euro`: tutto normalizzato a monte. */
export function normalizzaTesto(s) {
  return String(s ?? '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const MESI = { GEN: 1, FEB: 2, MAR: 3, APR: 4, MAG: 5, GIU: 6, LUG: 7, AGO: 8, SET: 9, OTT: 10, NOV: 11, DIC: 12 }

/** `29-GEN-26` → `2026-01-29`. Il file regionale non usa un formato ISO. */
export function dataItaliana(grezzo) {
  const t = normalizzaTesto(grezzo).toUpperCase()
  const m = /^(\d{1,2})-([A-Z]{3})-(\d{2})$/.exec(t)
  if (m) {
    const mese = MESI[m[2]]
    if (!mese) return null
    return `20${m[3]}-${String(mese).padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }
  // `22/01/2026` — formato delle date di delibera del file comunale
  const g = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t)
  if (g) return `${g[3]}-${g[2].padStart(2, '0')}-${g[1].padStart(2, '0')}`
  return null
}
