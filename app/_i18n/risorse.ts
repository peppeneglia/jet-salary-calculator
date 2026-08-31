/**
 * Le stringhe dell'interfaccia, in italiano e in inglese.
 *
 * ⚠️ Non è la stessa tabella di `data/testi.ts`, e la differenza non è
 * organizzativa. Là stanno le frasi che accompagnano un numero prodotto dal
 * motore, e stanno in `data/` perché il motore le riceve come riceve i
 * parametri (D-041). Qui stanno le frasi che l'interfaccia dice per conto
 * proprio: titoli, aiuti sotto i campi, etichette che la traccia non porta.
 * Mescolarle vorrebbe dire che `data/` contiene testo di interfaccia, e
 * `data/` non sa cosa sia un'interfaccia.
 *
 * Il registro è quello di D-039. Chi legge è un dipendente o chi gestisce
 * il personale, non chi valuta la prova. Frasi corte, si dà del tu, niente
 * *modello*, *perimetro*, *prototipo*, *scope*, *input*.
 *
 * Cosa resta in italiano anche in inglese (D-041): i nomi degli istituti
 * che non hanno equivalente, con una glossa fra parentesi alla prima
 * occorrenza. I titoli dei quattro gruppi di `nature` sono la prima
 * occorrenza in pagina di *contributi previdenziali*, *IRPEF* e *addizionale
 * regionale e comunale*: la glossa sta lì, e le voci sotto usano il nome nudo.
 */

import type { CodiceLingua } from '../../core/types'

