/**
 * Import delle geometrie dei ventuno enti impositori regionali.
 *
 * Si esegue una volta, offline: `node scripts/importa-geometrie.mjs`.
 * Legge due file di confini da `../Fonti/`, che sta fuori dal repo come ogni
 * altra sorgente (CLAUDE.md §4), e scrive `data/geo/enti-2026.json`: ventuno
 * stringhe `d` di SVG, già proiettate, con la propria provenienza dentro il
 * dato.
 *
 * Le quattro regole che governano questo file
 *
 * 1. **Ventuno sagome, non venti.** Il file dei confini regionali ISTAT ha
 * venti righe, e il Trentino-Alto Adige è una di quelle. Come **ente
 * impositore dell'addizionale regionale non esiste**: l'addizionale la
 * deliberano separatamente le due Province autonome, e il prospetto MEF ha
 * infatti righe distinte per Trento e Bolzano [Fonti §11]. Qui la regione viene
 * scartata e sostituita dalle due province prese dal file provinciale. La mappa
 * disegna gli enti che fissano l'aliquota, non le regioni della geografia.
 *
 * 2. **I nomi sono quelli del MEF, e la verifica è un confronto d'insieme.**
 * `reg_name` scrive *Sicilia*, *Valle d'Aosta/Vallée d'Aoste*,
 * *Friuli-Venezia Giulia*; il prospetto scrive `REGIONE SICILIA`,
 * `REGIONE VALLE D'AOSTA`, `REGIONE FRIULI VENEZIA GIULIA`. La tabella qui
 * sotto traduce le prime nelle seconde, e alla fine i ventuno nomi prodotti
 * vengono confrontati **uno a uno** con quelli di `data/mef/regioni-2026.json`:
 * se un solo nome non combacia lo script si ferma. È la stessa disciplina del
 * `Record` pieno di `data/nomi-enti.ts` — una sagoma orfana è una regione che
 * in pagina resterebbe grigia senza che nessuno se ne accorga.
 *
 * 3. **La proiezione si fa qui, non nel browser.** La scelta è di D-078: al
 * client arrivano stringhe di path, non coordinate geografiche, quindi la
 * pagina non porta né una libreria di mappe né una di proiezioni. Mercatore
 * sferica, la stessa delle mappe web, così la sagoma è quella che chi legge si
 * aspetta.
 *
 * 4. **La semplificazione è dichiarata, non nascosta.** Douglas–Peucker con
 * tolleranza in pixel della tela, più lo scarto degli anelli minuscoli: senza,
 * il file pesa dieci volte tanto per isolotti che a schermo sono mezzo pixel.
 * Tolleranza e soglia finiscono dentro il JSON, perché *quanto è approssimato
 * questo confine* è una domanda legittima e la risposta non deve stare solo
 * qui.
 *
 * ⚠️ **I confini non sono un parametro normativo.** Nessuna aliquota passa da
 * questo file: qui c'è solo la forma degli enti. Le aliquote restano in
 * `data/mef/regioni-2026.json`, e le due cose si incontrano in pagina tenendo
 * il nome MEF come chiave.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const QUI = dirname(fileURLToPath(import.meta.url))
const RADICE = resolve(QUI, '..')
const FONTI = resolve(RADICE, '..', 'Fonti')
const USCITA = join(RADICE, 'data', 'geo')

const ANNO_IMPOSTA = 2026
const ESTRATTO_IL = '2026-08-31'

/** La larghezza della tela. Le coordinate del path sono in queste unità. */
const LARGHEZZA = 1000

/**
 * Douglas–Peucker: distanza massima ammessa fra il confine vero e quello
 * disegnato, in pixel di tela. A 0,8 su mille, un confine mostrato a 600px di
 * larghezza sbaglia meno di mezzo pixel.
 */
const TOLLERANZA = 0.8

/**
 * Area minima di un anello perché sopravviva, in pixel quadrati di tela.
 * Sotto questa soglia c'è un isolotto che a schermo non copre un pixel: tenerlo
 * costa byte e non aggiunge niente da vedere. Pantelleria e le Egadi passano;
 * gli scogli no.
 */
const AREA_MINIMA = 3

