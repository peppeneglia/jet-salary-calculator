/**
 * Il catalogo dei comuni che l'handler sa risolvere.
 *
 * Non è un file di dati normativi. Non contiene aliquote scritte a mano:
 * gli enti impositori arrivano interi da `data/mef/`, e qui si aggiunge
 * soltanto la chiave con cui l'interfaccia li seleziona. È il pezzo che
 * `core/types.ts` descrive come «lettura di dati, non calcolo fiscale»:
 * trovare il comune sta a monte del motore, e `risolviComune` è il punto in
 * cui il dataset MEF entra nell'applicazione.
 *
 * Una provenienza sola, dal 29/08
 *
 * Tutti e 7.897 i comuni passano dall'import, Milano compresa. La `Fonte`
 * di ogni ente lo dice — `provenienza: 'importata'`, con l'artefatto e la data
 * di estrazione presi dal dato, non da una costante riscritta qui.
 *
 * ⚠️ Prima Milano e Lombardia arrivavano scritti a mano da `data/caso-base.ts`,
 * in nome della distinzione di D-005 fra parametro *verificato* e *importato*.
 * Quella distinzione non era nei dati: entrambe quelle `Fonte` portavano
 * `provenienza: 'importata'`. Restava lo stesso numero in due sedi, e la sede a
 * valle è stata tolta. Il dettaglio sta accanto al `return` che la usava.
 *
 * I nomi
 *
 * Il prospetto scrive tutto in maiuscolo — `MILANO`, `REGIONE LOMBARDIA` — che
 * è la convenzione di stampa di un archivio, non un dato. `nomi-comuni.ts` e
 * `data/nomi-enti.ts` lo riportano alla forma che si legge in pagina, senza
 * aggiungere diacritici che la fonte non segna.
 *
 * Il confine verso il client
 *
 * ⚠️ I due JSON entrano solo qui, e questo modulo non è mai importato da un
 * client component: `page.tsx` lo legge server-side, e i componenti sotto
 * `_components/` ne importano soltanto il tipo `ComuneSelezionabile`, che
 * si cancella in compilazione. Al client attraversa il confine la sola lista
 * leggera — codice, nome, provincia, calcolabilità — mai un'aliquota.
 */

import {
  aliquota,
  euro,
  type DetrazioneLocale,
  type EnteRisolto,
  type EntiRisolti,
  type Fonte,
  type FormaAliquota,
  type FormaAliquotaRegionale,
  type Multilingua,
  type ParametriComunali,
  type ParametriRegionali,
} from '../../core/types'
import { nomeEnte } from '../../data/nomi-enti'
import { nomeComune } from './nomi-comuni'
import datiComuni from '../../data/mef/comuni-2026.json'
import datiRegioni from '../../data/mef/regioni-2026.json'

/**
 * Un comune del catalogo è una di due cose, e la differenza va detta.
 *
 * `calcolabile` — entrambi gli enti impositori sono risolti e il motore può
 * percorrere la catena intera. Ci rientrano anche gli 884 comuni senza
 * addizionale comunale applicabile: per loro il numero è corretto, non
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

// Le fonti, costruite dal dato
//
// [D-005] «Il JSON porta dentro di sé la data di estrazione, così la dicitura
// in pagina viene dal dato e non da una costante scritta a mano che si
// dimenticherà di aggiornare.» Queste `Fonte` si compongono dai blocchi
// `provenienza` e `artefatti` dei due file: se l'import viene rifatto a una
// data diversa, la pagina lo dice da sola.

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
 * ⚠️ La riserva sul set di scaglioni ereditato, e non è una formalità.
 *
 * L'elenco annuale 2025 dice *quante* aliquote ha un comune, non su *quali*
 * confini: il set si infersce dalla cardinalità, e l'euristica tiene al 98,5%.
 * Su circa 560 comuni multialiquota, sei finiscono sul set sbagliato
 * [Fonti §15.b]. Chi capita su uno di quei comuni vede la riserva accanto al
 * numero, invece di leggere un'aliquota presentata come certa.
 */
