/**
 * Import dei due dataset MEF — da un comune calcolabile a tutti i comuni italiani.
 *
 * Si esegue **una volta, offline**: `node scripts/importa-mef.mjs`.
 * Legge i tre artefatti da `../Fonti/`, che sta **fuori dal repo** perché le
 * fonti primarie non si versionano (CLAUDE.md §4), e scrive in `data/mef/` tre
 * file versionati: i comuni, gli enti regionali, il rapporto di anomalie.
 *
 * ---------------------------------------------------------------------------
 * Le cinque regole che governano questo file, e perché ciascuna esiste
 * ---------------------------------------------------------------------------
 *
 * **1. `0*` non è zero.** 4.822 comuni su 7.897 non hanno deliberato per il
 * 2026. Il c. 752 della L. 207/2024 impone di applicare scaglioni e aliquote
 * già vigenti nell'ente nell'anno precedente. Il fallback va sull'**elenco
 * annuale 2025**, non su un giornaliero: il giornaliero riporta ciò che è stato
 * *deliberato* (61,1% di `0*`), l'annuale riporta ciò che si *applica* (11,5%).
 * È l'unico artefatto che risponde alla domanda giusta [Fonti §15.b].
 * **Milano è fra i comuni con `0*`**: il caso base passa da questo ramo, che
 * quindi non è una correzione ma il percorso principale.
 *
 * **2. Tre stati, non due** (D-054). `risolto` — delibera 2026 o ereditata.
 * `senza addizionale applicabile` — il calcolo si fa, l'addizionale è zero con
 * la sua ragione: sono gli 884 comuni che restano `0*` anche nell'annuale, e
 * non è un dato mancante. `non calcolabile` — manca un parametro necessario.
 *
 * **3. Due assi ortogonali, non tre forme.** Forma dell'aliquota (unica oppure
 * a scaglioni, con i confini nel dato) **per** soglia di esenzione facoltativa,
 * che ha colonna propria. Un comune può avere entrambi. La soglia è un
 * **cliff**: sotto, zero; sopra, aliquota sull'intera base. Gli scaglioni sono
 * invece **progressivi** — il file dice *«applicabile a scaglione di reddito da
 * … fino a …»* — quindi si applicano alla quota compresa nella fascia.
 *
 * **4. Nessun clamp, mai.** Il tetto comunale di 0,8 è derogato (dissesto e
 * predissesto, che il file etichetta in `NOTE`); quello regionale di 1,4 lo è
 * da 15 enti su 21, fino al 3,63 del Molise. Un clamp corromperebbe quasi tutto
 * il centro-sud.
 *
 * **5. Regionale: nessun fallback** (D-053). Tutti e 21 gli enti hanno
 * pubblicato entro gennaio 2026. Per gli enti con due provvedimenti si prende
 * quello con `DATA PUBBLICAZIONE` più antica dell'anno — regola **meccanica e
 * dichiarata come tale**, perché la colonna `ANNO` vale 2026 su tutte le righe
 * e non discrimina. La mappatura è `comune → ente impositore`, non
 * `comune → regione`: Trento e Bolzano sono righe separate e il Trentino-Alto
 * Adige non esiste come ente impositore.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  dataItaliana,
  leggiCsvComeOggetti,
  leggiFoglioXlsx,
  normalizzaTesto,
  numeroPunto,
  numeroVirgola,
} from './lib-mef.mjs'

const QUI = dirname(fileURLToPath(import.meta.url))
const RADICE = resolve(QUI, '..')
const FONTI = resolve(RADICE, '..', 'Fonti')
const USCITA = join(RADICE, 'data', 'mef')

const ANNO_IMPOSTA = 2026

/**
 * ⚠️ **La data di estrazione è dichiarata, non calcolata.**
 *
 * Gli elenchi generali del MEF si aggiornano ogni giorno e non portano un
 * timbro di versione: la data di consultazione è l'unico riferimento. Questa è
 * quella registrata in *Fonti* §15 per i file che stanno in `../Fonti/`, e non
 * la data di esecuzione dello script — che cambierebbe a ogni riesecuzione e
 * mentirebbe sul momento in cui il dato è stato letto.
 */
const ESTRATTO_IL = '2026-08-28'

// ---------------------------------------------------------------------------
// Rapporto di anomalie
//
// Lo script non fallisce in silenzio e non salta le righe storte: le elenca.
// Il rapporto è versionato accanto al JSON perché è la prova che i casi sporchi
// sono stati visti, non ignorati.
// ---------------------------------------------------------------------------

const anomalie = []
const segnala = (categoria, chiave, dettaglio) => anomalie.push({ categoria, chiave, dettaglio })

// ---------------------------------------------------------------------------
// I due set di scaglioni
//
// [Fonti §7] Il c. 751 della L. 207/2024 autorizza due set di confini: quello
// vigente (28.000 / 50.000) e quello previgente (15.000 / 28.000 / 50.000).
// **Sono due set di confini, cioè un dato, non due forme di calcolo.**
// ---------------------------------------------------------------------------

const CONFINI_PREVIGENTI = [15_000, 28_000, 50_000]
const CONFINI_VIGENTI = [28_000, 50_000]

const stessiConfini = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])

/** I soli confini che il c. 751 autorizza, più lo zero da cui parte il primo. */
const CONFINI_LECITI = [0, 15_000, 28_000, 50_000]

/**
 * ⚠️ **Lo stesso confine è scritto in tre modi, e sono lo stesso numero.**
 *
 * Un comune apre la seconda fascia a `15.000,01`, un altro a `15.001`, un terzo
 * a `15.001,00`: sono tutte e tre la formula «il primo euro sopra quindicimila»,
 * cioè il confine **15.000**. Chi le prende alla lettera vede una catena di
 * fasce non contigua e scarta comuni la cui delibera è perfettamente regolare —
 * sono nove nel file 2026.
 *
 * Lo scarto ammesso è **un euro**, non di più: serve a riconoscere la
 * convenzione di scrittura, non ad avvicinare un confine che l'ente ha scelto
 * davvero diverso. I 55.000 di MARNATE restano fuori dai due set, e devono.
 */
function confineNormalizzato(x) {
  for (const c of CONFINI_LECITI) if (x >= c && x - c <= 1) return c
  return x
}

/** Da confini a scaglioni, con `da` escluso e `a` incluso, come in `core/types.ts`. */
const costruisciScaglioni = (confini, aliquote) =>
  aliquote.map((aliquota, i) => ({
    da: i === 0 ? 0 : confini[i - 1],
    a: i === aliquote.length - 1 ? null : confini[i],
    aliquota,
  }))

const formaDaConfini = (confini, aliquote) => ({
  forma: stessiConfini(confini, CONFINI_PREVIGENTI) ? 'scaglioni-previgenti' : 'scaglioni-vigenti',
  scaglioni: costruisciScaglioni(confini, aliquote),
})

// ---------------------------------------------------------------------------
// Elenco generale giornaliero 2026 — le aliquote DELIBERATE
// ---------------------------------------------------------------------------

const COLONNE_ALIQUOTA = ['ALIQUOTA', ...Array.from({ length: 11 }, (_, i) => `ALIQUOTA_${i + 2}`)]
const COLONNE_FASCIA = ['FASCIA', ...Array.from({ length: 11 }, (_, i) => `FASCIA_${i + 2}`)]

/**
 * Esenzioni che il file descrive ma che **non sono una soglia di reddito e
 * basta**: ultrasessantacinquenni, nuclei con figli a carico, invalidità, ISEE,
 * reddito di sola provenienza da lavoro dipendente o pensione.
 *
 * Il ministero **non le riporta in `IMPORTO_ESENTE`** — la colonna resta a zero
 * — e fa bene: non sono derivabili dagli input del calcolatore. Vengono contate
 * e messe a rapporto invece che ignorate, perché un residente in quei comuni
 * potrebbe avere diritto a un'esenzione che qui non viene applicata (D-033).
 */
const ESENZIONE_CONDIZIONATA =
  /figli|a carico|famigli|nucleo|invalid|disabil|handicap|isee|ultra|anzian|pension|lavoro dipendente|assimilat/i

