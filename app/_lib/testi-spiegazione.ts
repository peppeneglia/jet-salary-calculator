/**
 * La prosa di `/spiegazione`.
 *
 * Perché non sta in `risorse.ts`, ed è una misura — D-069
 *
 * ⚠️ `risorse.ts` è nel pacchetto JavaScript di ogni pagina, perché il
 * provider della lingua è un client component nel layout: tutto ciò che entra
 * in quella tabella lo scarica chiunque apra il sito, in tutte e due le
 * lingue, anche chi non arriverà mai su questa pagina.
 *
 * `/spiegazione` è un server component senza stato: nessuna di queste frasi
 * viene mai letta dal client. Tenerle in `risorse.ts` costava 30.209 byte
 * grezzi e 10,4 KB gzip su ogni pagina del sito, misurati — dello stesso
 * ordine dei 25.612 che D-067 ha rifiutato di pagare per l'archivio di
 * `/norme`, e per la stessa ragione.
 *
 * Il pattern non è nuovo: è quello di `_lib/norme.ts`, prosa bilingue in
 * `Multilingua` letta solo dal server. Questo file lo applica alla seconda
 * pagina della stessa specie.
 *
 * Il confine, in una riga: una frase che un client component deve poter
 * leggere sta in `risorse.ts`; una frase che solo il server rende sta qui. Per
 * questo `nav.spiegazione` e i due campi `meta` restano di là — la barra di
 * navigazione è un client component, e la tabella dei titoli è una riga sola.
 *
 * Nessun numero, e non è un'omissione
 *
 * ⚠️ Le uniche due cifre della pagina — l'aliquota dei contributi e gli
 * scaglioni IRPEF — non sono qui: arrivano da `data/regime-2026.ts` con la
 * loro `Fonte`. Una percentuale scritta dentro una stringa sarebbe un parametro
 * normativo nascosto in un file di testo, e invecchierebbe in silenzio in due
 * lingue invece che in una. È il principio dei tre livelli applicato alla
 * prosa.
 *
 * Il registro è quello di D-039. Chi legge è un dipendente, non chi valuta
 * la prova: frasi corte, si dà del tu, niente *modello*, *perimetro*,
 * *prototipo*, *scope*, *input*.
 */

import type { Multilingua } from '../../core/types'

