/**
 * Le citazioni degli atti regionali — regressione su una tabella scritta a mano.
 *
 * ⚠️ **Questo file esiste per un buco aperto il 31/08/2026 e non chiuso dallo
 * stesso lavoro che l'ha aperto.** Quel giorno `fontiRegionaliVerificate` è
 * passata da una voce a diciannove, ciascuna scritta a mano e **indicizzata per
 * stringa esatta del prospetto MEF** — `REGIONE VALLE D'AOSTA`, `PROVINCIA
 * AUTONOMA DI BOLZANO`. Una chiave scritta male, o un import che domani cambi
 * il nome di un ente, fa **sparire la citazione in silenzio**: la pagina torna
 * al prospetto ministeriale e nessun test fallisce.
 *
 * Le citazioni erano state controllate a mano il giorno stesso. Ma una verifica
 * fatta a mano una volta protegge dal difetto che c'era quel giorno, non da
 * quello che arriva domani — è la definizione che la pagina *Test* dà alle
 * «verifiche che non sono test», ed è questo file a toglierla da quell'elenco.
 *
 * Famiglia: **regressione**. I valori attesi qui non vengono dalla norma,
 * vengono da ciò che il progetto ha deciso di dichiarare. Un fallimento
 * significa *qualcosa si è mosso, dimmi perché*, non *c'è un difetto*.
 */

import { describe, expect, it } from 'vitest'

import { entiRegionaliRisolti } from '../app/_lib/comuni'
import { ancoraFonte, SEZIONI } from '../app/_lib/norme'
import datiRegioni from '../data/mef/regioni-2026.json'

/**
 * I ventuno enti di cui si conosce l'atto, al 31/08/2026.
 *
 * Scritti per esteso e non contati: se uno se ne va, il test deve dire **quale**
 * e non soltanto che il totale è cambiato.
 *
 * ✅ Gli ultimi due sono Puglia e Molise, entrati con **D-080**. Fino a quel
 * giorno erano deliberatamente esclusi, e questo file sorvegliava l'esclusione:
 * il loro dato era superato, e attaccare l'atto giusto a un'aliquota che
 * quell'atto ha rideterminato sarebbe stato peggio del prospetto generico.
 * Corretta la regola di selezione, è caduta la ragione di tenerli fuori.
 */
const CON_CITAZIONE: readonly string[] = [
  'PROVINCIA AUTONOMA DI BOLZANO',
  'PROVINCIA AUTONOMA DI TRENTO',
  'REGIONE ABRUZZO',
  'REGIONE BASILICATA',
  'REGIONE CALABRIA',
  'REGIONE CAMPANIA',
  'REGIONE EMILIA-ROMAGNA',
  'REGIONE FRIULI VENEZIA GIULIA',
  'REGIONE LAZIO',
  'REGIONE LIGURIA',
  'REGIONE LOMBARDIA',
  'REGIONE MARCHE',
  'REGIONE MOLISE',
  'REGIONE PIEMONTE',
  'REGIONE PUGLIA',
  'REGIONE SARDEGNA',
  'REGIONE SICILIA',
  'REGIONE TOSCANA',
  'REGIONE UMBRIA',
  "REGIONE VALLE D'AOSTA",
  'REGIONE VENETO',
]

/** I due enti con più di un provvedimento nel 2026: sono questi e nessun altro. */
const CON_SECONDO_PROVVEDIMENTO: readonly string[] = ['REGIONE MOLISE', 'REGIONE PUGLIA']

const enti = () => entiRegionaliRisolti()

