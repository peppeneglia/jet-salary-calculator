/**
 * Il dataset MEF importato, messo alla prova.
 *
 * Sta in `fixtures/` per la stessa ragione del confronto motore ↔ fixture: non
 * è un test del motore — `core/` non sa nulla di CSV — e non è logica di
 * `data/`, che non ne ha. È il contratto fra l'import e i livelli che lo
 * consumano, e i contratti non vivono dentro una delle due parti (D-030).
 *
 * Copre tre cose, e la prima è la più importante:
 *
 * 1. il caso base non si è mosso. RAL 30.000 a Milano deve dare lo stesso
 *    netto di prima dell'import, a quattro decimali;
 * 2. l'import coincide con le misure registrate. I tre valori di Milano e
 *    della Lombardia in `data/caso-base.ts` sono quelli letti sul prospetto e
 *    registrati in *Fonti* §15. ⚠️ Dal 29/08 non è più un confronto fra due
 *    sedi vive — l'applicazione prende Milano dall'import come tutti gli
 *    altri — ma l'ancoraggio dell'import a ciò che è stato letto: se un import
 *    futuro portasse altro, la divergenza va vista, non risolta in silenzio;
 * 3. le invarianti dell'import reggono — i tre stati, nessun clamp, ogni
 *    comune con il proprio ente impositore.
 */

import { describe, expect, it } from 'vitest'

import {
  CODICE_COMUNE_INIZIALE,
  comuneIniziale,
  comuniSelezionabili,
  coperturaComuni,
  risolviComune,
} from '../app/_lib/comuni'
import { eseguiCalcolo } from '../app/_lib/calcolo'
import { aliquoteLombardia, aliquotaComunaleMilano, sogliaEsenzioneMilano } from '../data/caso-base'
import datiComuni from '../data/mef/comuni-2026.json'
import datiRegioni from '../data/mef/regioni-2026.json'

interface FormaJson {
  readonly forma: string
  readonly aliquota?: number
  readonly scaglioni?: readonly { readonly aliquota: number }[]
  readonly fasce?: readonly { readonly percentuale: number }[]
  readonly progressioneOltre?: readonly { readonly aliquota: number }[] | null
}

/**
 * Il massimo va misurato su tutte le aliquote che l'ente può applicare.
 * Con la fascia intera (D-062) sono due insiemi: quelle per fascia e quelle
 * della progressione oltre l'ultima — e ignorare le seconde farebbe sparire
 * dal conteggio del tetto proprio gli enti che lo superano di più.
 */
const massimo = (a: FormaJson): number => {
  if (a.forma === 'unica') return a.aliquota ?? 0
  if (a.forma === 'fasce-intere') {
    return Math.max(
      ...(a.fasce ?? []).map((f) => f.percentuale),
      ...(a.progressioneOltre ?? []).map((s) => s.aliquota),
    )
  }
  return Math.max(...(a.scaglioni ?? []).map((s) => s.aliquota))
}


describe('il caso base non si è mosso', () => {
  it('RAL 30.000 a Milano dà lo stesso netto di prima dell\'import', () => {
    const esito = eseguiCalcolo({
      ral: 30_000,
      codiceCatastale: CODICE_COMUNE_INIZIALE,
      tipoContratto: 'indeterminato',
      mensilita: 13,
    })
    expect(esito.stato).toBe('ok')
    if (esito.stato !== 'ok') return
    // Il valore è quello calcolato dal motore prima che il dataset entrasse:
    // se cambia, l'import ha alterato un parametro che era verificato a mano.
    expect(esito.risultato.nettoAnnuo).toBeCloseTo(23_425.4846, 4)
  })

  it('il comune iniziale della pagina è Milano, non il primo del catalogo', () => {
    const primoDelCatalogo = datiComuni.comuni[0]
    expect(primoDelCatalogo.codiceCatastale).not.toBe(CODICE_COMUNE_INIZIALE)
    // Il nome è quello leggibile (`_lib/nomi-comuni.ts`): il prospetto lo
    // scrive `MILANO`, che è la convenzione di stampa di un archivio.
    expect(risolviComune(CODICE_COMUNE_INIZIALE)?.nome).toBe('Milano')
  })
})