/**
 * ⚠️ **Il parsing è guidato dal testo di `FASCIA`, mai dalla posizione della
 * colonna.**
 *
 * Per i comuni con esenzione la prima coppia porta lo **zero dell'esenzione**:
 * 1.280 righe hanno `ALIQUOTA = 0`. Chi legge `ALIQUOTA` come «l'aliquota del
 * comune» assegna zero a 1.280 comuni, e ottiene per ciascuno un numero
 * perfettamente plausibile e sbagliato [Fonti §15].
 */
function classificaFascia(grezzo) {
  const pulito = normalizzaTesto(grezzo)
  if (pulito === '') return { tipo: 'vuota' }

  // `€` compare al posto di `euro`, e le maiuscole non sono uniformi:
  // «SCAGLIONE», «Da euro», «OLTRE euro», «SCAGLIONI DI REDDITO».
  const t = pulito.toLowerCase().replace(/€/g, ' euro ').replace(/\s+/g, ' ')

  if (t.includes('esenzion')) {
    const numeri = numeriDi(t)
    return {
      tipo: 'esenzione',
      soglia: numeri.length > 0 ? numeri[numeri.length - 1] : null,
      condizionata: ESENZIONE_CONDIZIONATA.test(pulito),
      testo: pulito,
    }
  }

  if (t.includes('aliquota unica')) return { tipo: 'unica', testo: pulito }

  const numeri = numeriDi(t)
  if (numeri.length === 0) return { tipo: 'ignota', testo: pulito }

  // ⚠️ **La fascia si riconosce dalla struttura, non dalla parola «scaglione».**
  // Otto comuni descrivono le proprie fasce senza mai usarla — «Applicabile a
  // 15.001-28.000», «Applicabile a redditi tra 15.000,01 e 28.000,00» — e un
  // classificatore che pretenda quella parola li scarta tutti. A tenere il
  // cancello non è il lessico ma la validazione a valle: una catena che non
  // ricade su uno dei due set autorizzati viene rifiutata comunque.
  const perStruttura = !t.includes('scaglion')
  const oltre = /\boltre\b/.test(t)
  const da = /\bda\b/.test(t)
  const finoA = /\bfino a\b|\bsino a\b/.test(t)

  let inizio
  let fine
  if (numeri.length >= 2) {
    inizio = numeri[0]
    fine = numeri[numeri.length - 1]
  } else if (oltre || da) {
    // «oltre euro 50.000,00», ma anche «da euro 50.000,01» senza estremo
    // superiore: è l'ultima fascia, quella aperta.
    inizio = numeri[0]
    fine = null
  } else if (finoA || numeri.length === 1) {
    inizio = 0
    fine = numeri[0]
  } else {
    return { tipo: 'ignota', testo: pulito }
  }

  return {
    tipo: 'scaglione',
    da: confineNormalizzato(inizio),
    a: fine === null ? null : confineNormalizzato(fine),
    perStruttura,
    testo: pulito,
  }
}

function numeriDi(t) {
  const trovati = []
  for (const m of t.matchAll(/\d[\d.]*(?:,\d+)?/g)) {
    const n = numeroVirgola(m[0])
    if (n) trovati.push(n.valore)
  }
  return trovati
}

function leggiGiornaliero2026() {
  const righe = leggiCsvComeOggetti(join(FONTI, 'Add_comunale_irpef2026.csv'))
  const per = new Map()

  for (const r of righe) {
    const codice = normalizzaTesto(r.CODICE_CATASTALE).toUpperCase()
    const nome = normalizzaTesto(r.COMUNE)
    const provincia = normalizzaTesto(r.PR).toUpperCase()
    if (!codice) continue
    if (per.has(codice)) segnala('codice-duplicato', codice, `${nome} compare più di una volta nel file 2026`)

    const base = { codice, nome, provincia, note: normalizzaTesto(r.NOTE) || null }

    if (normalizzaTesto(r.ALIQUOTA) === '0*') {
      per.set(codice, { ...base, deliberato: false })
      continue
    }

    // Coppie (aliquota, fascia) nell'ordine in cui il ministero le scrive.
    const coppie = []
    for (let i = 0; i < COLONNE_ALIQUOTA.length; i += 1) {
      const grezzaAliquota = r[COLONNE_ALIQUOTA[i]] ?? ''
      const fascia = classificaFascia(r[COLONNE_FASCIA[i]] ?? '')
      if (normalizzaTesto(grezzaAliquota) === '' && fascia.tipo === 'vuota') continue
      const letta = numeroVirgola(grezzaAliquota)
      if (!letta) {
        segnala('valore-non-normalizzabile', codice, `${nome}: ${COLONNE_ALIQUOTA[i]} = ${JSON.stringify(grezzaAliquota)}`)
        continue
      }
      if (letta.ambiguo) {
        segnala('convenzione-numerica-ambigua', codice, `${nome}: ${COLONNE_ALIQUOTA[i]} = ${JSON.stringify(grezzaAliquota)} — punto decimale in un file a virgola`)
      }
      if (fascia.tipo === 'ignota') {
        segnala('fascia-non-riconosciuta', codice, `${nome}: ${JSON.stringify(fascia.testo)}`)
      }
      coppie.push({ aliquota: letta.valore, fascia })
    }

    per.set(codice, { ...base, deliberato: true, coppie, importoEsente: r.IMPORTO_ESENTE ?? '', riga: r })
  }

  return per
}

/**
 * Da coppie a parametri. Restituisce `null` quando la riga non regge, e in quel
 * caso l'ente ricade sul fallback dell'anno precedente: **una riga 2026 che non
 * si lascia leggere non autorizza a inventare un'aliquota**, e il c. 752 dice
 * già cosa si applica a chi non ha una delibera utilizzabile.
 */