const setInferito: Multilingua = {
  it: 'Su questi scaglioni abbiamo una riserva. L’elenco annuale del ministero riporta quante aliquote ha il comune, non su quali soglie: quali siano è stato dedotto dal loro numero. È giusto per il 98,5% dei comuni a più aliquote — sei su circa 560 no.',
  en: 'We have a caveat on these bands. The ministry’s annual list states how many rates a municipality has, not which thresholds they sit on: which ones apply was inferred from their count. That is right for 98.5% of multi-rate municipalities — six out of roughly 560 it is not.',
}

/**
 * ⚠️ Stessa riserva già registrata in `data/caso-base.ts` per la Lombardia, e
 * vale per l'intero prospetto: la colonna `NORME` cita la legge regionale che
 * autorizza l'addizionale, non sempre l'atto che ne ha fissato i valori per
 * l'anno. Finché quei provvedimenti non sono reperiti uno per uno, i valori
 * sono citati sul prospetto ministeriale.
 */
/**
 * ⚠️ La riserva di D-059, ed è più profonda di quella sulla fonte.
 *
 * Quella sul prospetto dice *non sappiamo quale atto fissi questo valore*.
 * Questa dice se esista un atto statale che dia all'ente la facoltà di
 * prevedere il meccanismo: l'art. 50 istituisce l'addizionale regionale e non
 * nomina la soglia di esenzione. L'ente la delibera, il calcolatore la applica,
 * e la norma che gliene attribuisce il potere non risulta.
 *
 * ⚠️ Le parole sono di esistenza, non di quantità, e non è uno stile. Le
 * altre riserve del progetto dicono *più alto del reale* perché lì il numero c'è
 * e potrebbe essere sbagliato. Qui la soglia è un presupposto binario: da
 * essa dipende *se* l'addizionale sia dovuta, non *di quanto*. Una riserva che
 * parlasse di misura descriverebbe un meccanismo diverso da quello che c'è.
 *
 * Come vuole D-040, dice anche cosa la chiuderebbe.
 */
const facoltaSenzaNormaStatale: Multilingua = {
  it: 'Su questa esenzione abbiamo una riserva, e non riguarda il valore: riguarda il potere di stabilirla. L’articolo statale che istituisce l’addizionale regionale non prevede alcuna soglia di esenzione — l’ente la delibera comunque, e noi la applichiamo come la applica lui. La norma statale che gliene attribuisce la facoltà non risulta, e da questa esenzione dipende se l’addizionale sia dovuta o no. La chiuderebbe quella norma.',
  en: 'We have a caveat on this exemption, and it is not about the figure: it is about the power to set it. The national article creating the regional addizionale provides for no exemption threshold at all — the authority sets one regardless, and we apply it as it does. The national provision granting it that power does not appear to exist, and whether the addizionale is owed at all turns on this exemption. That provision would settle it.',
}

/**
 * La stessa riserva di `facoltaSenzaNormaStatale`, sulle detrazioni (D-059).
 *
 * ⚠️ Non è una copia per pigrizia: è la stessa categoria. D-059 l'ha
 * istituita proprio perché la soglia di esenzione e le detrazioni regionali
 * pongono la stessa domanda — *quale norma statale abilita l'ente a fare
 * questo* — e hanno la stessa risposta: nessuna che risulti, e il potere si
 * esercita comunque. Cambia solo su cosa incide, e la frase lo dice.
 */
const detrazioneSenzaNormaStatale: Multilingua = {
  it: 'Su questa detrazione abbiamo una riserva, e non riguarda l’importo: riguarda il potere di concederla. L’importo lo fissa una legge regionale, che citiamo. Ma l’articolo statale che istituisce l’addizionale regionale non prevede alcuna detrazione — l’ente la delibera comunque, e noi la applichiamo come la applica lui. La norma statale che gliene attribuisce la facoltà non risulta. La chiuderebbe quella norma.',
  en: 'We have a caveat on this credit, and it is not about the amount: it is about the power to grant it. The amount is set by a regional law, which we cite. But the national article creating the regional addizionale provides for no credit at all — the authority grants one regardless, and we apply it as it does. The national provision granting it that power does not appear to exist. That provision would settle it.',
}