describe('il parametro scritto a mano e quello importato coincidono', () => {
  const milanoImportato = datiComuni.comuni.find((c) => c.codiceCatastale === 'F205')
  const lombardiaImportata = datiRegioni.enti.find((e) => e.nome === 'REGIONE LOMBARDIA')

  it('Milano — aliquota unica 0,8% ereditata dal 2025', () => {
    expect(milanoImportato?.stato).toBe('ereditato')
    expect(milanoImportato?.annoDiProvenienza).toBe(2025)
    expect(milanoImportato?.parametri?.aliquota.forma).toBe('unica')
    expect(milanoImportato?.parametri?.aliquota.aliquota).toBe(aliquotaComunaleMilano as number)
  })

  it('Milano — soglia di esenzione a 23.000, e resta un cliff', () => {
    expect(milanoImportato?.parametri?.sogliaEsenzione).toBe(sogliaEsenzioneMilano as number)
  })

  it('Lombardia — scaglioni previgenti, 1,23 / 1,58 / 1,72 / 1,73', () => {
    expect(lombardiaImportata?.aliquota.forma).toBe('scaglioni-previgenti')
    expect(lombardiaImportata?.aliquota.scaglioni).toEqual(
      aliquoteLombardia.scaglioni.map((s) => ({ da: s.da as number, a: s.a as number | null, aliquota: s.aliquota as number })),
    )
  })

  it('Lombardia — il provvedimento selezionato è quello di gennaio, e non ce ne sono di scartati', () => {
    expect(lombardiaImportata?.dataPubblicazione.startsWith('2026-01')).toBe(true)
    expect(lombardiaImportata?.provvedimentiScartati).toEqual([])
  })
})


describe('i tre stati di D-054 sono tre cose diverse', () => {
  it('gli stati coprono tutti e 7.897 i comuni, senza residui', () => {
    const { totale2026, deliberato, ereditato, nonIstituito, assenteDal2025 } = datiComuni.conteggi
    expect(totale2026).toBe(7_897)
    expect(deliberato + ereditato + nonIstituito + assenteDal2025).toBe(totale2026)
  })

  it('il fallback del c. 752 è il ramo principale, non una correzione', () => {
    // 4.822 comuni con 0*, di cui 3.937 risolti sull'annuale 2025.
    expect(datiComuni.conteggi.ereditatoPerZeroStar).toBe(3_937)
    expect(datiComuni.conteggi.ereditato).toBeGreaterThan(datiComuni.conteggi.deliberato)
  })

  it('«senza addizionale applicabile» resta calcolabile: il numero è corretto, non mancante', () => {
    expect(datiComuni.conteggi.nonIstituito).toBe(884)
    const senza = datiComuni.comuni.find((c) => c.stato === 'nonIstituito' && c.provincia !== 'TN' && c.provincia !== 'BZ')
    expect(senza).toBeDefined()
    const risolto = risolviComune(senza!.codiceCatastale)
    expect(risolto?.stato).toBe('calcolabile')
    if (risolto?.stato !== 'calcolabile') return
    expect(risolto.enti.comunale.stato).toBe('nonIstituito')
  })

  it('il comune assente dall\'annuale 2025 è un caso esplicito, non un valore indefinito', () => {
    const assenti = datiComuni.comuni.filter((c) => c.stato === 'nonCalcolabile')
    expect(assenti).toHaveLength(1)
    expect(assenti[0].ragione).toBe('assente-dall-annuale-2025')
    expect(risolviComune(assenti[0].codiceCatastale)?.stato).toBe('nonCalcolabile')
  })

  /**
   * ⚠️ D-056: i 282 comuni delle due Province autonome sono calcolabili.
   *
   * D-037 non è stata revocata — si è avverata la sua condizione di caduta,
   * *«cade quando entrano i parametri delle due Province»*. E ciò che chiamava
   * «Trento e Bolzano» erano 166 comuni trentini e 116 altoatesini:
   * l'ente impositore delle Province autonome non riguarda i due capoluoghi,
   * riguarda tutto il territorio.
   */
  it('i 282 comuni delle Province autonome sono calcolabili (D-056)', () => {
    const taa = datiComuni.comuni.filter((c) => c.provincia === 'TN' || c.provincia === 'BZ')
    expect(taa).toHaveLength(282)
    for (const c of taa) expect(risolviComune(c.codiceCatastale)?.stato).toBe('calcolabile')

    // Ciascuno prende l'ente della propria Provincia, non della regione.
    //
    // ⚠️ Il nome atteso è quello leggibile di `data/nomi-enti.ts`, non la
    // stringa del prospetto: `EnteRisolto.nome` è ciò che finisce in pagina.
    // La stringa MEF resta la chiave con cui il comune punta al proprio ente,
    // e quella è verificata dal test sulla mappatura provincia → ente.
    const trento = risolviComune('L378')
    const bolzano = risolviComune('A952')
    expect(trento?.stato === 'calcolabile' && trento.enti.regionale.nome).toBe('Provincia autonoma di Trento')
    expect(bolzano?.stato === 'calcolabile' && bolzano.enti.regionale.nome).toBe('Provincia autonoma di Bolzano')

    // ⚠️ E il file MEF distingue i due modi di non pagare l'addizionale
    // comunale, che l'import conserva: Trento non l'ha mai istituita,
    // Bolzano l'ha deliberata a zero. Sono due cose diverse e restano tali.
    expect(trento?.stato === 'calcolabile' && trento.enti.comunale.stato).toBe('nonIstituito')
    expect(datiComuni.comuni.find((c) => c.codiceCatastale === 'A952')?.parametri?.aliquota.aliquota).toBe(0)
  })
})