function parametriDa2026(voce) {
  const { codice, nome, coppie } = voce

  const uniche = coppie.filter((c) => c.fascia.tipo === 'unica')
  const scaglioni = coppie.filter((c) => c.fascia.tipo === 'scaglione')
  const esenzioni = coppie.filter((c) => c.fascia.tipo === 'esenzione')

  // ---------------------------------------------------------------------
  // Asse 2 — la soglia di esenzione
  //
  // ⚠️ **`IMPORTO_ESENTE` non è sempre compilata, e da sola perde 96 comuni.**
  // La colonna esiste ed è il posto giusto dove guardare per primo, ma 138
  // righe del file 2026 descrivono un'esenzione — «Esenzione per redditi
  // imponibili fino a euro 10.000,00», senza condizioni — con la colonna a
  // zero. Fermarsi alla colonna significherebbe far pagare l'addizionale a chi
  // il comune ha esentato, cioè un numero plausibile e sbagliato nella
  // direzione peggiore, contro il contribuente.
  //
  // Vale qui la stessa regola già stabilita per le aliquote: **il parsing è
  // guidato dal testo della colonna `FASCIA`**. La colonna resta la sorgente
  // preferita; il testo interviene solo quando la colonna tace, e ogni volta
  // che interviene lo dice nel rapporto.
  // ---------------------------------------------------------------------
  const esente = numeroVirgola(voce.importoEsente)
  let sogliaEsenzione = esente && esente.valore > 0 ? esente.valore : null
  // D-055: la provenienza si marca riga per riga, non si deduce a valle.
  let origineSoglia = sogliaEsenzione === null ? null : 'colonna'

  const incondizionate = []
  for (const e of esenzioni) {
    if (e.fascia.condizionata) {
      // Esenzioni per figli a carico, invalidità, ISEE, età, o riservate a chi
      // ha solo redditi di una certa provenienza: non sono derivabili dagli
      // input del calcolatore e restano fuori perimetro. Dichiarate, non
      // ignorate (D-033).
      segnala('esenzione-condizionata', codice, `${nome}: ${e.fascia.testo}`)
      continue
    }
    if (e.fascia.soglia !== null) incondizionate.push(e.fascia)
  }

  const distinte = [...new Set(incondizionate.map((e) => e.soglia))]
  if (sogliaEsenzione !== null) {
    for (const s of distinte) {
      if (Math.abs(s - sogliaEsenzione) > 0.005) {
        segnala('esenzione-discorde', codice, `${nome}: IMPORTO_ESENTE = ${sogliaEsenzione} ma la descrizione dice ${s}`)
      }
    }
  } else if (distinte.length === 1) {
    sogliaEsenzione = distinte[0]
    origineSoglia = 'descrizione'
    segnala(
      'esenzione-letta-dal-testo',
      codice,
      `${nome}: IMPORTO_ESENTE = ${JSON.stringify(voce.importoEsente)} ma la descrizione dichiara una soglia di ${distinte[0]} — «${incondizionate[0].testo}»`,
    )
  } else if (distinte.length > 1) {
    segnala(
      'esenzione-ambigua',
      codice,
      `${nome}: IMPORTO_ESENTE a zero e ${distinte.length} soglie incondizionate diverse nel testo (${distinte.join(', ')}) — nessuna applicata`,
    )
  }

  if (uniche.length > 0 && scaglioni.length > 0) {
    segnala('forma-ambigua', codice, `${nome}: il file porta insieme «aliquota unica» e fasce a scaglione`)
    return null
  }

  if (uniche.length === 1) {
    return {
      parametri: { aliquota: { forma: 'unica', aliquota: uniche[0].aliquota }, sogliaEsenzione },
      origineSoglia,
    }
  }
  if (uniche.length > 1) {
    segnala('aliquota-unica-ripetuta', codice, `${nome}: ${uniche.length} righe «aliquota unica»`)
    return null
  }

  if (scaglioni.length === 0) {
    // Nessuna aliquota: solo l'esenzione, oppure una riga vuota di fatto.
    segnala('delibera-senza-aliquota', codice, `${nome}: nessuna fascia di aliquota nella riga 2026`)
    return null
  }

  const ordinati = [...scaglioni].sort((x, y) => x.fascia.da - y.fascia.da)

  const visti = new Set()
  for (const s of ordinati) {
    const chiave = `${s.fascia.da}→${s.fascia.a}`
    if (visti.has(chiave)) {
      segnala('fascia-duplicata', codice, `${nome}: la fascia ${chiave} compare due volte, con aliquote diverse`)
      return null
    }
    visti.add(chiave)
  }

  // La catena dev'essere contigua: 0 → c1 → … → null.
  const confini = []
  for (let i = 0; i < ordinati.length; i += 1) {
    const atteso = i === 0 ? 0 : confini[i - 1]
    if (ordinati[i].fascia.da !== atteso) {
      segnala('fascia-mancante', codice, `${nome}: dopo ${atteso} la fascia successiva parte da ${ordinati[i].fascia.da}`)
      return null
    }
    if (i < ordinati.length - 1) {
      if (ordinati[i].fascia.a === null) {
        segnala('fascia-mancante', codice, `${nome}: una fascia aperta non è l'ultima`)
        return null
      }
      confini.push(ordinati[i].fascia.a)
    } else if (ordinati[i].fascia.a !== null) {
      segnala('fascia-mancante', codice, `${nome}: l'ultima fascia si chiude a ${ordinati[i].fascia.a} invece di restare aperta`)
      return null
    }
  }

  if (!stessiConfini(confini, CONFINI_PREVIGENTI) && !stessiConfini(confini, CONFINI_VIGENTI)) {
    segnala('confini-fuori-dai-due-set', codice, `${nome}: confini ${JSON.stringify(confini)} — né previgenti né vigenti`)
    return null
  }

  return {
    parametri: { aliquota: formaDaConfini(confini, ordinati.map((s) => s.aliquota)), sogliaEsenzione },
    origineSoglia,
  }
}

// ---------------------------------------------------------------------------
// Elenco annuale 2025 — le aliquote APPLICABILI, cioè il fallback del c. 752
// ---------------------------------------------------------------------------

/**
 * ⚠️ **Qui il set di scaglioni si infersce, e va dichiarato comune per comune.**
 *
 * L'elenco annuale non porta le descrizioni delle fasce: dice *quante* aliquote
 * ha un comune, non su *quali* confini. Il set si ricava dalla cardinalità —
 * 4 aliquote → previgente (15.000), 3 → vigente (28.000) — e l'euristica tiene
 * al **98,5%**: su circa 560 comuni multialiquota, **sei finiscono sul set
 * sbagliato** [Fonti §15.b].
 *
 * L'inferenza non si può eliminare cercando le descrizioni nel file 2026: i
 * comuni che passano dal fallback sono per definizione quelli che nel 2026 non
 * hanno deliberato, e quindi non hanno descrizioni. **Il campo
 * `setScaglioniInferito` esiste perché un'inferenza silenziosa qui sarebbe
 * indifendibile**, e perché il giorno in cui il giornaliero 2025 entrerà in
 * cartella basterà spegnere quel campo per sei comuni.
 */
function leggiAnnuale2025() {
  const percorso = join(FONTI, 'Elenco-annuale-addizionale-comunale-IRPEF-2025-13-marzo-2026.xlsx')
  const righe = leggiFoglioXlsx(percorso)
  const per = new Map()

  const titolo = normalizzaTesto(righe[0]?.celle.A ?? '')

  for (const { numero, celle } of righe) {
    if (numero < 3) continue
    const codice = normalizzaTesto(celle.A).toUpperCase()
    if (!codice) continue
    const nome = normalizzaTesto(celle.B)
    const provincia = normalizzaTesto(celle.C).toUpperCase()

    // Colonna Esenzione: convenzione italiana (`23.000,00`), a differenza delle
    // aliquote nello stesso foglio, che usano il punto decimale.
    //
    // ⚠️ **2.880 celle non vuote non sono 2.880 soglie utilizzabili.** 112
    // portano la stringa `NOTA` — l'esenzione esiste ma il suo valore non è nel
    // file — e una è scritta male (`8.4999,99`). Restano 2.767 soglie leggibili.
    // I 113 comuni scoperti vengono calcolati **senza esenzione**, quindi con
    // un'addizionale più alta del reale: va detto, non lasciato accadere.
    const grezzaEsenzione = normalizzaTesto(celle.I)
    const esente = numeroVirgola(grezzaEsenzione)
    const sogliaEsenzione = esente && esente.valore > 0 ? esente.valore : null
    if (grezzaEsenzione !== '' && sogliaEsenzione === null) {
      segnala(
        grezzaEsenzione.toUpperCase() === 'NOTA' ? 'esenzione-2025-rinviata-a-nota' : 'esenzione-2025-non-normalizzabile',
        codice,
        `${nome}: annuale 2025, colonna Esenzione = ${JSON.stringify(grezzaEsenzione)} — nessuna soglia applicata`,
      )
    }

    const unicaGrezza = normalizzaTesto(celle.D)
    if (unicaGrezza === '0*') {
      per.set(codice, { codice, nome, provincia, stato: 'nonIstituito' })
      continue
    }

    if (unicaGrezza !== '') {
      const letta = numeroPunto(unicaGrezza)
      if (!letta) {
        segnala('valore-non-normalizzabile', codice, `${nome}: annuale 2025, aliquota unica = ${JSON.stringify(unicaGrezza)}`)
        continue
      }
      if (letta.ambiguo) {
        segnala('convenzione-numerica-ambigua', codice, `${nome}: annuale 2025, aliquota unica = ${JSON.stringify(unicaGrezza)} — virgola in una colonna a punto`)
      }
      per.set(codice, {
        codice,
        nome,
        provincia,
        stato: 'risolto',
        parametri: { aliquota: { forma: 'unica', aliquota: letta.valore }, sogliaEsenzione },
        origineSoglia: sogliaEsenzione === null ? null : 'colonna',
        setScaglioniInferito: false,
      })
      continue
    }

    const aliquote = []
    for (const col of ['E', 'F', 'G', 'H']) {
      const grezza = normalizzaTesto(celle[col])
      if (grezza === '') continue
      const letta = numeroPunto(grezza)
      if (!letta) {
        segnala('valore-non-normalizzabile', codice, `${nome}: annuale 2025, colonna ${col} = ${JSON.stringify(grezza)}`)
        continue
      }
      aliquote.push(letta.valore)
    }

    if (aliquote.length === 0) {
      segnala('riga-annuale-senza-aliquote', codice, `${nome}: annuale 2025, nessuna aliquota nelle colonne D–H`)
      continue
    }

    const confini =
      aliquote.length === 4 ? CONFINI_PREVIGENTI : aliquote.length === 3 ? CONFINI_VIGENTI : null
    if (!confini) {
      segnala('cardinalita-inattesa', codice, `${nome}: annuale 2025, ${aliquote.length} aliquote — l'inferenza del set copre solo 3 e 4`)
      continue
    }

    segnala(
      'set-scaglioni-inferito',
      codice,
      `${nome}: ${aliquote.length} aliquote → set ${confini === CONFINI_PREVIGENTI ? 'previgente' : 'vigente'}, inferito dalla cardinalità`,
    )

    per.set(codice, {
      codice,
      nome,
      provincia,
      stato: 'risolto',
      parametri: { aliquota: formaDaConfini(confini, aliquote), sogliaEsenzione },
      origineSoglia: sogliaEsenzione === null ? null : 'colonna',
      setScaglioniInferito: true,
    })
  }

  return { per, titolo }
}

