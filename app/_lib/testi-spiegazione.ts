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
    it: 'Il percorso è lo stesso per chiunque, ovunque tu viva: cambiano le cifre, non i passaggi. Qui c’è per intero: che cosa esce dallo stipendio, in quale ordine, e perché l’ordine cambia il risultato. Sotto ogni passaggio ci sono le cifre che lo governano, con la norma che le stabilisce.',
    en: 'The route is the same for everyone, wherever you live: the figures change, the steps do not. Here it is in full: what leaves your salary, in what order, and why the order changes the result. Under every step are the figures that govern it, with the rule that sets each one.',
  },
  indice: { it: 'Vai a', en: 'Jump to' },
  cercaEtichetta: { it: 'Cerca nella spiegazione', en: 'Search the explanation' },
  cercaSegnaposto: {
    it: 'Cerca una parola: detrazione, addizionale, cuneo…',
    en: 'Search a word: credit, surcharge, wedge…',
  },
  cercaBottone: { it: 'Cerca', en: 'Search' },

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
    it: 'Le due strade partono dalla stessa cifra: l’addizionale non si calcola su quello che resta dopo aver pagato l’IRPEF, ma sullo stesso imponibile.',
    en: 'Both routes start from the same figure: the addizionale is not computed on what is left after paying the IRPEF, but on the same taxable base.',
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
    it: 'Fonti',
    en: 'Sources',
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
    it: 'Le detrazioni hanno un limite, ed è quello che si sente di meno: non possono portare l’imposta sotto zero. Se valgono più dell’imposta, l’eccedenza non diventa un credito da incassare: si perde. È il motivo per cui, sotto un certo stipendio, aggiungere detrazioni non cambia più niente.',
    en: 'Tax credits carry a limit, and it is the least talked about: they cannot push the tax below zero. If they are worth more than the tax, the excess does not turn into money you can claim: it is lost. That is why, below a certain salary, adding credits changes nothing at all.',
  },

  localiTitolo: { it: 'Poi arrivano Regione e Comune', en: 'Then the region and the municipality' },
  localiOcchiello: {
    it: 'Due imposte in più, sullo stesso reddito, con aliquote decise sul posto.',
    en: 'Two more taxes, on the same income, at rates decided locally.',
  },
  localiP1: {
    it: 'Le addizionali non le fissa lo Stato: le delibera ogni Regione e ogni Comune. Due persone con lo stesso stipendio, in due città diverse, non pagano la stessa cifra. È la ragione per cui un calcolatore che non ti chiede dove vivi non può darti il numero giusto.',
    en: 'The surcharges are not set by the state: each region and each municipality adopts its own. Two people on the same salary in two different towns do not pay the same amount. That is why a calculator that never asks where you live cannot give you the right figure.',
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
    it: 'Non si riducono: si spengono. La legge le lega all’esito dell’imposta statale, e la condizione è secca: o si pagano sull’intero reddito, o non si pagano.',
    en: 'They do not shrink: they switch off. The law ties them to the outcome of the state tax, and the condition is all-or-nothing: either they are paid on the whole income, or they are not paid.',
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
    it: 'Non sono uno sconto sulle imposte e non sono un rimborso: sono soldi in più. Per questo, nel dettaglio del calcolo, il loro segno è positivo, e per questo quella sezione non si può chiamare «trattenute».',
    en: 'They are not a discount on tax and they are not a refund: they are extra money. That is why their sign is positive in the breakdown, and why that section cannot be called “deductions”.',
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
    it: 'È uno schema, non un calcolo: serve a mostrare la forma. Dove cadano davvero quei punti dipende dal Comune in cui vivi, perché molte soglie le fissa il Comune, e non esiste un elenco valido per tutti.',
    en: 'This is a diagram, not a calculation: it shows the shape. Where those points actually fall depends on the municipality you live in, because many thresholds are set by the municipality, and there is no single list that holds for everyone.',
  },

  bustaTitolo: {
    it: 'Perché questo conto non coincide con la tua busta paga',
    en: 'Why this figure does not match your payslip',
  },
  /**
   * ⚠️ **Annunciava due domande dopo averne posta una.**
   *
   * Il titolo chiede *perché questo conto non coincide con la tua busta paga*,
   * cioè una domanda sola; la riga sotto rispondeva *«sono due domande
   * diverse»*, lasciando cercare quale fosse la seconda. Intendeva dire che il
   * calcolatore e la busta paga rispondono a domande diverse, il che è vero e
   * utile, ma detto così si legge come un rinvio a qualcosa che non c'è.
   */
  bustaP1: {
    it: 'Perché il calcolatore e la busta paga rispondono a due domande diverse, e nessuna delle due risposte è sbagliata.',
    en: 'Because the calculator and your payslip answer two different questions, and neither answer is wrong.',
  },
  bustaP2: {
    it: 'Qui si proietta il netto di un anno intero, per uno stipendio percepito tutto nell’anno. Una busta paga dice quanto arriva quel mese, e contiene voci che appartengono ad anni diversi: le addizionali di un anno si pagano a rate in quello dopo, e a dicembre si ricalcola tutto sull’anno effettivo.',
    en: 'This works out net pay for a full year, on a salary earned entirely within that year. A payslip tells you how much arrives that month, and it carries items belonging to different years: one year’s surcharges are paid in instalments during the next, and in December everything is recomputed on the year as it actually turned out.',
  },
  bustaP3: {
    it: 'C’è anche una differenza di regola, dentro la stessa busta: l’imposta segue il momento in cui i soldi ti arrivano, i contributi seguono il momento in cui li maturi. Stesso stipendio, due criteri diversi.',
    en: 'There is also a difference of rule inside the same payslip: tax follows the moment the money reaches you, contributions follow the moment you earn it. Same salary, two different criteria.',
  },


  // ── Le cifre, sezione per sezione ─────────────────────────────────────────
  //
  // ⚠️ Nessun parametro applicato è scritto qui dentro: aliquote, soglie,
  // scaglioni e conteggi arrivano da `data/` attraverso `_lib/cifre.ts`. Dove
  // una frase ha bisogno di una cifra è una funzione, e le funzioni stanno
  // tutte in fondo al file: è il posto in cui guardare per verificare che
  // nessun numero sia stato riscritto.
  //
  // ⚠️ L'unica eccezione sono i valori **storici** — l'aliquota che il 2026 ha
  // sostituito, i tre punti che la legge sull'apprendistato dispone di
  // togliere. Non sono parametri applicati, non entrano in un calcolo, e non
  // possono divergere da `data/` perché in `data/` non ci sono.

  contributiOrdinaria: { it: 'Dipendente', en: 'Employee' },
  contributiApprendista: { it: 'Apprendista', en: 'Apprentice' },
  contributiQuota: { it: 'Quota aggiuntiva', en: 'Additional share' },
  contributiQuotaNota: {
    it: 'Non è un’aliquota alternativa: si somma a quella del dipendente, e solo sulla parte di retribuzione che supera la prima fascia pensionabile.',
    en: 'It is not an alternative rate: it adds to the employee one, and only on the part of pay above the first pension band.',
  },

  detrazioneCurvaTitolo: {
    it: 'Quanto vale, al crescere del reddito',
    en: 'What it is worth, as income rises',
  },
  detrazioneAssi: {
    it: 'In verticale quanto vale la detrazione, in orizzontale il reddito complessivo.',
    en: 'Vertically what the credit is worth, horizontally total income.',
  },
  detrazionePiuAlta: { it: 'Il valore più alto che raggiunge', en: 'The highest value it reaches' },
  detrazioneGradino: { it: 'Il gradino che sale', en: 'The step that goes up' },
  detrazioneIncremento: {
    it: 'In una fascia intermedia la detrazione è aumentata di un importo fisso, che compare e sparisce di colpo agli estremi: nel grafico sono i due gradini della parte centrale.',
    en: 'In a middle band the credit is raised by a fixed amount, which appears and disappears sharply at the edges: in the chart they are the two steps in the central stretch.',
  },
  detrazioneFormule: {
    it: 'Come si calcola, fascia per fascia',
    en: 'How it is worked out, band by band',
  },
  detrazioneTroncamento: {
    it: 'Il rapporto dentro la formula si tronca alla quarta cifra decimale, non si arrotonda. Lo scrive la norma, e non è un dettaglio di stile: cambia il centesimo, e cambiarlo sarebbe applicare una formula diversa da quella di legge.',
    en: 'The ratio inside the formula is truncated at the fourth decimal, not rounded. The rule says so, and it is not a matter of style: it changes the cent, and changing it would mean applying a formula other than the one in law.',
  },
  /** La frase che introduce i due minimi, che prima erano due cifre nude. */
  detrazioneMinimiIntro: {
    it: 'I due minimi della prima fascia sono questi:',
    en: 'The two floors on the first band are these:',
  },
  detrazioneMinimi: {
    it: 'Nella prima fascia la detrazione non può scendere sotto un minimo, più alto per i contratti a tempo determinato. I due minimi mordono solo per chi ha lavorato una parte dell’anno: su un anno intero la detrazione piena è più alta di entrambi, e nessuno dei due si attiva mai.',
    en: 'In the first band the credit cannot fall below a floor, higher for fixed-term contracts. The two floors only bite for someone who worked part of the year: over a full year the full credit is higher than both, and neither ever applies.',
  },

  cuneoTitolo: {
    it: 'Il taglio del cuneo: due istituti che si passano il testimone',
    en: 'The wedge cut: two measures that hand over to each other',
  },
  cuneoOcchiello: {
    it: 'Non è un passaggio della catena: è un fenomeno a cavallo di due passaggi. Sotto una certa soglia una somma si aggiunge al netto senza essere tassata; sopra, una detrazione abbassa l’imposta. Non si sovrappongono mai, perché la norma usa parole diverse ai due lati: «non superiore a» di qua, «superiore a» di là.',
    en: 'It is not a step in the chain: it is a phenomenon straddling two steps. Below a certain threshold a sum is added to take-home pay untaxed; above it, a credit lowers the tax. They never overlap, because the law uses different words on each side: “not above” on one, “above” on the other.',
  },
  cuneoSomma: { it: 'La somma', en: 'The sum' },
  cuneoDetrazione: { it: 'La detrazione', en: 'The credit' },
  cuneoSommaTesto: {
    it: 'La percentuale si applica all’intero reddito, non alla parte che eccede il confine. Ogni confine è quindi un salto verso il basso: guadagnare un euro in più, lì, fa perdere più di quell’euro. Nel grafico si vedono come pareti.',
    en: 'The percentage applies to the whole income, not to the part above the boundary. Every boundary is therefore a drop: earning one euro more, right there, loses you more than that euro. In the chart they show up as walls.',
  },
  cuneoDetrazioneTesto: {
    it: 'Piena per una fascia, poi in discesa lineare fino ad azzerarsi. È una detrazione vera: si sottrae dall’imposta come quella per lavoro dipendente, e come quella non può portarla sotto zero.',
    en: 'Full for one band, then declining in a straight line to nothing. It is a true tax credit: it comes off the tax like the employee one, and like that one it cannot push tax below zero.',
  },

  mappaTitolo: {
    it: 'Quanto chiede la tua Regione, e quanto ne chiedono le altre',
    en: 'What your region asks, and what the others ask',
  },
  mappaOcchiello: {
    it: 'Scegli un ente per vedere le sue aliquote e la norma che le fissa.',
    en: 'Pick an authority to see its rates and the rule that sets them.',
  },
  mappaScegli: { it: 'Scegli un ente', en: 'Pick an authority' },
  mappaAliquotaMassima: { it: 'Aliquota più alta', en: 'Highest rate' },
  mappaBande: { it: 'Come è articolata', en: 'How it is structured' },
  mappaRegoleProprie: { it: 'Altre regole di questo ente', en: 'Other rules of this authority' },
  mappaSopraIlTetto: { it: 'sopra il tetto', en: 'above the ceiling' },
  mappaLegenda: {
    it: 'Più scuro, più alta l’aliquota massima',
    en: 'Darker means a higher top rate',
  },
  /**
   * ⚠️ Era un paragrafo sul nostro dataset, ora è un fatto in una riga.
   *
   * Spiegava perché le sagome sono ventuno e le regioni venti, cioè rispondeva
   * a una domanda che chi legge non si era fatto. Quello che gli serve sapere è
   * che sulla mappa Trento e Bolzano si cliccano separatamente, ed è quello che
   * dice adesso.
   */
  regionaleVentuno: {
    it: 'Sulla mappa il Trentino-Alto Adige è rappresentato dalle due Province autonome, Trento e Bolzano, perché l’addizionale la deliberano separatamente.',
    en: 'On the map Trentino-Alto Adige appears as its two autonomous provinces, Trento and Bolzano, because each sets the surcharge separately.',
  },

  comunaleTitolo: { it: 'E quanto chiede il Comune', en: 'And what the municipality asks' },
  comunaleOcchiello: {
    it: 'Il terzo livello, e il più frammentato: ogni Comune delibera per conto proprio, e quasi nessuno lo fa allo stesso modo. Non c’è una mappa che tenga: ci sono le forme che quelle delibere assumono, contate una per una.',
    en: 'The third level, and the most fragmented: every municipality decides for itself, and almost none of them in the same way. No map could hold this: what follows is the shapes those decisions take, counted one by one.',
  },
  comunaleConAddizionale: {
    it: 'Comuni con un’addizionale da pagare',
    en: 'municipalities with a surcharge to pay',
  },
  comunaleSenza: { it: 'Comuni dove non si paga nulla', en: 'municipalities where nothing is due' },
  comunaleSenzaNota: {
    it: 'Non è un dato mancante: è un’addizionale che non c’è, e per loro il netto è corretto, non incompleto.',
    en: 'This is not missing data: it is a surcharge that does not exist, and for them take-home pay is correct, not incomplete.',
  },
  comunaleUnica: { it: 'con una sola aliquota', en: 'with a single rate' },
  comunaleScaglioni: { it: 'con più aliquote a scaglioni', en: 'with several rates in brackets' },
  comunaleSoglia: {
    it: 'Comuni con una soglia di esenzione',
    en: 'municipalities with an exemption threshold',
  },
  comunaleSogliaNota: {
    it: 'La soglia è un gradino secco, non una franchigia: un euro sotto non si paga niente, un euro sopra si paga sull’intera base.',
    en: 'The threshold is a hard step, not an allowance: one euro below and nothing is due, one euro above and the whole base is taxed.',
  },
  comunaleTettoEtichetta: { it: 'esattamente al tetto', en: 'exactly at the ceiling' },
  comunaleSopraIlTetto: { it: 'sopra il tetto di legge', en: 'above the statutory ceiling' },
  comunaleSopraNota: {
    it: 'Il tetto è una norma, e questi Comuni lo superano. La norma che glielo consenta non l’abbiamo trovata: il valore resta quello che il ministero pubblica, senza ritocchi. Ritoccarlo per farlo rientrare produrrebbe un numero più ordinato e sbagliato.',
    en: 'The ceiling is in law, and these municipalities exceed it. We could not find the rule that lets them: the figure stays as the ministry publishes it, untouched. Trimming it to fit would produce a tidier and wrong number.',
  },

  tiTitolo: { it: 'Il trattamento integrativo', en: 'The supplementary allowance' },
  tiImporto: { it: 'Importo', en: 'Amount' },
  tiSoglia: { it: 'Spetta fino a', en: 'Granted up to' },
  tiScartoEtichetta: { it: 'Scarto sulla condizione', en: 'Margin on the condition' },
  tiCondizione: {
    it: 'Non basta stare sotto la soglia: spetta solo a chi ha imposta da pagare, cioè a chi ha un’imposta lorda più alta della propria detrazione diminuita di un piccolo scarto. È il contrario di come si immagina un aiuto ai redditi bassi: chi non paga imposta non lo prende.',
    en: 'Being under the threshold is not enough: it goes only to those with tax to pay, that is, whose gross tax exceeds their credit less a small margin. It is the opposite of how you would imagine support for low incomes: someone with no tax to pay does not get it.',
  },
  tiScarto: {
    it: 'Quello scarto ha una storia precisa: la stessa legge che ha alzato la detrazione per lavoro dipendente lo ha sottratto qui, dello stesso importo, per lasciare la soglia di accesso esattamente dov’era.',
    en: 'That margin has an exact history: the same law that raised the employee credit subtracted it here, by the same amount, so as to leave the entry threshold exactly where it was.',
  },

  gradiniElencoTitolo: { it: 'Dove cadono, di preciso', en: 'Where they fall, exactly' },
  gradiniVoceDetrazione: {
    it: 'La detrazione per lavoro dipendente',
    en: 'The employee tax credit',
  },
  gradiniVoceSomma: { it: 'La somma del cuneo', en: 'The wedge sum' },
  gradiniVoceComune: { it: 'L’esenzione del Comune', en: 'The municipal exemption' },
  gradiniElencoNota: {
    it: 'Sono i gradini che si vedono nei grafici qui sopra, misurati sulle stesse curve. L’ultimo non ha un valore unico: la soglia la fissa ogni Comune, quindi il salto è alto quanto l’aliquota di quel Comune sull’intero imponibile.',
    en: 'These are the steps visible in the charts above, measured on the same curves. The last one has no single value: each municipality sets its own threshold, so the drop is as large as that municipality’s rate applied to the whole base.',
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
 * L'occhiello sulle cifre, con dentro l'anno d'imposta.
 *
 * ⚠️ **L'anno sta in questa frase e non più in una pastiglia sotto il
 * titolo.** Il riquadro con *Anno d'imposta 2026* dava il rilievo di un
 * controllo a un qualificatore, e lo dava nel punto più visibile dopo il
 * titolo, su una pagina che spiega un **meccanismo** che ogni anno è lo stesso.
 *
 * Riceve la cifra invece di scriverla: arriva da `regime2026.anno`, cioè dal
 * regime che il motore applica davvero, quindi non può restare indietro
 * rispetto ai parametri che la pagina mostra. È la ragione per cui questo file
 * non contiene nessun numero, e per cui questa è una funzione e non una
 * stringa.
 */
/**
 * Quanti passaggi combaciano con la ricerca.
 *
 * ⚠️ Dice **passaggi** e non risultati, perché la pagina non si accorcia: la
 * ricerca restringe l'indice, e questa frase deve dire che cosa è
 * successo davvero.
 */
export const cercaEsito = (n: number, ricerca: string): Multilingua =>
  n === 0
    ? {
        it: `Nessun passaggio parla di «${ricerca}».`,
        en: `No step mentions “${ricerca}”.`,
      }
    : n === 1
      ? {
          it: `Un passaggio parla di «${ricerca}».`,
          en: `One step mentions “${ricerca}”.`,
        }
      : {
          it: `${n} passaggi parlano di «${ricerca}».`,
          en: `${n} steps mention “${ricerca}”.`,
        }

export const occhielloCifre = (anno: string): Multilingua => ({
  it: `Le cifre sono quelle che il calcolatore applica davvero per l’anno d’imposta ${anno}: non una copia scritta a mano, ma gli stessi valori letti dagli stessi file. E i grafici sono disegnati chiamando le stesse funzioni del calcolo.`,
  en: `The figures are the ones the calculator actually applies for tax year ${anno}: not a copy typed out by hand, but the same values read from the same files. And the charts are drawn by calling the same functions the calculation uses.`,
})

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

/**
 * ── Le frasi che portano dentro una cifra ──────────────────────────────────
 *
 * Stessa forma di `fasciaFino` qui sopra, e stessa ragione: fuori da i18next
 * nessuno risolve `{{n}}`, e il tipo garantisce che l'argomento non possa
 * mancare in una sola delle due lingue.
 *
 * ⚠️ Ricevono la cifra **già formattata**. Quale sia la forma giusta —
 * `1,23%` o `1.23%`, `56.224 €` o `€56,224` — lo decide `formato(lingua)`, ed è
 * il chiamante ad averla. Un modulo di prosa che formattasse da sé
 * duplicherebbe la convenzione in una seconda sede.
 *
 * ⚠️ **Questo è il posto in cui verificare che nessun parametro sia stato
 * riscritto a mano.** Se una cifra compare in pagina e non passa da una di
 * queste funzioni o da `_lib/cifre.ts`, è scritta dentro una stringa — ed è
 * esattamente ciò che la separazione in tre livelli esiste per impedire.
 */

export const contributiOltre = (soglia: string): Multilingua => ({
  it: `sulla parte oltre ${soglia}`,
  en: `on the part above ${soglia}`,
})

export const contributiPrimaFascia = (soglia: string): Multilingua => ({
  it: `${soglia} è la prima fascia di retribuzione pensionabile dell’anno: è il punto oltre il quale scatta la quota aggiuntiva.`,
  en: `${soglia} is the year’s first pensionable pay band: it is the point beyond which the additional share kicks in.`,
})

export const contributiCondizione = (limite: string): Multilingua => ({
  it: `La quota aggiuntiva è dovuta perché l’aliquota a carico del lavoratore sta sotto il ${limite}. È una condizione, non un automatismo: se l’aliquota salisse sopra quel limite, il contributo si spegnerebbe da solo.`,
  en: `The additional share is owed because the employee rate sits below ${limite}. That is a condition, not a given: were the rate to rise above that limit, the contribution would switch itself off.`,
})

export const detrazioneSaltoTesto = (soglia: string, salto: string): Multilingua => ({
  it: `Il gradino a ${soglia} va nella direzione contraria a quella che ci si aspetta: superando quella soglia la detrazione non cala, sale di ${salto}. È l’effetto di due lettere della stessa norma che si raccordano male, e nel grafico è il muro che sale.`,
  en: `The step at ${soglia} runs the opposite way to what you would expect: crossing that threshold the credit does not fall, it rises by ${salto}. It is the effect of two paragraphs of the same rule that meet badly, and in the chart it is the wall going up.`,
})

export const minimoGenerale = (importo: string): Multilingua => ({
  it: `Non scende sotto ${importo}, qualunque sia la retribuzione`,
  en: `It never falls below ${importo}, whatever the pay`,
})

export const minimoDeterminato = (importo: string): Multilingua => ({
  it: `Con un contratto a tempo determinato il minimo sale a ${importo}`,
  en: `On a fixed-term contract that floor rises to ${importo}`,
})

export const cuneoRaccordo = (soglia: string, somma: string, detrazione: string): Multilingua => ({
  it: `A ridosso di ${soglia} la somma vale circa ${somma}; appena sopra, la detrazione vale ${detrazione}. Superare la soglia non fa perdere niente: il legislatore ha calibrato il raccordo e ha scelto di sovracompensare leggermente, invece di lasciare un buco.`,
  en: `Just under ${soglia} the sum is worth about ${somma}; just above, the credit is worth ${detrazione}. Crossing the threshold costs nothing: the legislator calibrated the handover and chose to slightly overcompensate rather than leave a gap.`,
})

export const cuneoMarginale = (da: string, a: string, aliquota: string): Multilingua => ({
  it: `Fra ${da} e ${a} succede una cosa inaspettata: su ogni euro in più agiscono insieme l’aliquota del ${aliquota}, la discesa della detrazione per lavoro dipendente e la discesa di questa. Sommandole, di quell’euro in più resta meno della metà.`,
  en: `Between ${da} and ${a} something unexpected happens: on every extra euro the ${aliquota} rate, the decline of the employee credit and the decline of this one all act at once. Added up, less than half of that extra euro survives.`,
})

export const enteMenoEPiu = (bassa: string, alta: string): Multilingua => ({
  it: `Dalla più bassa (${bassa}) alla più alta (${alta})`,
  en: `From the lowest (${bassa}) to the highest (${alta})`,
})

/**
 * Il tetto, e chi lo supera per nome.
 *
 * ⚠️ **Riceve i nomi e non il conteggio, e la frase cambia forma con quanti
 * sono.** Diceva *«lo superano 1 enti su 21»*: scritta per il plurale, e messa
 * davanti a un numero che dopo la correzione sul tetto applicabile è sceso a
 * uno. Con un ente solo il conteggio non informa; il nome sì.
 *
 * Le tre forme non sono un vezzo: sono i tre casi che i dati possono davvero
 * produrre, e sceglierli qui evita che la pagina scriva una frase sgrammaticata
 * il giorno in cui il numero si muove.
 */
export const tettoRegionale = (tetto: string, nomi: readonly string[]): Multilingua => {
  if (nomi.length === 0) {
    return {
      it: `Il tetto di legge è ${tetto}, e nessun ente lo supera.`,
      en: `The statutory ceiling is ${tetto}, and no authority exceeds it.`,
    }
  }
  if (nomi.length === 1) {
    return {
      it: `Il tetto di legge è ${tetto}, e un solo ente lo supera: ${nomi[0]}.`,
      en: `The statutory ceiling is ${tetto}, and one authority exceeds it: ${nomi[0]}.`,
    }
  }
  return {
    it: `Il tetto di legge è ${tetto}, e lo superano ${nomi.length} enti: ${nomi.join(', ')}.`,
    en: `The statutory ceiling is ${tetto}, and ${nomi.length} authorities exceed it: ${nomi.join(', ')}.`,
  }
}

export const tettoComunale = (tetto: string): Multilingua => ({
  it: `Il tetto di legge è ${tetto}`,
  en: `The statutory ceiling is ${tetto}`,
})

/**
 * Le tre righe dell'inventario dei gradini.
 *
 * ⚠️ Una sale e due scendono, e le due frasi sono distinte apposta: quello
 * che sale è la cosa che nessuno si aspetta — attraversando una soglia si
 * *guadagna* — e appiattirlo su un generico «qui il netto cambia di colpo»
 * perderebbe proprio il fatto per cui l'inventario esiste.
 */
export const gradinoSale = (dove: string, quanto: string): Multilingua => ({
  it: `A ${dove} sale di ${quanto}`,
  en: `At ${dove} it rises by ${quanto}`,
})

export const gradinoScende = (dove: string, quanto: string): Multilingua => ({
  it: `A ${dove} scende di ${quanto}`,
  en: `At ${dove} it drops by ${quanto}`,
})

export const gradinoComunale = (comuni: string): Multilingua => ({
  it: `Dipende dal Comune: ${comuni} ne hanno una`,
  en: `It depends on the municipality: ${comuni} have one`,
})

/**
 * Perché il confine fra i due istituti del cuneo non è in elenco.
 *
 * ⚠️ **È una correzione, non una nota di colore.** L'inventario dei gradini
 * si costruisce cercando i salti sulle curve, e su quella della somma il salto
 * più grande cade proprio sulla soglia di accesso: lì la somma sparisce
 * interamente. Ma un salto della *voce* non è un salto del *netto* — un
 * centesimo sopra, la detrazione la sostituisce e vale qualcosa in più.
 * Elencarlo fra i punti in cui il netto scende sarebbe falso, e sarebbe falso
 * contro ciò che questa stessa pagina dimostra due riquadri più su.
 */
export const gradiniRaccordoEscluso = (soglia: string): Multilingua => ({
  it: `Il confine di ${soglia} non è in elenco, ed è l’eccezione che conferma la regola: lì la somma sparisce tutta insieme, ma la detrazione la sostituisce e vale un po’ di più. È l’unico punto in cui il legislatore ha raccordato le due cose.`,
  en: `The ${soglia} boundary is not on the list, and it is the exception that proves the rule: there the sum vanishes all at once, but the credit replaces it and is worth slightly more. It is the one point where the legislator joined the two up.`,
})
