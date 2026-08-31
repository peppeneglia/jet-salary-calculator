/**
 * Parametri locali di Milano e della Lombardia, scritti a mano.
 *
 * ⚠️ Dal 29/08 questo file non alimenta più l'applicazione. Milano passa
 * dall'import come tutti gli altri 7.896 comuni, e `app/_lib/comuni.ts` non lo
 * importa più. Quello che resta serve ai fixture e ai test, ed è la sua
 * sola ragione di esistere adesso.
 *
 * Perché è caduta la ragione precedente. Il file esisteva per la
 * distinzione di D-005 fra parametro *verificato* e *importato*: Milano e
 * Lombardia sarebbero stati «verificati uno per uno». Quella distinzione non
 * era nei dati — le due `Fonte` qui sotto portano entrambe
 * `provenienza: 'importata'`, e il commento su `elencoComunaleAnnuale2025` lo
 * dice: la delibera del Comune di Milano non è stata letta. Restava lo stesso
 * numero in due sedi, cioè il difetto che D-052 ha già chiuso altrove.
 *
 * A cosa serve oggi. I tre valori — l'aliquota comunale, la soglia, gli
 * scaglioni regionali — sono le misure registrate in *Fonti* §15, e
 * `fixtures/import-mef.test.ts` le confronta con ciò che l'import produce. Non
 * è più un confronto fra due sedi vive: è l'ancoraggio dell'import a quello che
 * è stato letto sul prospetto. Se un import futuro portasse altro, si vede.
 *
 * ⚠️ Da emendare in Notion: D-005 e la riga di `CLAUDE.md` §4 affermano
 * ancora la verifica sulle delibere. La voce la scrive l'autore.
 *
 * Nessuna logica: nessuna funzione che risolve un comune, nessun parsing.
 */

import {
  aliquota,
  euro,
  type EnteRisolto,
  type Fonte,
  type FormaAliquota,
  type ParametriComunali,
  type ParametriRegionali,
} from '../core/types'

// Fonti

/**
 * [Fonti §15.a] La fonte delle aliquote regionali della Lombardia.
 *
 * ✅ **La riserva è caduta il 31/08/2026, ed è caduto anche il ragionamento che
 * la reggeva — D-076.** Questo docblock diceva: *la colonna* `NORME` *cita
 * l'art. 72 c. 1 della L.R. 14/07/2003 n. 10, che è la legge abilitante; una
 * legge del 2003 non può aver fissato una struttura a quattro fasce sul set
 * previgente, divenuta lecita solo con il c. 727 della L. 207/2024*.
 *
 * **Era sbagliato due volte.** L'art. 72 si intitola «Determinazione delle
 * aliquote» e la l.r. 10/2003 è un **testo unico**, che si modifica in luogo:
 * la data dell'atto non data i suoi contenuti. E le quattro fasce non sono
 * state rese lecite dal c. 727 — erano la struttura ordinaria dal 2022 al 2024,
 * introdotta dalla L. 234/2021 e recepita dalla **l.r. 31/03/2022 n. 5**, che
 * ha sostituito quel comma 1. Il c. 727 consente solo di **tenerle**.
 *
 * La citazione ora è l'atto regionale, non il prospetto. Il prospetto MEF
 * resta la fonte dei valori per gli altri venti enti, con la riserva, in
 * `app/_lib/comuni.ts`.
 */