describe('nessun clamp, mai', () => {
  it('il tetto comunale di 0,8 è superato, e i comuni sopra restano sopra', () => {
    const sopra = datiComuni.comuni.filter((c) => c.parametri && massimo(c.parametri.aliquota) > 0.8)
    expect(sopra.length).toBeGreaterThan(0)
    expect(Math.max(...sopra.map((c) => massimo(c.parametri!.aliquota)))).toBeCloseTo(1.2, 10)
  })

  it('il tetto regionale di 1,4 è superato da 15 enti su 21', () => {
    const sopra = datiRegioni.enti.filter((e) => massimo(e.aliquota) > 1.4)
    expect(sopra).toHaveLength(15)
    expect(datiRegioni.enti).toHaveLength(21)
  })

  it('la selezione D-053 tiene il Molise a 3,33, non a 3,63', () => {
    const molise = datiRegioni.enti.find((e) => e.nome === 'REGIONE MOLISE')
    expect(massimo(molise!.aliquota)).toBeCloseTo(3.33, 10)
    expect(molise?.provvedimentiScartati).toHaveLength(1)
    // Il provvedimento scartato è pubblicato dopo quello selezionato.
    expect(molise!.provvedimentiScartati[0].dataPubblicazione > molise!.dataPubblicazione).toBe(true)
  })
})


