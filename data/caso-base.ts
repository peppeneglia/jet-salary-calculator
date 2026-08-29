/**
 * Parametri locali del caso base, scritti a mano.
 *
 * Milano e Lombardia sono i due enti che il progetto dichiara **verificati uno
 * per uno**, contro il resto d'Italia che arriverà importato dal MEF a una data
 * dichiarata. Vivono qui, a mano, perché quella distinzione è una decisione di
 * prodotto (D-005) e non un effetto collaterale dell'import.
 *
 * Nessuna logica: nessuna funzione che risolve un comune, nessun parsing.
 * L'import del dataset arriva dopo e non sostituisce questo file — lo affianca.
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

// ---------------------------------------------------------------------------
// Fonti
// ---------------------------------------------------------------------------

/**
 * [Fonti §15.a] Il prospetto dà i valori 2026 per tutti e 21 gli enti
 * impositori regionali.
 *
 * ⚠️ Riserva da dichiarare in pagina. Per la Lombardia la colonna `NORME` cita
 * l'art. 72 c. 1 della L.R. 14/07/2003 n. 10, che è la **legge abilitante**:
 * una legge del 2003 non può aver fissato una struttura a quattro fasce sul set
 * previgente, divenuta lecita solo con il c. 727 della L. 207/2024. Il
 * provvedimento che fissa le aliquote 2026 non è identificato dal prospetto.
 * Finché non lo si reperisce, i valori sono citati sul prospetto ministeriale e
 * non sull'atto regionale.
 */
export const prospettoRegionaleMef: Fonte = {
  atto: 'MEF, Dipartimento delle Finanze — prospetto addizionale regionale IRPEF 2026',
  riferimento: 'Lombardia',
  consultataIl: '2026-08-28',
  provenienza: 'importata',
  estrattoIl: '2026-08-28',
  nonVerificato: {
    it: 'Su questa aliquota abbiamo una riserva. L\'elenco ministeriale indica la legge regionale che autorizza l\'addizionale, non l\'atto che ne ha fissato i valori per il 2026.',
    en: 'We have a caveat on this rate. The ministerial list points to the regional law that authorises the addizionale, not to the act that set its 2026 figures.',
  },
}

/**
 * [Fonti §15.b] L'elenco **annuale** è uno snapshot congelato e datato, non la
 * vista giornaliera che cambia ogni giorno: è l'artefatto giusto da citare, ed
 * è quello che risponde alla domanda «cosa si applica» invece di «cosa è stato
 * deliberato».
 *
 * La delibera del Comune di Milano non è stata letta: il valore viene
 * dall'elenco ministeriale, quindi è **importato**.
 */
export const elencoComunaleAnnuale2025: Fonte = {
  atto: 'MEF, Elenco annuale addizionale comunale IRPEF 2025 (aggiornato al 13/03/2026)',
  consultataIl: '2026-08-28',
  provenienza: 'importata',
  estrattoIl: '2026-03-13',
}

/**
 * [Fonti §7, §15] Il fallback per chi non delibera **non è aliquota zero**: si
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

// ---------------------------------------------------------------------------
// Il caso base
// ---------------------------------------------------------------------------

/**
 * Quattro fasce con la prima soglia a 15.000: è il **set previgente**,
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
    // Stessa cosa per la soglia: **un ente su ventuno** ne ha una, ed è la
    // Valle d'Aosta (D-057). Il `null` è misurato sul prospetto, non assunto.
    sogliaEsenzione: null,
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

// ---------------------------------------------------------------------------
// Enti che il caso base non usa, e che servono a tenere onesto il tipo
//
// Due modi diversi di non pagare nulla, che il file MEF distingue e che la UI
// non deve confondere: il tributo che non esiste per quell'ente, e il tributo
// che esiste con aliquota deliberata pari a zero. Il primo non ha parametri —
// non «ha zero», non ne ha — e nella pagina va detto diversamente.
//
// Stanno qui adesso, e non quando servirà l'import, perché un tipo che non
// viene esercitato finché non arriva il dato reale è un tipo che si scopre
// sbagliato tardi.
// ---------------------------------------------------------------------------

/**
 * [Fonti §15.b] Trento è `0*` anche nell'**elenco annuale**, che è già il
 * risultato del consolidamento: non è un dato mancante, è addizionale comunale
 * mai istituita.
 */
export const trentoComunaleNonIstituita: EnteRisolto<ParametriComunali> = {
  stato: 'nonIstituito',
  nome: 'Trento',
}

/**
 * [Fonti §15.b] Bolzano ha un'addizionale comunale **istituita e deliberata**,
 * con aliquota pari a zero. Il contribuente non paga, ma per una ragione
 * diversa da quella di Trento — e la differenza è visibile nel tipo: qui i
 * parametri esistono.
 */
export const bolzanoComunaleAliquotaZero: EnteRisolto<ParametriComunali> = {
  stato: 'deliberato',
  nome: 'Bolzano',
  annoDelibera: 2025,
  fonte: elencoComunaleAnnuale2025,
  parametri: {
    aliquota: { forma: 'unica', aliquota: aliquota(0) },
    sogliaEsenzione: null,
  },
}