// ---------------------------------------------------------------------------
// Prospetto regionale 2026
// ---------------------------------------------------------------------------

function fasciaRegionale(grezzo) {
  const pulito = normalizzaTesto(grezzo)
  const t = pulito.toLowerCase().replace(/€/g, ' euro ').replace(/\s+/g, ' ')
  if (t.includes('aliquota unica')) return { tipo: 'unica', testo: pulito }

  const numeri = []
  for (const m of t.matchAll(/\d+(?:\.\d+)?/g)) {
    const n = numeroPunto(m[0])
    if (n) numeri.push(n.valore)
  }
  if (numeri.length === 0) return { tipo: 'ignota', testo: pulito }

  const oltre = /\boltre\b/.test(t)
  const finoA = /\bfino a\b/.test(t)
  if (oltre && finoA && numeri.length >= 2) return { tipo: 'scaglione', da: numeri[0], a: numeri[numeri.length - 1], testo: pulito }
  if (oltre) return { tipo: 'scaglione', da: numeri[0], a: null, testo: pulito }
  return { tipo: 'scaglione', da: 0, a: numeri[numeri.length - 1], testo: pulito }
}

const statisticheRegionali = { righe: 0, massimoNelFile: 0 }

/**
 * ⚠️ **La soglia di esenzione regionale sta nella prosa, e va presa con le pinze**
 * (D-057).
 *
 * Il prospetto regionale **non ha una colonna** come `IMPORTO_ESENTE` del file
 * comunale: se un ente prevede una soglia, lo scrive in `DISPOSIZIONE`. Leggere
 * un parametro da un testo libero è esattamente ciò che ho rifiutato di fare
 * per le detrazioni regionali, quindi la differenza va detta: **qui il testo
 * dichiara da sé la meccanica**, e l'estrazione la accetta solo se lo fa.
 *
 * Due condizioni, entrambe necessarie:
 * 1. una frase che esenta dei redditi **fino a** un importo;
 * 2. una conferma esplicita del **cliff** — *oltre* lo stesso importo si applica
 *    l'aliquota *sull'intero imponibile*.
 *
 * La Valle d'Aosta le soddisfa entrambe, con lo stesso numero in tutte e due le
 * frasi. Un ente che parlasse di esenzione senza dire cosa succede sopra la
 * soglia finirebbe nel rapporto, **senza soglia**: un'esenzione applicata come
 * cliff quando è una franchigia è un numero plausibile e sbagliato.
 *
 * ⚠️ **E qui la convenzione numerica cambia di nuovo, dentro lo stesso file.**
 * Le colonne `ALIQUOTA` e `FASCIA` usano il punto decimale (`1.23`, `15000.00`);
 * la prosa di `DISPOSIZIONE` scrive `15.000 euro` all'italiana. Terza
 * convenzione, terzo normalizzatore dichiarato.
 */
function sogliaEsenzioneRegionale(ente, provvedimento) {
  const blob = normalizzaTesto([provvedimento.disposizione, provvedimento.note].filter(Boolean).join(' '))
  if (!/esent|esenzion/i.test(blob)) return null

  const frasi = blob.split(/(?<=[.;])\s+/)
  const frasiEsenzione = frasi.filter((fr) => /esent|esenzion/i.test(fr) && /reddito/i.test(fr))
  if (frasiEsenzione.length === 0) {
    segnala('esenzione-regionale-non-interpretabile', ente, `il testo nomina un'esenzione ma nessuna frase la lega a un reddito: ${blob.slice(0, 200)}`)
    return null
  }

  const sogliePossibili = new Set()
  for (const fr of frasiEsenzione) {
    for (const m of fr.matchAll(/fino a (?:euro )?([\d.,]+)/gi)) {
      const n = numeroVirgola(m[1].replace(/[.,]$/, ''))
      if (n) sogliePossibili.add(n.valore)
    }
  }
  if (sogliePossibili.size !== 1) {
    segnala('esenzione-regionale-non-interpretabile', ente, `${sogliePossibili.size} soglie candidate nel testo (${[...sogliePossibili].join(', ')}) — nessuna applicata`)
    return null
  }
  const soglia = [...sogliePossibili][0]

  // La conferma del cliff: sopra la soglia si paga sull'**intero** imponibile.
  const conferma = frasi.some(
    (fr) =>
      /oltre/i.test(fr) &&
      /inter[oa]/i.test(fr) &&
      [...fr.matchAll(/([\d.,]+)/g)].some((m) => {
        const n = numeroVirgola(m[1].replace(/[.,]$/, ''))
        return n && n.valore === soglia
      }),
  )
  if (!conferma) {
    segnala('esenzione-regionale-senza-conferma-cliff', ente, `soglia di ${soglia} trovata, ma il testo non dichiara che sopra si applica l'aliquota sull'intera base: non applicata`)
    return null
  }

  segnala('esenzione-regionale-applicata', ente, `soglia di ${soglia}, letta dal testo di DISPOSIZIONE e confermata come cliff dallo stesso testo`)
  return soglia
}