describe('la soglia di esenzione regionale (D-057)', () => {
  it('la porta un ente su ventuno, ed è misurato non assunto', () => {
    const conSoglia = datiRegioni.enti.filter((e) => e.sogliaEsenzione !== null)
    expect(conSoglia).toHaveLength(1)
    expect(conSoglia[0].nome).toBe("REGIONE VALLE D'AOSTA")
    expect(conSoglia[0].sogliaEsenzione).toBe(15_000)
  })

  it('arriva fino agli enti risolti di un comune valdostano', () => {
    const aosta = risolviComune('A326')
    expect(aosta?.stato).toBe('calcolabile')
    if (aosta?.stato !== 'calcolabile') return
    const regionale = aosta.enti.regionale
    expect(regionale.stato === 'deliberato' && regionale.parametri.sogliaEsenzione?.valore).toBe(15_000)
    // D-059: la soglia porta la propria riserva, e non e' quella del prospetto.
    const riserva =
      regionale.stato === 'deliberato' ? regionale.parametri.sogliaEsenzione?.fonte.nonVerificato : undefined
    expect(riserva?.it).toContain('non risulta')
    expect(riserva?.it).not.toBe(
      regionale.stato === 'deliberato' ? regionale.fonte.nonVerificato?.it : undefined,
    )
  })

  /**
   * ⚠️ Il difetto che D-057 chiude era un numero sbagliato in produzione,
   * non una lacuna dichiarata: prima di questa passata un residente valdostano
   * sotto la soglia vedeva un'addizionale regionale che non doveva.
   */
  it('sotto la soglia l\'addizionale regionale non è più dovuta — end to end', () => {
    const sotto = eseguiCalcolo({
      ral: 14_000,
      codiceCatastale: 'A326',
      tipoContratto: 'indeterminato',
      mensilita: 13,
    })
    expect(sotto.stato).toBe('ok')
    if (sotto.stato !== 'ok') return

    const gate = sotto.risultato.passi.find((p) => p.id === 'gate-addizionali')!
    expect(gate.esito.stato === 'verifica' && gate.esito.superata).toBe(true)

    const regionale = sotto.risultato.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.esito.stato).toBe('nonDovuto')
    // La soglia è resa come verifica con la sua ragione, non come voce a zero.
    const verifica = regionale.dettaglio?.find((d) => d.id === 'soglia-esenzione-regionale')
    expect(verifica?.esito.stato).toBe('verifica')
  })

  it('sopra la soglia si paga, e sull\'intera base — è un cliff', () => {
    const sopra = eseguiCalcolo({
      ral: 30_000,
      codiceCatastale: 'A326',
      tipoContratto: 'indeterminato',
      mensilita: 13,
    })
    expect(sopra.stato).toBe('ok')
    if (sopra.stato !== 'ok') return

    const rcPasso = sopra.risultato.passi.find((p) => p.id === 'reddito-complessivo')!
    const regionale = sopra.risultato.passi.find((p) => p.id === 'addizionale-regionale')!
    expect(regionale.esito.stato).toBe('applicato')
    if (regionale.esito.stato !== 'applicato' || rcPasso.esito.stato !== 'applicato') return
    // 1,23% sull'intero reddito complessivo, non sulla parte oltre 15.000.
    expect(regionale.esito.esce).toBeCloseTo((rcPasso.esito.esce * 1.23) / 100, 6)
  })
})


describe('l’aliquota regionale per fascia intera (D-062)', () => {
  const regionale = (codice: string, ral: number) => {
    const e = eseguiCalcolo({ ral, codiceCatastale: codice, tipoContratto: 'indeterminato', mensilita: 13 })
    if (e.stato !== 'ok') throw new Error(`calcolo fallito per ${codice}`)
    const passo = e.risultato.passi.find((x) => x.id === 'addizionale-regionale')!
    const rc = e.risultato.passi.find((x) => x.id === 'reddito-complessivo')!
    return {
      importo: passo.esito.stato === 'applicato' ? passo.esito.esce : 0,
      rc: rc.esito.stato === 'applicato' ? rc.esito.esce : 0,
      passo,
    }
  }

  it('tre enti su ventuno, e sono quelli il cui testo lo dichiara', () => {
    const fasceIntere = datiRegioni.enti.filter((e) => e.aliquota.forma === 'fasce-intere')
    expect(fasceIntere.map((e) => e.nome).sort()).toEqual([
      'REGIONE FRIULI VENEZIA GIULIA',
      'REGIONE LAZIO',
      'REGIONE UMBRIA',
    ])
    // Le tre varianti coprono tutti e ventuno gli enti, senza residui.
    const perForma = datiRegioni.enti.reduce<Record<string, number>>((acc, e) => {
      const k = e.aliquota.forma === 'unica' || e.aliquota.forma === 'fasce-intere' ? e.aliquota.forma : 'scaglioni'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})
    expect(perForma).toEqual({ unica: 6, 'fasce-intere': 3, scaglioni: 12 })
  })

  /**
   * ⚠️ I tre numeri sono quelli che D-062 ha misurato a mano sul testo. Se il
   * motore ne producesse altri, la lettura della prosa sarebbe sbagliata.
   */
  it('a imponibile 20.000 dà il numero del testo, non quello delle colonne', () => {
    // La RAL che porta il reddito complessivo esattamente a 20.000.
    const ral = 20_000 / 0.9081
    for (const [codice, atteso] of [
      ['L424', 1.23],
      ['G478', 1.23],
      ['H501', 1.73],
    ] as const) {
      const { importo, rc } = regionale(codice, ral)
      expect(rc).toBeCloseTo(20_000, 0)
      expect(importo).toBeCloseTo((rc * atteso) / 100, 2)
    }
  })

  it('Umbria e Lazio producono un gradino a 28.000, non una pendenza', () => {
    for (const codice of ['G478', 'H501']) {
      const sotto = regionale(codice, 27_900 / 0.9081)
      const sopra = regionale(codice, 28_100 / 0.9081)
      // Duecento euro di imponibile in più non spiegano un salto di questa taglia.
      expect(sopra.importo - sotto.importo).toBeGreaterThan(100)
    }
  })
})