/**
 * La stessa riserva di `facoltaSenzaNormaStatale`, sulla deduzione (D-064).
 *
 * ⚠️ Ciò che manca qui è più grosso di quanto manchi sugli altri due, e la
 * frase deve dirlo: una soglia di esenzione e una detrazione muovono *quanta*
 * imposta si paga, questa muove la base imponibile di un tributo che la
 * norma statale definisce come *reddito complessivo al netto degli oneri
 * deducibili*. L'ente la ridefinisce per i propri residenti, e la norma che
 * glielo consenta non risulta.
 */
const deduzioneSenzaNormaStatale: Multilingua = {
  it: 'Su questa deduzione abbiamo una riserva, e non riguarda l’importo: riguarda il potere di concederla. L’importo lo fissa una legge provinciale, che citiamo. Ma l’articolo statale che istituisce l’addizionale regionale ne fissa la base — il reddito complessivo al netto degli oneri deducibili — e non prevede che l’ente possa abbassarla. L’ente la abbassa comunque, e noi la calcoliamo come la calcola lui. La norma statale che gliene attribuisce la facoltà non risulta. La chiuderebbe quella norma.',
  en: 'We have a caveat on this deduction, and it is not about the amount: it is about the power to grant it. The amount is set by a provincial law, which we cite. But the national article creating the regional addizionale fixes its base — total income net of deductible charges — and does not provide for the authority lowering it. The authority lowers it regardless, and we compute it as it does. The national provision granting it that power does not appear to exist. That provision would settle it.',
}

const riservaProspettoRegionale: Multilingua = {
  it: 'Su questa aliquota abbiamo una riserva. L’elenco ministeriale indica la legge regionale che autorizza l’addizionale, non sempre l’atto che ne ha fissato i valori per il 2026.',
  en: 'We have a caveat on this rate. The ministerial list points to the regional law that authorises the addizionale, not always to the act that set its 2026 figures.',
}

// Dal JSON ai tipi del motore
//
// I due file sono generati da `scripts/importa-mef.mjs`, che è JavaScript: il
// confine dove il dato diventa tipato è questo, e le conversioni qui sotto
// lanciano invece di restituire un valore approssimato. Un `throw` all'avvio
// del server è un difetto che si vede; un `as` silenzioso è un numero sbagliato
// che non si vede.

interface ScaglioneJson {
  readonly da: number
  readonly a: number | null
  readonly aliquota: number
}

interface FormaAliquotaJson {
  readonly forma: string
  readonly aliquota?: number
  readonly scaglioni?: readonly ScaglioneJson[]
  readonly fasce?: readonly { readonly redditoDa: number; readonly redditoA: number | null; readonly percentuale: number }[]
  readonly progressioneOltre?: readonly ScaglioneJson[] | null
}

const scaglioniDa = (j: readonly ScaglioneJson[]) =>
  j.map((s) => ({
    da: euro(s.da),
    a: s.a === null ? null : euro(s.a),
    aliquota: aliquota(s.aliquota),
  }))

function formaAliquota(j: FormaAliquotaJson, dove: string): FormaAliquota {
  if (j.forma === 'unica') {
    if (typeof j.aliquota !== 'number') throw new Error(`${dove}: forma «unica» senza aliquota`)
    return { forma: 'unica', aliquota: aliquota(j.aliquota) }
  }
  if (j.forma === 'scaglioni-vigenti' || j.forma === 'scaglioni-previgenti') {
    if (!j.scaglioni) throw new Error(`${dove}: forma «${j.forma}» senza scaglioni`)
    return { forma: j.forma, scaglioni: scaglioniDa(j.scaglioni) }
  }
  throw new Error(`${dove}: forma di aliquota sconosciuta «${j.forma}»`)
}

