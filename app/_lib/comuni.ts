/**
 * Il catalogo dei comuni che l'handler sa risolvere.
 *
 * **Non è un file di dati normativi.** Non contiene aliquote scritte a mano:
 * gli enti impositori arrivano interi da `data/caso-base.ts` per il caso
 * verificato e da `data/mef/` per tutti gli altri, e qui si aggiunge soltanto
 * la chiave con cui l'interfaccia li seleziona. È il pezzo che `core/types.ts`
 * descrive come «lettura di dati, non calcolo fiscale»: trovare il comune sta
 * a monte del motore, e `risolviComune` è il punto di innesto del dataset MEF.
 *
 * ---------------------------------------------------------------------------
 * Due provenienze, e la differenza è una decisione di prodotto (D-005)
 * ---------------------------------------------------------------------------
 *
 * **Milano e Lombardia restano quelli scritti a mano** in `data/caso-base.ts`:
 * sono i due enti che il progetto dichiara verificati uno per uno. Tutto il
 * resto è **importato** dal MEF a una data dichiarata, e la `Fonte` di ogni
 * ente lo dice — `provenienza: 'importata'`, con l'artefatto e la data di
 * estrazione presi **dal dato**, non da una costante riscritta qui.
 *
 * Che i due valori coincidano non è assunto: lo asserisce
 * `data/mef/caso-base-contro-import.test.ts`, che confronta il parametro
 * scritto a mano con quello importato e fallisce se divergono.
 *
 * ---------------------------------------------------------------------------
 * Il confine verso il client
 * ---------------------------------------------------------------------------
 *
 * ⚠️ **I due JSON entrano solo qui, e questo modulo non è mai importato da un
 * client component**: `page.tsx` lo legge server-side, e i componenti sotto
 * `_components/` ne importano soltanto il **tipo** `ComuneSelezionabile`, che
 * si cancella in compilazione. Al client attraversa il confine la sola lista
 * leggera — codice, nome, provincia, calcolabilità — mai un'aliquota.
 */

import { aliquota, euro, type EnteRisolto, type EntiRisolti, type Fonte, type FormaAliquota, type Multilingua, type ParametriComunali, type ParametriRegionali } from '../../core/types'
import { lombardia, milano } from '../../data/caso-base'
import datiComuni from '../../data/mef/comuni-2026.json'
import datiRegioni from '../../data/mef/regioni-2026.json'

/**
 * Un comune del catalogo è una di due cose, e la differenza va detta.
 *
 * `calcolabile` — entrambi gli enti impositori sono risolti e il motore può
 * percorrere la catena intera. **Ci rientrano anche gli 884 comuni senza
 * addizionale comunale applicabile**: per loro il numero è corretto, non
 * mancante, e rifiutare il calcolo negherebbe un risultato giusto all'11% dei
 * comuni italiani (D-054).
 *
 * `nonCalcolabile` — il comune è nel catalogo, ma un parametro necessario
 * manca. Non è un comune sconosciuto e non è un calcolo che dà zero: è un caso
 * riconosciuto che il perimetro attuale non copre, e il calcolatore lo dice
 * con la sua ragione invece di restituire un numero plausibile e sbagliato
 * (D-037).
 */
export type ComuneDelCatalogo =
  | {
      readonly stato: 'calcolabile'
      readonly codiceCatastale: string
      readonly nome: string
      readonly provincia: string
      readonly enti: EntiRisolti
    }
  | {
      readonly stato: 'nonCalcolabile'
      readonly codiceCatastale: string
      readonly nome: string
      readonly provincia: string
      readonly ragione: Multilingua
    }

// ---------------------------------------------------------------------------
// Le fonti, costruite dal dato
//
// [D-005] «Il JSON porta dentro di sé la data di estrazione, così la dicitura
// in pagina viene dal dato e non da una costante scritta a mano che si
// dimenticherà di aggiornare.» Queste `Fonte` si compongono dai blocchi
// `provenienza` e `artefatti` dei due file: se l'import viene rifatto a una
// data diversa, la pagina lo dice da sola.
// ---------------------------------------------------------------------------