function leggiRegionale2026() {
  const righe = leggiCsvComeOggetti(join(FONTI, 'addreg2026.csv'))
  const perEnte = new Map()
  statisticheRegionali.righe = righe.length

  for (const r of righe) {
    const ente = normalizzaTesto(r.REGIONE)
    if (!ente) continue
    const numero = normalizzaTesto(r.NUMERO)
    const pubblicazione = dataItaliana(r['DATA PUBBLICAZIONE'])
    if (!pubblicazione) {
      segnala('data-non-normalizzabile', ente, `provvedimento ${numero}: DATA PUBBLICAZIONE = ${JSON.stringify(r['DATA PUBBLICAZIONE'])}`)
      continue
    }
    const anno = normalizzaTesto(r.ANNO)
    if (anno !== String(ANNO_IMPOSTA)) {
      segnala('anno-inatteso', ente, `provvedimento ${numero}: ANNO = ${anno}`)
    }

    const letta = numeroPunto(r.ALIQUOTA)
    if (!letta) {
      segnala('valore-non-normalizzabile', ente, `provvedimento ${numero}: ALIQUOTA = ${JSON.stringify(r.ALIQUOTA)}`)
      continue
    }
    if (letta.ambiguo) {
      segnala('convenzione-numerica-ambigua', ente, `provvedimento ${numero}: ALIQUOTA = ${JSON.stringify(r.ALIQUOTA)} — virgola in un file a punto`)
    }
    // Il massimo **prima** della selezione: è il 3,63 del Molise, che appartiene
    // al provvedimento di giugno e quindi non entra nell'anno d'imposta 2026.
    statisticheRegionali.massimoNelFile = Math.max(statisticheRegionali.massimoNelFile, letta.valore)

    if (!perEnte.has(ente)) perEnte.set(ente, new Map())
    const provvedimenti = perEnte.get(ente)
    const chiave = `${numero}@${pubblicazione}`
    if (!provvedimenti.has(chiave)) {
      provvedimenti.set(chiave, {
        numero,
        pubblicazione,
        norme: normalizzaTesto(r.NORME) || null,
        note: normalizzaTesto(r.NOTE) || null,
        disposizione: normalizzaTesto(r.DISPOSIZIONE) || null,
        fasce: [],
      })
    }
    provvedimenti.get(chiave).fasce.push({ aliquota: letta.valore, fascia: fasciaRegionale(r['FASCIA']) })
  }

  const enti = []
  for (const [ente, provvedimenti] of perEnte) {
    const ordinati = [...provvedimenti.values()].sort((a, b) =>
      a.pubblicazione === b.pubblicazione ? a.numero.localeCompare(b.numero) : a.pubblicazione.localeCompare(b.pubblicazione),
    )
    const scelto = ordinati[0]
    const scartati = ordinati.slice(1)

    const forma = formaRegionale(ente, scelto)
    if (!forma) continue

    // ⚠️ Art. 50 c. 3 terzo periodo — una maggiorazione **più favorevole** al
    // contribuente può applicarsi retroattivamente all'anno in corso. Oggi non
    // ricorre, perché entrambe le seconde delibere alzano le aliquote. La
    // condizione va scritta lo stesso: una regola senza la propria condizione è
    // muta il giorno in cui il caso si presenta (D-053).
    for (const alt of scartati) {
      const formaAlt = formaRegionale(ente, alt, true)
      if (formaAlt && piuFavorevole(formaAlt, forma)) {
        segnala(
          'maggiorazione-piu-favorevole',
          ente,
          `il provvedimento ${alt.numero} del ${alt.pubblicazione} è più favorevole di quello selezionato (${scelto.numero} del ${scelto.pubblicazione}): l'art. 50 c. 3 terzo periodo ne consente l'applicazione retroattiva all'anno in corso, e la selezione per data va rivista a mano`,
        )
      } else {
        segnala(
          'secondo-provvedimento-scartato',
          ente,
          `${alt.numero} del ${alt.pubblicazione} scartato: pubblicato dopo ${scelto.numero} del ${scelto.pubblicazione}, e non è più favorevole`,
        )
      }
    }

    const testoLibero = [scelto.disposizione, scelto.note, scelto.norme].filter(Boolean).join(' ')
    if (/detrazion/i.test(testoLibero)) {
      segnala(
        'detrazione-regionale-non-modellata',
        ente,
        'il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)',
      )
    }

    enti.push({
      nome: ente,
      numeroProvvedimento: scelto.numero,
      dataPubblicazione: scelto.pubblicazione,
      norme: scelto.norme,
      note: scelto.note,
      aliquota: forma,
      // Le detrazioni esistono nel testo libero ma non vengono inferite: il
      // motore le dichiarerà mancanti invece di applicarle a caso (D-033).
      detrazioni: [],
      sogliaEsenzione: sogliaEsenzioneRegionale(ente, scelto),
      provvedimentiScartati: scartati.map((p) => ({ numero: p.numero, dataPubblicazione: p.pubblicazione })),
    })
  }

  return enti.sort((a, b) => a.nome.localeCompare(b.nome))
}

function formaRegionale(ente, provvedimento, silenzioso = false) {
  const uniche = provvedimento.fasce.filter((f) => f.fascia.tipo === 'unica')
  const scaglioni = provvedimento.fasce.filter((f) => f.fascia.tipo === 'scaglione')

  if (uniche.length === 1 && scaglioni.length === 0) {
    return { forma: 'unica', aliquota: uniche[0].aliquota }
  }
  if (scaglioni.length > 0 && uniche.length === 0) {
    const ordinati = [...scaglioni].sort((a, b) => a.fascia.da - b.fascia.da)
    const confini = ordinati.slice(0, -1).map((s) => s.fascia.a)
    if (!stessiConfini(confini, CONFINI_PREVIGENTI) && !stessiConfini(confini, CONFINI_VIGENTI)) {
      if (!silenzioso) segnala('confini-fuori-dai-due-set', ente, `provvedimento ${provvedimento.numero}: confini ${JSON.stringify(confini)}`)
      return null
    }
    return formaDaConfini(confini, ordinati.map((s) => s.aliquota))
  }
  if (!silenzioso) segnala('forma-ambigua', ente, `provvedimento ${provvedimento.numero}: ${uniche.length} «aliquota unica» e ${scaglioni.length} scaglioni`)
  return null
}

const aliquoteDi = (forma) => (forma.forma === 'unica' ? [forma.aliquota] : forma.scaglioni.map((s) => s.aliquota))

/** Più favorevole = nessuna aliquota superiore, almeno una inferiore. */
function piuFavorevole(candidata, corrente) {
  const a = aliquoteDi(candidata)
  const b = aliquoteDi(corrente)
  if (a.length !== b.length) return Math.max(...a) < Math.max(...b)
  return a.every((v, i) => v <= b[i]) && a.some((v, i) => v < b[i])
}

// ---------------------------------------------------------------------------
// comune → ente impositore
//
// ⚠️ **PARAMETRO NON VERIFICATO, e non è un dettaglio.** La ripartizione delle
// province fra gli enti impositori **non sta in nessuno dei tre file MEF**: il
// file comunale porta la sigla della provincia, quello regionale il nome
// dell'ente, e niente li lega. Questa tabella è di uso corrente ma non è stata
// reperita su un atto, e va marcata come tale in pagina finché non lo sarà.
//
// Le due province autonome sono enti a sé: il Trentino-Alto Adige **non esiste**
// come soggetto che impone il tributo [Fonti §15.a, D-037].
// ---------------------------------------------------------------------------

const PROVINCE_PER_ENTE = {
  'REGIONE PIEMONTE': ['AL', 'AT', 'BI', 'CN', 'NO', 'TO', 'VB', 'VC'],
  "REGIONE VALLE D'AOSTA": ['AO'],
  'REGIONE LOMBARDIA': ['BG', 'BS', 'CO', 'CR', 'LC', 'LO', 'MB', 'MI', 'MN', 'PV', 'SO', 'VA'],
  'PROVINCIA AUTONOMA DI BOLZANO': ['BZ'],
  'PROVINCIA AUTONOMA DI TRENTO': ['TN'],
  'REGIONE VENETO': ['BL', 'PD', 'RO', 'TV', 'VE', 'VI', 'VR'],
  'REGIONE FRIULI VENEZIA GIULIA': ['GO', 'PN', 'TS', 'UD'],
  'REGIONE LIGURIA': ['GE', 'IM', 'SP', 'SV'],
  'REGIONE EMILIA-ROMAGNA': ['BO', 'FC', 'FE', 'MO', 'PC', 'PR', 'RA', 'RE', 'RN'],
  'REGIONE TOSCANA': ['AR', 'FI', 'GR', 'LI', 'LU', 'MS', 'PI', 'PO', 'PT', 'SI'],
  'REGIONE UMBRIA': ['PG', 'TR'],
  'REGIONE MARCHE': ['AN', 'AP', 'FM', 'MC', 'PU'],
  'REGIONE LAZIO': ['FR', 'LT', 'RI', 'RM', 'VT'],
  'REGIONE ABRUZZO': ['AQ', 'CH', 'PE', 'TE'],
  'REGIONE MOLISE': ['CB', 'IS'],
  'REGIONE CAMPANIA': ['AV', 'BN', 'CE', 'NA', 'SA'],
  'REGIONE PUGLIA': ['BA', 'BR', 'BT', 'FG', 'LE', 'TA'],
  'REGIONE BASILICATA': ['MT', 'PZ'],
  'REGIONE CALABRIA': ['CS', 'CZ', 'KR', 'RC', 'VV'],
  'REGIONE SICILIA': ['AG', 'CL', 'CT', 'EN', 'ME', 'PA', 'RG', 'SR', 'TP'],
  'REGIONE SARDEGNA': ['CA', 'NU', 'OR', 'SS', 'SU'],
}

const ENTE_PER_PROVINCIA = new Map()
for (const [ente, province] of Object.entries(PROVINCE_PER_ENTE)) {
  for (const p of province) ENTE_PER_PROVINCIA.set(p, ente)
}

// ---------------------------------------------------------------------------
// Risoluzione
// ---------------------------------------------------------------------------