/**
 * ⚠️ La forma regionale ha una variante in più di quella comunale (D-062).
 *
 * L'aliquota per fascia intera si applica all'intero imponibile e cambia
 * per soglia: al confine c'è un salto secco, non un cambio di pendenza. La
 * conversione sta qui e non nella funzione comunale perché il comunale quella
 * variante non ce l'ha — il file dice «applicabile a scaglione», e un tipo
 * che ammettesse la fascia intera anche lì racconterebbe un dominio più largo
 * di quello vero.
 */
function formaAliquotaRegionale(j: FormaAliquotaJson, dove: string): FormaAliquotaRegionale {
  if (j.forma !== 'fasce-intere') return formaAliquota(j, dove)
  if (!j.fasce) throw new Error(`${dove}: forma «fasce-intere» senza fasce`)
  return {
    forma: 'fasce-intere',
    fasce: j.fasce.map((f) => ({
      redditoDa: euro(f.redditoDa),
      redditoA: f.redditoA === null ? null : euro(f.redditoA),
      percentuale: aliquota(f.percentuale),
    })),
    progressioneOltre: j.progressioneOltre ? scaglioniDa(j.progressioneOltre) : null,
  }
}

// Gli enti regionali

const entiRegionali = new Map<string, EnteRisolto<ParametriRegionali>>(
  datiRegioni.enti.map((e) => [
    // ⚠️ La chiave resta la stringa MEF, il nome no. La prima è
    // l'identificatore con cui il record del comune punta al proprio ente e
    // non si tocca; il secondo è quello che si legge in pagina (`nomi-enti.ts`).
    e.nome,
    {
      stato: 'deliberato',
      nome: nomeEnte(e.nome),
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
        aliquota: formaAliquotaRegionale(e.aliquota, e.nome),
        /*
         * Le detrazioni legate al solo reddito, applicate con pavimento a
         * zero (D-061). Tre enti su ventuno: Bolzano, Lazio, Umbria.
         *
         * ⚠️ Il valore ha una fonte, il meccanismo ha una riserva. La legge
         * regionale che istituisce la detrazione è esposta per ente nella
         * colonna `NORME`, quindi il numero è citabile; è la norma statale
         * che autorizza le regioni a concederle a non risultare — ed è la
         * categoria che D-059 ha istituito, non un caso isolato.
         *
         * Le detrazioni per carichi di famiglia non sono qui e non devono
         * esserci: sei enti le prevedono, e stanno fuori perimetro per D-019
         * come le detrazioni statali dell'art. 12 TUIR, già dichiarate in S-001.
         */
        detrazioni: e.detrazioni.map(
          (d): DetrazioneLocale => ({
            importo: euro(d.importo),
            redditoDa: euro(d.redditoDa),
            redditoA: d.redditoA === null ? null : euro(d.redditoA),
            fonte: {
              atto: e.norme ?? `MEF, ${regionale2026.descrizione}`,
              riferimento: `${e.nome} — detrazione dall'addizionale regionale`,
              url: 'https://www1.finanze.gov.it/finanze/index_addreg.php',
              consultataIl: regionale2026.estrattoIl,
              provenienza: 'importata',
              estrattoIl: regionale2026.estrattoIl,
              nonVerificato: detrazioneSenzaNormaStatale,
            },
          }),
        ),
        // ⚠️ Un ente su ventuno, e il numero è misurato sul prospetto, non
        // assunto (D-057). La Valle d'Aosta esenta i redditi fino a 15.000, e
        // il suo stesso testo dichiara che sopra si applica l'aliquota
        // sull'intero imponibile — cioè un cliff, non una franchigia.
        //
        // Porta la propria fonte, distinta da quella dell'ente, perché la
        // riserva che deve dichiarare è un'altra: non quale atto fissi il
        // valore, ma se esista un atto statale che autorizzi il meccanismo
        // (D-059).
        sogliaEsenzione:
          e.sogliaEsenzione === null
            ? null
            : {
                valore: euro(e.sogliaEsenzione),
                fonte: {
                  atto: e.norme ?? `MEF, ${regionale2026.descrizione}`,
                  riferimento: `${e.nome} — soglia di esenzione dall'addizionale regionale`,
                  url: 'https://www1.finanze.gov.it/finanze/index_addreg.php',
                  consultataIl: regionale2026.estrattoIl,
                  provenienza: 'importata',
                  estrattoIl: regionale2026.estrattoIl,
                  nonVerificato: facoltaSenzaNormaStatale,
                },
              },
        /*
         * La deduzione dalla base (D-064). Un ente su ventuno, la Provincia
         * autonoma di Trento, e il numero è misurato sul prospetto.
         *
         * ⚠️ Porta la propria riserva, e non è quella della soglia. Su
         * questo campo la domanda che resta senza risposta non è *se l'ente
         * possa esentare* ma *se possa spostare la base imponibile di un
         * tributo statale*: è la stessa categoria di D-059 — potere esercitato
         * senza norma statale che risulti — su un piano diverso.
         */
        deduzione:
          e.deduzione === null || e.deduzione === undefined
            ? null
            : {
                importo: euro(e.deduzione.importo),
                redditoMassimo: euro(e.deduzione.redditoMassimo),
                fonte: {
                  atto: e.norme ?? `MEF, ${regionale2026.descrizione}`,
                  riferimento: `${e.nome} — deduzione dalla base dell'addizionale regionale`,
                  url: 'https://www1.finanze.gov.it/finanze/index_addreg.php',
                  consultataIl: regionale2026.estrattoIl,
                  provenienza: 'importata',
                  estrattoIl: regionale2026.estrattoIl,
                  nonVerificato: deduzioneSenzaNormaStatale,
                },
              },
      },
    } satisfies EnteRisolto<ParametriRegionali>,
  ]),
)