describe('le detrazioni regionali (D-061)', () => {
  it('tre enti su ventuno le hanno legate al solo reddito, e sono tutte a cliff', () => {
    const con = datiRegioni.enti.filter((e) => e.detrazioni.length > 0)
    expect(con.map((e) => e.nome).sort()).toEqual([
      'PROVINCIA AUTONOMA DI BOLZANO',
      'REGIONE LAZIO',
      'REGIONE UMBRIA',
    ])
    // Cliff = importo fisso entro una banda, che è ciò che il tipo esprime.
    for (const e of con) {
      for (const d of e.detrazioni) {
        expect(typeof d.importo).toBe('number')
        expect(d.redditoA === null || d.redditoA > d.redditoDa).toBe(true)
      }
    }
  })

  /**
   * ⚠️ È il difetto che D-056 aveva reso attivo. 430,50 = 1,23% × 35.000
   * esatti: sotto quel reddito la detrazione azzera l'intera addizionale
   * regionale, e prima di D-061 i 116 comuni altoatesini la pagavano.
   */
  it('a Bolzano sotto i 35.000 la detrazione azzera l’addizionale regionale', () => {
    const e = eseguiCalcolo({ ral: 33_000, codiceCatastale: 'A952', tipoContratto: 'indeterminato', mensilita: 13 })
    expect(e.stato).toBe('ok')
    if (e.stato !== 'ok') return
    const passo = e.risultato.passi.find((x) => x.id === 'addizionale-regionale')!
    expect(passo.esito.stato).toBe('applicato')
    if (passo.esito.stato !== 'applicato') return
    expect(passo.esito.esce).toBe(0)
    // Il pavimento è a zero, non un credito: l'effetto sul netto è nullo.
    expect(passo.esito.effettoSulNetto).toBe(0)
    const detrazione = passo.dettaglio?.find((d) => d.id === 'detrazioni-regionali')
    expect(detrazione).toBeDefined()
  })

  /**
   * ⚠️ Ciò che il modello non copre si dichiara accanto al numero, non solo
   * nel rapporto di anomalie. E si dichiara con il verso: fa risultare
   * l'addizionale più alta del reale, quindi il netto mostrato è più basso di
   * quello vero. È l'informazione utile a chi legge; il motivo per cui non la
   * calcoliamo non lo è (D-039).
   *
   * ⚠️ Erano due, ed è rimasta una. S-016 dichiarava la deduzione trentina
   * come non applicata: D-064 l'ha implementata, quindi la voce deve essere
   * sparita. Un'assunzione che sopravvive alla propria chiusura dice al lettore
   * che il numero è più basso del vero quando non lo è più — ed è il motivo per
   * cui questo test asserisce anche un'assenza.
   */
  it('la voce fuori perimetro compare solo a chi riguarda, e quella chiusa non compare più', () => {
    const assunzioniDi = (codice: string) => {
      const e = eseguiCalcolo({ ral: 60_000, codiceCatastale: codice, tipoContratto: 'indeterminato', mensilita: 13 })
      if (e.stato !== 'ok') throw new Error('ko')
      return e.risultato.assunzioni
    }

    const bolzano = assunzioniDi('A952')
    const trento = assunzioniDi('L378')
    const milano = assunzioniDi('F205')

    expect(bolzano.map((a) => a.id)).toContain('S-015')

    // A Milano no: direbbe a un lombardo una cosa che non lo riguarda, ed è la
    // ragione per cui la condizione è per ente.
    expect(milano.map((a) => a.id)).not.toContain('S-015')

    // S-016 è chiusa da D-064: non deve comparire a nessuno, Trento compreso.
    for (const chi of [bolzano, trento, milano]) {
      expect(chi.map((a) => a.id)).not.toContain('S-016')
    }

    // Il verso è quello: il netto vero è più alto di quello mostrato.
    for (const a of bolzano.filter((x) => x.id === 'S-015')) {
      expect(a.direzione).toBe('netto-reale-piu-alto')
    }
  })

  it('ogni detrazione cita la legge regionale, con la riserva sul meccanismo (D-059)', () => {
    const bolzano = risolviComune('A952')
    expect(bolzano?.stato).toBe('calcolabile')
    if (bolzano?.stato !== 'calcolabile') return
    const reg = bolzano.enti.regionale
    if (reg.stato !== 'deliberato') return
    const d = reg.parametri.detrazioni[0]
    expect(d).toBeDefined()
    // Il valore ha una fonte; è il livello statale che non risulta.
    expect(d.fonte.nonVerificato?.it).toContain('non risulta')
    expect(d.fonte.nonVerificato?.en).toBeTruthy()
  })
})


