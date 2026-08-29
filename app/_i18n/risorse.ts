/**
 * Le stringhe dell'interfaccia, in italiano e in inglese.
 *
 * ⚠️ **Non è la stessa tabella di `data/testi.ts`, e la differenza non è
 * organizzativa.** Là stanno le frasi che accompagnano un numero prodotto dal
 * motore, e stanno in `data/` perché il motore le riceve come riceve i
 * parametri (D-041). Qui stanno le frasi che l'interfaccia dice **per conto
 * proprio**: titoli, aiuti sotto i campi, etichette che la traccia non porta.
 * Mescolarle vorrebbe dire che `data/` contiene testo di interfaccia, e
 * `data/` non sa cosa sia un'interfaccia.
 *
 * **Il registro è quello di D-039.** Chi legge è un dipendente o chi gestisce
 * il personale, non chi valuta la prova. Frasi corte, si dà del tu, niente
 * *modello*, *perimetro*, *prototipo*, *scope*, *input*.
 *
 * **Cosa resta in italiano anche in inglese** (D-041): i nomi degli istituti
 * che non hanno equivalente, con una glossa fra parentesi alla prima
 * occorrenza. I titoli dei quattro gruppi di `nature` sono la **prima
 * occorrenza in pagina** di *contributi previdenziali*, *IRPEF* e *addizionale
 * regionale e comunale*: la glossa sta lì, e le voci sotto usano il nome nudo.
 */

import type { CodiceLingua } from '../../core/types'