// I comuni

/**
 * ⚠️ Il comune assente dall'elenco 2025: la catena del fallback non si
 * interrompe, si biforca — ed è per questo che non è uno zero.
 *
 * Ce n'è uno solo, Castegnero Nanto (VI), e i file raccontano tutta la
 * storia: il giornaliero 2026 porta tre codici — `C056` Castegnero, `F838`
 * Nanto e `M439` Castegnero Nanto — tutti e tre a `0*`; l'elenco annuale 2025
 * porta i due predecessori con aliquote diverse, 0,65% e 0,75%, e il comune
 * fuso non ce l'ha affatto.
 *
 * Il c. 752 rinvia a *«scaglioni e aliquote già vigenti in ciascun ente
 * nell'anno precedente»*. Nell'anno precedente quel territorio aveva due
 * aliquote vigenti. Non c'è un valore da ereditare: ce ne sono due, e sceglierne
 * uno è una decisione, non una lettura.
 *
 * ⚠️ Perché non è lo stato «senza addizionale applicabile» di D-054.
 * L'argomento di D-054 per gli 884 è il consolidamento: *un `0*` che sopravvive
 * all'elenco annuale significa nessuna aliquota applicabile*. Qui non c'è uno
 * `0*` che sopravvive — non c'è la riga. Un'addizionale a zero direbbe che
 * il comune non ha il tributo, e i suoi due predecessori ce l'avevano entrambi.
 */
const fallbackBiforcato: Multilingua = {
  it: 'Questo comune non ha deliberato l’addizionale per il 2026, e la legge dice di applicare quella già vigente l’anno prima. Ma l’anno prima non esisteva: è nato dalla fusione di Castegnero e Nanto, che avevano due aliquote diverse — 0,65% e 0,75%. Non c’è un’aliquota da ereditare, ce ne sono due, e sceglierne una non spetta a noi. Mettere zero direbbe che qui l’addizionale non si paga, e non è vero.',
  en: 'This municipality did not set its 2026 surcharge, and the law says to apply the one already in force the year before. But the year before it did not exist: it was formed by merging Castegnero and Nanto, which had two different rates — 0.65% and 0.75%. There is no single rate to inherit, there are two, and picking one is not ours to do. Showing zero would say the surcharge is not levied here, and that is not true.',
}

/**
 * Il comune da cui la pagina parte.
 *
 * ⚠️ Sta qui e non in `page.tsx`, e il motivo è l'import. La pagina
 * sceglieva «il primo comune calcolabile del catalogo»: con tre voci quello era
 * Milano, con 7.897 ordinate per codice catastale diventa Abano Terme, e il
 * caso base del progetto — quello verificato a mano, quello dei casi di test,
 * quello di cui si conosce il netto a quattro decimali — si sarebbe spostato
 * senza che nessuno lo decidesse.
 */
