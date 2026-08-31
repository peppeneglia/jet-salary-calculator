/**
 * La prosa di `/che-progetto-e`.
 *
 * Sta qui e non in `risorse.ts` per la ragione misurata in
 * `testi-spiegazione.ts` (D-069, D-070): la tabella delle stringhe è nel
 * pacchetto JavaScript di ogni pagina, e questa pagina è un server
 * component senza stato le cui frasi il client non legge mai. Restano di là
 * `piede.linkProgetto` — il piede lo rende il layout, ma la voce vive accanto
 * alle altre del piede — e i due campi `meta`.
 *
 * ⚠️ I numeri della copertura non sono qui, e non è una svista. Comuni ed
 * enti si contano su `coperturaComuni`, che li deriva dall'import; la data di
 * estrazione arriva dal dato (D-005, D-054). Una pagina che dichiara una
 * copertura con un numero riscritto a mano è la prima a dire il falso quando il
 * dataset cambia — e sarebbe la pagina peggiore su cui farlo, perché è quella
 * che promette di essere verificabile.
 *
 * ⚠️ Il registro è diverso da quello di D-039, ed è voluto. Le altre pagine
 * parlano a un dipendente che vuole il proprio netto, e lì *prova di
 * selezione* o *parametro normativo* sarebbero parole fuori posto. Questa
 * pagina risponde a *chi ha fatto questa cosa e perché*: nominare la prova, il
 * committente e il metodo è il contenuto, non gergo che ci si è dimenticati di
 * togliere.
 */

import type { Multilingua } from '../../core/types'