describe('la deduzione dalla base (D-064)', () => {
  /** Un comune trentino: l'ente impositore è la Provincia, non la regione (D-056). */
  const TRENTO = 'L378'

  it('la porta un ente su ventuno, ed è misurato non assunto', () => {
    const conDeduzione = datiRegioni.enti.filter((e) => e.deduzione !== null)
    expect(conDeduzione).toHaveLength(1)
    expect(conDeduzione[0].nome).toBe('PROVINCIA AUTONOMA DI TRENTO')
    /*
     * ⚠️ I due numeri coincidono, e sono due campi lo stesso. È tutta la
     * ragione di D-064: `sogliaEsenzione` darebbe oggi lo stesso risultato al
     * centesimo, e smetterebbe di darlo il giorno in cui la Provincia cambiasse
     * uno dei due senza l'altro — senza che nulla se ne accorga.
     */
    expect(conDeduzione[0].deduzione).toEqual({ importo: 30_000, redditoMassimo: 30_000 })
  })

  it('arriva fino agli enti risolti di un comune trentino, con la propria riserva', () => {
    const trento = risolviComune(TRENTO)
    expect(trento?.stato).toBe('calcolabile')
    if (trento?.stato !== 'calcolabile') return
    const reg = trento.enti.regionale
    if (reg.stato !== 'deliberato') return

    expect(reg.parametri.deduzione?.importo).toBe(30_000)
    expect(reg.parametri.deduzione?.redditoMassimo).toBe(30_000)

    // D-059: il valore ha una fonte, è il livello statale a non risultare — e
    // la riserva è propria, perché ciò che manca qui riguarda la base
    // imponibile e non il quantum.
    const riserva = reg.parametri.deduzione?.fonte.nonVerificato
    expect(riserva?.it).toContain('non risulta')
    expect(riserva?.en).toBeTruthy()
    expect(riserva?.it).not.toBe(reg.fonte.nonVerificato?.it)
  })

  /*
   * ⚠️ È il difetto che D-056 aveva reso attivo, come per Bolzano. Finché i
   * 166 comuni trentini erano non calcolabili nessuno vedeva l'addizionale di
   * troppo; dichiarandoli calcolabili l'abbiamo resa visibile.
   *
   * Le due RAL sono costruite a ritroso dalla soglia, che è su reddito
   * imponibile e non su RAL: `RAL = RC / (1 − 0,0919)`, valida sotto la prima
   * fascia pensionabile.
   */
  const RAL_SOTTO = 33_036.0
  const RAL_SOPRA = 33_036.02

  const calcolo = (ral: number) => {
    const e = eseguiCalcolo({ ral, codiceCatastale: TRENTO, tipoContratto: 'indeterminato', mensilita: 13 })
    if (e.stato !== 'ok') throw new Error('ko')
    const rc = e.risultato.passi.find((p) => p.id === 'reddito-complessivo')!
    const reg = e.risultato.passi.find((p) => p.id === 'addizionale-regionale')!
    if (rc.esito.stato !== 'applicato') throw new Error('rc')
    return { rc: rc.esito.esce as number, regionale: reg, netto: e.risultato.nettoAnnuo as number }
  }

  it('sotto la soglia la deduzione azzera la base, e l’addizionale è zero — end to end', () => {
    const { rc, regionale } = calcolo(RAL_SOTTO)
    expect(rc).toBeLessThanOrEqual(30_000)

    // ⚠️ Non è «non dovuta»: è dovuta e vale zero. La differenza non è
    // formale — un'esenzione sopprime il presupposto, una deduzione azzera la
    // base. È la distinzione che D-064 esiste per tenere in piedi.
    expect(regionale.esito.stato).toBe('applicato')
    if (regionale.esito.stato !== 'applicato') return
    expect(regionale.esito.esce).toBe(0)
    expect(regionale.esito.effettoSulNetto).toBe(0)

    const passo = regionale.dettaglio?.find((d) => d.id === 'deduzione-regionale')
    expect(passo?.esito.stato).toBe('applicato')
    if (passo?.esito.stato !== 'applicato') return
    expect(passo.esito.entra).toBeCloseTo(rc, 6)
    expect(passo.esito.esce).toBe(0)
  })

  it('sopra la soglia non spetta affatto, e si paga sull’intera base — è un cliff', () => {
    const { rc, regionale } = calcolo(RAL_SOPRA)
    expect(rc).toBeGreaterThan(30_000)

    expect(regionale.esito.stato).toBe('applicato')
    if (regionale.esito.stato !== 'applicato') return
    // 1,23% sull'intero imponibile, non su quello che eccede i 30.000.
    expect(regionale.esito.esce).toBeCloseTo((rc * 1.23) / 100, 6)

    // La deduzione non decresce: sopra la soglia il passo dice che non spetta.
    const passo = regionale.dettaglio?.find((d) => d.id === 'deduzione-regionale')
    expect(passo?.esito.stato).toBe('nonDovuto')
  })

  /**
   * ⚠️ Il gradino misurato, ed è il più grande del ramo locale. −369 euro
   * di netto per due centesimi di RAL: il doppio di quello di Milano, e cade a
   * una RAL di circa 33.036.
   */
  it('produce un gradino di circa −369 euro, il più grande del ramo locale', () => {
    const sotto = calcolo(RAL_SOTTO)
    const sopra = calcolo(RAL_SOPRA)

    expect(sopra.netto).toBeLessThan(sotto.netto)
    expect(sotto.netto - sopra.netto).toBeCloseTo(369, 0)
  })

  /**
   * ⚠️ La prosa segue il calcolo, o le due verità divergono. Il passo
   * ordinario dice *«si calcola sulla stessa base dell'IRPEF»*, e con la
   * deduzione quella base non è più la stessa: la frase deve cambiare insieme
   * al numero.
   */
  it('quando la deduzione spetta, la spiegazione non dice più «stessa base dell’IRPEF»', () => {
    const { regionale: conDeduzione } = calcolo(RAL_SOTTO)
    const { regionale: senza } = calcolo(RAL_SOPRA)
    expect(conDeduzione.spiegazione).not.toBe(senza.spiegazione)
    expect(conDeduzione.spiegazione).toContain('deduzione')
  })

  it('nessun altro ente la prende: a Milano il campo è null', () => {
    const milano = risolviComune('F205')
    if (milano?.stato !== 'calcolabile') throw new Error('ko')
    const reg = milano.enti.regionale
    if (reg.stato !== 'deliberato') return
    expect(reg.parametri.deduzione).toBeNull()
  })
})