export const CODICE_COMUNE_INIZIALE = 'F205'

function comunaleDa(c: (typeof datiComuni.comuni)[number]): EnteRisolto<ParametriComunali> {
  const nome = nomeComune(c.nome)
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
  const identita = { codiceCatastale: c.codiceCatastale, nome: nomeComune(c.nome), provincia: c.provincia }

  if (c.stato === 'nonCalcolabile') {
    return { stato: 'nonCalcolabile', ...identita, ragione: fallbackBiforcato }
  }

  /*
   * ⚠️ I 282 comuni delle due Province autonome sono calcolabili (D-056).
   *
   * D-037 li teneva fuori, e non è stata revocata: si è avverata la sua
   * condizione di caduta, che la decisione si era scritta da sé — «cade
   * quando entrano i parametri delle due Province». Il prospetto regionale
   * importato contiene le aliquote di entrambe, quindi il parametro c'è.
   *
   * E ciò che D-037 chiamava «Trento e Bolzano» erano in realtà 166 comuni
   * trentini e 116 altoatesini: l'ente impositore delle Province autonome non
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

  /*
   * ⚠️ Milano passa dall'import come tutti gli altri, e il caso speciale non
   * c'è più.
   *
   * Fino al 29/08 questi due enti arrivavano da `data/caso-base.ts`, scritti a
   * mano, in nome della distinzione di D-005 fra *parametro verificato* e
   * *parametro importato*. Ma quella distinzione non era nei dati: le due
   * `Fonte` scritte a mano portavano entrambe `provenienza: 'importata'`, e il
   * commento sopra una di esse lo diceva — *«la delibera del Comune di Milano
   * non è stata letta: il valore viene dall'elenco ministeriale»*.
   *
   * Restava quindi lo stesso numero in due sedi, che è il difetto che D-052 ha
   * già chiuso altrove: non il numero sbagliato, il numero scritto due volte.
   * Un test asseriva che le due sedi coincidessero — ed è il motivo per cui
   * togliere quella a valle non muove il risultato.
   *
   * Ci si guadagna anche una citazione migliore: il prospetto porta per la
   * Lombardia l'atto vero (*art. 72, comma 1, legge regionale 14 luglio 2003,
   * n. 10*) e l'URL, dove la versione a mano aveva la sola stringa «Lombardia».
   */
  return { stato: 'calcolabile', ...identita, enti: { regionale, comunale: comunaleDa(c) } }
})

const perCodice = new Map(catalogo.map((c) => [c.codiceCatastale, c]))

/**
 * Il nome dell'ente impositore regionale, preso dal dato e non dal catalogo
 * già costruito: vale anche per il comune non calcolabile, che un ente ce l'ha.
 *
 * ⚠️ Esce leggibile, non grezzo. Questo valore attraversa il confine verso
 * il client e finisce nel riquadro *Regione o Provincia autonoma* accanto al
 * campo comune: lì `REGIONE LOMBARDIA` è la stringa di un archivio
 * ministeriale, non un nome che si legge in una pagina.
 */
const entePerComune = new Map(datiComuni.comuni.map((c) => [c.codiceCatastale, c.enteRegionale]))
const enteDi = (codice: string): string => {
  const grezzo = entePerComune.get(codice)
  return grezzo === undefined ? '' : nomeEnte(grezzo)
}

/** Il codice catastale è la chiave: è quella del dataset MEF, non il nome. */
export const risolviComune = (codiceCatastale: string): ComuneDelCatalogo | undefined =>
  perCodice.get(codiceCatastale.trim().toUpperCase())