export const PROGETTO = {
  titolo: { it: 'Che progetto è Jet Salary Calculator', en: 'What Jet Salary Calculator is' },
  occhiello: {
    it: 'Un calcolatore costruito per essere spiegato, non solo usato. Da dove nasce, come è fatto, e che cosa c’entra Jet HR.',
    en: 'A calculator built to be explained, not just used. Where it comes from, how it is made, and what Jet HR has to do with it.',
  },

  nasceTitolo: { it: 'Da dove nasce', en: 'Where it comes from' },
  nasceP1: {
    it: 'Questo strumento è la prova pratica di una candidatura: la prima selezione per il ruolo di AI Product Builder in Jet HR. La consegna era breve — una pagina con un campo per lo stipendio lordo, un bottone, e in risposta il netto annuo, il netto mensile e il dettaglio delle trattenute.',
    en: 'This tool is the practical exercise of a job application: the first stage of selection for the role of AI Product Builder at Jet HR. The brief was short — a page with a field for the gross salary, a button, and in return the annual net pay, the monthly net pay and a breakdown of the deductions.',
  },
  nasceP2: {
    it: 'Quello che veniva valutato, però, non era il bottone. Nell’ordine: la capacità di cercare le informazioni alle fonti giuste, quella di dargli una struttura, e solo per terza quella di costruire qualcosa che funzioni. La consegna diceva anche che lo scopo non era vedere quanto si è bravi con gli strumenti che generano applicazioni da soli, ma verificare di aver costruito qualcosa di cui si capiscono le logiche.',
    en: 'What was being assessed, though, was not the button. In order: the ability to find the relevant information at the right sources, the ability to give it a structure, and only third the ability to build something that works. The brief also said the point was not to see how good someone is with tools that generate applications on their own, but to check they had built something whose logic they understood.',
  },
  nasceP3: {
    it: 'Da lì viene tutto il resto. Non basta che il numero sia giusto: deve essere difendibile. Ogni cifra in pagina porta la norma da cui viene e la data in cui è stata letta, e ogni cosa che il calcolo non copre è scritta invece che taciuta.',
    en: 'Everything else follows from that. It is not enough for the number to be right: it has to be defensible. Every figure on the page carries the rule it comes from and the date it was read, and everything the calculation does not cover is written down rather than left unsaid.',
  },

  jetTitolo: { it: 'Che cosa c’entra Jet HR', en: 'What Jet HR has to do with it' },
  jetP1: {
    it: 'Jet HR è una scaleup italiana che si occupa di payroll e amministrazione del personale per le piccole e medie imprese: buste paga, contributi, adempimenti. È l’azienda che ha proposto la prova, ed è il destinatario di questo lavoro.',
    en: 'Jet HR is an Italian scaleup that handles payroll and HR administration for small and medium-sized companies: payslips, contributions, statutory filings. They are the company that set the exercise, and the recipient of this work.',
  },
  jetP2: {
    it: 'Il legame con il modo in cui il calcolatore è costruito è più stretto di così. Per un’azienda di payroll la normativa che cambia a ogni Legge di Bilancio non è un caso limite: è il lavoro di tutti i giorni. Per questo qui i valori di legge non stanno dentro il calcolo ma in file separati, ognuno con la propria citazione — quando cambiano le aliquote si aggiorna un file, non si riscrive il calcolo, e le verifiche dell’anno prima continuano a valere.',
    en: 'The connection with how the calculator is built runs deeper than that. For a payroll company, legislation that changes with every budget law is not an edge case: it is the daily job. So the statutory values here do not live inside the calculation but in separate files, each with its own citation — when rates change you update a file rather than rewriting the calculation, and last year’s checks still hold.',
  },
  jetP3: {
    it: 'Jet HR ha anche un proprio calcolatore pubblico, ed è stato usato come termine di confronto, non come oracolo: dove i due numeri divergono, la differenza è stata spiegata trovando quale ipotesi diversa la produce, mai fatta sparire ritoccando il codice finché i due coincidevano.',
    en: 'Jet HR also runs a public calculator of its own, and it was used as a point of comparison, not as an oracle: where the two figures diverge, the difference was explained by finding which different assumption produces it, never made to disappear by adjusting the code until the two agreed.',
  },

  indipendenteTitolo: { it: 'Non è un prodotto Jet HR', en: 'Not a Jet HR product' },
  indipendenteTesto: {
    it: 'Questo sito non è pubblicato da Jet HR, non è un loro prodotto e non è affiliato all’azienda. È un lavoro indipendente, fatto per una candidatura: il nome dell’azienda compare perché è il contesto in cui nasce, non perché ne sia la fonte.',
    en: 'This site is not published by Jet HR, is not one of their products and is not affiliated with the company. It is independent work, made for a job application: the company’s name appears because it is the context this comes from, not because it is the source.',
  },

  coperturaTitolo: {
    it: 'Quanto è ampio, e perché più del necessario',
    en: 'How wide it goes, and why wider than needed',
  },
  coperturaP1: {
    it: 'La consegna suggeriva di fermarsi al caso semplice: un impiegato a tempo indeterminato, residente a Milano, senza agevolazioni particolari. La copertura qui è tutta l’Italia.',
    en: 'The brief suggested stopping at the simple case: an office worker on a permanent contract, resident in Milan, with no particular reliefs. The coverage here is the whole of Italy.',
  },
  coperturaComuni: { it: 'comuni in elenco', en: 'municipalities listed' },
  coperturaEnti: {
    it: 'enti che fissano l’addizionale regionale',
    en: 'authorities setting the regional surcharge',
  },
  coperturaEntiNota: {
    it: 'le Regioni più le due Province autonome, che la deliberano separatamente',
    en: 'the regions plus the two autonomous provinces, which adopt it separately',
  },
  coperturaLivelli: { it: 'livelli di imposta', en: 'levels of tax' },
  coperturaLivelliNota: {
    it: 'Stato, Regione e Comune, tutti e tre nel conto',
    en: 'state, region and municipality, all three in the figure',
  },
  coperturaMensilita: { it: 'divisioni dello stipendio', en: 'ways to split the salary' },
  coperturaMensilitaNota: {
    it: 'dodici, tredici e quattordici mensilità, mostrate insieme',
    en: 'twelve, thirteen and fourteen instalments, all shown together',
  },
  coperturaP3: {
    it: 'Il limite non era quanto codice scrivere, ma quanti valori di legge si riesce a reperire, capire e difendere uno per uno. È la ragione per cui l’ampiezza si misura in parametri, non in funzioni.',
    en: 'The constraint was never how much code to write, but how many statutory values can be tracked down, understood and defended one by one. That is why the scope is measured in parameters, not in features.',
  },

  comeTitolo: { it: 'Come è fatto', en: 'How it is built' },
  comeUnoTitolo: {
    it: 'I valori di legge sono dati, non codice',
    en: 'Statutory values are data, not code',
  },
  comeUno: {
    it: 'Aliquote, scaglioni e soglie stanno in file separati dal calcolo, e ognuno porta accanto l’atto che lo stabilisce. Il calcolo, da solo, non conosce nessun numero.',
    en: 'Rates, brackets and thresholds sit in files kept apart from the calculation, and each one carries the act that establishes it. The calculation on its own knows no numbers.',
  },
  comeDueTitolo: {
    it: 'Il calcolo non restituisce un numero, restituisce il percorso',
    en: 'The calculation returns the route, not a number',
  },
  comeDue: {
    it: 'Ogni passaggio si porta dietro che cosa è entrato, quale regola è stata applicata, quale valore e da quale fonte. Il numero grande, il dettaglio voce per voce e la spiegazione escono tutti dallo stesso posto: non possono contraddirsi.',
    en: 'Every step carries what went in, which rule was applied, which value and from which source. The headline figure, the item-by-item breakdown and the explanation all come out of the same place: they cannot contradict each other.',
  },
  comeTreTitolo: {
    it: 'Quello che resta fuori è scritto in pagina',
    en: 'What stays out is written on the page',
  },
  comeTre: {
    it: 'Con l’effetto che avrebbe sul risultato, e da che parte lo sposterebbe. Un limite dichiarato in un file che nessuno apre non è un limite dichiarato.',
    en: 'With the effect it would have on the result, and which way it would move it. A limit declared in a file nobody opens is not a limit declared.',
  },

  nonETitolo: { it: 'Che cosa questo non è', en: 'What this is not' },
  nonEUno: {
    it: 'Non è una busta paga. Proietta il netto di un anno, non l’importo di un mese.',
    en: 'It is not a payslip. It projects a year’s net pay, not one month’s amount.',
  },
  nonEDue: {
    it: 'Non è consulenza fiscale. È uno strumento per capire come si compone un netto, non un documento su cui prendere decisioni.',
    en: 'It is not tax advice. It is a way to understand how net pay is put together, not a document to make decisions on.',
  },
  nonETre: {
    it: 'Non è un prodotto Jet HR, e non è affiliato all’azienda.',
    en: 'It is not a Jet HR product, and it is not affiliated with the company.',
  },

  chiusuraTitolo: { it: 'Dove continuare', en: 'Where to go next' },
  chiusuraTesto: {
    it: 'Il meccanismo generale sta nella spiegazione; le norme una per una nell’archivio; i confini del calcolo nella pagina dei limiti. E se quello che interessa è come è costruita la macchina — stack, divisione del codice, import dei dati, verifiche — c’è una pagina apposta.',
    en: 'The general mechanism is on the explanation page; the rules one by one are in the archive; the limits of the calculation are on the limits page. And if what you are after is how the machine is built — stack, code layout, data import, checks — there is a page for that.',
  },
  linkTecnica: { it: 'Come è fatta tecnicamente →', en: 'How it is built, technically →' },
  linkSpiegazione: { it: 'Come si calcola il netto →', en: 'How net pay is worked out →' },
  linkNorme: { it: 'Leggi le norme →', en: 'Read the law →' },
  linkNonCopre: { it: 'Cosa non copriamo →', en: 'What we do not cover →' },
} as const satisfies Readonly<Record<string, Multilingua>>