describe('la mappatura è comune → ente impositore', () => {
  it('ogni comune punta a un ente presente nel prospetto regionale', () => {
    const enti = new Set(datiRegioni.enti.map((e) => e.nome))
    const orfani = datiComuni.comuni.filter((c) => c.enteRegionale === null || !enti.has(c.enteRegionale))
    expect(orfani).toEqual([])
  })

  it('il Trentino-Alto Adige non esiste come ente impositore', () => {
    const nomi = datiRegioni.enti.map((e) => e.nome)
    expect(nomi).toContain('PROVINCIA AUTONOMA DI TRENTO')
    expect(nomi).toContain('PROVINCIA AUTONOMA DI BOLZANO')
    expect(nomi.some((n) => /TRENTINO/i.test(n))).toBe(false)
  })
})


describe('il confine verso il client', () => {
  it('la lista leggera porta quattro campi, più la ragione dove serve', () => {
    const lista = comuniSelezionabili()
    expect(lista).toHaveLength(7_897)

    // ⚠️ Il controllo è strutturale, non una ricerca di stringa: la parola
    // «aliquota» compare legittimamente dentro la ragione di Trento e Bolzano —
    // *«applicare al suo posto l'aliquota lombarda darebbe un numero credibile
    // e sbagliato»* — e cercarla lì dentro confonde la spiegazione col dato.
    // Quello che non deve attraversare il confine è un valore.
    // ⚠️ `enteRegionale` è entrato con D-063: la pagina lo mostra accanto al
    // comune, e non è un'aliquota — è il nome di chi impone il tributo.
    const ammessi = new Set([
      'codiceCatastale',
      'nome',
      'provincia',
      'enteRegionale',
      'calcolabile',
      'ragione',
    ])
    const estranei = [...new Set(lista.flatMap((c) => Object.keys(c)))].filter((k) => !ammessi.has(k))
    expect(estranei).toEqual([])

    const numerici = lista.filter((c) => Object.values(c).some((v) => typeof v === 'number'))
    expect(numerici).toEqual([])
  })

  it('i comuni non calcolabili portano la ragione già nella lista (D-037)', () => {
    const nonCalcolabili = comuniSelezionabili().filter((c) => !c.calcolabile)
    // Dopo D-056 ne resta uno: Castegnero Nanto, dove il fallback del
    // c. 752 non si interrompe ma si biforca su due aliquote diverse. Chi apre
    // l'elenco lo vede marcato prima di selezionarlo.
    expect(nonCalcolabili).toHaveLength(1)
    expect(nonCalcolabili[0].codiceCatastale).toBe('M439')
    for (const c of nonCalcolabili) expect(c.ragione?.it).toBeTruthy()
  })

  /**
   * D-058: nel documento va un comune solo, e deve bastare a rendere il
   * campo leggibile prima che l'elenco arrivi.
   */
  it('nel documento entra un comune solo, completo (D-058)', () => {
    const iniziale = comuneIniziale()
    expect(iniziale.codiceCatastale).toBe(CODICE_COMUNE_INIZIALE)
    expect(iniziale.nome).toBe('Milano')
    expect(iniziale.provincia).toBe('MI')
    expect(iniziale.calcolabile).toBe(true)
    // Pesa quattro campi, contro i 7.897 dell'elenco intero.
    expect(JSON.stringify(iniziale).length).toBeLessThan(200)
    expect(JSON.stringify(comuniSelezionabili()).length).toBeGreaterThan(500_000)
  })

  it('la copertura si conta dal dato, non si scrive a mano (D-054)', () => {
    expect(coperturaComuni.totale).toBe(7_897)
    expect(coperturaComuni.calcolabili + coperturaComuni.nonCalcolabili).toBe(coperturaComuni.totale)
    expect(coperturaComuni.estrattoIl).toBe('2026-08-28')
  })
})