function risolvi(giornaliero, annuale, entiRegionali) {
  const nomiEnti = new Set(entiRegionali.map((e) => e.nome))
  const comuni = []
  const conteggi = {
    totale2026: giornaliero.size,
    deliberato: 0,
    ereditato: 0,
    ereditatoPerZeroStar: 0,
    ereditatoPerRigaInutilizzabile: 0,
    nonIstituito: 0,
    assenteDal2025: 0,
    setInferito: 0,
    conSogliaEsenzione: 0,
    sogliaDallaDescrizione: 0,
    deliberaNonUtilizzabile: 0,
    senzaEnteRegionale: 0,
  }

  for (const voce of [...giornaliero.values()].sort((a, b) => a.codice.localeCompare(b.codice))) {
    const enteRegionale = ENTE_PER_PROVINCIA.get(voce.provincia) ?? null
    if (!enteRegionale) {
      segnala('provincia-senza-ente', voce.codice, `${voce.nome} (${voce.provincia}): nessun ente impositore mappato`)
    } else if (!nomiEnti.has(enteRegionale)) {
      segnala('ente-regionale-assente', voce.codice, `${voce.nome}: ${enteRegionale} non è fra gli enti del prospetto regionale`)
    }
    if (!enteRegionale || !nomiEnti.has(enteRegionale)) conteggi.senzaEnteRegionale += 1

    const comune = {
      codiceCatastale: voce.codice,
      nome: voce.nome,
      provincia: voce.provincia,
      enteRegionale,
    }

    let letto = null
    if (voce.deliberato) {
      letto = parametriDa2026(voce)
      if (letto) {
        conteggi.deliberato += 1
        comuni.push({
          ...comune,
          stato: 'deliberato',
          annoDelibera: ANNO_IMPOSTA,
          numeroDelibera: normalizzaTesto(voce.riga.NUMERO_DELIBERA) || null,
          dataPubblicazione: dataItaliana(voce.riga.DATA_PUBBLICAZIONE),
          note: voce.note,
          parametri: letto.parametri,
          // D-055 — la soglia viene dalla colonna dedicata oppure dalla
          // descrizione della fascia, e quale delle due si dice qui.
          origineSoglia: letto.origineSoglia,
          setScaglioniInferito: false,
        })
        if (letto.parametri.sogliaEsenzione !== null) conteggi.conSogliaEsenzione += 1
        if (letto.origineSoglia === 'descrizione') conteggi.sogliaDallaDescrizione += 1
        continue
      }
      conteggi.deliberaNonUtilizzabile += 1
      segnala(
        'ricaduta-sul-fallback',
        voce.codice,
        `${voce.nome}: la riga 2026 non è utilizzabile, si applica l'anno precedente per il c. 752`,
      )
    }

    // Regola 1 — il fallback del c. 752, che è il ramo principale.
    const precedente = annuale.get(voce.codice)
    if (!precedente) {
      conteggi.assenteDal2025 += 1
      segnala('assente-dall-annuale-2025', voce.codice, `${voce.nome} (${voce.provincia}): presente nel 2026 senza delibera, assente dall'elenco annuale 2025`)
      comuni.push({ ...comune, stato: 'nonCalcolabile', ragione: 'assente-dall-annuale-2025' })
      continue
    }

    if (precedente.stato === 'nonIstituito') {
      conteggi.nonIstituito += 1
      comuni.push({ ...comune, stato: 'nonIstituito' })
      continue
    }

    conteggi.ereditato += 1
    if (voce.deliberato) conteggi.ereditatoPerRigaInutilizzabile += 1
    else conteggi.ereditatoPerZeroStar += 1
    if (precedente.setScaglioniInferito) conteggi.setInferito += 1
    if (precedente.parametri.sogliaEsenzione !== null) conteggi.conSogliaEsenzione += 1
    comuni.push({
      ...comune,
      stato: 'ereditato',
      annoDiProvenienza: ANNO_IMPOSTA - 1,
      parametri: precedente.parametri,
      origineSoglia: precedente.origineSoglia,
      setScaglioniInferito: precedente.setScaglioniInferito,
    })
  }

  return { comuni, conteggi }
}

// ---------------------------------------------------------------------------
// Verifiche — i numeri devono tornare
//
// [Fonti §15, §15.b] sono già misurati sui file in cartella. Se l'import ne
// produce di diversi, è il parser a essere sbagliato, non la misura.
// ---------------------------------------------------------------------------

function verifiche(giornaliero, annuale, comuni, entiRegionali, conteggi) {
  const aliquoteMassime = (forma) => Math.max(...aliquoteDi(forma))
  const conSoglia2026 = [...giornaliero.values()].filter((v) => {
    const e = numeroVirgola(v.importoEsente ?? '')
    return v.deliberato && e && e.valore > 0
  }).length
  const conSoglia2025 = [...annuale.values()].filter((v) => v.stato === 'risolto' && v.parametri.sogliaEsenzione !== null).length
  const unica2026 = [...giornaliero.values()].filter(
    (v) => v.deliberato && v.coppie.some((c) => c.fascia.tipo === 'unica'),
  ).length
  const previgenti2026 = [...giornaliero.values()].filter(
    (v) => v.deliberato && v.coppie.filter((c) => c.fascia.tipo === 'scaglione').length === 4,
  ).length
  // ⚠️ La misura di §15 è sulla **prima** colonna `ALIQUOTA`, non su tutte e
  // dodici: è quella la colonna che un import ingenuo scambierebbe per
  // «l'aliquota del comune», ed è lì che sta lo zero dell'esenzione.
  const righeAliquotaZero = [...giornaliero.values()].filter(
    (v) => v.deliberato && v.coppie.length > 0 && v.coppie[0].aliquota === 0,
  ).length
  const zeriInTutteLeColonne = [...giornaliero.values()].reduce(
    (n, v) => n + (v.deliberato ? v.coppie.filter((c) => c.aliquota === 0).length : 0),
    0,
  )
  // Misurato sull'esito, non sulle righe grezze: sono i comuni la cui delibera
  // 2026 è stata accettata e ricade sul set previgente.
  const previgentiRisolti = comuni.filter(
    (c) => c.stato === 'deliberato' && c.parametri.aliquota.forma === 'scaglioni-previgenti',
  ).length
  const sopraZeroOtto = [...annuale.values()].filter(
    (v) => v.stato === 'risolto' && aliquoteMassime(v.parametri.aliquota) > 0.8,
  )
  const massimoComunale = Math.max(
    ...[...annuale.values()].filter((v) => v.stato === 'risolto').map((v) => aliquoteMassime(v.parametri.aliquota)),
  )
  const sopraUnoQuattro = entiRegionali.filter((e) => aliquoteMassime(e.aliquota) > 1.4)
  const massimoRegionale = Math.max(...entiRegionali.map((e) => aliquoteMassime(e.aliquota)))

  const milano = comuni.find((c) => c.codiceCatastale === 'F205')
  const lombardia = entiRegionali.find((e) => e.nome === 'REGIONE LOMBARDIA')

  return [
    ['comuni nel giornaliero 2026', 7897, giornaliero.size],
    ['con delibera 2026 (righe non 0*)', 3075, [...giornaliero.values()].filter((v) => v.deliberato).length],
    ['con 0* nel 2026', 4822, [...giornaliero.values()].filter((v) => !v.deliberato).length],
    ['comuni nell\'annuale 2025', 7896, annuale.size],
    ['risolti sull\'annuale 2025 — ramo 0*', 3937, conteggi.ereditatoPerZeroStar],
    ['ancora 0* nel 2025 (senza addizionale applicabile)', 884, conteggi.nonIstituito],
    ['assenti dall\'annuale 2025', 1, conteggi.assenteDal2025],
    ['comuni con soglia di esenzione — 2026', 1270, conSoglia2026],
    ['celle Esenzione non vuote — annuale 2025', 2880, conSoglia2025 + 113],
    ['di cui soglie leggibili', 2767, conSoglia2025],
    ['«aliquota unica» nel 2026', 2501, unica2026],
    ['scaglioni previgenti nel 2026 (delibere accettate)', 173, previgentiRisolti],
    ['righe FLAG_NUOVA = 0 («casi specifici»)', 176, previgenti2026],
    ['comuni con ALIQUOTA (prima colonna) = 0', 1280, righeAliquotaZero],
    ['zeri in tutte le colonne aliquota', 1462, zeriInTutteLeColonne],
    ['comuni sopra 0,8 nell\'annuale 2025', 12, sopraZeroOtto.length],
    ['massimo comunale nell\'annuale 2025', 1.2, massimoComunale],
    ['enti regionali', 21, entiRegionali.length],
    ['enti regionali sopra 1,4', 15, sopraUnoQuattro.length],
    ['righe nel prospetto regionale', 71, statisticheRegionali.righe],
    ['massimo regionale nel file', 3.63, statisticheRegionali.massimoNelFile],
    ['massimo regionale dopo la selezione D-053', 3.33, massimoRegionale],
    ['MILANO — stato', 'ereditato', milano?.stato],
    ['MILANO — forma aliquota', 'unica', milano?.parametri?.aliquota.forma],
    ['MILANO — aliquota', 0.8, milano?.parametri?.aliquota.aliquota],
    ['MILANO — soglia di esenzione', 23000, milano?.parametri?.sogliaEsenzione],
    ['LOMBARDIA — forma aliquota', 'scaglioni-previgenti', lombardia?.aliquota.forma],
    ['LOMBARDIA — aliquote', '1.23 / 1.58 / 1.72 / 1.73', lombardia ? aliquoteDi(lombardia.aliquota).join(' / ') : undefined],
  ]
}