const it = {
  meta: {
    titolo: 'Jet Salary Calculator',
    descrizione:
      'Quanto resta davvero di uno stipendio lordo: netto annuo e mensile, con il dettaglio di ogni voce e la norma che la determina. Progetto indipendente, non un prodotto Jet HR.',
    titoloNonCopre: 'Cosa questo calcolatore non copre — Jet Salary Calculator',
    descrizioneNonCopre:
      'I confini dichiarati del calcolo: cosa resta fuori, perché, e da che parte si sposta il conto.',
    titoloNorme: 'Norme sul calcolo dello stipendio — Jet Salary Calculator',
    descrizioneNorme:
      'Archivio delle norme che determinano la retribuzione netta in Italia: cosa dispone ciascuna, cosa determina nel calcolo o perché resta fuori, con vigenza e fonte istituzionale.',
  },

  nav: {
    etichettaTesta: 'Sezioni del sito',
    etichettaPiede: 'Sezioni del sito, in fondo',
    calcolatore: 'Calcolatore',
    norme: 'Norme',
  },

  piede: {
    notaAnnuale:
      'Il risultato è il netto di un anno intero, per uno stipendio percepito tutto nell’anno. Non è l’importo di una singola busta paga: quella risponde a una domanda diversa, e il numero che ci leggi sarà un altro.',
    linkNonCopre: 'Cosa questo calcolatore non copre',
    indipendente: 'Progetto indipendente. Non è un prodotto Jet HR e non è affiliato all’azienda.',
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
      'Quanto resta davvero di uno stipendio lordo, e dove finisce tutto il resto: contributi, IRPEF, addizionali di Regione e Comune, e le somme che invece si aggiungono. Per ogni voce trovi la regola che la determina e la norma da cui viene il numero.',
  },

  input: {
    titolo: 'I tuoi dati',
    ralEtichetta: 'Retribuzione annua lorda (RAL)',
    ralAiuto: 'È lo stipendio annuo scritto sul contratto, prima di ogni trattenuta.',
    comuneEtichetta: 'Comune in cui vivi',
    comuneAiuto: 'Conta dove avevi il domicilio fiscale al 1° gennaio.',
    comuneEnte: 'Addizionale regionale di {{ente}}',
    comuneSegnaposto: 'Cerca un comune',
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
    calcola: 'Calcola il netto',
    inCorso: 'Calcolo in corso…',
  },

  risultato: {
    titolo: 'Il risultato',
    occhiello: '{{contratto}}, {{comune}}, anno {{anno}}.',
    annoPaese: 'Anno d’imposta {{anno}} · Italia',
    riepilogoTitolo: 'Calcolato su',
    riepilogoMensilita: '{{n}} mensilità',
    notaContrattoTitolo: 'Determinato e indeterminato danno lo stesso netto.',
    notaContrattoCorpo:
      'Sui contratti a termine c’è un contributo in più, ma lo paga l’azienda e non passa dalla tua busta paga. L’apprendistato invece cambia: lì la legge riduce i contributi a carico tuo, e il netto sale.',
    nettoAnnuo: 'Netto annuo',
    daUnaRal: 'da una RAL di {{importo}}',
    suMensilita: 'su {{n}} mensilità',
    mensilitaSelezionata: ' — la mensilità selezionata',
    notaMensilitaTitolo: 'È sempre lo stesso stipendio, diviso in modi diversi.',
    notaMensilitaCorpo:
      'Il totale dell’anno non cambia: cambia quanto ti arriva ogni volta. Chi ha quattordici mensilità non guadagna meno di chi ne ha dodici.',
    assunzioniTitolo: 'Cosa vuol dire esattamente questa cifra',
    assunzioniOcchiello: 'Come va letta questa cifra, per il calcolo che hai appena fatto.',
  },

  dettaglio: {
    titolo: 'Dove vanno i tuoi soldi',
    occhiello:
      'Ogni voce con la regola che la determina e la norma da cui viene il numero. Ci sono anche i passaggi intermedi: servono a far tornare i conti.',
    entiTitolo: 'Chi incassa le addizionali, e come sono state fissate',
    entiOcchiello:
      'Le addizionali dipendono da dove vivi, e non tutti gli enti le fissano allo stesso modo: alcuni deliberano ogni anno, altri lasciano in vigore quelle dell’anno prima.',
    tributoRegionale: 'Addizionale regionale',
    tributoComunale: 'Addizionale comunale',
    enteNonIstituito:
      'Qui questa addizionale non esiste proprio. È diverso da un’aliquota fissata a zero: in un caso il tributo non è mai stato introdotto, nell’altro è stato introdotto e poi azzerato. Per te il risultato è lo stesso, ma non sono la stessa cosa.',
    enteDeliberato: 'Aliquote decise dall’ente per il {{anno}}.',
    enteEreditato:
      'Per quest’anno l’ente non ha deliberato nuove aliquote, quindi per legge restano quelle del {{anno}}. Non vuol dire che non si paga: si continua con le aliquote precedenti, ed è quello che succede alla maggior parte dei comuni.',
    fontiAliquote: 'Da dove vengono le aliquote',
    fontiFallback: 'La norma che lo prevede',
  },

  passo: {
    nonDovuto: 'Non dovuto',
    presuppostoSoddisfatto: 'Presupposto soddisfatto',
    presuppostoAssente: 'Presupposto assente',
    calcolataSu: 'calcolata su',
    aliquoteAScaglioni: 'aliquote a scaglioni',
    valoreApplicato: 'Il valore applicato',
    daDoveVieneIlNumero: 'Da dove viene il numero',
    regolaApplicata: 'La regola applicata',
    regolaNormativa: 'La regola, in linguaggio normativo',
  },

  fonte: {
    verificata: '· verificata il {{data}}',
    importataConEstrazione: '· importata, estratta il {{estratta}}, consultata il {{data}}',
    importata: '· importata, consultata il {{data}}',
    riserva: 'Riserva sulla fonte:',
    riferimento: 'Riferimento',
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
   * Dicono **cosa fare**, non cosa è andato storto. Nessun codice visibile, e
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
      'Controlla la cifra: la leggiamo come {{importo}}, che per uno stipendio annuo è fuori scala. Scrivila in euro, non in centesimi — oltre {{soglia}} non facciamo il calcolo.',
    comuneMancante: 'Scegli il comune in cui avevi il domicilio fiscale al 1° gennaio.',
    comuneSconosciuto:
      'Scegli un comune dall’elenco. Per ora il calcolatore copre i comuni che abbiamo verificato uno per uno: l’elenco completo dei comuni italiani arriverà più avanti.',
    contrattoNonValido: 'Scegli uno dei tre tipi di contratto.',
    mensilitaNonValida: 'Scegli 12, 13 o 14 mensilità.',
    rete:
      'Non siamo riusciti a completare il calcolo. Riprova fra poco: se il problema resta, non dipende dai dati che hai inserito.',
  },

  nonCopre: {
    torna: '← Torna al calcolatore',
    titolo: 'Cosa questo calcolatore non copre',
    paragrafo1:
      'Questo strumento parte dallo stipendio lordo annuo e arriva al netto. Alcune cose che cambiano la busta paga da quel numero non si possono ricavare: dipendono dalla tua famiglia, dal contratto che ti applicano, o da scelte che hai fatto tu.',
    paragrafo2: 'Le trovi qui sotto, ognuna con l’effetto che avrebbe sul risultato se la includessimo.',
    quandoRalSupera: 'Riguarda solo chi ha una RAL sopra {{soglia}}.',
    quandoContrattoDiverso: 'Riguarda chi non ha dichiarato un contratto di {{contratto}}.',
    percheTitolo: 'Perché non le abbiamo nascoste',
    percheTesto:
      'Un calcolatore che tace i propri limiti dà un numero che sembra definitivo. Questo dice dove finisce: così puoi capire se la tua situazione rientra nel conto, e di quanto ti aspetti che il tuo caso se ne discosti.',
  },

  norme: {
    titolo: 'Norme sul calcolo dello stipendio',
    paragrafo1:
      'Quanto arriva davvero in busta paga non lo decide una regola sola. Lo decidono decine di norme stratificate negli anni, che si rinviano a vicenda e che quasi nessuno legge insieme. Qui ci sono quelle che abbiamo aperto e letto, nell’ordine in cui incontrano una retribuzione: prima i contributi, poi l’imposta, poi Regione e Comune.',
    paragrafo2a: 'Di ciascuna trovi cosa dispone, cosa determina nel netto — o perché resta fuori dal nostro calcolo — e le',
    paragrafo2b: 'ambiguità che porta con sé',
    paragrafo2c:
      ': rinvii che non arrivano a destinazione, tetti che vengono derogati, articoli che citano numerazioni cambiate vent’anni fa. È la parte che di solito non si racconta.',
    indice: 'Sezioni dell’archivio',
    cosaDetermina: 'Cosa determina nel netto',
    inVigore: 'In vigore',
    ultimaModifica: 'Ultima modifica',
    ambiguita: 'Ambiguità e cose da sapere',
    lettaIl: 'Letta il {{data}}',
    vuotoTitolo: 'Dove un campo è vuoto, è vuoto apposta',
    vuotoTesto:
      'Alcune schede non hanno la data di vigenza, e per alcune manca il link al portale istituzionale. Non è una dimenticanza: significa che quella verifica non è stata fatta, o che il documento è stato letto su un portale che non espone un indirizzo stabile. Su una pagina di norme un dato ricostruito a memoria vale meno di un campo lasciato in bianco, perché il primo sembra affidabile e non lo è.',
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
    titoloNonCopre: 'What this calculator does not cover — Jet Salary Calculator',
    descrizioneNonCopre:
      'The declared limits of the calculation: what is left out, why, and which way it moves the figure.',
    titoloNorme: 'The law behind Italian net pay — Jet Salary Calculator',
    descrizioneNorme:
      'An archive of the rules that determine net pay in Italy: what each one provides, what it determines in the calculation or why it stays out, with dates in force and the institutional source.',
  },

  nav: {
    etichettaTesta: 'Site sections',
    etichettaPiede: 'Site sections, in the footer',
    calcolatore: 'Calculator',
    norme: 'The law',
  },

  piede: {
    notaAnnuale:
      'The figure is net pay for a full year, on a salary earned entirely within that year. It is not the amount of a single payslip: that answers a different question, and the number you read on it will be another one.',
    linkNonCopre: 'What this calculator does not cover',
    indipendente: 'An independent project. Not a Jet HR product and not affiliated with the company.',
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
      'What is actually left of a gross salary, and where the rest goes: social security contributions, IRPEF (Italian personal income tax), the regional and municipal addizionali (local income tax surcharges), and the sums that are added back instead. Each item comes with the rule that determines it and the source the figure comes from.',
  },

  input: {
    titolo: 'Your details',
    ralEtichetta: 'Gross annual salary (RAL)',
    ralAiuto: 'The annual salary written in your contract, before any deduction.',
    comuneEtichetta: 'Where you live',
    comuneAiuto: 'What counts is where you were tax-resident on 1 January.',
    comuneEnte: 'Regional addizionale of {{ente}}',
    comuneSegnaposto: 'Search for a municipality',
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
    calcola: 'Work out my net pay',
    inCorso: 'Working it out…',
  },

  risultato: {
    titolo: 'The result',
    occhiello: '{{contratto}}, {{comune}}, tax year {{anno}}.',
    annoPaese: 'Tax year {{anno}} · Italy',
    riepilogoTitolo: 'Worked out from',
    riepilogoMensilita: '{{n}} instalments',
    notaContrattoTitolo: 'Fixed-term and permanent give the same net pay.',
    notaContrattoCorpo:
      'Fixed-term contracts carry an extra contribution, but the employer pays it and it never passes through your payslip. Apprendistato (apprenticeship) does change things: there the law lowers the contributions you pay, and your net pay goes up.',
    nettoAnnuo: 'Net pay for the year',
    daUnaRal: 'from a RAL of {{importo}}',
    suMensilita: 'over {{n}} instalments',
    mensilitaSelezionata: ' — the selected number of instalments',
    notaMensilitaTitolo: 'It is the same salary, split up in different ways.',
    notaMensilitaCorpo:
      'The yearly total does not change: what changes is how much reaches you each time. Someone paid over fourteen instalments does not earn less than someone paid over twelve.',
    assunzioniTitolo: 'What this figure means, exactly',
    assunzioniOcchiello: 'How to read this figure, for the calculation you have just run.',
  },

  dettaglio: {
    titolo: 'Where your money goes',
    occhiello:
      'Every item with the rule that determines it and the source the figure comes from. The intermediate steps are here too: they are what makes the arithmetic add up.',
    entiTitolo: 'Who collects the addizionali, and how the rates were set',
    entiOcchiello:
      'The addizionali depend on where you live, and not every authority sets them the same way: some adopt new figures each year, others leave last year’s in force.',
    tributoRegionale: 'Addizionale regionale',
    tributoComunale: 'Addizionale comunale',
    enteNonIstituito:
      'This addizionale simply does not exist here. That is different from a rate set to zero: in one case the tax was never introduced, in the other it was introduced and then zeroed. For you the outcome is the same, but they are not the same thing.',
    enteDeliberato: 'Rates adopted by the authority for {{anno}}.',
    enteEreditato:
      'The authority did not adopt new rates this year, so by law the {{anno}} ones stay in force. It does not mean there is nothing to pay: the previous rates carry on, and that is what happens to most municipalities.',
    fontiAliquote: 'Where the rates come from',
    fontiFallback: 'The rule that provides for it',
  },

  passo: {
    nonDovuto: 'Not due',
    presuppostoSoddisfatto: 'Condition met',
    presuppostoAssente: 'Condition not met',
    calcolataSu: 'calculated on',
    aliquoteAScaglioni: 'rates by bracket',
    valoreApplicato: 'The figure applied',
    daDoveVieneIlNumero: 'Where the figure comes from',
    regolaApplicata: 'The rule applied',
    regolaNormativa: 'The rule, in statutory language',
  },

  fonte: {
    verificata: '· checked on {{data}}',
    importataConEstrazione: '· imported, extracted on {{estratta}}, consulted on {{data}}',
    importata: '· imported, consulted on {{data}}',
    riserva: 'A caveat on this source:',
    riferimento: 'Reference',
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
      'Check the figure: we read it as {{importo}}, which is off the scale for an annual salary. Write it in euros, not in cents — above {{soglia}} we do not run the calculation.',
    comuneMancante: 'Choose the municipality where you were tax-resident on 1 January.',
    comuneSconosciuto:
      'Choose a municipality from the list. For now the calculator covers the ones we have checked one by one: the full list of Italian municipalities will come later.',
    contrattoNonValido: 'Choose one of the three types of contract.',
    mensilitaNonValida: 'Choose 12, 13 or 14 instalments.',
    rete:
      'We could not finish the calculation. Try again shortly: if it keeps happening, it is not down to what you entered.',
  },

  nonCopre: {
    torna: '← Back to the calculator',
    titolo: 'What this calculator does not cover',
    paragrafo1:
      'This tool starts from your gross annual salary and works out your net pay. Some of the things that change a payslip cannot be derived from that number: they depend on your family, on the collective agreement applied to you, or on choices you have made.',
    paragrafo2: 'They are listed below, each with the effect it would have on the result if we included it.',
    quandoRalSupera: 'Applies only to a RAL above {{soglia}}.',
    quandoContrattoDiverso: 'Applies to anyone whose declared contract is not {{contratto}}.',
    percheTitolo: 'Why we have not hidden them',
    percheTesto:
      'A calculator that keeps quiet about its limits hands you a number that looks final. This one tells you where it stops: so you can see whether your situation fits the calculation, and how far your own case is likely to sit from it.',
  },

  norme: {
    titolo: 'The law behind Italian net pay',
    paragrafo1:
      'What actually reaches your payslip is not decided by a single rule. It is decided by dozens of them, layered over the years, cross-referring to one another, and almost never read side by side. These are the ones we opened and read, in the order a salary meets them: contributions first, then the tax, then the region and the municipality.',
    paragrafo2a: 'For each one you will find what it provides, what it determines in your net pay — or why it stays outside our calculation — and the',
    paragrafo2b: 'ambiguities it carries with it',
    paragrafo2c:
      ': cross-references that lead nowhere, ceilings that get derogated from, articles citing numbering that changed twenty years ago. It is the part nobody usually tells you about.',
    indice: 'Sections of the archive',
    cosaDetermina: 'What it determines in your net pay',
    inVigore: 'In force',
    ultimaModifica: 'Last amended',
    ambiguita: 'Ambiguities and things worth knowing',
    lettaIl: 'Read on {{data}}',
    vuotoTitolo: 'Where a field is empty, it is empty on purpose',
    vuotoTesto:
      'Some entries have no date in force, and for some the link to the institutional portal is missing. That is not an oversight: it means the check was not carried out, or the document was read on a portal that exposes no stable address. On a page about the law, a figure reconstructed from memory is worth less than a field left blank, because the first one looks reliable and is not.',
  },
}

export const RISORSE: Readonly<Record<CodiceLingua, Risorse>> = { it, en }

export type ChiaveRisorse = {
  [S in keyof Risorse]: `${S & string}.${keyof Risorse[S] & string}`
}[keyof Risorse]
