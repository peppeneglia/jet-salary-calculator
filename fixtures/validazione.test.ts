/**
 * La validazione e i sette casi d'errore.
 *
 * D-007 tiene i componenti fuori dalla suite, non la validazione: quella è
 * codice con dei rami, e i suoi sette casi esistono perché *cosa fare* è diverso
 * in ciascuno (D-043).
 *
 * Scritti contro D-043 e non leggendo il codice: un test scritto guardando
 * l'implementazione la fotografa, difetti compresi. Che la frase sia
 * comprensibile non lo verifica nulla — qui si controlla il codice d'errore,
 * che è quello che la sceglie.
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import { SOGLIA_RAL_IMPLAUSIBILE, validaComune, validaImporto } from '../app/_lib/validazione'
import { RISORSE } from '../app/_i18n/risorse'

/** Un corpo valido, da cui ogni caso guasta un campo solo. */
const VALIDO = {
  ral: 30_000,
  codiceCatastale: 'F205',
  tipoContratto: 'indeterminato',
  mensilita: 13,
} as const

const errore = (corpo: unknown) => {
  const esito = eseguiCalcolo(corpo)
  if (esito.stato === 'ok') throw new Error('atteso un errore, ricevuto un risultato')
  return esito
}

describe('i sette casi d’errore di D-043 sono sette cose diverse', () => {
  it('il corpo valido non produce errori: è la riga di controllo', () => {
    expect(eseguiCalcolo(VALIDO).stato).toBe('ok')
  })

  /*
   * I primi quattro riguardano la RAL, e restano quattro: sono i casi in cui
   * *cosa fare* è diverso — scrivere un numero, correggere il segno, togliere
   * uno zero di troppo.
   */
  it('RAL assente → ral-mancante, 400', () => {
    const e = errore({ ...VALIDO, ral: undefined })
    expect(e.errore.codice).toBe('ral-mancante')
    expect(e.http).toBe(400)
  })

  it('RAL non numerica → ral-non-numerica, 400', () => {
    const e = errore({ ...VALIDO, ral: '30.000 euro' })
    expect(e.errore.codice).toBe('ral-non-numerica')
    expect(e.http).toBe(400)
  })

  it('RAL non positiva → ral-non-positiva, 400', () => {
    for (const ral of [0, -1, -30_000]) {
      expect(errore({ ...VALIDO, ral }).errore.codice).toBe('ral-non-positiva')
    }
  })

  // Dieci milioni intercettano la RAL battuta in centesimi o con uno zero di
  // troppo, senza rifiutare nessuno stipendio reale (D-043).
  it('RAL implausibile → ral-implausibile, e porta con sé la soglia', () => {
    const e = errore({ ...VALIDO, ral: SOGLIA_RAL_IMPLAUSIBILE + 1 })
    expect(e.errore.codice).toBe('ral-implausibile')
    expect(e.http).toBe(400)
    if (e.errore.codice !== 'ral-implausibile') return
    // I dati viaggiano con l'errore: la frase li interpola, non li riscrive.
    expect(e.errore.soglia).toBe(SOGLIA_RAL_IMPLAUSIBILE)
    expect(e.errore.ral).toBe(SOGLIA_RAL_IMPLAUSIBILE + 1)
  })

  it('esattamente alla soglia la RAL è ancora accettata', () => {
    expect(validaImporto(SOGLIA_RAL_IMPLAUSIBILE)).toBeUndefined()
    expect(validaImporto(SOGLIA_RAL_IMPLAUSIBILE + 0.01)).toBeDefined()
  })

  it('comune assente → comune-mancante, 400', () => {
    expect(errore({ ...VALIDO, codiceCatastale: '' }).errore.codice).toBe('comune-mancante')
    expect(errore({ ...VALIDO, codiceCatastale: '   ' }).errore.codice).toBe('comune-mancante')
  })

  // Sconosciuto (404) e non calcolabile (422) sono due cose diverse: il primo
  // è un codice che non esiste, il secondo un comune che il perimetro non copre
  // e che porta con sé la ragione (D-033, D-037).
  it('comune fuori catalogo → comune-sconosciuto, 404', () => {
    const e = errore({ ...VALIDO, codiceCatastale: 'ZZZZ' })
    expect(e.errore.codice).toBe('comune-sconosciuto')
    expect(e.http).toBe(404)
  })

  it('comune non calcolabile → 422, con la sua ragione nelle due lingue', () => {
    const e = errore({ ...VALIDO, codiceCatastale: 'M439' })
    expect(e.errore.codice).toBe('comune-non-calcolabile')
    expect(e.http).toBe(422)
    if (e.errore.codice !== 'comune-non-calcolabile') return
    expect(e.errore.nome).toBeTruthy()
    expect(e.errore.ragione.it).toBeTruthy()
    expect(e.errore.ragione.en).toBeTruthy()
    expect(e.errore.ragione.it).not.toBe(e.errore.ragione.en)
  })

  it('corpo illeggibile → rete, 400', () => {
    for (const corpo of [null, 'non un oggetto', 42]) {
      const e = errore(corpo)
      expect(e.errore.codice).toBe('rete')
      expect(e.http).toBe(400)
    }
  })
})