/**
 * La forma che arriva al client: nome, provincia, codice e — se il calcolo non
 * è disponibile — la ragione, già qui.
 *
 * La ragione viaggia con la lista e non solo con la risposta d'errore, perché
 * D-037 chiede che questi comuni siano marcati prima della selezione: chi
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
  /**
   * ⚠️ L'ente impositore regionale, non la regione geografica (D-063).
   *
   * Per i 282 comuni delle Province autonome l'ente è la Provincia (D-056):
   * scrivere *Trentino-Alto Adige* accanto a un comune trentino sarebbe
   * esattamente l'errore che D-037 esisteva per impedire, e sarebbe
   * credibile — che è la parte peggiore.
   *
   * Attraversa il confine perché la pagina lo mostra accanto al campo, e non è
   * un'aliquota: è il nome di chi impone il tributo.
   */
  readonly enteRegionale: string
  readonly calcolabile: boolean
  readonly ragione?: Multilingua
}

/**
 * Il collatore, costruito una volta e con la lingua dichiarata.
 *
 * ⚠️ Era `localeCompare` per confronto, e sono due difetti in uno. Il primo è
 * che senza collatore esplicito l'ordine dipende da come è configurato il
 * runtime — sul secondo confronto la lingua non era nemmeno indicata — cioè un
 * comportamento visibile all'utente deciso dall'ambiente invece che da noi. È
 * la stessa classe del raggruppamento delle migliaia, chiusa con
 * `useGrouping: 'always'`.
 *
 * Il secondo è il costo: questo `sort` sta a livello di modulo, quindi gira a
 * ogni avvio di processo, e su serverless gli avvii freddi sono la norma.
 * Misurato su 7.897 voci: 49 ms contro 6, con ordine identico.
 *
 * Nessuna opzione oltre alla lingua: `sensitivity` o `ignorePunctuation`
 * cambierebbero l'ordine rispetto a oggi, e qui si vuole lo stesso di prima.
 */
const collatore = new Intl.Collator('it')

/**
 * Ordinato per nome, che è l'unico ordine consultabile in un elenco a ottomila
 * voci: il JSON resta ordinato per codice catastale, perché lì l'ordine serve a
 * rendere leggibili i diff fra due import, non a farsi scorrere da qualcuno.
 */
const selezionabili: readonly ComuneSelezionabile[] = [...catalogo]
  .sort((a, b) => collatore.compare(a.nome, b.nome) || collatore.compare(a.provincia, b.provincia))
  .map((c) => {
    const identita = {
      codiceCatastale: c.codiceCatastale,
      nome: c.nome,
      provincia: c.provincia,
      enteRegionale: enteDi(c.codiceCatastale),
    }
    return c.stato === 'calcolabile'
      ? { ...identita, calcolabile: true }
      : { ...identita, calcolabile: false, ragione: c.ragione }
  })

export const comuniSelezionabili = (): readonly ComuneSelezionabile[] => selezionabili

/**
 * L'unica voce dell'elenco che entra nel documento — D-058.
 *
 * ⚠️ È la condizione perché il caricamento differito non sia un
 * peggioramento. Il campo deve restare leggibile mentre l'elenco arriva, e
 * per esserlo gli serve il comune scelto per intero: un codice catastale da
 * solo mostrerebbe `F205` invece di *Milano (MI)*, o un campo vuoto. Sono
 * quattro campi contro 7.897 voci.
 */
export const comuneIniziale = (): ComuneSelezionabile => {
  const c = selezionabili.find((v) => v.codiceCatastale === CODICE_COMUNE_INIZIALE)
  if (!c) throw new Error(`Il comune iniziale ${CODICE_COMUNE_INIZIALE} non è nel catalogo`)
  return c
}

/**
 * I numeri della copertura, ricalcolati dall'import e non scritti a mano.
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
  /**
   * Gli enti impositori regionali, contati sul prospetto e non scritti a
   * mano (D-070). Sono ventuno perché le due Province autonome deliberano
   * separatamente e il Trentino-Alto Adige non compare come ente: è
   * esattamente il genere di numero che, riscritto in una pagina di prosa,
   * diventa falso al primo cambio del dataset senza che nessuno se ne accorga.
   */
  entiRegionali: datiRegioni.enti.length,
  estrattoIl: datiComuni.provenienza.estrattoIl,
} as const