/**
 * Le due frasi che portano dentro un numero.
 *
 * Funzioni, per la ragione di `fasciaFino` in `testi-spiegazione.ts`: fuori da
 * i18next nessuno risolve `{{n}}`, e il tipo garantisce che l'argomento non
 * possa mancare in una sola delle due lingue.
 *
 * ⚠️ Ricevono la cifra già formattata. `7.897` o `7,897`, `28/08/2026` o
 * `28 Aug 2026`: quale delle due forme si scriva lo decide `formato(lingua)`,
 * ed è il chiamante ad averla. Un modulo di prosa che formattasse da sé
 * duplicherebbe la convenzione in una seconda sede.
 */
export const coperturaComuniNota = (n: string): Multilingua => ({
  it: `di cui ${n} con un netto calcolabile`,
  en: `of which ${n} with net pay that can be computed`,
})

export const coperturaEstrazione = (data: string): Multilingua => ({
  it: `I dati degli enti vengono dagli elenchi del Ministero dell’Economia e delle Finanze, estratti il ${data} e convertiti una volta sola: mentre usi il sito non viene interrogato nessun servizio esterno.`,
  en: `The figures for each authority come from the lists published by the Italian Ministry of Economy and Finance, extracted on ${data} and converted once: no external service is queried while you use the site.`,
})