/**
 * Da `reg_name` ISTAT al nome del prospetto MEF.
 *
 * Il Trentino-Alto Adige non c'è, ed è la regola 1: la sua riga viene scartata
 * e al suo posto entrano le due province.
 */
const ENTE_PER_REGIONE = {
  Abruzzo: 'REGIONE ABRUZZO',
  Basilicata: 'REGIONE BASILICATA',
  Calabria: 'REGIONE CALABRIA',
  Campania: 'REGIONE CAMPANIA',
  'Emilia-Romagna': 'REGIONE EMILIA-ROMAGNA',
  'Friuli-Venezia Giulia': 'REGIONE FRIULI VENEZIA GIULIA',
  Lazio: 'REGIONE LAZIO',
  Liguria: 'REGIONE LIGURIA',
  Lombardia: 'REGIONE LOMBARDIA',
  Marche: 'REGIONE MARCHE',
  Molise: 'REGIONE MOLISE',
  Piemonte: 'REGIONE PIEMONTE',
  Puglia: 'REGIONE PUGLIA',
  Sardegna: 'REGIONE SARDEGNA',
  Sicilia: 'REGIONE SICILIA',
  Toscana: 'REGIONE TOSCANA',
  Umbria: 'REGIONE UMBRIA',
  "Valle d'Aosta/Vallée d'Aoste": "REGIONE VALLE D'AOSTA",
  Veneto: 'REGIONE VENETO',
}

/** Da `prov_name` ISTAT al nome del prospetto, per le due Province autonome. */
const ENTE_PER_PROVINCIA = {
  'Bolzano/Bozen': 'PROVINCIA AUTONOMA DI BOLZANO',
  Trento: 'PROVINCIA AUTONOMA DI TRENTO',
}

const REGIONE_DA_SCARTARE = 'Trentino-Alto Adige/Südtirol'

// --- lettura ----------------------------------------------------------------

const leggi = (file) => JSON.parse(readFileSync(join(FONTI, file), 'utf8'))

const FILE_REGIONI = 'limits_IT_regions.geojson'
const FILE_PROVINCE = 'limits_IT_provinces.geojson'

const regioni = leggi(FILE_REGIONI)
const province = leggi(FILE_PROVINCE)

/**
 * Le sagome scelte, già appaiate al nome MEF.
 *
 * ⚠️ Il conto delle regioni scartate si verifica invece di assumerlo: se
 * ISTAT rinominasse il Trentino-Alto Adige, senza questo controllo la mappa
 * perderebbe una sagoma in silenzio e ne guadagnerebbe due sovrapposte.
 */
const daRegioni = regioni.features.filter((f) => f.properties.reg_name !== REGIONE_DA_SCARTARE)
if (regioni.features.length - daRegioni.length !== 1) {
  throw new Error(
    `Attese 20 regioni con una sola da scartare (${REGIONE_DA_SCARTARE}), trovate ${regioni.features.length} con ${regioni.features.length - daRegioni.length} scarti`,
  )
}

const daProvince = province.features.filter((f) => f.properties.prov_name in ENTE_PER_PROVINCIA)
if (daProvince.length !== 2) {
  throw new Error(`Attese le due Province autonome, trovate ${daProvince.length}`)
}

const scelti = [
  ...daRegioni.map((f) => {
    const nome = ENTE_PER_REGIONE[f.properties.reg_name]
    if (!nome) throw new Error(`Regione ISTAT senza ente MEF: «${f.properties.reg_name}»`)
    return { nome, geometria: f.geometry }
  }),
  ...daProvince.map((f) => ({
    nome: ENTE_PER_PROVINCIA[f.properties.prov_name],
    geometria: f.geometry,
  })),
]

// --- proiezione -------------------------------------------------------------

/**
 * Mercatore sferica. In ingresso gradi WGS84, in uscita unità di proiezione:
 * la scala e la traslazione arrivano dopo, dal riquadro di tutti gli enti presi
 * insieme.
 */
const mercatore = ([lon, lat]) => [
  (lon * Math.PI) / 180,
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
]

/** `Polygon` e `MultiPolygon` differiscono di un livello di annidamento. */
const poligoni = (geometria) =>
  geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates

let xMin = Infinity
let yMin = Infinity
let xMax = -Infinity
let yMax = -Infinity