describe('le citazioni degli atti regionali', () => {
  it('il catalogo ha ventuno enti impositori', () => {
    // Non venti: il Trentino-Alto Adige non esiste come soggetto impositore,
    // ci sono le due province autonome. È la scoperta del §11 di *Fonti*.
    expect(enti().size).toBe(21)
  })

  it('ogni chiave della tabella corrisponde a un ente che esiste', () => {
    const nomiMef = new Set(datiRegioni.enti.map((e) => e.nome))
    for (const nome of CON_CITAZIONE) {
      expect(nomiMef.has(nome), `«${nome}» non è un ente del prospetto MEF`).toBe(true)
    }
  })

  it.each(CON_CITAZIONE)('%s cita il proprio atto, con link', (nome) => {
    const ente = enti().get(nome)
    expect(ente, `${nome} non è nel catalogo`).toBeDefined()
    if (!ente || ente.stato === 'nonIstituito') throw new Error(`${nome}: ente non istituito`)

    /*
     * `verificata` qui non vuol dire «più affidabile del prospetto» — quella
     * lettura è caduta con l'emenda a D-076. Vuol dire che si cita l'atto
     * dell'ente, che porta articolo e comma, invece dell'elenco ministeriale.
     */
    expect(ente.fonte.provenienza, `${nome} dovrebbe citare l'atto`).toBe('verificata')
    expect(ente.fonte.url, `${nome} senza link alla fonte primaria`).toBeTruthy()
    expect(ente.fonte.riferimento, `${nome} senza articolo e comma`).toBeTruthy()
    expect(ente.fonte.atto.length, `${nome} con atto vuoto`).toBeGreaterThan(0)
  })

  it('nessun ente porta più la riserva generica sul prospetto', () => {
    // La riserva è caduta su decisione dell'autore (emenda a D-076): la sua
    // premessa — il prospetto come fonte di serie B — era il punto debole.
    for (const [nome, ente] of enti()) {
      if (ente.stato === 'nonIstituito') continue
      expect(ente.fonte.nonVerificato, `${nome} porta ancora una riserva`).toBeUndefined()
    }
  })

  it('tutti e ventuno gli enti citano il proprio atto', () => {
    const verificati = [...enti().values()].filter(
      (e) => e.stato !== 'nonIstituito' && e.fonte.provenienza === 'verificata',
    )
    expect(verificati.length).toBe(21)
    expect(CON_CITAZIONE).toHaveLength(21)
  })

  /*
   * ⚠️ Questo blocco sorvegliava, fino a D-080, che Puglia e Molise restassero
   * **senza** citazione, perché il loro dato era superato. Ora sorveglia il
   * contrario, ed è la rete che la nuova regola da sola non ha: D-080 è ancora
   * meccanica — tiene il provvedimento più recente — e l'unica cosa che la
   * rende giusta è che il più recente sia effettivamente quello efficace.
   * Se un giorno si tornasse a tenere il primo, o comparisse un terzo ente con
   * due provvedimenti, questi test lo dicono invece di lasciarlo passare.
   */
  describe('la selezione tiene il provvedimento più recente (D-080)', () => {
    it('gli enti con un secondo provvedimento sono due, e sono questi', () => {
      const conSecondo = datiRegioni.enti
        .filter((e) => (e.provvedimentiScartati ?? []).length > 0)
        .map((e) => e.nome)
        .sort()
      expect(conSecondo).toEqual([...CON_SECONDO_PROVVEDIMENTO])
    })

    it.each(CON_SECONDO_PROVVEDIMENTO)('%s tiene il più recente e supera il più antico', (nome) => {
      const riga = datiRegioni.enti.find((e) => e.nome === nome)
      expect(riga, `${nome} assente dal prospetto`).toBeDefined()
      const superati = riga?.provvedimentiScartati ?? []
      expect(superati.length, `${nome}: nessun provvedimento superato`).toBeGreaterThan(0)

      const tenuto = riga?.dataPubblicazione ?? ''
      const tuttiPrecedenti = superati.every((p) => p.dataPubblicazione < tenuto)
      expect(
        tuttiPrecedenti,
        `${nome}: il tenuto (${tenuto}) dovrebbe essere il più recente — se non lo è, la regola è tornata a D-053`,
      ).toBe(true)
    })
  })
})