export const prospettoRegionaleMef: Fonte = {
  atto: 'L.R. Lombardia 14/07/2003 n. 10, come sostituito dall’art. 1 c. 1 lett. a) della L.R. Lombardia 31/03/2022 n. 5',
  riferimento: 'art. 72 c. 1 — Determinazione delle aliquote',
  url: 'https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/**
 * [Fonti §15.b] L'elenco annuale è uno snapshot congelato e datato, non la
 * vista giornaliera che cambia ogni giorno: è l'artefatto giusto da citare, ed
 * è quello che risponde alla domanda «cosa si applica» invece di «cosa è stato
 * deliberato».
 *
 * La delibera del Comune di Milano non è stata letta: il valore viene
 * dall'elenco ministeriale, quindi è importato.
 */
export const elencoComunaleAnnuale2025: Fonte = {
  atto: 'MEF, Elenco annuale addizionale comunale IRPEF 2025 (aggiornato al 13/03/2026)',
  consultataIl: '2026-08-28',
  provenienza: 'importata',
  estrattoIl: '2026-03-13',
}

/**
 * [Fonti §7, §15] Il fallback per chi non delibera non è aliquota zero: si
 * applicano scaglioni e aliquote già vigenti nell'ente nell'anno precedente.
 * Al 28/08/2026 riguarda il 61% dei comuni, Milano compresa: è il ramo
 * principale dell'import, non una correzione.
 */
const fallbackAnnoPrecedente: Fonte = {
  atto: 'L. 30/12/2024 n. 207, come mod. dall\'art. 1 c. 650 della L. 30/12/2025 n. 199',
  riferimento: 'art. 1 c. 752',
  url: 'https://def.finanze.it',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

// Il caso base

/**
 * Quattro fasce con la prima soglia a 15.000: è il set previgente,
 * autorizzato dal c. 727 della L. 207/2024, non quello dell'IRPEF vigente.
 *
 * Il caso base del progetto richiede quindi questa forma fin dal primo calcolo:
 * un motore che implementasse solo aliquota unica e scaglioni nuovi
 * sbaglierebbe proprio il caso che va in pagina.
 */
export const aliquoteLombardia = {
  forma: 'scaglioni-previgenti',
  scaglioni: [
    { da: euro(0), a: euro(15_000), aliquota: aliquota(1.23) },
    { da: euro(15_000), a: euro(28_000), aliquota: aliquota(1.58) },
    { da: euro(28_000), a: euro(50_000), aliquota: aliquota(1.72) },
    { da: euro(50_000), a: null, aliquota: aliquota(1.73) },
  ],
} as const satisfies FormaAliquota

/** Aliquota unica, ereditata dal 2025. */
export const aliquotaComunaleMilano = aliquota(0.8)

/**
 * Soglia secca, non franchigia: a 23.000,00 l'addizionale è zero, a 23.000,01 è
 * 184,00 sull'intera base. È un gradino di −184 euro di netto per un euro di
 * reddito, a una RAL di circa 25.328.
 */
export const sogliaEsenzioneMilano = euro(23_000)

export const lombardia: EnteRisolto<ParametriRegionali> = {
  stato: 'deliberato',
  nome: 'Lombardia',
  annoDelibera: 2026,
  fonte: prospettoRegionaleMef,
  parametri: {
    aliquota: aliquoteLombardia,
    // Le detrazioni regionali esistono — Umbria 150 €, Lazio 60 € — ma la
    // Lombardia non ne prevede. L'array vuoto è un dato, non un segnaposto.
    detrazioni: [],
    // Stessa cosa per la soglia: un ente su ventuno ne ha una, ed è la
    // Valle d'Aosta (D-057). Il `null` è misurato sul prospetto, non assunto —
    // e quando c'è porta la propria fonte con la riserva di D-059, perché è una
    // regola la cui sola base è l'atto dell'ente.
    sogliaEsenzione: null,
    // E la deduzione dalla base (D-064) la prevede un ente su ventuno, la
    // Provincia autonoma di Trento. Anche questo `null` è misurato sul
    // prospetto: la Lombardia non deduce nulla.
    deduzione: null,
  },
}

export const milano: EnteRisolto<ParametriComunali> = {
  stato: 'ereditato',
  nome: 'Milano',
  annoDiProvenienza: 2025,
  normaDiFallback: fallbackAnnoPrecedente,
  fonte: elencoComunaleAnnuale2025,
  parametri: {
    aliquota: { forma: 'unica', aliquota: aliquotaComunaleMilano },
    sogliaEsenzione: sogliaEsenzioneMilano,
  },
}