describe('i due campi che il contratto pubblico rende obbligatori', () => {
  it('contratto ignoto → contratto-non-valido', () => {
    expect(errore({ ...VALIDO, tipoContratto: 'stagionale' }).errore.codice).toBe('contratto-non-valido')
    expect(errore({ ...VALIDO, tipoContratto: undefined }).errore.codice).toBe('contratto-non-valido')
  })

  // L'assenza è un errore, non un valore predefinito (D-052).
  it('mensilità assente o fuori dalle tre → mensilita-non-valida', () => {
    expect(errore({ ...VALIDO, mensilita: undefined }).errore.codice).toBe('mensilita-non-valida')
    for (const m of [0, 11, 15, 12.5]) {
      expect(errore({ ...VALIDO, mensilita: m }).errore.codice).toBe('mensilita-non-valida')
    }
  })

  it('le tre mensilità legittime passano tutte', () => {
    for (const mensilita of [12, 13, 14]) {
      expect(eseguiCalcolo({ ...VALIDO, mensilita }).stato).toBe('ok')
    }
  })
})

describe('la validazione è la stessa per il client e per il server', () => {
  // Se le due sedi divergessero, l'utente vedrebbe passare la validazione del
  // modulo e poi fallire il calcolo.
  it('validaImporto concorda con l’handler su ogni caso della RAL', () => {
    for (const ral of [-1, 0, 0.01, 30_000, SOGLIA_RAL_IMPLAUSIBILE, SOGLIA_RAL_IMPLAUSIBILE + 1]) {
      const dalClient = validaImporto(ral)
      const dalServer = eseguiCalcolo({ ...VALIDO, ral })
      if (dalClient === undefined) {
        expect(dalServer.stato, `RAL ${ral}: il client accetta, il server rifiuta`).toBe('ok')
      } else {
        expect(dalServer.stato, `RAL ${ral}: il client rifiuta, il server accetta`).toBe('errore')
        if (dalServer.stato !== 'errore') return
        expect(dalServer.errore.codice).toBe(dalClient.codice)
      }
    }
  })

  it('validaComune concorda con l’handler sul codice vuoto', () => {
    expect(validaComune('')?.codice).toBe('comune-mancante')
    expect(validaComune('F205')).toBeUndefined()
  })
})

/**
 * Che ogni chiave esista lo garantisce il compilatore. Quello che non vede è una
 * stringa vuota o rimasta identica all'italiano per dimenticanza.
 */
describe('le due lingue sono piene, non solo dichiarate', () => {
  const foglie = (o: object, prefisso = ''): (readonly [string, string])[] =>
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === 'string'
        ? [[`${prefisso}${k}`, v] as const]
        : foglie(v as object, `${prefisso}${k}.`),
    )

  it('nessuna stringa è vuota, in nessuna delle due lingue', () => {
    for (const lingua of ['it', 'en'] as const) {
      const vuote = foglie(RISORSE[lingua]).filter(([, v]) => v.trim() === '')
      expect(vuote.map(([k]) => k), `chiavi vuote in ${lingua}`).toEqual([])
    }
  })

  it('le due lingue hanno esattamente le stesse chiavi', () => {
    const chiavi = (l: 'it' | 'en') => foglie(RISORSE[l]).map(([k]) => k).sort()
    expect(chiavi('en')).toEqual(chiavi('it'))
  })

  // Alcune restano identiche per costruzione — nomi propri, riferimenti
  // normativi (D-041) — quindi si verifica che non lo siano quasi tutte.
  it('la traduzione inglese esiste davvero: non è una copia dell’italiano', () => {
    const it = foglie(RISORSE.it)
    const en = new Map(foglie(RISORSE.en))
    const identiche = it.filter(([k, v]) => en.get(k) === v)
    expect(identiche.length / it.length).toBeLessThan(0.15)
  })
})