const { giornaliero2026, annuale2025 } = datiComuni.artefatti
const { regionale2026 } = datiRegioni.artefatti

const fonteGiornaliero2026: Fonte = {
  atto: `MEF, ${giornaliero2026.descrizione.split(':')[0]}`,
  url: 'https://www1.finanze.gov.it/finanze/index_addcom.php',
  consultataIl: giornaliero2026.estrattoIl,
  provenienza: 'importata',
  estrattoIl: giornaliero2026.estrattoIl,
}

const fonteAnnuale2025: Fonte = {
  atto: `MEF, ${annuale2025.dicituraInFile.replace(/^Elenco/, 'Elenco annuale addizionale comunale IRPEF 2025,')}`,
  url: 'https://www1.finanze.gov.it/finanze/index_addcom.php',
  consultataIl: annuale2025.estrattoIl,
  provenienza: 'importata',
  estrattoIl: annuale2025.estrattoIl,
}

/** La norma che impone il fallback, non il dato ereditato. */
const normaDiFallback: Fonte = {
  atto: datiComuni.normaDiFallback.atto,
  riferimento: datiComuni.normaDiFallback.riferimento,
  url: 'https://def.finanze.it',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * ⚠️ **La riserva sul set di scaglioni ereditato, e non è una formalità.**
 *
 * L'elenco annuale 2025 dice *quante* aliquote ha un comune, non su *quali*
 * confini: il set si infersce dalla cardinalità, e l'euristica tiene al 98,5%.
 * Su circa 560 comuni multialiquota, **sei finiscono sul set sbagliato**
 * [Fonti §15.b]. Chi capita su uno di quei comuni vede la riserva accanto al
 * numero, invece di leggere un'aliquota presentata come certa.
 */
const setInferito: Multilingua = {
  it: 'Su questi scaglioni abbiamo una riserva. L’elenco annuale del ministero riporta quante aliquote ha il comune, non su quali soglie: quali siano è stato dedotto dal loro numero. È giusto per il 98,5% dei comuni a più aliquote — sei su circa 560 no.',
  en: 'We have a caveat on these bands. The ministry’s annual list states how many rates a municipality has, not which thresholds they sit on: which ones apply was inferred from their count. That is right for 98.5% of multi-rate municipalities — six out of roughly 560 it is not.',
}

/**
 * ⚠️ Stessa riserva già registrata in `data/caso-base.ts` per la Lombardia, e
 * vale per l'intero prospetto: la colonna `NORME` cita **la legge regionale che
 * autorizza** l'addizionale, non sempre l'atto che ne ha fissato i valori per
 * l'anno. Finché quei provvedimenti non sono reperiti uno per uno, i valori
 * sono citati sul prospetto ministeriale.
 */
const riservaProspettoRegionale: Multilingua = {
  it: 'Su questa aliquota abbiamo una riserva. L’elenco ministeriale indica la legge regionale che autorizza l’addizionale, non sempre l’atto che ne ha fissato i valori per il 2026.',
  en: 'We have a caveat on this rate. The ministerial list points to the regional law that authorises the addizionale, not always to the act that set its 2026 figures.',
}

// ---------------------------------------------------------------------------
// Dal JSON ai tipi del motore
//
// I due file sono generati da `scripts/importa-mef.mjs`, che è JavaScript: il
// confine dove il dato diventa tipato è **questo**, e le conversioni qui sotto
// lanciano invece di restituire un valore approssimato. Un `throw` all'avvio
// del server è un difetto che si vede; un `as` silenzioso è un numero sbagliato
// che non si vede.
// ---------------------------------------------------------------------------

interface FormaAliquotaJson {
  readonly forma: string
  readonly aliquota?: number
  readonly scaglioni?: readonly { readonly da: number; readonly a: number | null; readonly aliquota: number }[]
}

function formaAliquota(j: FormaAliquotaJson, dove: string): FormaAliquota {
  if (j.forma === 'unica') {
    if (typeof j.aliquota !== 'number') throw new Error(`${dove}: forma «unica» senza aliquota`)
    return { forma: 'unica', aliquota: aliquota(j.aliquota) }
  }
  if (j.forma === 'scaglioni-vigenti' || j.forma === 'scaglioni-previgenti') {
    if (!j.scaglioni) throw new Error(`${dove}: forma «${j.forma}» senza scaglioni`)
    return {
      forma: j.forma,
      scaglioni: j.scaglioni.map((s) => ({
        da: euro(s.da),
        a: s.a === null ? null : euro(s.a),
        aliquota: aliquota(s.aliquota),
      })),
    }
  }
  throw new Error(`${dove}: forma di aliquota sconosciuta «${j.forma}»`)
}

// ---------------------------------------------------------------------------
// Gli enti regionali
// ---------------------------------------------------------------------------

const entiRegionali = new Map<string, EnteRisolto<ParametriRegionali>>(
  datiRegioni.enti.map((e) => [
    e.nome,
    {
      stato: 'deliberato',
      nome: e.nome,
      annoDelibera: datiRegioni.provenienza.annoImposta,
      fonte: {
        atto: `MEF, ${regionale2026.descrizione}`,
        riferimento: e.norme ?? `${e.nome} — provvedimento n. ${e.numeroProvvedimento} del ${e.dataPubblicazione}`,
        url: 'https://www1.finanze.gov.it/finanze/index_addreg.php',
        consultataIl: regionale2026.estrattoIl,
        provenienza: 'importata',
        estrattoIl: regionale2026.estrattoIl,
        nonVerificato: riservaProspettoRegionale,
      },
      parametri: {
        aliquota: formaAliquota(e.aliquota, e.nome),
        // Le detrazioni regionali esistono nel testo libero del prospetto per
        // otto enti, ma ricavarne importo e banda da quella prosa sarebbe un
        // parametro senza fonte. L'array resta vuoto e il motore dichiara la
        // mancanza in traccia invece di applicare un numero inventato (D-033).
        detrazioni: [],
      },
    } satisfies EnteRisolto<ParametriRegionali>,
  ]),
)

// ---------------------------------------------------------------------------
// I comuni
// ---------------------------------------------------------------------------

/**
 * ⚠️ **Trento e Bolzano non sono calcolabili, ed è una scoperta della ricerca,
 * non una svista.**
 *
 * È una delle poche conclusioni che ha **falsificato una riga del perimetro** —
 * quella secondo cui la copertura Italia intera è dati e non struttura, e
 * quindi non può rompere il motore. Rompe la struttura: la mappatura non è
 * `comune → regione` ma `comune → ente impositore`, e per due province quel
 * soggetto non è una regione.
 *
 * Il testo è condiviso dai due comuni perché la ragione è la stessa: non
 * riguarda Trento o Bolzano, riguarda l'assetto del Trentino-Alto Adige.
 */
const trentinoAltoAdige: Multilingua = {
  it: 'In Trentino-Alto Adige l’addizionale «regionale» non la fissa la regione: la stabiliscono le due Province autonome, separatamente, ciascuna con le proprie aliquote. La regione, come soggetto che impone il tributo, non esiste. Il calcolatore conosce l’addizionale comunale di questi due comuni ma non quella provinciale, e applicare al suo posto l’aliquota lombarda produrrebbe un numero credibile e sbagliato. Preferiamo dirtelo.',
  en: 'In Trentino-Alto Adige the “regional” surcharge is not set by the region: it is set by the two autonomous Provinces, separately, each with its own rates. The region, as the authority levying the tax, does not exist. The calculator knows the addizionale comunale of these two municipalities but not the provincial one, and putting the Lombardy rate in its place would produce a credible, wrong number. We would rather tell you.',
}

/**
 * ⚠️ **Il comune assente dall'elenco 2025 è un caso esplicito, non un buco.**
 *
 * Ce n'è **uno solo** — Castegnero Nanto, nato dalla fusione di due comuni
 * vicentini — e nel 2026 non ha ancora deliberato. Il c. 752 rinvia all'anno
 * precedente, ma nell'anno precedente quel comune non esisteva: la catena del
 * fallback si interrompe senza che nessuno abbia sbagliato. Resta in elenco,
 * marcato, invece di cadere in un valore indefinito (D-054).
 */
const fusoDopoIlConsolidamento: Multilingua = {
  it: 'Questo comune non ha deliberato l’addizionale per il 2026, e la legge dice di applicare quella dell’anno precedente. Ma nell’elenco consolidato del 2025 non c’è: è nato da una fusione dopo. Non abbiamo un’aliquota da applicare, e inventarne una darebbe un numero credibile e sbagliato.',
  en: 'This municipality did not set its 2026 surcharge, and the law says to apply the previous year’s. But it is absent from the consolidated 2025 list: it was created by a merger afterwards. We have no rate to apply, and making one up would produce a credible, wrong number.',
}

/**
 * Il comune da cui la pagina parte.
 *
 * ⚠️ **Sta qui e non in `page.tsx`, e il motivo è l'import.** La pagina
 * sceglieva «il primo comune calcolabile del catalogo»: con tre voci quello era
 * Milano, con 7.897 ordinate per codice catastale diventa Abano Terme, e il
 * caso base del progetto — quello verificato a mano, quello dei casi di test,
 * quello di cui si conosce il netto a quattro decimali — si sarebbe spostato
 * senza che nessuno lo decidesse.
 */
export const CODICE_COMUNE_INIZIALE = 'F205'

/** Gli enti impositori regionali che il perimetro attuale non copre (D-037). */
const ENTI_FUORI_PERIMETRO = new Set(['PROVINCIA AUTONOMA DI TRENTO', 'PROVINCIA AUTONOMA DI BOLZANO'])

function comunaleDa(c: (typeof datiComuni.comuni)[number]): EnteRisolto<ParametriComunali> {
  const nome = c.nome
  if (c.stato === 'nonIstituito') return { stato: 'nonIstituito', nome }

  if (!c.parametri) throw new Error(`${c.codiceCatastale}: stato «${c.stato}» senza parametri`)
  const parametri: ParametriComunali = {
    aliquota: formaAliquota(c.parametri.aliquota, `${c.codiceCatastale} ${nome}`),
    sogliaEsenzione: c.parametri.sogliaEsenzione === null ? null : euro(c.parametri.sogliaEsenzione),
  }

  if (c.stato === 'deliberato') {
    return {
      stato: 'deliberato',
      nome,
      parametri,
      annoDelibera: c.annoDelibera ?? datiComuni.provenienza.annoImposta,
      fonte: {
        ...fonteGiornaliero2026,
        riferimento: c.numeroDelibera
          ? `${nome} — delibera n. ${c.numeroDelibera}${c.dataPubblicazione ? `, pubblicata il ${c.dataPubblicazione}` : ''}`
          : nome,
      },
    }
  }

  if (c.stato === 'ereditato') {
    return {
      stato: 'ereditato',
      nome,
      parametri,
      annoDiProvenienza: c.annoDiProvenienza ?? datiComuni.provenienza.annoImposta - 1,
      normaDiFallback,
      fonte: {
        ...fonteAnnuale2025,
        riferimento: nome,
        ...(c.setScaglioniInferito ? { nonVerificato: setInferito } : {}),
      },
    }
  }

  throw new Error(`${c.codiceCatastale}: stato comunale sconosciuto «${c.stato}»`)
}

const catalogo: readonly ComuneDelCatalogo[] = datiComuni.comuni.map((c): ComuneDelCatalogo => {
  const identita = { codiceCatastale: c.codiceCatastale, nome: c.nome, provincia: c.provincia }

  if (c.stato === 'nonCalcolabile') {
    return { stato: 'nonCalcolabile', ...identita, ragione: fusoDopoIlConsolidamento }
  }

  // ⚠️ Il prospetto regionale **contiene** le aliquote delle due Province
  // autonome, quindi il parametro tecnicamente c'è. Restano fuori perimetro
  // perché D-037 le esclude e questa non è la sede per revocarlo: la decisione
  // sta in Notion, non in questo file.
  if (c.enteRegionale === null || ENTI_FUORI_PERIMETRO.has(c.enteRegionale)) {
    return { stato: 'nonCalcolabile', ...identita, ragione: trentinoAltoAdige }
  }

  const regionale = entiRegionali.get(c.enteRegionale)
  if (!regionale) throw new Error(`${c.codiceCatastale} ${c.nome}: ente regionale «${c.enteRegionale}» assente dal prospetto`)

  // Milano e Lombardia sono i due enti verificati a mano: il caso base non
  // passa dall'import, e la loro `Fonte` resta quella di `data/caso-base.ts`.
  const enti: EntiRisolti =
    c.codiceCatastale === CODICE_COMUNE_INIZIALE
      ? { regionale: lombardia, comunale: milano }
      : { regionale, comunale: comunaleDa(c) }

  return { stato: 'calcolabile', ...identita, enti }
})

const perCodice = new Map(catalogo.map((c) => [c.codiceCatastale, c]))

/** Il codice catastale è la chiave: è quella del dataset MEF, non il nome. */
export const risolviComune = (codiceCatastale: string): ComuneDelCatalogo | undefined =>
  perCodice.get(codiceCatastale.trim().toUpperCase())

/**
 * La forma che arriva al client: nome, provincia, codice e — se il calcolo non
 * è disponibile — **la ragione, già qui**.
 *
 * La ragione viaggia con la lista e non solo con la risposta d'errore, perché
 * D-037 chiede che questi comuni siano marcati **prima** della selezione: chi
 * apre l'elenco deve vedere il limite, non scoprirlo dopo aver premuto un
 * bottone.
 *
 * Gli enti impositori — aliquote, scaglioni, citazioni — non attraversano il
 * confine: restano server-side, che è la ragione per cui il progetto ha scelto
 * Next (D-004).
 */
export interface ComuneSelezionabile {
  readonly codiceCatastale: string
  readonly nome: string
  readonly provincia: string
  readonly calcolabile: boolean
  readonly ragione?: Multilingua
}

/**
 * Ordinato per nome, che è l'unico ordine consultabile in un elenco a ottomila
 * voci: il JSON resta ordinato per codice catastale, perché lì l'ordine serve a
 * rendere leggibili i diff fra due import, non a farsi scorrere da qualcuno.
 */
const selezionabili: readonly ComuneSelezionabile[] = [...catalogo]
  .sort((a, b) => a.nome.localeCompare(b.nome, 'it') || a.provincia.localeCompare(b.provincia))
  .map((c) =>
    c.stato === 'calcolabile'
      ? { codiceCatastale: c.codiceCatastale, nome: c.nome, provincia: c.provincia, calcolabile: true }
      : {
          codiceCatastale: c.codiceCatastale,
          nome: c.nome,
          provincia: c.provincia,
          calcolabile: false,
          ragione: c.ragione,
        },
  )

export const comuniSelezionabili = (): readonly ComuneSelezionabile[] => selezionabili

/**
 * I numeri della copertura, **ricalcolati dall'import** e non scritti a mano.
 *
 * D-054: «*Copertura Italia intera* va detta con il numero: tutti i comuni
 * risolti, di cui una quota senza addizionale comunale applicabile e due senza
 * ente impositore regionale. Il numero è più forte dell'aggettivo.»
 */
export const coperturaComuni = {
  totale: catalogo.length,
  calcolabili: catalogo.filter((c) => c.stato === 'calcolabile').length,
  senzaAddizionaleComunale: datiComuni.conteggi.nonIstituito,
  nonCalcolabili: catalogo.filter((c) => c.stato === 'nonCalcolabile').length,
  estrattoIl: datiComuni.provenienza.estrattoIl,
} as const