for (const { geometria } of scelti) {
  for (const poligono of poligoni(geometria)) {
    for (const anello of poligono) {
      for (const punto of anello) {
        const [x, y] = mercatore(punto)
        if (x < xMin) xMin = x
        if (x > xMax) xMax = x
        if (y < yMin) yMin = y
        if (y > yMax) yMax = y
      }
    }
  }
}

const scala = LARGHEZZA / (xMax - xMin)
const ALTEZZA = Math.round((yMax - yMin) * scala)

/** La y si ribalta: in proiezione cresce verso nord, sulla tela verso il basso. */
const proietta = (punto) => {
  const [x, y] = mercatore(punto)
  return [(x - xMin) * scala, (yMax - y) * scala]
}

// --- semplificazione --------------------------------------------------------

/** Area di un anello con la formula del laccio delle scarpe, in segno assoluto. */
const area = (anello) => {
  let doppia = 0
  for (let i = 0, j = anello.length - 1; i < anello.length; j = i++) {
    doppia += anello[j][0] * anello[i][1] - anello[i][0] * anello[j][1]
  }
  return Math.abs(doppia / 2)
}

/** Distanza al quadrato fra un punto e il segmento `a`–`b`. Senza radici: si confronta. */
const distanzaAlQuadrato = (punto, a, b) => {
  let [x, y] = a
  const dx = b[0] - x
  const dy = b[1] - y
  if (dx !== 0 || dy !== 0) {
    const t = ((punto[0] - x) * dx + (punto[1] - y) * dy) / (dx * dx + dy * dy)
    if (t > 1) {
      ;[x, y] = b
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }
  return (punto[0] - x) ** 2 + (punto[1] - y) ** 2
}

/**
 * Douglas–Peucker ricorsivo.
 *
 * Tiene il punto più lontano dalla corda finché quella distanza supera la
 * tolleranza, scarta tutto il resto. È l'algoritmo che preserva le punte —
 * il Gargano, il Salento, la Calabria — invece di smussarle come farebbe una
 * media mobile.
 */
const semplifica = (punti, tolleranzaAlQuadrato) => {
  if (punti.length < 3) return punti
  let massima = 0
  let indice = 0
  for (let i = 1; i < punti.length - 1; i++) {
    const d = distanzaAlQuadrato(punti[i], punti[0], punti[punti.length - 1])
    if (d > massima) {
      massima = d
      indice = i
    }
  }
  if (massima <= tolleranzaAlQuadrato) return [punti[0], punti[punti.length - 1]]
  return [
    ...semplifica(punti.slice(0, indice + 1), tolleranzaAlQuadrato).slice(0, -1),
    ...semplifica(punti.slice(indice), tolleranzaAlQuadrato),
  ]
}

const tolleranzaAlQuadrato = TOLLERANZA * TOLLERANZA

let anelliTenuti = 0
let anelliScartati = 0
let puntiPrima = 0
let puntiDopo = 0

const enti = scelti
  .map(({ nome, geometria }) => {
    const pezzi = []
    for (const poligono of poligoni(geometria)) {
      for (const anello of poligono) {
        const proiettato = anello.map(proietta)
        puntiPrima += proiettato.length
        if (area(proiettato) < AREA_MINIMA) {
          anelliScartati += 1
          continue
        }
        const ridotto = semplifica(proiettato, tolleranzaAlQuadrato)
        anelliTenuti += 1
        puntiDopo += ridotto.length
        pezzi.push(
          `M${ridotto.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`,
        )
      }
    }
    if (pezzi.length === 0) throw new Error(`Ente «${nome}» rimasto senza sagoma`)
    return { nome, path: pezzi.join('') }
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))

// --- verifica contro il prospetto MEF ---------------------------------------

/**
 * ⚠️ Il confronto è d'insieme e simmetrico: non basta che ogni sagoma trovi
 * un ente, deve valere anche il contrario. Un ente del prospetto senza sagoma
 * sarebbe una regione che in pagina non si può cliccare.
 */
const datiRegioni = JSON.parse(readFileSync(join(RADICE, 'data', 'mef', 'regioni-2026.json'), 'utf8'))
const attesi = new Set(datiRegioni.enti.map((e) => e.nome))
const ottenuti = new Set(enti.map((e) => e.nome))

const senzaSagoma = [...attesi].filter((n) => !ottenuti.has(n))
const senzaEnte = [...ottenuti].filter((n) => !attesi.has(n))
if (senzaSagoma.length > 0 || senzaEnte.length > 0) {
  throw new Error(
    `I nomi non combaciano con data/mef/regioni-2026.json.\n  enti senza sagoma: ${senzaSagoma.join(', ') || '—'}\n  sagome senza ente: ${senzaEnte.join(', ') || '—'}`,
  )
}

// --- scrittura --------------------------------------------------------------

const file = {
  provenienza: {
    origine:
      'ISTAT — confini amministrativi, vintage 1° gennaio 2026, in WGS84 (EPSG:4326)',
    redistribuzione:
      'openpolis/geojson-italy, che redistribuisce i confini ISTAT senza modificarli',
    licenza:
      'CC BY 4.0. L\'attribuzione a ISTAT va mantenuta da chi redistribuisce, e per questo compare in pagina accanto alla mappa.',
    annoImposta: ANNO_IMPOSTA,
    estrattoIl: ESTRATTO_IL,
    generatoDa: 'scripts/importa-geometrie.mjs',
    avvertenza:
      'Confini amministrativi, non parametri normativi: qui non c\'è nessuna aliquota. Le aliquote stanno in data/mef/regioni-2026.json e le due cose si legano per nome dell\'ente.',
  },
  artefatti: {
    regioni: { file: FILE_REGIONI, righe: regioni.features.length, estrattoIl: ESTRATTO_IL },
    province: { file: FILE_PROVINCE, righe: province.features.length, estrattoIl: ESTRATTO_IL },
  },
  regolaDiSelezione:
    'Diciannove regioni più le due Province autonome, prese dal file provinciale: il Trentino-Alto Adige è scartato perché come ente impositore dell\'addizionale regionale non esiste, e la deliberano separatamente Trento e Bolzano (Fonti §11). Le sagome sono ventuno come le righe del prospetto MEF, e i nomi sono verificati uno a uno contro quel file.',
  proiezione: {
    nome: 'Mercatore sferica',
    fattaIn: 'scripts/importa-geometrie.mjs — al client arrivano path, non coordinate (D-078)',
    viewBox: `0 0 ${LARGHEZZA} ${ALTEZZA}`,
  },
  semplificazione: {
    algoritmo: 'Douglas–Peucker',
    tolleranzaPx: TOLLERANZA,
    areaMinimaPx2: AREA_MINIMA,
    nota: `Su una tela larga ${LARGHEZZA}, il confine disegnato dista dal confine ISTAT al più ${String(TOLLERANZA).replace('.', ',')} px. Gli anelli sotto ${AREA_MINIMA} px² — scogli e isolotti — non sono disegnati.`,
    anelliTenuti,
    anelliScartati,
    puntiPrima,
    puntiDopo,
  },
  viewBox: `0 0 ${LARGHEZZA} ${ALTEZZA}`,
  enti,
}

mkdirSync(USCITA, { recursive: true })
const json = `${JSON.stringify(file, null, 1)}\n`
writeFileSync(join(USCITA, 'enti-2026.json'), json, 'utf8')

// --- a schermo --------------------------------------------------------------

const peso = { grezzo: Buffer.byteLength(json, 'utf8'), gzip: gzipSync(json).length }

process.stdout.write('\nGEOMETRIE — data/geo/enti-2026.json\n\n')
process.stdout.write(`  enti                 ${enti.length} (attesi ${attesi.size})\n`)
process.stdout.write(`  viewBox              0 0 ${LARGHEZZA} ${ALTEZZA}\n`)
process.stdout.write(`  anelli               ${anelliTenuti} tenuti, ${anelliScartati} scartati sotto ${AREA_MINIMA} px²\n`)
process.stdout.write(`  punti                ${puntiPrima} → ${puntiDopo} (${((1 - puntiDopo / puntiPrima) * 100).toFixed(1)}% in meno)\n`)
process.stdout.write(
  `  peso                 ${(peso.grezzo / 1024).toFixed(1)} KiB grezzo, ${(peso.gzip / 1024).toFixed(1)} KiB gzip\n\n`,
)
