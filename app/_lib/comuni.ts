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
        // ⚠️ **Un ente su ventuno**, e il numero è misurato sul prospetto, non
        // assunto (D-057). La Valle d'Aosta esenta i redditi fino a 15.000, e
        // il suo stesso testo dichiara che sopra si applica l'aliquota
        // sull'intero imponibile — cioè un cliff, non una franchigia.
        sogliaEsenzione: e.sogliaEsenzione === null ? null : euro(e.sogliaEsenzione),
      },
    } satisfies EnteRisolto<ParametriRegionali>,
  ]),
)

// ---------------------------------------------------------------------------
// I comuni
// ---------------------------------------------------------------------------

/**
 * ⚠️ **Il comune assente dall'elenco 2025: la catena del fallback non si
 * interrompe, si biforca — ed è per questo che non è uno zero.**
 *
 * Ce n'è **uno solo**, Castegnero Nanto (VI), e i file raccontano tutta la
 * storia: il giornaliero 2026 porta **tre** codici — `C056` Castegnero, `F838`
 * Nanto e `M439` Castegnero Nanto — tutti e tre a `0*`; l'elenco annuale 2025
 * porta i due predecessori con **aliquote diverse**, 0,65% e 0,75%, e il comune
 * fuso non ce l'ha affatto.
 *
 * Il c. 752 rinvia a *«scaglioni e aliquote già vigenti in ciascun ente
 * nell'anno precedente»*. Nell'anno precedente quel territorio aveva **due**
 * aliquote vigenti. Non c'è un valore da ereditare: ce ne sono due, e sceglierne
 * uno è una decisione, non una lettura.
 *
 * ⚠️ **Perché non è lo stato «senza addizionale applicabile» di D-054.**
 * L'argomento di D-054 per gli 884 è il consolidamento: *un `0*` che sopravvive
 * all'elenco annuale significa nessuna aliquota applicabile*. Qui non c'è uno
 * `0*` che sopravvive — **non c'è la riga**. Un'addizionale a zero direbbe che
 * il comune non ha il tributo, e i suoi due predecessori ce l'avevano entrambi.
 */
const fallbackBiforcato: Multilingua = {
  it: 'Questo comune non ha deliberato l’addizionale per il 2026, e la legge dice di applicare quella già vigente l’anno prima. Ma l’anno prima non esisteva: è nato dalla fusione di Castegnero e Nanto, che avevano due aliquote diverse — 0,65% e 0,75%. Non c’è un’aliquota da ereditare, ce ne sono due, e sceglierne una non spetta a noi. Mettere zero direbbe che qui l’addizionale non si paga, e non è vero.',
  en: 'This municipality did not set its 2026 surcharge, and the law says to apply the one already in force the year before. But the year before it did not exist: it was formed by merging Castegnero and Nanto, which had two different rates — 0.65% and 0.75%. There is no single rate to inherit, there are two, and picking one is not ours to do. Showing zero would say the surcharge is not levied here, and that is not true.',
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
    return { stato: 'nonCalcolabile', ...identita, ragione: fallbackBiforcato }
  }

  /*
   * ⚠️ **I 282 comuni delle due Province autonome sono calcolabili** (D-056).
   *
   * D-037 li teneva fuori, e non è stata revocata: **si è avverata la sua
   * condizione di caduta**, che la decisione si era scritta da sé — «cade
   * quando entrano i parametri delle due Province». Il prospetto regionale
   * importato contiene le aliquote di entrambe, quindi il parametro c'è.
   *
   * E ciò che D-037 chiamava «Trento e Bolzano» erano in realtà **166 comuni
   * trentini e 116 altoatesini**: l'ente impositore delle Province autonome non
   * riguarda i due capoluoghi, riguarda tutto il territorio.
   *
   * La riserva sulla citazione è quella già dichiarata per la Lombardia —
   * `NORME` espone la legge abilitante e non l'atto che fissa i valori 2026,
   * Bolzano cita il 1998 come la Lombardia cita il 2003 — e applicare due pesi
   * diversi allo stesso difetto sarebbe incoerente.
   */
  if (c.enteRegionale === null) {
    throw new Error(`${c.codiceCatastale} ${c.nome}: nessun ente impositore regionale mappato`)
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
 * L'unica voce dell'elenco che entra nel documento — D-058.
 *
 * ⚠️ **È la condizione perché il caricamento differito non sia un
 * peggioramento.** Il campo deve restare leggibile mentre l'elenco arriva, e
 * per esserlo gli serve il comune scelto **per intero**: un codice catastale da
 * solo mostrerebbe `F205` invece di *Milano (MI)*, o un campo vuoto. Sono
 * quattro campi contro 7.897 voci.
 */
export const comuneIniziale = (): ComuneSelezionabile => {
  const c = selezionabili.find((v) => v.codiceCatastale === CODICE_COMUNE_INIZIALE)
  if (!c) throw new Error(`Il comune iniziale ${CODICE_COMUNE_INIZIALE} non è nel catalogo`)
  return c
}

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