const it = {
  meta: {
    titolo: 'Jet Salary Calculator',
    descrizione:
      'Quanto resta davvero di uno stipendio lordo: netto annuo e mensile, con il dettaglio di ogni voce e la norma che la determina. Progetto indipendente, non un prodotto Jet HR.',
    titoloNonCopre: 'Cosa non copre questo calcolatore · Jet Salary Calculator',
    descrizioneNonCopre:
      'I confini dichiarati del calcolo: cosa resta fuori, perché, e da che parte si sposta il conto.',
    titoloNorme: 'Norme sul calcolo dello stipendio · Jet Salary Calculator',
    descrizioneNorme:
      'Archivio delle norme che determinano la retribuzione netta in Italia: cosa dispone ciascuna, cosa determina nel calcolo o perché resta fuori, con vigenza e fonte istituzionale.',
    titoloSpiegazione: 'Come si passa dal lordo al netto · Jet Salary Calculator',
    descrizioneSpiegazione:
      'La catena intera con le cifre che la governano: contributi, IRPEF a scaglioni, detrazioni, cuneo fiscale, le addizionali di tutti e ventuno gli enti regionali su una mappa, e le somme che invece si aggiungono.',
    titoloProgetto: 'Che progetto è Jet Salary Calculator',
    descrizioneProgetto:
      'Da dove nasce questo calcolatore, come è costruito, e che cosa c’entra Jet HR. Progetto indipendente, non un prodotto dell’azienda.',
    titoloChiSono: 'Chi sono · Jet Salary Calculator',
    descrizioneChiSono:
      'Giuseppe Neglia: sviluppatore in Deloitte, laureato in informatica e studente di gestione d’impresa. Chi ha scritto questo calcolatore, e perché proprio questo.',
    titoloTecnica: 'Come è fatta tecnicamente l’app · Jet Salary Calculator',
    descrizioneTecnica:
      'Lo stack, la divisione del codice fra motore, parametri e interfaccia, l’import dei dati del MEF, che cosa non arriva al browser, come si verifica, e dove sta pubblicato.',
  },

  nav: {
    etichettaTesta: 'Sezioni del sito',
    etichettaPiede: 'Sezioni del sito, in fondo',
    calcolatore: 'Calcolatore',
    spiegazione: 'Spiegazione',
    norme: 'Norme',
  },

  piede: {
    notaAnnuale:
      'Jet Salary Calculator permette di sapere quanto resta davvero di uno stipendio lordo, e soprattutto perché. Parte dalla retribuzione annua lorda e dal comune di residenza, applica i contributi previdenziali, l’IRPEF con le sue detrazioni e le addizionali di Regione e Comune, e mostra il netto annuo insieme alla sua divisione in 12, 13 o 14 mensilità. Ogni voce porta accanto la regola che la determina e la norma da cui viene il numero, così il risultato si può verificare invece di doverci credere. È il netto di un anno intero, non l’importo di una singola busta paga: quella risponde a una domanda diversa.',
    linkNonCopre: 'Cosa non copre questo calcolatore',
    linkProgetto: 'Che progetto è Jet Salary Calculator',
    linkTecnica: 'Come è fatta tecnicamente l’app',
    indipendenteApertura: 'Progetto indipendente di',
    indipendenteChiusura: 'Task di hiring per la posizione di Product Builder in Jet HR.',
  },

  preferenze: {
    lingua: 'Lingua',
    tema: 'Tema',
    temaChiaro: 'Chiaro',
    temaScuro: 'Scuro',
    temaSistema: 'Come il sistema',
  },

  home: {
    titolo: 'Dalla RAL al netto, voce per voce',
    occhiello:
      'Quanto resta davvero di uno stipendio lordo, e dove finisce tutto il resto: contributi. Per ogni voce trovi la regola che la determina e la norma da cui viene il numero.',
  },

  input: {
    titolo: 'I tuoi dati',
    ralEtichetta: 'Retribuzione annua lorda (RAL)',
    ralAiuto: 'È lo stipendio annuo scritto sul contratto, prima di ogni trattenuta.',
    ralSegnaposto: 'Es: 30000',
    comuneEtichetta: 'Comune di residenza',
    comuneAiuto: 'Conta dove avevi il domicilio fiscale al 1° gennaio.',
    regioneEtichetta: 'Regione o Provincia autonoma',
    regioneAssente: 'Non disponibile',
    regioneSegnaposto: 'Es: Lombardia',
    comuneSegnaposto: 'Es: Milano (MI)',
    comuneSuggeriti: 'Le città più grandi',
    comuneTutti: 'Tutti i comuni',
    comuneNessunRisultato: 'Nessun comune con questo nome, per ora.',
    comuneElencoInArrivo: 'Sto caricando l’elenco dei comuni…',
    comuneElencoPronto: 'Elenco pronto: {{n}} comuni, cerca pure.',
    comuneElencoFallito:
      'Non sono riuscito a caricare l’elenco dei comuni. Puoi riprovare: intanto resta selezionato quello che vedi nel campo, e il calcolo funziona.',
    comuneElencoRiprova: 'Riprova a caricare l’elenco',
    comuneMarcatoreNonDisponibile: 'non disponibile',
    comuneNonCalcolabile: 'Per {{comune}} non possiamo calcolare il netto.',
    contrattoEtichetta: 'Tipo di contratto',
    mensilitaEtichetta: 'In quante mensilità',
    mensilitaMarcatore: 'facoltativo',
    facoltativo: 'facoltativo',
    calcola: 'Calcola lo stipendio netto',
    inCorso: 'Calcolo in corso…',
  },

  risultato: {
    titolo: 'Il risultato',
    riepilogoTitolo: 'Calcolato su',
    riepilogoMensilita: '{{n}} mensilità',
    riepilogoAnno: 'anno d’imposta {{anno}}',
    graficoTitolo: 'Quanto del lordo ti resta',
    graficoNetto: 'Ti resta',
    graficoDifferenza: 'Non ti arriva',
    graficoInPiu: 'In più del lordo',
    graficoDescrizione:
      'Di {{lordo}} lordi te ne restano {{netto}}, cioè il {{quota}}. La differenza, {{differenza}}, è spiegata voce per voce qui sotto.',
    graficoDescrizioneInPiu:
      'Di {{lordo}} lordi te ne restano {{netto}}, cioè il {{quota}}: più del lordo di partenza. A questo livello di reddito ti spettano somme che per legge non sono tassate e si sommano al netto, e valgono {{differenza}} più di tutto ciò che ti viene trattenuto. Le trovi voce per voce qui sotto.',
    notaContrattoDomanda: 'Il tipo di contratto cambia quello che prendo?',
    notaContrattoTitolo: 'Determinato e indeterminato danno lo stesso netto.',
    notaContrattoCorpo:
      'Sui contratti a termine c’è un contributo in più, ma lo paga l’azienda e non passa dalla tua busta paga. L’apprendistato invece cambia: lì la legge riduce i contributi a carico tuo, e il netto sale.',
    nettoAnnuo: 'Netto annuo',
    suMensilita: 'su {{n}} mensilità',
    mensilitaSelezionata: 'la mensilità selezionata',
    notaMensilitaTitolo: 'La mensilità non determina quanto guadagni in un anno.',
    notaMensilitaCorpo:
      'Determina in quante parti quel totale viene diviso: è sempre lo stesso stipendio, e chi ha quattordici mensilità non guadagna meno di chi ne ha dodici.',
    assunzioniTitolo: 'Cosa vuol dire esattamente questa cifra?',
    assunzioniOcchiello: 'Come va letta questa cifra, per il calcolo che hai appena fatto.',
  },

  dettaglio: {
    titolo: 'Dove vanno i tuoi soldi',
    occhiello:
      'Prima la ripartizione, poi i numeri in tabella, poi ogni voce spiegata con la regola che la determina e la norma da cui viene.',

    graficoTitolo: 'Come si divide',
    graficoResta: 'Ti resta',
    graficoNotaAggiunte:
      'La barra è lunga {{totale}} e non {{lordo}}: alcune somme non passano dallo stipendio lordo, non vengono tassate e si sommano al netto. Sono elencate più sotto.',

    tabellaTitolo: 'Tutti i numeri del calcolo',
    tabellaOcchiello:
      'Gli stessi passaggi, senza spiegazioni: serve a rifare il conto, non a capirlo. Le righe rientrate scompongono la voce che le precede.',
    tabellaVoce: 'Voce',
    tabellaBase: 'Calcolata su',
    tabellaValore: 'Valore applicato',
    tabellaEffetto: 'Effetto sul netto',
    tabellaProgressivo: 'Netto progressivo',
    tabellaNetto: 'Netto annuo',

    spiegazioneTitolo: 'Voce per voce',
    spiegazioneOcchiello:
      'Qui c’è il perché: cosa fa ogni voce, su cosa si calcola e quale norma la stabilisce. Ci sono anche i passaggi intermedi, che servono a far tornare i conti.',

    sankeyTitolo: 'Il percorso, dal lordo al netto',
    sankeyOcchiello:
      'Lo stesso calcolo come flusso: a ogni passaggio qualcosa esce, e quello che resta prosegue.',
    sankeyLordo: 'Lordo',
    sankeyRedditoComplessivo: 'Reddito complessivo',
    sankeyNetto: 'Netto',
    sankeyDescrizione:
      'Da {{lordo}} lordi escono prima i contributi, che lasciano {{rc}} di reddito complessivo. Su quello si calcolano le imposte, e alla fine restano {{netto}}.',

    fallbackRegionale: 'Perché restano le aliquote dell’anno prima (Regione)',
    fallbackComunale: 'Perché restano le aliquote dell’anno prima (Comune)',
  },

  passo: {
    nonDovuto: 'Non dovuto',
    presuppostoSoddisfatto: 'Presupposto soddisfatto',
    presuppostoAssente: 'Presupposto assente',
    calcolataSu: 'calcolata su',
    aliquoteAScaglioni: 'aliquote a scaglioni',
    valoreApplicato: 'Valore applicato',
    regolaNormativa: 'Regola',
    scaglioneDaA: 'Da {{da}} a {{a}}',
    scaglioneOltre: 'Oltre {{da}}',
  },

  fonte: {
    verificata: '· verificata il {{data}}',
    importataConEstrazione: '· importata, estratta il {{estratta}}, consultata il {{data}}',
    importata: '· importata, consultata il {{data}}',
    titolo: 'Fonte',
  },

  assunzioni: {
    direzioneNessuna: 'Non cambia la cifra',
    direzionePiuAlto: 'In questo caso prendi più di quanto calcoliamo',
    direzionePiuBasso: 'In questo caso prendi meno di quanto calcoliamo',
  },

  nature: {
    previdenzaTitolo: 'Contributi previdenziali',
    previdenzaDestinazione: 'alla tua pensione futura',
    previdenzaSpiegazione:
      'Non sono tasse. Vanno all’INPS e costruiscono la tua pensione: escono dallo stipendio adesso e tornano dopo, sotto forma di assegno. È il motivo per cui li teniamo separati dalle imposte.',
    erarialeTitolo: 'IRPEF',
    erarialeDestinazione: 'allo Stato',
    erarialeSpiegazione:
      'L’imposta sul reddito che va allo Stato. Cresce per scaglioni: la parte di reddito oltre una certa soglia è tassata di più, ma solo quella parte, non tutto. Le detrazioni la riducono, e non possono portarla sotto zero: se valgono più dell’imposta, l’eccedenza si perde.',
    localeTitolo: 'Addizionale regionale e comunale',
    localeDestinazione: 'alla sanità regionale e al bilancio del tuo Comune',
    localeSpiegazione:
      'Le stesse imposte, incassate da Regione e Comune. Si calcolano sullo stesso reddito dell’IRPEF, non su quello che resta dopo averla pagata. Le aliquote le decide ogni ente, quindi due persone con lo stesso stipendio in due comuni diversi pagano cifre diverse.',
    aggiungeTitolo: 'Voci che aggiungono',
    aggiungeDestinazione: 'restano a te',
    aggiungeSpiegazione:
      'Somme che il datore ti versa in busta e che non vengono tassate. Non sono uno sconto sulle imposte: sono soldi in più. Per questo qui il segno è positivo.',
  },

  contratti: {
    indeterminato: 'Tempo indeterminato',
    determinato: 'Tempo determinato',
    apprendistato: 'Apprendistato',
  },

  /**
   * Il registro degli errori — D-043.
   *
   * Dicono cosa fare, non cosa è andato storto. Nessun codice visibile, e
   * nessuna parola di quantità su una condizione binaria (nota di D-039).
   */
  errori: {
    titolo: 'Non possiamo darti un numero',
    occhiello: 'Preferiamo dirtelo, invece di mostrarti una cifra che sembra giusta e non lo è.',
    ralMancante: 'Inserisci lo stipendio lordo annuo, per esempio 30.000.',
    ralNonNumerica:
      'Scrivi lo stipendio lordo in cifre, per esempio 30.000. Le lettere e i simboli non li sappiamo leggere.',
    ralNonPositiva: 'Inserisci uno stipendio lordo maggiore di zero, per esempio 30.000.',
    ralImplausibile:
      'Controlla la cifra: la leggiamo come {{importo}}, che per uno stipendio annuo è fuori scala. Scrivila in euro, non in centesimi: oltre {{soglia}} non facciamo il calcolo.',
    comuneMancante: 'Scegli il comune in cui avevi il domicilio fiscale al 1° gennaio.',
    comuneSconosciuto:
      'Scegli un comune dall’elenco: ci sono tutti i comuni italiani, presi dagli elenchi del Ministero dell’Economia e delle Finanze.',
    contrattoNonValido: 'Scegli uno dei tre tipi di contratto.',
    mensilitaNonValida: 'Scegli 12, 13 o 14 mensilità.',
    rete:
      'Non siamo riusciti a completare il calcolo. Riprova fra poco: se il problema resta, non dipende dai dati che hai inserito.',
  },

  nonCopre: {
    titolo: 'Cosa non copre questo calcolatore',
    paragrafo1:
      'Questo strumento parte dallo stipendio lordo annuo e arriva al netto. Alcune cose che cambiano la busta paga da quel numero non si possono ricavare: dipendono dalla tua famiglia, dal contratto che ti applicano, o da scelte che hai fatto tu.',
    paragrafo2: 'Le trovi qui sotto, ognuna con l’effetto che avrebbe sul risultato se la includessimo.',
    quandoRalSupera: 'Riguarda solo chi ha una RAL sopra {{soglia}}.',
    quandoRalSotto: 'Riguarda solo chi ha una RAL sotto {{soglia}}.',
    quandoContrattoDiverso: 'Riguarda chi non ha dichiarato un contratto di {{contratto}}.',
    percheTitolo: 'Perché non le abbiamo nascoste',
    percheTesto:
      'Un calcolatore che tace i propri limiti dà un numero che sembra definitivo. Questo dice dove finisce: così puoi capire se la tua situazione rientra nel conto, e di quanto ti aspetti che il tuo caso se ne discosti.',
  },

  norme: {
    titolo: 'Norme sul calcolo dello stipendio',
    paragrafo1:
      'Quanto arriva davvero in busta paga non lo decide una regola sola. Lo decidono decine di norme stratificate negli anni, che si rinviano a vicenda e che quasi nessuno legge insieme. Qui ci sono quelle che abbiamo aperto e letto, nell’ordine in cui incontrano una retribuzione: prima i contributi, poi l’imposta, poi Regione e Comune.',
    paragrafo2a: 'Di ciascuna trovi cosa dispone, cosa determina nel netto, o perché resta fuori dal nostro calcolo, e le',
    paragrafo2b: 'ambiguità che porta con sé',
    paragrafo2c:
      ': rinvii che non arrivano a destinazione, tetti che vengono derogati, articoli che citano numerazioni cambiate vent’anni fa. È la parte che di solito non si racconta.',
    filtro: 'Filtra per sezione',
    tutte: 'Tutte',
    cosaDetermina: 'Cosa determina nel netto',
    inVigore: 'In vigore',
    ultimaModifica: 'Ultima modifica',
    ambiguita: 'Cose da sapere',
    cercaEtichetta: 'Cerca fra le norme',
    cercaSegnaposto: 'Cerca una parola, un atto, un articolo',
    cercaBottone: 'Cerca',
    cercaEsito: '{{n}} schede per «{{ricerca}}».',
    lettaIl: 'Letta il {{data}}',
  },
} as const