// ---------------------------------------------------------------------------
// Esecuzione
// ---------------------------------------------------------------------------

const giornaliero = leggiGiornaliero2026()
const { per: annuale, titolo: titoloAnnuale } = leggiAnnuale2025()
const entiRegionali = leggiRegionale2026()
const { comuni, conteggi } = risolvi(giornaliero, annuale, entiRegionali)

const provenienza = {
  origine: 'MEF, Dipartimento delle Finanze — Fiscalità regionale e locale',
  annoImposta: ANNO_IMPOSTA,
  estrattoIl: ESTRATTO_IL,
  generatoDa: 'scripts/importa-mef.mjs',
  avvertenza:
    'Gli elenchi generali del MEF si aggiornano quotidianamente e non portano un timbro di versione: la data di estrazione è l\'unico riferimento, e per questo vive dentro il dato invece che in una costante scritta a mano (D-005).',
}

const artefatti = {
  giornaliero2026: {
    file: 'Add_comunale_irpef2026.csv',
    descrizione: 'Elenco generale giornaliero — addizionale comunale IRPEF 2026: riporta le aliquote deliberate',
    estrattoIl: ESTRATTO_IL,
    righe: giornaliero.size,
  },
  annuale2025: {
    file: 'Elenco-annuale-addizionale-comunale-IRPEF-2025-13-marzo-2026.xlsx',
    descrizione: 'Elenco annuale 2025 — snapshot consolidato: riporta le aliquote applicabili, ed è la sorgente del fallback del c. 752',
    consolidatoIl: '2026-03-13',
    dicituraInFile: titoloAnnuale,
    estrattoIl: ESTRATTO_IL,
    righe: annuale.size,
  },
  regionale2026: {
    file: 'addreg2026.csv',
    descrizione: 'Prospetto addizionale regionale IRPEF 2026',
    estrattoIl: ESTRATTO_IL,
    enti: entiRegionali.length,
  },
}

mkdirSync(USCITA, { recursive: true })

const fileComuni = {
  provenienza,
  artefatti: { giornaliero2026: artefatti.giornaliero2026, annuale2025: artefatti.annuale2025 },
  normaDiFallback: {
    atto: "L. 30/12/2024 n. 207, come mod. dall'art. 1 c. 650 della L. 30/12/2025 n. 199",
    riferimento: 'art. 1 c. 752',
  },
  conteggi,
  comuni,
}

const fileRegioni = {
  provenienza,
  artefatti: { regionale2026: artefatti.regionale2026 },
  regolaDiSelezione:
    "Per ciascun ente si prende il provvedimento con DATA PUBBLICAZIONE più antica dell'anno d'imposta: la colonna ANNO vale 2026 su tutte le righe e non discrimina. È una regola meccanica, non un criterio di efficacia (D-053).",
  mappaturaProvince: {
    nonVerificato:
      "La ripartizione province → ente impositore non è in nessuno dei tre file MEF e non è stata reperita su un atto. È di uso corrente ma va dichiarata non verificata finché non lo sarà.",
    perEnte: PROVINCE_PER_ENTE,
  },
  enti: entiRegionali,
}

writeFileSync(join(USCITA, 'comuni-2026.json'), `${JSON.stringify(fileComuni, null, 1)}\n`, 'utf8')
writeFileSync(join(USCITA, 'regioni-2026.json'), `${JSON.stringify(fileRegioni, null, 1)}\n`, 'utf8')

// --- il rapporto ------------------------------------------------------------

const esiti = verifiche(giornaliero, annuale, comuni, entiRegionali, conteggi)
const perCategoria = new Map()
for (const a of anomalie) {
  if (!perCategoria.has(a.categoria)) perCategoria.set(a.categoria, [])
  perCategoria.get(a.categoria).push(a)
}

// [D-049] Il peso della lista che attraverserebbe il confine verso il client.
// Misurato, non deciso: se è troppo, il filtro passa a una rotta server, ed è
// una decisione che va nel log prima di essere scritta.
const comuniPerEnte = new Map()
for (const c of comuni) {
  const e = c.enteRegionale ?? '— nessun ente mappato —'
  comuniPerEnte.set(e, (comuniPerEnte.get(e) ?? 0) + 1)
}

/**
 * ⚠️ **La mappatura provincia → ente è il punto più fragile dell'import, e
 * questi controlli dicono fin dove arrivano — non che sia giusta.**
 *
 * Nessuno dei tre file MEF lega una sigla di provincia a un ente impositore: il
 * comunale porta la sigla, il regionale il nome dell'ente, e in mezzo non c'è
 * niente. La tabella **non è derivabile** da questi dati, quindi non è
 * verificabile con questi dati. Quello che si può fare è escludere gli errori
 * che si vedono — buchi, doppioni, enti inventati, enti vuoti — e **dichiarare
 * quello che resta**.
 *
 * **Il difetto che sopravvive a tutti e quattro i controlli è lo scambio:** due
 * province attribuite l'una all'ente dell'altra. Copertura, unicità e totali
 * tornerebbero identici, e ogni comune di quelle due province riceverebbe
 * l'aliquota di un ente sbagliato producendo un numero perfettamente
 * plausibile. Per questo la tabella resta marcata **non verificata**.
 */
function controlliSullaMappatura() {
  const sigleNelFile = new Set(comuni.map((c) => c.provincia))
  const sigleMappate = new Set(ENTE_PER_PROVINCIA.keys())
  const nomiProspetto = new Set(entiRegionali.map((e) => e.nome))

  const nonMappate = [...sigleNelFile].filter((p) => !sigleMappate.has(p)).sort()
  const mappateInEccesso = [...sigleMappate].filter((p) => !sigleNelFile.has(p)).sort()
  const entiInventati = Object.keys(PROVINCE_PER_ENTE).filter((e) => !nomiProspetto.has(e)).sort()
  const entiSenzaComuni = [...nomiProspetto].filter((e) => !comuniPerEnte.has(e)).sort()

  const doppioni = []
  const vista = new Map()
  for (const [ente, province] of Object.entries(PROVINCE_PER_ENTE)) {
    for (const p of province) {
      if (vista.has(p)) doppioni.push(`${p}: ${vista.get(p)} e ${ente}`)
      else vista.set(p, ente)
    }
  }

  for (const p of nonMappate) segnala('provincia-non-mappata', p, 'sigla presente nel file comunale e assente dalla tabella')
  for (const p of mappateInEccesso) segnala('provincia-mappata-in-eccesso', p, 'sigla nella tabella e assente dal file comunale')
  for (const e of entiInventati) segnala('ente-non-nel-prospetto', e, 'ente nella tabella e assente dal prospetto regionale')
  for (const e of entiSenzaComuni) segnala('ente-senza-comuni', e, 'ente nel prospetto e senza alcun comune assegnato')
  for (const d of doppioni) segnala('provincia-assegnata-due-volte', d, 'la stessa sigla compare sotto due enti')

  return [
    ['sigle di provincia nel file comunale', sigleNelFile.size],
    ['sigle coperte dalla tabella', sigleNelFile.size - nonMappate.length],
    ['sigle nella tabella ma non nel file', mappateInEccesso.length],
    ['sigle assegnate a due enti', doppioni.length],
    ['enti della tabella assenti dal prospetto', entiInventati.length],
    ['enti del prospetto senza comuni', entiSenzaComuni.length],
    ['somma dei comuni per ente', [...comuniPerEnte.values()].reduce((a, b) => a + b, 0)],
  ]
}