/*
 * ⚠️ **Le due catene erano separate, e questo blocco le lega.**
 *
 * `fontiRegionaliVerificate` dice *quale atto* citiamo accanto al numero;
 * `app/_lib/norme.ts` dice *cosa quell'atto dispone*. Fino al 31/08/2026 le due
 * vivevano senza sapere l'una dell'altra: la citazione dell'Umbria compariva nel
 * risultato e in `/norme` non esisteva, quindi chi la seguiva non arrivava da
 * nessuna parte. Ora ogni ente ha la sua scheda, e questi test sorvegliano che
 * il legame regga — perché è fatto di stringhe, e le stringhe si spostano.
 *
 * Famiglia: **regressione strutturale**. Non verificano un numero di legge:
 * verificano che ciò che l'app promette all'utente — *da dove viene questo
 * numero* — abbia una destinazione.
 */
describe('ogni ente regionale ha la propria scheda in /norme', () => {
  const schede = SEZIONI.flatMap((s) => s.schede)

  it.each(CON_CITAZIONE)('la citazione di %s risolve a una scheda dell’archivio', (nome) => {
    const ente = enti().get(nome)
    if (!ente || ente.stato === 'nonIstituito') throw new Error(`${nome}: ente non istituito`)

    const ancora = ancoraFonte(ente.fonte)
    expect(ancora, `${nome}: la citazione non porta a nessuna scheda`).toBeDefined()

    const scheda = schede.find((s) => s.id === ancora)
    expect(scheda, `${nome}: l’ancora «${ancora}» non esiste in /norme`).toBeDefined()
  })

  it('le schede regionali sono ventuno, una per ente impositore', () => {
    const regionali = schede.filter((s) => s.id.startsWith('reg-'))
    expect(regionali).toHaveLength(21)
  })

  it('ogni scheda regionale rimanda allo stesso atto della citazione', () => {
    /*
     * L'url della scheda e quello della `Fonte` devono coincidere: sono lo
     * stesso atto letto nello stesso posto. Se divergono, l'utente legge una
     * cosa accanto al numero e ne apre un'altra dall'archivio.
     */
    const perUrl = new Map(schede.filter((s) => s.id.startsWith('reg-')).map((s) => [s.url, s.id]))
    for (const nome of CON_CITAZIONE) {
      const ente = enti().get(nome)
      if (!ente || ente.stato === 'nonIstituito') continue
      expect(
        perUrl.has(ente.fonte.url),
        `${nome}: nessuna scheda regionale punta a ${ente.fonte.url}`,
      ).toBe(true)
    }
  })
})

/*
 * La salute dell'archivio, e sono le tre cose che si rompono da sole.
 *
 * ⚠️ Il terzo test è nato da una misura, non da un timore: al 31/08/2026
 * diciannove schede su trentasei portavano `https://def.finanze.it`, cioè la
 * **home del portale**. Un link alla home sembra una fonte e non lo è — chi lo
 * segue non trova l'atto e non sa di non averlo trovato.
 */
describe('l’archivio delle norme è sano', () => {
  const schede = SEZIONI.flatMap((s) => s.schede)

  it('nessun id di scheda è duplicato', () => {
    const visti = new Map<string, number>()
    for (const s of schede) visti.set(s.id, (visti.get(s.id) ?? 0) + 1)
    const doppi = [...visti.entries()].filter(([, n]) => n > 1).map(([id]) => id)
    expect(doppi, `id duplicati: ${doppi.join(', ')}`).toEqual([])
  })

  it('ogni scheda ha un link', () => {
    const senza = schede.filter((s) => !s.url).map((s) => s.id)
    expect(senza, `schede senza url: ${senza.join(', ')}`).toEqual([])
  })

  it('nessun link punta alla radice di un portale', () => {
    /* Una radice è un url senza percorso: `https://host` o `https://host/`. */
    const radici = schede
      .filter((s) => s.url !== undefined && /^https?:\/\/[^/]+\/?$/u.test(s.url))
      .map((s) => `${s.id} → ${s.url}`)
    expect(radici, `link alla home di un portale: ${radici.join(', ')}`).toEqual([])
  })
})