/**
 * La forma della tabella è quella italiana: l'inglese deve riempirla tutta.
 * Una chiave dimenticata non compila, che è la stessa proprietà del `Record`
 * pieno di `TestiTraccia`.
 */
type Risorse = {
  readonly [Sezione in keyof typeof it]: { readonly [Chiave in keyof (typeof it)[Sezione]]: string }
}

const en: Risorse = {
  meta: {
    titolo: 'Jet Salary Calculator',
    descrizione:
      'What is actually left of a gross Italian salary: annual and monthly net pay, every item broken down, and the rule behind each one. An independent project, not a Jet HR product.',
    titoloNonCopre: 'What this calculator does not cover · Jet Salary Calculator',
    descrizioneNonCopre:
      'The declared limits of the calculation: what is left out, why, and which way it moves the figure.',
    titoloNorme: 'The law behind Italian net pay · Jet Salary Calculator',
    descrizioneNorme:
      'An archive of the rules that determine net pay in Italy: what each one provides, what it determines in the calculation or why it stays out, with dates in force and the institutional source.',
    titoloSpiegazione: 'How gross pay becomes take-home pay · Jet Salary Calculator',
    descrizioneSpiegazione:
      'The whole chain with the figures that govern it: contributions, IRPEF brackets, tax credits, the wedge cut, the surcharges of all twenty-one regional authorities on a map, and the sums that are added back instead.',
    titoloProgetto: 'What Jet Salary Calculator is',
    descrizioneProgetto:
      'Where this calculator comes from, how it is built, and what Jet HR has to do with it. An independent project, not a product of the company.',
    titoloChiSono: 'About me · Jet Salary Calculator',
    descrizioneChiSono:
      'Giuseppe Neglia: developer at Deloitte, computer science graduate and business management student. Who wrote this calculator, and why this one.',
    titoloTecnica: 'How the app is built, technically · Jet Salary Calculator',
    descrizioneTecnica:
      'The stack, how the code is split between engine, parameters and interface, the import of the ministry data, what never reaches the browser, how it is checked, and where it is published.',
  },

  nav: {
    etichettaTesta: 'Site sections',
    etichettaPiede: 'Site sections, in the footer',
    calcolatore: 'Calculator',
    spiegazione: 'How it works',
    norme: 'The law',
  },

  piede: {
    notaAnnuale:
      'Jet Salary Calculator lets you find out what is actually left of a gross salary, and above all why. It starts from your gross annual salary and your municipality of residence, applies social security contributions, IRPEF with its detrazioni (tax credits) and the regional and municipal addizionali (local income tax surcharges), and shows net pay for the year alongside its division into 12, 13 or 14 instalments. Each item comes with the rule that determines it and the source the figure comes from, so the result can be checked instead of taken on trust. It is net pay for a full year, not the amount of a single payslip: that answers a different question.',
    linkNonCopre: 'What this calculator does not cover',
    linkProgetto: 'What Jet Salary Calculator is',
    linkTecnica: 'How the app is built, technically',
    indipendenteApertura: 'An independent project by',
    indipendenteChiusura: 'A hiring task for the Product Builder position at Jet HR.',
  },

  preferenze: {
    lingua: 'Language',
    tema: 'Theme',
    temaChiaro: 'Light',
    temaScuro: 'Dark',
    temaSistema: 'System',
  },

  home: {
    titolo: 'From gross salary to take-home pay, item by item',
    occhiello:
      'What is actually left of a gross salary, and where the rest goes: social security contributions. Each item comes with the rule that determines it and the source the figure comes from.',
  },

  input: {
    titolo: 'Your details',
    ralEtichetta: 'Gross annual salary (RAL)',
    ralAiuto: 'The annual salary written in your contract, before any deduction.',
    ralSegnaposto: 'E.g. 30000',
    comuneEtichetta: 'Municipality of residence',
    comuneAiuto: 'What counts is where you were tax-resident on 1 January.',
    regioneEtichetta: 'Region or autonomous Province',
    regioneAssente: 'Not available',
    regioneSegnaposto: 'E.g. Lombardia',
    comuneSegnaposto: 'E.g. Milano (MI)',
    comuneSuggeriti: 'The largest cities',
    comuneTutti: 'All municipalities',
    comuneNessunRisultato: 'No municipality by that name, for now.',
    comuneElencoInArrivo: 'Loading the list of municipalities…',
    comuneElencoPronto: 'List ready: {{n}} municipalities, go ahead and search.',
    comuneElencoFallito:
      'I could not load the list of municipalities. You can try again: meanwhile the one in the field stays selected, and the calculation still works.',
    comuneElencoRiprova: 'Try loading the list again',
    comuneMarcatoreNonDisponibile: 'not available',
    comuneNonCalcolabile: 'We cannot work out net pay for {{comune}}.',
    contrattoEtichetta: 'Type of contract',
    mensilitaEtichetta: 'Paid over how many instalments',
    mensilitaMarcatore: 'optional',
    facoltativo: 'optional',
    calcola: 'Work out my net salary',
    inCorso: 'Working it out…',
  },

  risultato: {
    titolo: 'The result',
    riepilogoTitolo: 'Worked out from',
    riepilogoMensilita: '{{n}} instalments',
    riepilogoAnno: 'tax year {{anno}}',
    graficoTitolo: 'How much of the gross is left',
    graficoNetto: 'You keep',
    graficoDifferenza: 'Does not reach you',
    graficoInPiu: 'On top of the gross',
    graficoDescrizione:
      'Out of {{lordo}} gross you keep {{netto}}, that is {{quota}}. The difference, {{differenza}}, is broken down item by item below.',
    graficoDescrizioneInPiu:
      'Out of {{lordo}} gross you keep {{netto}}, that is {{quota}}: more than the gross you started from. At this income level you are owed sums that by law are not taxed and are added to your net pay, and they come to {{differenza}} more than everything withheld from you. You will find them item by item below.',
    notaContrattoDomanda: 'Does the type of contract change what I take home?',
    notaContrattoTitolo: 'Fixed-term and permanent give the same net pay.',
    notaContrattoCorpo:
      'Fixed-term contracts carry an extra contribution, but the employer pays it and it never passes through your payslip. Apprendistato (apprenticeship) does change things: there the law lowers the contributions you pay, and your net pay goes up.',
    nettoAnnuo: 'Net pay for the year',
    suMensilita: 'over {{n}} instalments',
    mensilitaSelezionata: 'the selected number of instalments',
    notaMensilitaTitolo: 'How many instalments does not determine what you earn in a year.',
    notaMensilitaCorpo:
      'It determines how many parts that total is split into: it is the same salary either way, and someone paid over fourteen instalments does not earn less than someone paid over twelve.',
    assunzioniTitolo: 'What does this figure mean, exactly?',
    assunzioniOcchiello: 'How to read this figure, for the calculation you have just run.',
  },

  dettaglio: {
    titolo: 'Where your money goes',
    occhiello:
      'First how it splits, then the numbers in a table, then every item explained with the rule behind it and the source it comes from.',

    graficoTitolo: 'How it splits',
    graficoResta: 'You keep',
    graficoNotaAggiunte:
      'The bar is {{totale}} long, not {{lordo}}: some sums do not come out of your gross salary, are not taxed, and are added to your net pay. They are listed below.',

    tabellaTitolo: 'Every number in the calculation',
    tabellaOcchiello:
      'The same steps with no commentary: this is for redoing the arithmetic, not for understanding it. Indented rows break down the item above them.',
    tabellaVoce: 'Item',
    tabellaBase: 'Applied to',
    tabellaValore: 'Value applied',
    tabellaEffetto: 'Effect on net pay',
    tabellaProgressivo: 'Running net',
    tabellaNetto: 'Net pay for the year',

    spiegazioneTitolo: 'Item by item',
    spiegazioneOcchiello:
      'This is the why: what each item does, what it is calculated on, and which rule sets it. The intermediate steps are here too, because they are what makes the arithmetic add up.',

    sankeyTitolo: 'The path, from gross to net',
    sankeyOcchiello:
      'The same calculation as a flow: at each stage something leaves, and what is left carries on.',
    sankeyLordo: 'Gross',
    sankeyRedditoComplessivo: 'Total income',
    sankeyNetto: 'Net',
    sankeyDescrizione:
      'Out of {{lordo}} gross, contributions come out first, leaving {{rc}} of total income. Taxes are worked out on that, and {{netto}} is what remains.',

    fallbackRegionale: 'Why last year’s rates still apply (Region)',
    fallbackComunale: 'Why last year’s rates still apply (Municipality)',
  },

  passo: {
    nonDovuto: 'Not due',
    presuppostoSoddisfatto: 'Condition met',
    presuppostoAssente: 'Condition not met',
    calcolataSu: 'calculated on',
    aliquoteAScaglioni: 'rates by bracket',
    valoreApplicato: 'Value applied',
    regolaNormativa: 'Rule',
    scaglioneDaA: 'From {{da}} to {{a}}',
    scaglioneOltre: 'Above {{da}}',
  },

  fonte: {
    verificata: '· checked on {{data}}',
    importataConEstrazione: '· imported, extracted on {{estratta}}, consulted on {{data}}',
    importata: '· imported, consulted on {{data}}',
    titolo: 'Source',
  },

  assunzioni: {
    direzioneNessuna: 'Does not change the figure',
    direzionePiuAlto: 'In this case you get more than we calculate',
    direzionePiuBasso: 'In this case you get less than we calculate',
  },

  nature: {
    previdenzaTitolo: 'Contributi previdenziali (social security contributions)',
    previdenzaDestinazione: 'to your future pension',
    previdenzaSpiegazione:
      'These are not taxes. They go to INPS, the state social security institute, and build your pension: they leave your salary now and come back later as a monthly payment. That is why we keep them separate from tax.',
    erarialeTitolo: 'IRPEF (Italian personal income tax)',
    erarialeDestinazione: 'to the state',
    erarialeSpiegazione:
      'The income tax that goes to the state. It rises in brackets: income above a threshold is taxed more heavily, but only that part of it, not all of it. Tax credits bring it down, and they cannot push it below zero: if they are worth more than the tax, the excess is lost.',
    localeTitolo: 'Addizionale regionale e comunale (regional and municipal income tax surcharges)',
    localeDestinazione: 'to regional healthcare and to your municipality’s budget',
    localeSpiegazione:
      'The same tax, collected by the region and the municipality. They are computed on the same income as IRPEF, not on what is left after paying it. Each authority sets its own rates, so two people on the same salary in two different towns pay different amounts.',
    aggiungeTitolo: 'Items that add',
    aggiungeDestinazione: 'stay with you',
    aggiungeSpiegazione:
      'Sums your employer pays into your payslip that are not taxed. They are not a discount on tax: they are extra money. That is why the sign here is positive.',
  },

  contratti: {
    indeterminato: 'Permanent',
    determinato: 'Fixed-term',
    apprendistato: 'Apprendistato (apprenticeship)',
  },

  errori: {
    titolo: 'We cannot give you a figure',
    occhiello: 'We would rather say so than show you a number that looks right and is not.',
    ralMancante: 'Enter your gross annual salary, for example 30,000.',
    ralNonNumerica:
      'Write your gross salary in figures, for example 30,000. We cannot read letters or symbols.',
    ralNonPositiva: 'Enter a gross salary above zero, for example 30,000.',
    ralImplausibile:
      'Check the figure: we read it as {{importo}}, which is off the scale for an annual salary. Write it in euros, not in cents: above {{soglia}} we do not run the calculation.',
    comuneMancante: 'Choose the municipality where you were tax-resident on 1 January.',
    comuneSconosciuto:
      'Choose a municipality from the list: every Italian municipality is there, taken from the lists published by the Italian Ministry of Economy and Finance.',
    contrattoNonValido: 'Choose one of the three types of contract.',
    mensilitaNonValida: 'Choose 12, 13 or 14 instalments.',
    rete:
      'We could not finish the calculation. Try again shortly: if it keeps happening, it is not down to what you entered.',
  },

  nonCopre: {
    titolo: 'What this calculator does not cover',
    paragrafo1:
      'This tool starts from your gross annual salary and works out your net pay. Some of the things that change a payslip cannot be derived from that number: they depend on your family, on the collective agreement applied to you, or on choices you have made.',
    paragrafo2: 'They are listed below, each with the effect it would have on the result if we included it.',
    quandoRalSupera: 'Applies only to a RAL above {{soglia}}.',
    quandoRalSotto: 'Applies only to a RAL below {{soglia}}.',
    quandoContrattoDiverso: 'Applies to anyone whose declared contract is not {{contratto}}.',
    percheTitolo: 'Why we have not hidden them',
    percheTesto:
      'A calculator that keeps quiet about its limits hands you a number that looks final. This one tells you where it stops: so you can see whether your situation fits the calculation, and how far your own case is likely to sit from it.',
  },

  norme: {
    titolo: 'The law behind Italian net pay',
    paragrafo1:
      'What actually reaches your payslip is not decided by a single rule. It is decided by dozens of them, layered over the years, cross-referring to one another, and almost never read side by side. These are the ones we opened and read, in the order a salary meets them: contributions first, then the tax, then the region and the municipality.',
    paragrafo2a: 'For each one you will find what it provides, what it determines in your net pay, or why it stays outside our calculation, and the',
    paragrafo2b: 'ambiguities it carries with it',
    paragrafo2c:
      ': cross-references that lead nowhere, ceilings that get derogated from, articles citing numbering that changed twenty years ago. It is the part nobody usually tells you about.',
    filtro: 'Filter by section',
    tutte: 'All',
    cosaDetermina: 'What it determines in your net pay',
    inVigore: 'In force',
    ultimaModifica: 'Last amended',
    ambiguita: 'Things worth knowing',
    cercaEtichetta: 'Search the rules',
    cercaSegnaposto: 'Search a word, an act, an article',
    cercaBottone: 'Search',
    cercaEsito: '{{n}} entries for “{{ricerca}}”.',
    lettaIl: 'Read on {{data}}',
  },


}

export const RISORSE: Readonly<Record<CodiceLingua, Risorse>> = { it, en }

export type ChiaveRisorse = {
  [S in keyof Risorse]: `${S & string}.${keyof Risorse[S] & string}`
}[keyof Risorse]