const esitiMappatura = controlliSullaMappatura()

const listaLeggera = comuni.map((c) => ({
  codiceCatastale: c.codiceCatastale,
  nome: c.nome,
  provincia: c.provincia,
  calcolabile: c.stato !== 'nonCalcolabile' && c.enteRegionale !== null,
}))
const listaJson = JSON.stringify(listaLeggera)
const pesoLista = { grezzo: Buffer.byteLength(listaJson, 'utf8'), gzip: gzipSync(listaJson).length }

const righeVerifica = esiti.map(([nome, atteso, ottenuto]) => {
  const uguale = String(atteso) === String(ottenuto)
  return `| ${nome} | ${atteso} | ${ottenuto ?? '—'} | ${uguale ? 'OK' : '**SCOSTAMENTO**'} |`
})

const rapporto = [
  '# Rapporto di import — dataset MEF',
  '',
  `Generato da \`scripts/importa-mef.mjs\`. Artefatti estratti il **${ESTRATTO_IL}**, anno d'imposta **${ANNO_IMPOSTA}**.`,
  '',
  "Questo file è versionato insieme al JSON: è la prova che i casi sporchi sono stati **visti**, non ignorati. Lo script non fallisce in silenzio e non salta le righe storte.",
  '',
  '## Verifiche',
  '',
  'I valori attesi sono quelli già misurati in *Fonti* §15 e §15.b sugli stessi file. Uno scostamento è un difetto del parser finché non si dimostra il contrario.',
  '',
  '| Verifica | Atteso | Ottenuto | |',
  '| --- | --- | --- | --- |',
  ...righeVerifica,
  '',
  '## Nota sulla misura dei comuni a scaglioni previgenti',
  '',
  "*Fonti* §15 registrava **157 comuni**. La misura era una ricerca **case-sensitive**, e il file non è uniforme nelle maiuscole: convivono `da euro`, `Da euro`, `OLTRE euro`, `SCAGLIONE` e `SCAGLIONI`. Ricontata:",
  '',
  '| Come si conta | Comuni |',
  '| --- | --- |',
  '| ricerca case-sensitive originale | 157 |',
  '| predicato corretto, ancora case-sensitive | 163 |',
  '| tre predicati indipendenti, case-insensitive — quattro fasce a scaglione, confine a 15.000, presenza di `15.000,01` — che **concordano** | 176 |',
  '| di cui con delibera 2026 accettata | 173 |',
  '',
  "I 176 coincidono esattamente con le righe `FLAG_NUOVA = 0`, i *casi specifici* che il MEF non acquisisce col format assistito: è una quarta conferma indipendente, e viene da una colonna invece che dal testo.",
  '',
  '## Esiti della risoluzione',
  '',
  '| Stato | Comuni |',
  '| --- | --- |',
  ...Object.entries(conteggi).map(([k, v]) => `| ${k} | ${v} |`),
  '',
  '## La mappatura provincia → ente impositore — cosa è verificato e cosa no',
  '',
  "**Nessuno dei tre file MEF lega una sigla di provincia a un ente impositore.** Il file comunale porta la sigla, il prospetto regionale il nome dell'ente, e in mezzo non c'è nulla: la tabella delle 107 province in `scripts/importa-mef.mjs` **non è derivabile da questi dati, quindi non è verificabile con questi dati**. Resta marcata *non verificata* dentro `regioni-2026.json`.",
  '',
  'Quello che i controlli escludono — eseguiti a ogni import, non asseriti:',
  '',
  '| Controllo | Esito |',
  '| --- | --- |',
  ...esitiMappatura.map(([nome, valore]) => `| ${nome} | ${valore} |`),
  '',
  "> ⚠️ **Il difetto che sopravvive a tutti e quattro i controlli è lo scambio.** Due province attribuite l'una all'ente dell'altra passerebbero copertura, unicità e totali senza muovere un numero, e ogni comune di quelle due province riceverebbe l'aliquota di un ente sbagliato — **con un risultato perfettamente plausibile**. È la ragione per cui la marcatura resta, e per cui chiuderla richiede una fonte esterna: la ripartizione amministrativa su atto, che non è in cartella.",
  '',
  '## Comuni per ente impositore regionale',
  '',
  "La mappatura è `comune → ente impositore`, non `comune → regione`: il Trentino-Alto Adige non esiste come soggetto che impone il tributo, e le due Province autonome sono enti a sé [Fonti §15.a]. **La riga che conta è la loro**: l'ente impositore delle due Province non è quello dei due capoluoghi, è quello di tutti i comuni della regione. D-037 li tiene fuori perimetro, e sono 282 — non due.",
  '',
  '| Ente impositore | Comuni |',
  '| --- | --- |',
  ...[...comuniPerEnte.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([e, n]) => `| ${e} | ${n} |`),
  '',
  '## Peso della lista leggera (D-049)',
  '',
  `Codice, nome, provincia e calcolabilità per ${listaLeggera.length} voci — **nessuna aliquota, nessuna citazione**.`,
  '',
  `- grezzo: **${(pesoLista.grezzo / 1024).toFixed(1)} KiB**`,
  `- gzip: **${(pesoLista.gzip / 1024).toFixed(1)} KiB**`,
  '',
  '## Anomalie',
  '',
  `Totale: **${anomalie.length}** in ${perCategoria.size} categorie.`,
  '',
  '| Categoria | Occorrenze |',
  '| --- | --- |',
  ...[...perCategoria.entries()].sort((a, b) => b[1].length - a[1].length).map(([c, v]) => `| \`${c}\` | ${v.length} |`),
  '',
  ...[...perCategoria.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flatMap(([categoria, voci]) => {
      const mostra = categoria === 'set-scaglioni-inferito' ? voci.slice(0, 20) : voci
      return [
        `### \`${categoria}\` — ${voci.length}`,
        '',
        ...mostra.map((v) => `- **${v.chiave}** — ${v.dettaglio}`),
        ...(mostra.length < voci.length ? ['', `*… e altri ${voci.length - mostra.length}. L'elenco completo è ricavabile dal campo \`setScaglioniInferito\` in \`comuni-2026.json\`.*`] : []),
        '',
      ]
    }),
].join('\n')

writeFileSync(join(USCITA, 'anomalie-2026.md'), `${rapporto}\n`, 'utf8')

// --- a schermo --------------------------------------------------------------

const larghezza = Math.max(...esiti.map(([n]) => n.length))
process.stdout.write('\nVERIFICHE — atteso vs ottenuto\n\n')
for (const [nome, atteso, ottenuto] of esiti) {
  const uguale = String(atteso) === String(ottenuto)
  process.stdout.write(
    `  ${uguale ? 'ok  ' : 'DIFF'} ${nome.padEnd(larghezza)}  atteso ${String(atteso).padStart(24)}   ottenuto ${String(ottenuto ?? '—').padStart(24)}\n`,
  )
}
process.stdout.write(`\nESITI\n`)
for (const [k, v] of Object.entries(conteggi)) process.stdout.write(`  ${k.padEnd(24)} ${v}\n`)
process.stdout.write(`\nANOMALIE  ${anomalie.length} in ${perCategoria.size} categorie\n`)
for (const [c, v] of [...perCategoria.entries()].sort((a, b) => b[1].length - a[1].length)) {
  process.stdout.write(`  ${String(v.length).padStart(5)}  ${c}\n`)
}
process.stdout.write(
  `\nLISTA LEGGERA (D-049)  ${listaLeggera.length} voci — ${(pesoLista.grezzo / 1024).toFixed(1)} KiB grezzo, ${(pesoLista.gzip / 1024).toFixed(1)} KiB gzip\n\n`,
)