export const SPIEGAZIONE = {
  titolo: {
    it: 'Come si passa dallo stipendio lordo al netto',
    en: 'How a gross salary becomes take-home pay',
  },
  occhiello: {
    it: 'Il percorso è lo stesso per chiunque, ovunque tu viva: cambiano le cifre, non i passaggi. Qui c’è per intero — che cosa esce dallo stipendio, in quale ordine, e perché l’ordine cambia il risultato.',
    en: 'The route is the same for everyone, wherever you live: the figures change, the steps do not. Here it is in full — what leaves your salary, in what order, and why the order changes the result.',
  },

  catenaTitolo: {
    it: 'La catena, in un colpo d’occhio',
    en: 'The chain, at a glance',
  },
  catenaOcchiello: {
    it: 'Cinque passaggi. I primi due valgono per tutti, il terzo si sdoppia, il quarto va nella direzione opposta.',
    en: 'Five steps. The first two apply to everyone, the third splits in two, the fourth runs the other way.',
  },
  catenaRal: { it: 'Stipendio lordo annuo', en: 'Gross annual salary' },
  catenaRalNota: {
    it: 'La cifra scritta sul contratto, prima di qualsiasi trattenuta.',
    en: 'The figure written in your contract, before any deduction at all.',
  },
  catenaContributi: { it: 'Contributi previdenziali', en: 'Social security contributions' },
  catenaContributiNota: {
    it: 'Vanno all’INPS e costruiscono la tua pensione. Escono per primi, quindi tutto quello che viene dopo si calcola su una cifra già più bassa.',
    en: 'They go to INPS and build your pension. They come out first, so everything that follows is worked out on a figure that is already lower.',
  },
  catenaImponibile: { it: 'Reddito imponibile', en: 'Taxable income' },
  catenaImponibileNota: {
    it: 'È la cifra su cui si calcolano le imposte. Da qui partono due strade, e partono dallo stesso punto.',
    en: 'This is the figure the taxes are computed on. Two routes start here, and they start from the same point.',
  },
  catenaIrpef: { it: 'IRPEF', en: 'IRPEF' },
  catenaIrpefNota: {
    it: 'L’imposta dello Stato. Sale per scaglioni, poi le detrazioni la riducono.',
    en: 'The state income tax. It rises in brackets, and tax credits then bring it down.',
  },
  catenaLocali: {
    it: 'Addizionale regionale e comunale',
    en: 'Regional and municipal surcharges',
  },
  catenaLocaliNota: {
    it: 'Le stesse imposte, incassate da Regione e Comune, con aliquote decise da loro.',
    en: 'The same tax, collected by the region and the municipality, at their own rates.',
  },
  catenaStessaBase: {
    it: 'Le due strade partono dalla stessa cifra. La seconda non si calcola su quello che resta dopo aver pagato la prima: è l’errore più comune dei calcolatori improvvisati, e produce un numero credibile e sbagliato.',
    en: 'Both routes start from the same figure. The second one is not computed on what is left after paying the first: that is the commonest mistake in home-made calculators, and it produces a believable, wrong number.',
  },
  catenaAggiunge: { it: 'Voci che aggiungono', en: 'Items that add' },
  catenaAggiungeNota: {
    it: 'Somme che il datore ti versa e che la legge non tassa. Non sono uno sconto sulle imposte: sono soldi in più.',
    en: 'Sums your employer pays you that the law does not tax. They are not a discount on tax: they are extra money.',
  },
  catenaNetto: { it: 'Netto annuo', en: 'Net pay for the year' },
  catenaNettoNota: {
    it: 'Quello che ti resta in un anno intero.',
    en: 'What is left to you over a full year.',
  },

  fonteEtichetta: {
    it: 'Da dove viene questo numero',
    en: 'Where this figure comes from',
  },

  primoTitolo: { it: 'Prima escono i contributi', en: 'Contributions come out first' },
  primoOcchiello: { it: 'E non sono una tassa.', en: 'And they are not a tax.' },
  primoP1: {
    it: 'La prima trattenuta di una busta paga non va allo Stato. È il contributo che finanzia la tua pensione: esce adesso e torna dopo, sotto forma di assegno. Per questo, nel dettaglio del calcolo, lo teniamo separato dalle imposte.',
    en: 'The first deduction on a payslip does not go to the state. It is the contribution that funds your pension: it leaves now and comes back later as a monthly payment. That is why we keep it separate from tax in the breakdown.',
  },
  primoP2: {
    it: 'Chi ha un contratto di apprendistato paga una quota più bassa, perché la legge gliela riduce. È l’unico tipo di contratto che cambia davvero il netto: fra tempo determinato e indeterminato la differenza c’è, ma la paga l’azienda e non passa dalla tua busta.',
    en: 'Anyone on an apprendistato (apprenticeship) contract pays a lower share, because the law reduces it. It is the only type of contract that really changes net pay: between fixed-term and permanent there is a difference, but the employer pays it and it never reaches your payslip.',
  },
  primoP3: {
    it: 'C’è una conseguenza che si vede solo mettendo i numeri in fila: i contributi non abbassano soltanto se stessi. Abbassando il reddito, abbassano anche l’imposta che si calcola su quel reddito. Ti costano meno di quanto la cifra faccia pensare.',
    en: 'One consequence only shows up once the figures are lined up: contributions do not only reduce themselves. By lowering your income, they also lower the tax computed on that income. They cost you less than the figure suggests.',
  },
  primoAliquota: {
    it: 'Aliquota ordinaria a carico del dipendente',
    en: 'Standard rate borne by the employee',
  },

  scaglioniTitolo: { it: 'Poi l’IRPEF, che sale per fasce', en: 'Then IRPEF, which rises in bands' },
  scaglioniOcchiello: {
    it: 'Non una percentuale sola: il reddito si taglia, e ogni pezzo ha la sua.',
    en: 'Not one single rate: income is cut up, and each piece has its own.',
  },
  scaglioniP1: {
    it: 'Quello che resta dopo i contributi è il reddito imponibile, e l’imposta dello Stato si calcola lì sopra. Il reddito viene diviso in fasce, e ogni fascia ha la propria aliquota.',
    en: 'What remains after contributions is your taxable income, and the state tax is computed on it. The income is split into bands, and each band carries its own rate.',
  },
  scaglioniGraficoTitolo: {
    it: 'Quanto si paga su ogni fascia di reddito',
    en: 'What is paid on each band of income',
  },
  scaglioniP2: {
    it: 'La cosa che quasi tutti fraintendono: passare alla fascia successiva non fa pagare di più su tutto lo stipendio. L’aliquota più alta tocca solo la parte di reddito che sta dentro quella fascia. Per questa ragione, un euro lordo in più non può farti portare a casa di meno.',
    en: 'The part almost everyone gets wrong: moving into the next band does not tax your whole salary more heavily. The higher rate touches only the slice of income inside that band. For this reason, one more euro of gross pay can never leave you with less.',
  },

  detrazioniTitolo: {
    it: 'Le detrazioni abbassano l’imposta, non il reddito',
    en: 'Tax credits reduce the tax, not the income',
  },
  detrazioniOcchiello: {
    it: 'Detrarre e dedurre sembrano sinonimi. Non lo sono, e la differenza pesa.',
    en: 'Deducting and crediting sound like the same thing. They are not, and the difference matters.',
  },
  detrazioniDeduzioneTitolo: { it: 'Una deduzione', en: 'A deduction' },
  detrazioniDeduzioneTesto: {
    it: 'Abbassa il reddito prima che l’imposta venga calcolata. Quanto ti fa risparmiare dipende da quanto guadagni: la stessa deduzione vale di più a chi sta in una fascia alta.',
    en: 'Lowers your income before the tax is worked out. What it saves you depends on what you earn: the same deduction is worth more to someone in a higher band.',
  },
  detrazioniDetrazioneTitolo: { it: 'Una detrazione', en: 'A tax credit' },
  detrazioniDetrazioneTesto: {
    it: 'Abbassa l’imposta già calcolata, euro su euro. Vale lo stesso importo per tutti, indipendentemente dalla fascia.',
    en: 'Lowers the tax once it has been worked out, euro for euro. It is worth the same amount to everyone, whatever the band.',
  },
  detrazioniP1: {
    it: 'Le detrazioni hanno un limite, ed è quello che si sente di meno: non possono portare l’imposta sotto zero. Se valgono più dell’imposta, l’eccedenza non diventa un credito da incassare — si perde. È il motivo per cui, sotto un certo stipendio, aggiungere detrazioni non cambia più niente.',
    en: 'Tax credits carry a limit, and it is the least talked about: they cannot push the tax below zero. If they are worth more than the tax, the excess does not turn into money you can claim — it is lost. That is why, below a certain salary, adding credits changes nothing at all.',
  },

  localiTitolo: { it: 'Poi arrivano Regione e Comune', en: 'Then the region and the municipality' },
  localiOcchiello: {
    it: 'Due imposte in più, sullo stesso reddito, con aliquote decise sul posto.',
    en: 'Two more taxes, on the same income, at rates decided locally.',
  },
  localiP1: {
    it: 'Le addizionali non le fissa lo Stato: le delibera ogni Regione e ogni Comune. Due persone con lo stesso stipendio, in due città diverse, non pagano la stessa cifra — ed è la ragione per cui un calcolatore che non ti chiede dove vivi non può darti il numero giusto.',
    en: 'The surcharges are not set by the state: each region and each municipality adopts its own. Two people on the same salary in two different towns do not pay the same amount — which is why a calculator that never asks where you live cannot give you the right figure.',
  },
  localiPunto1Titolo: {
    it: 'Si calcolano sull’imponibile, non su quello che resta',
    en: 'They are computed on the taxable income, not on what is left',
  },
  localiPunto1: {
    it: 'Vengono dopo l’IRPEF nell’ordine dei conti, ma partono dalla stessa cifra su cui è partita l’IRPEF. Posizione nella sequenza e base di calcolo sono due cose diverse.',
    en: 'They come after IRPEF in the order of the arithmetic, but they start from the same figure IRPEF started from. Position in the sequence and base of the calculation are two different things.',
  },
  localiPunto2Titolo: {
    it: 'Se l’IRPEF finisce a zero, non sono dovute affatto',
    en: 'If IRPEF ends up at zero, they are not due at all',
  },
  localiPunto2: {
    it: 'Non si riducono: si spengono. La legge le lega all’esito dell’imposta statale, e la condizione è secca — o si pagano sull’intero reddito, o non si pagano.',
    en: 'They do not shrink: they switch off. The law ties them to the outcome of the state tax, and the condition is all-or-nothing — either they are paid on the whole income, or they are not paid.',
  },
  localiPunto3Titolo: {
    it: 'Molti Comuni fissano una soglia sotto la quale non si paga',
    en: 'Many municipalities set a threshold below which nothing is due',
  },
  localiPunto3: {
    it: 'Ed è una soglia secca, non una franchigia: un euro sopra, e si paga sull’intero reddito, non sulla parte che la supera.',
    en: 'And it is a hard threshold, not an allowance: one euro above it and you pay on the whole income, not on the part that exceeds it.',
  },
  localiP2: {
    it: 'Non tutti gli enti deliberano ogni anno. Chi non lo fa non azzera l’imposta: per legge restano in vigore le aliquote dell’anno prima, ed è quello che succede alla maggior parte dei Comuni italiani.',
    en: 'Not every authority adopts new rates each year. The ones that do not are not setting the tax to zero: by law last year’s rates stay in force, and that is what happens to most Italian municipalities.',
  },

  aggiungeTitolo: {
    it: 'Alcune somme vanno nella direzione opposta',
    en: 'Some sums run the other way',
  },
  aggiungeOcchiello: {
    it: 'Non tutto quello che passa dalla busta paga esce.',
    en: 'Not everything that passes through a payslip leaves it.',
  },
  aggiungeP1: {
    it: 'Ci sono somme che il datore ti versa e che la legge dichiara non tassabili. Non entrano nel reddito, quindi non fanno salire l’imposta, e si sommano a quello che ti resta.',
    en: 'There are sums your employer pays you that the law declares untaxable. They do not enter your income, so they do not push the tax up, and they add to what is left to you.',
  },
  aggiungeP2: {
    it: 'Non sono uno sconto sulle imposte e non sono un rimborso: sono soldi in più. Per questo, nel dettaglio del calcolo, il loro segno è positivo — e per questo quella sezione non si può chiamare «trattenute».',
    en: 'They are not a discount on tax and they are not a refund: they are extra money. That is why their sign is positive in the breakdown — and why that section cannot be called “deductions”.',
  },
  aggiungeP3: {
    it: 'Quanto valgono dipende dal reddito, e una di esse dipende anche da come è andato il calcolo dell’imposta. Sotto certi stipendi arrivano intere; sopra una soglia spariscono.',
    en: 'What they are worth depends on income, and one of them also depends on how the tax calculation turned out. Below certain salaries they arrive in full; above a threshold they disappear.',
  },

  nettoTitolo: { it: 'Il netto, e come si divide', en: 'Net pay, and how it is split' },
  nettoOcchiello: {
    it: 'Il totale dell’anno non cambia con il numero delle mensilità.',
    en: 'The yearly total does not change with the number of instalments.',
  },
  nettoP1: {
    it: 'Quello che resta alla fine è il netto dell’anno. Dividerlo per dodici, tredici o quattordici non cambia il totale: cambia soltanto quanto ti arriva ogni volta.',
    en: 'What is left at the end is your net pay for the year. Dividing it by twelve, thirteen or fourteen does not change the total: it only changes how much reaches you each time.',
  },
  nettoP2: {
    it: 'Lo stipendio lordo annuo contiene già la tredicesima e la quattordicesima, se il contratto le prevede. Chi è pagato in quattordici rate non guadagna meno di chi è pagato in dodici: prende meno per volta, più volte.',
    en: 'A gross annual salary already contains the thirteenth and fourteenth instalments, where the contract provides for them. Someone paid over fourteen does not earn less than someone paid over twelve: they get less at a time, more times.',
  },

  gradiniTitolo: {
    it: 'Una cosa che sorprende: in qualche punto il netto scende',
    en: 'One thing that surprises people: in places, net pay goes down',
  },
  gradiniP1: {
    it: 'Il netto non cresce come una retta. In alcuni tratti sale più piano, e in almeno un punto va indietro: si guadagna un euro lordo in più e si porta a casa di meno.',
    en: 'Net pay does not grow in a straight line. In some stretches it rises more slowly, and at least at one point it goes backwards: you earn one more euro gross and take home less.',
  },
  gradiniP2: {
    it: 'Succede quando un beneficio dipende da una soglia secca invece che da una progressione. Un euro sopra la soglia e il beneficio non si riduce in proporzione: sparisce tutto insieme. Lo stesso vale per l’esenzione che molti Comuni fissano sull’addizionale.',
    en: 'It happens when a benefit depends on a hard threshold rather than on a gradual scale. One euro above the threshold and the benefit does not shrink in proportion: it vanishes all at once. The same goes for the exemption many municipalities set on their surcharge.',
  },
  gradiniSchema: {
    it: 'Schema: il netto sale al crescere del lordo, con un tratto in cui scende.',
    en: 'Diagram: net pay rises as gross pay rises, with one stretch where it goes down.',
  },
  gradiniAsseX: { it: 'Stipendio lordo', en: 'Gross salary' },
  gradiniAsseY: { it: 'Netto', en: 'Net pay' },
  gradiniEtichetta: { it: 'Qui il netto scende', en: 'Net pay drops here' },
  gradiniNota: {
    it: 'È uno schema, non un calcolo: serve a mostrare la forma. Dove cadano davvero quei punti dipende dal Comune in cui vivi, perché molte soglie le fissa il Comune — non esiste un elenco valido per tutti.',
    en: 'This is a diagram, not a calculation: it shows the shape. Where those points actually fall depends on the municipality you live in, because many thresholds are set by the municipality — there is no single list that holds for everyone.',
  },

  bustaTitolo: {
    it: 'Perché questo conto non coincide con la tua busta paga',
    en: 'Why this figure does not match your payslip',
  },
  bustaP1: {
    it: 'Sono due domande diverse, e nessuna delle due risposte è sbagliata.',
    en: 'They are two different questions, and neither answer is wrong.',
  },
  bustaP2: {
    it: 'Qui si proietta il netto di un anno intero, per uno stipendio percepito tutto nell’anno. Una busta paga dice quanto arriva quel mese, e contiene voci che appartengono ad anni diversi: le addizionali di un anno si pagano a rate in quello dopo, e a dicembre si ricalcola tutto sull’anno effettivo.',
    en: 'This works out net pay for a full year, on a salary earned entirely within that year. A payslip tells you how much arrives that month, and it carries items belonging to different years: one year’s surcharges are paid in instalments during the next, and in December everything is recomputed on the year as it actually turned out.',
  },
  bustaP3: {
    it: 'C’è anche una differenza di regola, dentro la stessa busta: l’imposta segue il momento in cui i soldi ti arrivano, i contributi seguono il momento in cui li maturi. Stesso stipendio, due criteri diversi.',
    en: 'There is also a difference of rule inside the same payslip: tax follows the moment the money reaches you, contributions follow the moment you earn it. Same salary, two different criteria.',
  },

  chiusuraTitolo: { it: 'Dove continuare', en: 'Where to go next' },
  chiusuraTesto: {
    it: 'Questa pagina racconta il meccanismo. Le norme che lo stabiliscono, una per una, stanno nell’archivio; i confini di quello che qui non viene calcolato stanno nella pagina dei limiti.',
    en: 'This page describes the mechanism. The rules that establish it, one by one, are in the archive; the limits of what is not computed here are on the limits page.',
  },
  chiusuraCalcolatore: { it: 'Fai il calcolo →', en: 'Run the calculation →' },
  chiusuraNorme: { it: 'Leggi le norme →', en: 'Read the law →' },
  chiusuraNonCopre: { it: 'Cosa non copriamo →', en: 'What we do not cover →' },
} as const satisfies Readonly<Record<string, Multilingua>>

/**
 * L'etichetta di una fascia di reddito.
 *
 * ⚠️ Funzioni e non stringhe con dei segnaposto, ed è l'unica deviazione
 * dalla forma di `_lib/norme.ts`. Fuori da i18next non c'è un motore che
 * risolva `{{a}}`, e riscriverne uno per tre frasi sarebbe codice in più che
 * può sbagliare; una funzione tipizzata non può dimenticare un argomento né
 * lasciarlo scritto male in una sola delle due lingue.
 *
 * Tre forme e non una, perché la prima fascia non ha un limite inferiore da
 * dire e l'ultima non ha un limite superiore: *da 0 a 28.000* e *da 50.000 a
 * nessun limite* sono due modi di scrivere male la stessa cosa.
 */
export const fasciaFino = (a: string): Multilingua => ({
  it: `Fino a ${a}`,
  en: `Up to ${a}`,
})

export const fasciaDa = (da: string, a: string): Multilingua => ({
  it: `Da ${da} a ${a}`,
  en: `From ${da} to ${a}`,
})

export const fasciaOltre = (da: string): Multilingua => ({
  it: `Oltre ${da}`,
  en: `Above ${da}`,
})
