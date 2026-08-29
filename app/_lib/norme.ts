/**
 * L'archivio delle norme che determinano la retribuzione netta in Italia.
 *
 * ⚠️ **Nessun collegamento al motore, ed è una proprietà voluta.** Questa non è
 * la lista delle citazioni del calcolo — quelle stanno accanto alle voci del
 * risultato, dove servono. Qui c'è un archivio consultabile, leggibile anche da
 * chi non ha calcolato niente, e che comprende **atti letti e rimasti fuori**
 * dal perimetro: cose che il motore non tocca e che quindi non potrebbe mai
 * citare.
 *
 * ⚠️ **Ogni riga viene dalla pagina *Fonti*, e da nient'altro.** Nessuna data
 * di vigenza, nessun comma, nessun numero che *Fonti* non riporti. Dove *Fonti*
 * tace, il campo resta **vuoto**: su una pagina intitolata alle norme una data
 * di vigenza inventata è l'errore che costa più di tutti, e il metodo del
 * progetto dice che le fonti primarie le reperisce l'autore.
 *
 * Se una voce di *Fonti* cambia, cambia questo file — non il contrario.
 */

export interface Scheda {
  /** L'atto per esteso, come va citato. */
  readonly atto: string
  /** Articolo o comma. Vuoto se l'atto rileva per intero. */
  readonly riferimento?: string
  /** Cosa dispone, in una frase, in italiano piano. */
  readonly dispone: string
  /** Vigenza, solo se *Fonti* la riporta. */
  readonly vigenza?: string
  /** Ultima modifica, solo se *Fonti* la riporta. */
  readonly ultimaModifica?: string
  /** Cosa determina nel calcolo del netto, oppure perché resta fuori. */
  readonly effetto: string
  /** Portale istituzionale su cui l'atto è stato letto, se *Fonti* lo nomina. */
  readonly portale?: string
  /** Identificativo dell'atto sul portale, se *Fonti* lo riporta. */
  readonly identificativo?: string
  /** Link diretto, solo dove *Fonti* riporta un URL completo. */
  readonly url?: string
  readonly consultata: string
  /** Ambiguità, rinvii morti, divergenze — documentate in *Fonti*. */
  readonly note?: readonly string[]
}

export interface SezioneNorme {
  readonly id: string
  readonly titolo: string
  readonly occhiello: string
  readonly schede: readonly Scheda[]
}

const DEF_FINANZE = 'https://def.finanze.it'

/**
 * L'ordine è quello della catena di calcolo, non alfabetico: chi legge ritrova
 * la sequenza in cui una retribuzione lorda diventa netta.
 */
export const SEZIONI: readonly SezioneNorme[] = [
  // -------------------------------------------------------------------------
  {
    id: 'contributi',
    titolo: 'Contributi previdenziali',
    occhiello:
      'Il primo prelievo, e l’unico che non è una tassa. Determina quanto esce dalla retribuzione per la pensione, e su quale base si calcola.',
    schede: [
      {
        atto: 'L. 30/04/1969 n. 153',
        riferimento: 'art. 12',
        dispone:
          'Stabilisce su quale retribuzione si calcolano i contributi: le somme si assumono al lordo di qualsiasi contributo e trattenuta, meno un elenco tassativo di esclusioni.',
        effetto:
          'È la norma per cui i contributi si calcolano sulla retribuzione lorda, non su una grandezza ridotta. Nel caso standard la base coincide con la RAL, perché tutte le voci escluse dall’elenco tassativo — TFR, previdenza complementare, casse sanitarie, premi da contrattazione di secondo livello — sono già fuori dal calcolo.',
        portale: 'Normattiva',
        consultata: '28/08/2026',
        note: [
          'Non abbiamo la data di vigenza: il testo che abbiamo letto non la riporta, e non indica nemmeno l’atto che ha introdotto il testo sostitutivo. Il contenuto rinvia al D.Lgs. 124/1993 e al DL 67/1997, quindi è posteriore al 1997 — ma «posteriore al 1997» non è «vigente nel 2026». La verifica resta da fare.',
          'Due rinvii alla numerazione del TUIR anteriore al 2004: il c. 1 rinvia all’art. 46 e i c. 2 e 3 all’art. 48, che oggi sono gli artt. 49 e 51.',
          'Il criterio temporale è diverso da quello fiscale: qui i redditi sono quelli «maturati» nel periodo, mentre l’art. 51 TUIR conta le somme «percepite». Contributivo per maturazione, fiscale per cassa allargata, nella stessa busta paga.',
          'Ambiguità dichiarata: come si combinano il c. 2, che rinvia all’art. 48 TUIR con le sue esclusioni, e il c. 5, che dichiara tassativo l’elenco del c. 4. Abbiamo adottato la lettura per cui valgono entrambi, perché il c. 3 deroga espressamente alla lett. h) dell’art. 48 — e si deroga solo a ciò che altrimenti varrebbe.',
          'Il portale def.finanze non basta per il previdenziale: del testo porta il solo art. 66, perché è un portale tributario.',
        ],
      },
      {
        atto: 'INPS, circolare n. 40 del 22/02/2011',
        riferimento: 'par. 1.1.1',
        dispone:
          'Riporta l’aliquota per invalidità, vecchiaia e superstiti: 33% in totale, di cui 9,19% a carico del lavoratore.',
        effetto:
          'È la fonte dell’aliquota che si vede in busta paga. La circolare è rivolta ai datori di lavoro in genere, non a una categoria specifica, ed è per questo che sostituisce come citazione principale la circolare sui magistrati onorari.',
        consultata: '28/08/2026',
        note: [
          'Esistono due aliquote a carico del lavoratore, e la differenza è il contributo ex GESCAL: 9,19% dove si applica, 8,84% nei settori che ne sono esclusi. Per l’impiegato del settore privato vale il 9,19%.',
          'La scomposizione riportata dalla circolare: 32% dal decreto interministeriale del 21/02/1996 in attuazione dell’art. 3 c. 23 della L. 335/1995, più 0,70 punti ex GESCAL, più 0,30 punti dall’art. 1 c. 769 della L. 296/2006.',
          'Cautela sulle date: il +0,30 alla quota del lavoratore è del 2007, non del 2002. E la data del 1° gennaio 2002 compare in un paragrafo sugli equipaggi delle navi da pesca e le aziende agricole — estenderla alla generalità dei dipendenti è un’inferenza, non una lettura.',
          'Di questo documento non abbiamo un indirizzo stabile da citare.',
        ],
      },
      {
        atto: 'DL 19/09/1992 n. 384, conv. con mod. dalla L. 14/11/1992 n. 438',
        riferimento: 'art. 3-ter',
        dispone:
          'Aggiunge un punto percentuale di contributo sulla parte di retribuzione che supera la prima fascia di retribuzione pensionabile, per i regimi che prevedono aliquote a carico del lavoratore inferiori al 10 per cento.',
        vigenza: 'dal 19/11/1992, con decorrenza degli effetti dal 1° gennaio 1993',
        ultimaModifica:
          'L. 14/11/1992 n. 438, in sede di conversione. Mai modificato dopo.',
        effetto:
          'È l’unica soglia sul versante contributivo: sotto la prima fascia i contributi sono una moltiplicazione, sopra il ramo acquista la stessa forma di quello fiscale.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {2E278145-81A8-4B7C-9ED2-7A9CAF61DA6C}, Articolo 3 ter',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Il testo non attribuisce il contributo al lavoratore dipendente. L’attribuzione espressa esiste solo per i lavoratori autonomi; per i dipendenti la fonte del soggetto passivo è la circolare INPS. La citazione è doppia per necessità, non per eleganza.',
          'Il rinvio per la soglia non arriva a destinazione: rimanda all’art. 21 c. 6 della L. 67/1988, che a sua volta rinvia a una tabella allegata che non è nell’export dell’atto.',
          'La condizione del 10 per cento è riferita al regime pensionistico, non al singolo lavoratore: la verifica va fatta sull’aliquota ordinaria del regime, non su quella ridotta dell’apprendista.',
          'L’articolo non ha commi: è un unico periodo non numerato, quindi la citazione corretta non indica un comma.',
          'Domanda che resta aperta: se l’1% aggiuntivo generi montante pensionistico. Il testo non lo dice, e la risposta starebbe nella disciplina del calcolo della pensione, non nella norma istitutiva.',
        ],
      },
      {
        atto: 'L. 11/03/1988 n. 67',
        riferimento: 'art. 21 c. 6',
        dispone:
          'Dispone che la retribuzione oltre il limite massimo pensionabile sia computata secondo le aliquote di una tabella allegata, e che la pensione così ottenuta diventi parte integrante di quella ordinaria.',
        effetto:
          'È la norma a cui rinvia il contributo aggiuntivo dell’1%, ma non porta al parametro: non fissa la soglia, non dice chi la fissa, e non contiene mai l’espressione «prima fascia». Il valore in euro sta quindi in una circolare annuale.',
        consultata: '27/08/2026',
        note: [
          'La tabella allegata a cui il comma rinvia non è presente nell’export dell’atto: la catena dei rinvii si interrompe lì.',
          'Verifica svolta sull’intero atto: «prima fascia» compare zero volte, «retribuzione pensionabile» zero volte.',
          'Dà però un elemento in senso opposto: la retribuzione oltre la prima fascia è comunque pensionabile, il che sposta l’onere argomentativo sul dubbio circa l’1%.',
        ],
      },
      {
        atto: 'INPS, circolare n. 6 del 30/01/2026',
        riferimento: 'par. 5 e 6',
        dispone:
          'Fissa per il 2026 la prima fascia di retribuzione pensionabile a 56.224,00 euro e il massimale della base contributiva a 122.295,00 euro, e conferma che il contributo aggiuntivo dell’1% è a carico del lavoratore.',
        effetto:
          'Dà il valore della soglia oltre la quale scatta il contributo aggiuntivo — il numero che la legge non contiene.',
        consultata: '27/08/2026',
        note: [
          'Il massimale opera anche ai fini dell’1%: sopra 122.295 il contributo aggiuntivo si ferma. Il calcolatore non modella il massimale, perché dipende dalla data di prima iscrizione previdenziale, e assume quindi un lavoratore iscritto prima del 1996.',
          'Il contributo aggiuntivo segue il criterio della mensilizzazione, mese per mese sulla quota eccedente 4.685 euro. Il calcolatore adotta l’equivalente annuo, che è il risultato a cui il conguaglio di fine anno dovrebbe ricondurre.',
          'Il massimale è quello dell’art. 2 c. 18, secondo periodo, della L. 08/08/1995 n. 335, rivalutato sull’indice ISTAT dei prezzi al consumo per famiglie di operai e impiegati. Valore 2026: 122.295,40, arrotondato a 122.295,00.',
          'Di questo documento non abbiamo un indirizzo stabile da citare.',
        ],
      },
      {
        atto: 'L. 28/02/1986 n. 41',
        riferimento: 'art. 21',
        dispone:
          'Estende agli apprendisti la disciplina contributiva della generalità dei lavoratori dipendenti, con una riduzione di tre punti dell’aliquota.',
        vigenza: 'dal 28/02/1986',
        effetto:
          'È la ragione per cui l’apprendistato cambia davvero il netto, mentre tempo determinato e indeterminato no. Non fissa un’aliquota propria: sottrae tre punti a quella ordinaria, quindi è un rinvio che si muove da sé se l’aliquota ordinaria cambia.',
        consultata: '28/08/2026',
        note: [
          'La lettera b) dell’articolo è esaurita: riduceva il contributo per il Servizio sanitario nazionale, e quei contributi sono stati aboliti dall’art. 36 c. 1 lett. a) del D.Lgs. 446/1997.',
          'Che i tre punti si applichino alla base 8,84% e non alla 9,19% è una derivazione aritmetica, non un’affermazione delle fonti: nessuna delle due lo scrive. Il valore finale del 5,84% è invece dichiarato testualmente.',
          'Di questo atto non abbiamo un indirizzo stabile da citare.',
        ],
      },
      {
        atto: 'INPS, messaggio n. 3618 del 17/10/2023 e circolare n. 70 del 15/06/2022',
        dispone:
          'Dichiarano che l’aliquota a carico dell’apprendista è pari al 5,84% della retribuzione imponibile, per tutta la durata del periodo di formazione e per un anno dalla prosecuzione del rapporto.',
        effetto:
          'Dà il valore dell’aliquota dell’apprendista. La circolare 70/2022 aggiunge che quell’aliquota «rimane» tale anche dove il datore è integralmente esonerato: nessuna agevolazione a carico dell’azienda tocca il lavoratore.',
        consultata: '28/08/2026',
        note: [
          'I codici Uniemens lo mostrano dall’altro lato: l’aliquota a carico del datore varia con l’anzianità di apprendistato, quella del lavoratore no. Basta quindi sapere che il contratto è di apprendistato, senza chiedere l’anno né la dimensione aziendale.',
          'Il messaggio cita l’art. 47 c. 7 del D.Lgs. 81/2015, che estende il 5,84% per un anno dalla prosecuzione del rapporto. Quell’articolo però non l’abbiamo letto alla fonte: il testo consultato era l’art. 47-septies, che è tutt’altra disposizione.',
          'Ne discende un limite dichiarato del calcolatore: chi ha concluso un apprendistato da meno di un anno risulta a tempo indeterminato e riceve l’aliquota piena, quindi il suo netto reale è più alto di quello calcolato.',
          'Di questi documenti non abbiamo un indirizzo stabile da citare.',
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'imponibile',
    titolo: 'Dal lordo all’imponibile',
    occhiello:
      'Il passaggio che decide su quale cifra si calcolano le imposte. È corto — poche norme — ma se si sbaglia qui sbaglia tutto quello che viene dopo.',
    schede: [
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 51 c. 2 lett. a)',
        dispone:
          'Stabilisce che i contributi previdenziali e assistenziali obbligatori non concorrono a formare il reddito.',
        vigenza: 'dal 23/05/2026',
        ultimaModifica: 'DL 27/03/2026 n. 38, art. 2-bis',
        effetto:
          'È la ragione per cui il reddito su cui si pagano le imposte nasce già al netto dei contributi. I contributi non sono una deduzione ma un’esclusione, e da qui discende che pesano più del loro valore nominale: abbassano anche l’imposta.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Il c. 1 dello stesso articolo determina il reddito per cassa allargata: contano le somme percepite nell’anno, più quelle corrisposte entro il 12 gennaio successivo. È la ragione per cui il progetto non usa la parola «competenza», che appartiene ai redditi d’impresa.',
          'La lett. h) esclude dal reddito le somme trattenute per oneri deducibili: per un dipendente gli oneri sono neutralizzati alla fonte, e non è una coincidenza numerica se le due basi coincidono.',
          'La modifica del DL 38/2026 riguarda il c. 8-bis, sulle retribuzioni convenzionali per lavoro all’estero: nessuno dei commi che contano per questo calcolo è toccato.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 3',
        dispone:
          'Definisce la base imponibile dell’imposta: il reddito complessivo al netto degli oneri deducibili.',
        vigenza: 'dal 23/05/2026',
        ultimaModifica: 'DL 27/03/2026 n. 38, art. 2-bis',
        effetto:
          'È la formula da cui parte il conto delle imposte. Nel caso standard gli oneri deducibili valgono zero, quindi la base coincide con il reddito complessivo.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'La modifica del 2026 va nel c. 3, che è l’elenco delle esclusioni oggettive, e riguarda i lavoratori marittimi. Il c. 1, cioè la formula, non è toccato.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 49',
        dispone:
          'Definisce quali redditi sono di lavoro dipendente, per la loro provenienza e non per il loro importo.',
        effetto:
          'Individua chi ha diritto alle misure sul cuneo, che spettano ai titolari di reddito di lavoro dipendente ed escludono i redditi di pensione.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: ['Il testo è fermo dal 2004, ma la data di vigenza non l’abbiamo registrata.'],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 8',
        dispone: 'Definisce il reddito complessivo come somma dei redditi di ogni categoria.',
        effetto:
          'Nel caso standard il reddito complessivo coincide con il solo reddito di lavoro dipendente. È la grandezza su cui si misurano le fasce delle detrazioni e le soglie del cuneo.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 10 c. 3-bis',
        dispone:
          'Prevede la deduzione del reddito dell’abitazione principale fino alla rendita catastale.',
        effetto:
          'Non entra nel calcolo direttamente, ma spiega perché le grandezze di reddito coincidono anche per chi possiede la casa in cui vive: è il meccanismo a cui rinviano sei istituti diversi con la stessa formula.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'irpef',
    titolo: 'IRPEF e detrazioni',
    occhiello:
      'L’imposta sul reddito e gli sconti che la riducono. È il ramo più lungo, ed è quello in cui si concentrano quasi tutte le soglie del sistema.',
    schede: [
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 11',
        dispone:
          'Fissa gli scaglioni e le aliquote dell’imposta — 23% fino a 28.000, 33% fino a 50.000, 43% oltre — e stabilisce che le detrazioni si operano sull’imposta lorda fino alla concorrenza del suo ammontare.',
        vigenza: 'dal 01/01/2026',
        ultimaModifica: 'L. 30/12/2025 n. 199, art. 1 c. 3',
        effetto:
          'Determina quanta imposta si deve prima degli sconti, e fissa il limite per cui le detrazioni non possono portare l’imposta sotto zero: se valgono più dell’imposta, l’eccedenza si perde.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'La modifica del 2026 ha sostituito l’aliquota centrale del 35% con il 33%: i confini degli scaglioni non sono cambiati.',
          'Il pavimento a zero del c. 3 non è un principio dedotto ma una citazione, e l’elenco si chiude con «nonché in altre disposizioni di legge» — formula che copre anche le detrazioni nate fuori dal testo unico.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 13',
        dispone:
          'Riconosce a chi ha reddito di lavoro dipendente una detrazione che decresce al crescere del reddito, con un importo fisso in più nella fascia intermedia.',
        vigenza: 'dal 01/01/2025',
        ultimaModifica: 'L. 30/12/2024 n. 207, art. 1 c. 2',
        effetto:
          'È lo sconto principale sull’imposta. Si calcola sul reddito complessivo, non sull’imponibile, e nella fascia in cui decresce ogni euro in più di reddito viene tassato e riduce anche la detrazione.',
        portale: 'def.finanze.it — Documentazione Economica e Finanziaria (MEF)',
        url: 'https://def.finanze.it/DocTribFrontend/getAttoNormativoDetail.do?ACTION=getArticolo&id=%7B31D694E8-4398-4030-873B-FEAF5A6647F9%7D&codiceOrdinamento=0000000000000130000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&articolo=Articolo%2013',
        consultata: '27/08/2026',
        note: [
          'Attraversando i 15.000 euro di reddito complessivo la detrazione sale di circa 1.145 euro: è una discontinuità nella direzione contraria a quella che ci si aspetta.',
          'Il c. 6 impone di assumere il risultato dei rapporti nelle prime quattro cifre decimali. Non è un arrotondamento di busta paga: è parte della formula.',
          'Il troncamento non è una peculiarità di questa detrazione: la stessa formula compare identica all’art. 12 c. 4, ed è una convenzione del testo unico per le detrazioni a formula.',
          'Ambiguità dichiarata: il testo non dice se l’importo fisso della fascia intermedia si ragguagli al periodo di lavoro prima o dopo essere stato sommato. Sotto l’assunzione di anno intero non cambia nulla.',
          'Che nessun atto del 2025 o del 2026 abbia toccato questo articolo è verificato da due lati: dalle note in calce e dal testo della legge che avrebbe potuto toccarlo.',
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 6',
        dispone:
          'Riconosce un’ulteriore detrazione dall’imposta lorda a chi ha un reddito complessivo fra 20.000 e 40.000 euro: 1.000 euro fino a 32.000, poi decrescente fino ad azzerarsi.',
        vigenza: 'dal 01/01/2025',
        effetto:
          'È la seconda gamba del taglio del cuneo fiscale. Sotto i 20.000 euro il beneficio esiste ma ha un’altra forma — è una somma erogata, non uno sconto sull’imposta.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}, Articolo 1 com 6',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'È una detrazione vera e non porta alcuna deroga, quindi ricade nella regola generale dell’art. 11 c. 3: si consuma sull’imposta lorda e non genera credito.',
          'Nella fascia fra 32.000 e 40.000 euro agiscono insieme tre riduzioni — l’aliquota del 33%, la decrescenza della detrazione dell’art. 13 e quella di questa — per un prelievo effettivo su ogni euro in più attorno al 54%, prima delle addizionali.',
          'Il raccordo con la somma sotto i 20.000 è calibrato e leggermente favorevole: superando la soglia non si perde nulla, si guadagnano circa 40 euro.',
          'Controllando la vigenza comma per comma risulta che i commi 2–10 della legge non sono mai stati modificati da alcun atto successivo.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 12',
        dispone:
          'Disciplina le detrazioni per coniuge e figli a carico, a condizione che il familiare abbia un reddito proprio sotto una soglia.',
        vigenza: 'dal 20/12/2025',
        ultimaModifica: 'D.Lgs. 18/12/2025 n. 192, art. 1',
        effetto:
          'Resta fuori dal calcolo, e l’articolo serve a difendere l’esclusione invece che a implementarla: la detrazione dipende dal reddito di un’altra persona, che dalla busta paga non si vede.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Per i figli sotto i 21 anni la detrazione non esiste più, e il comma che prevedeva l’ulteriore detrazione per famiglie numerose è stato abrogato dal D.Lgs. 29/12/2021 n. 230 — il decreto che ha istituito l’Assegno Unico. L’abrogazione porta la firma dell’atto che l’ha sostituita.',
          'Il c. 4 contiene un terzo limite, distinto dagli altri due del sistema: se i rapporti sono pari a zero, minori di zero o uguali a uno, le detrazioni non spettano.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 16-ter',
        dispone:
          'Pone un tetto complessivo agli oneri e alle spese detraibili per chi ha un reddito complessivo sopra i 75.000 euro, e ne riduce l’ammontare sopra i 200.000.',
        vigenza: 'dal 01/01/2026',
        ultimaModifica: 'L. 30/12/2025 n. 199, art. 1 c. 4',
        effetto:
          'Non tocca questo calcolo, e la ragione è testuale: il tetto riguarda «oneri e spese», mentre la detrazione per lavoro dipendente e quella da cuneo sono legate al tipo di reddito e non a un esborso.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Sono tre i meccanismi sovrapposti che limitano le detrazioni ai redditi alti — art. 15 c. 3-bis, art. 16-ter c. 1–5 e art. 16-ter c. 5-bis — e nessuno dei tre tocca le detrazioni legate alla tipologia di reddito.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 15',
        dispone: 'Disciplina le detrazioni per oneri e spese sostenute dal contribuente.',
        effetto:
          'Resta fuori: nel caso standard gli oneri detraibili valgono zero. Ne teniamo i commi 3-bis e 3-ter, che servono a delimitare l’art. 16-ter.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 165',
        dispone: 'Riconosce un credito per le imposte pagate all’estero sui redditi ivi prodotti.',
        vigenza: 'dal 07/10/2015',
        effetto:
          'Nel caso standard vale zero, ma è il riferimento esatto della condizione che accende l’addizionale comunale, che guarda l’imposta al netto delle detrazioni e di questo credito.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'addizionali',
    titolo: 'Addizionale regionale e comunale',
    occhiello:
      'Le stesse imposte, incassate da Regione e Comune. Hanno la base dell’IRPEF ma una disciplina propria — e due norme istitutive che, lette una accanto all’altra, non si somigliano quanto ci si aspetterebbe.',
    schede: [
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 50',
        dispone:
          'Istituisce l’addizionale regionale, la fissa allo 0,9% e consente a ciascuna regione di maggiorarla fino all’1,4%, e stabilisce che è dovuta soltanto se per lo stesso anno l’IRPEF risulta dovuta.',
        vigenza: 'dal 13/12/2014',
        ultimaModifica: 'D.Lgs. 21/11/2014 n. 175, art. 8',
        effetto:
          'Determina quando l’addizionale regionale si paga e su quale base. La condizione è binaria: se l’imposta è dovuta si applica sull’intera base, se non lo è non si applica affatto.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
        note: [
          'Due rinvii alla numerazione del TUIR anteriore al 2004. Il c. 2 rinvia ai crediti «di cui agli articoli 14 e 15», che oggi non hanno più quel contenuto; il c. 4 rinvia ai redditi di lavoro dipendente «di cui agli articoli 46 e 47», che oggi sono il 49 e il 50. La norma gemella sull’addizionale comunale è stata riallineata, questa no — e sono state modificate dallo stesso atto nello stesso giorno.',
          'Il tetto dell’1,4% è derogato in modo massiccio: sul prospetto ministeriale 47 aliquote lo superano, con un massimo del 3,63% in Molise, e 15 enti su 21 hanno almeno un’aliquota sopra il tetto. Solo due citano il disavanzo sanitario. La norma che autorizza la deroga non è stata reperita, e un controllo che tagliasse le aliquote a 1,4 corromperebbe quasi tutto il centro-sud.',
          'L’aliquota di un anno non è congelata: il c. 3 consente a una regione di applicare retroattivamente una maggiorazione più favorevole al periodo d’imposta in corso. Il dato di un anno non è definitivo mentre quell’anno è in corso, e può cambiare solo in meglio.',
          'Contraddizione interna: il c. 2 individua l’aliquota con la residenza, il c. 5 destina il gettito al domicilio fiscale al 1° gennaio. Due criteri diversi nella stessa norma.',
          'Sul testo dell’art. 50 non risultano né soglie di esenzione né detrazioni regionali. Va però detto che l’argomento dal silenzio ha già fallito una volta sullo stesso articolo, che non conosce nemmeno gli scaglioni: non è una prova di inesistenza, è una prova di assenza in quel testo. E i dati ministeriali mostrano detrazioni regionali che esistono.',
        ],
      },
      {
        atto: 'D.Lgs. 28/09/1998 n. 360',
        riferimento: 'art. 1',
        dispone:
          'Istituisce l’addizionale comunale, la calcola sul reddito complessivo al netto degli oneri deducibili, la subordina al fatto che l’IRPEF risulti dovuta, e consente al Comune una soglia di esenzione per requisiti reddituali.',
        vigenza: 'art. 1 dal 13/12/2014; artt. 2 e 3 dal 18/05/1999',
        ultimaModifica: 'D.Lgs. 21/11/2014 n. 175, art. 8',
        effetto:
          'Determina quando si paga l’addizionale comunale e su quale base, e autorizza la soglia sotto la quale un Comune può non farla pagare affatto. Il Comune è quello del domicilio fiscale al 1° gennaio: chi trasloca a marzo paga per tutto l’anno al Comune di partenza.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
        note: [
          'La soglia di esenzione è un limite secco e non una franchigia: superata di un euro, l’addizionale si paga sull’intero reddito e non sull’eccedenza. La lettura è confermata dal modello dati ministeriale, che la espone come «esenzione per redditi imponibili fino a euro X».',
          'Il c. 8 prevede che per quanto non disciplinato si applichino le regole dell’IRPEF. Non ne discende che le detrazioni abbattano l’addizionale: il rinvio copre ciò che non è disciplinato, e base e presupposto sono disciplinati espressamente.',
          'Ambiguità di lungo corso: il testo descrive l’aliquota comunale come variazione su una compartecipazione statale che avrebbe dovuto essere fissata con decreto. La nostra conclusione è che quella compartecipazione non sia mai stata attivata, perché il decreto avrebbe dovuto ridurre contestualmente le aliquote IRPEF e nell’art. 11 quella riduzione non c’è.',
          'La quota provinciale non è una seconda aliquota da sommare: vive dentro la compartecipazione statale, e Comune e Provincia se la dividono a valle.',
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 727 e 728',
        dispone:
          'Consente a regioni e province autonome di applicare aliquote differenziate sugli scaglioni IRPEF in vigore prima del 2025, e stabilisce che l’ente che non delibera applica scaglioni e aliquote già vigenti nell’anno precedente.',
        vigenza: 'dal 01/01/2026',
        ultimaModifica: 'L. 30/12/2025 n. 199, art. 1 c. 649',
        effetto:
          'Determina quali strutture di aliquota un ente può usare, e cosa si applica quando non delibera. Il fallback non è aliquota zero: è la prosecuzione dell’anno precedente.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Il comma attribuisce la potestà a «le regioni e le province autonome di Trento e di Bolzano». Ne discende che per un comune del Trentino-Alto Adige l’ente che fissa l’addizionale «regionale» non è la regione: sono le due province, separatamente. Il prospetto ministeriale le porta come righe distinte, e il Trentino-Alto Adige come ente impositore non esiste.',
          'Gli scaglioni delle addizionali non sono quelli dell’IRPEF: l’ente sceglie fra due set autorizzati. Riusare le costanti dell’IRPEF produce numeri plausibili e sbagliati.',
          'Sulle 21 righe del prospetto regionale le uniche soglie usate sono 15.000, 28.000 e 50.000: nessun ente si è inventato soglie proprie.',
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 751 e 752',
        dispone:
          'Fa per i Comuni quello che i commi 727 e 728 fanno per le regioni: autorizza gli scaglioni previgenti e stabilisce che chi non delibera applica l’anno precedente.',
        vigenza: 'dal 01/01/2026',
        ultimaModifica: 'L. 30/12/2025 n. 199, art. 1 c. 650',
        effetto:
          'È la norma che regge il caso base del calcolatore: Milano non ha deliberato per il 2026, quindi si applicano aliquota ed esenzione del 2025. Alla data di estrazione dei dati riguardava il 61% dei Comuni italiani.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Il c. 650 non ha solo esteso gli anni: ha anche portato al 15 aprile 2026 il termine entro cui i Comuni potevano deliberare per il 2026. Le regioni non hanno avuto la stessa proroga, quindi i due dataset hanno finestre di stabilità diverse e nessuna coincide con il 1° gennaio.',
          'Resta aperto il caso dell’ente che non ha mai deliberato e non ha un anno precedente da cui ereditare.',
        ],
      },
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 52',
        dispone:
          'Riconosce a Province e Comuni la potestà di disciplinare le proprie entrate con regolamento, escluse la fattispecie imponibile, i soggetti passivi e l’aliquota massima.',
        effetto:
          'Non entra nel calcolo, ma è l’argomento per cui la soglia di esenzione comunale è un’esenzione soggettiva e non una franchigia: il Comune non può ridefinire la base imponibile.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
        note: [
          'Il c. 2 è stato abrogato dal DL 34/2019 art. 15-bis: la vecchia regola sull’efficacia temporale dei regolamenti non sta più qui.',
        ],
      },
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'artt. 36 e 38',
        dispone:
          'Aboliscono i contributi per il Servizio sanitario nazionale a carico dei lavoratori e destinano alle regioni il gettito dell’addizionale regionale.',
        effetto:
          'Non cambia un numero, ma spiega da dove viene l’addizionale regionale: nasce nella stessa riforma che abolisce un contributo sanitario che il lavoratore pagava comunque, ed è destinata a finanziare la sanità regionale. È una sostituzione funzionale, non aritmetica.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
      },
      {
        atto: 'MEF, Dipartimento delle Finanze — Fiscalità regionale e locale',
        riferimento:
          'elenco addizionale comunale 2026 (7.897 comuni), elenco annuale 2025 aggiornato al 13/03/2026 (7.896 comuni), prospetto addizionale regionale 2026 (21 enti)',
        dispone:
          'Pubblicano le aliquote, gli scaglioni e le soglie di esenzione deliberate da ciascun ente.',
        effetto:
          'Danno i valori che le norme non contengono. Sono la fonte delle aliquote di Regione e Comune usate dal calcolatore.',
        portale: 'MEF, Dipartimento delle Finanze',
        consultata: '28/08/2026',
        note: [
          'Gli elenchi sono aggiornati quotidianamente e non portano un timbro di versione: la data di estrazione è l’unico riferimento, e per questo è dichiarata accanto al dato.',
          'La dicitura «0*» non significa aliquota zero: alla data di estrazione indica un Comune che non ha ancora deliberato per l’anno in corso. Milano, Roma, Trento e Bolzano risultano «0*» nell’elenco 2026.',
          'L’elenco annuale distingue due modi diversi di non pagare nulla: Bolzano ha un’aliquota deliberata pari a zero, Trento risulta «0*» anche a consolidamento avvenuto, cioè non ha mai istituito il tributo.',
          'Il tetto comunale di 0,8 punti non è assoluto: sei aliquote lo superano, con un massimo dell’1,2%. Il file etichetta esplicitamente gli enti in dissesto e predissesto finanziario.',
          'Riserva sul caso base: per la Lombardia il prospetto cita l’art. 72 c. 1 della legge regionale 14/07/2003 n. 10, che è la legge abilitante. Una legge del 2003 non può avere fissato una struttura a quattro fasce divenuta lecita nel 2025, quindi il provvedimento che fissa le aliquote 2026 non è identificato dal prospetto.',
          'Di questi elenchi non abbiamo un indirizzo stabile da citare.',
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'aggiungono',
    titolo: 'Voci che non concorrono al reddito',
    occhiello:
      'Somme che la legge non considera reddito: non vengono tassate e si sommano a quello che resta. Sono l’unico ramo del sistema che va nella direzione del lavoratore.',
    schede: [
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 4 e 5',
        dispone:
          'Riconosce a chi ha un reddito complessivo fino a 20.000 euro una somma che non concorre a formare il reddito, pari a una percentuale del reddito di lavoro dipendente che decresce per fasce.',
        vigenza: 'dal 01/01/2025',
        effetto:
          'È denaro che si aggiunge al netto senza passare per le imposte: non riduce l’imponibile, non ha effetti a cascata sulle detrazioni, e spetta anche a chi non ha imposta da pagare.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}, Articolo 1 com 4 e com 5',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'Le fasce non sono scaglioni: la percentuale si applica all’intero reddito, non alla parte eccedente. Ogni confine è quindi un salto secco verso il basso — circa 153 euro a 8.500 euro di reddito, circa 75 a 15.000.',
          'Il c. 8 mostra la meccanica: il datore anticipa denaro proprio e lo recupera dallo Stato in compensazione. Una detrazione non funziona così, e questa è la prova che non è una riduzione d’imposta.',
          'Il c. 5 ragguaglia il reddito all’intero anno ai soli fini della scelta della percentuale, non per la base: è una regola di ragguaglio diversa da quella dell’art. 13 e da quella del c. 6.',
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 9',
        dispone:
          'Definisce le grandezze di reddito usate dalle misure sul cuneo, includendo la quota esente dei redditi agevolati e assumendo il reddito complessivo al netto dell’abitazione principale.',
        vigenza: 'dal 01/01/2025',
        effetto:
          'Chiude quale reddito si guarda per la soglia e quale per l’importo. Una sola definizione di reddito complessivo attraversa tutto il calcolo.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
      {
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 1',
        dispone:
          'Riconosce un trattamento integrativo di 1.200 euro a chi ha un reddito complessivo fino a 15.000 euro, a condizione che l’imposta lorda superi la detrazione per lavoro dipendente diminuita di 75 euro.',
        vigenza: 'dal 01/01/2025',
        ultimaModifica: 'L. 30/12/2024 n. 207, art. 1 c. 3',
        effetto:
          'È il terzo istituto che si somma al netto, e coesiste con le due misure sul cuneo. La condizione lo riserva a chi ha imposta da pagare, non agli incapienti — e questo lo rende l’unica voce di questo ramo che dipende dall’esito del ramo fiscale.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {E6D98FB9-4121-4201-9966-37A2987520BA}',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
        note: [
          'I 75 euro non sono una tolleranza: la stessa legge che li ha inseriti ha alzato la detrazione da 1.880 a 1.955 euro, e 1.955 meno 75 fa esattamente l’importo precedente. Servono a lasciare ferma la soglia di accesso.',
          'Ne discende un effetto collaterale involontario: fra circa 8.174 e 8.500 euro di reddito complessivo il trattamento spetta mentre l’imposta netta è già zero. Quella banda non esisteva prima del 2025.',
          'La cumulabilità con la somma sul cuneo è un’assunzione dichiarata, non una lettura: Abbiamo cercato su tutta la legge di bilancio: una clausola che vieti il cumulo non c’è.',
          'Il secondo periodo estende il trattamento fino a 28.000 euro se la somma di un elenco chiuso di detrazioni supera l’imposta lorda. Nel caso standard non si attiva mai, e la detrazione da cuneo non può entrare in quell’elenco perché l’elenco è del 2020 e la detrazione del 2025.',
        ],
      },
      {
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 3',
        dispone:
          'Abroga il vecchio bonus che stava dentro il TUIR e definisce il reddito complessivo ai fini del trattamento integrativo.',
        effetto:
          'Non cambia un numero, ma spiega la stratificazione: il vecchio bonus non è stato eliminato, è stato spostato fuori dal testo unico.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'fuori',
    titolo: 'Atti letti e rimasti fuori dal calcolo',
    occhiello:
      'Norme aperte, lette e volutamente non applicate. Stanno qui perché sapere cosa è stato escluso, e perché, vale quanto sapere cosa è stato incluso — e perché alcune di queste cambierebbero il numero, se ci fossero gli elementi per applicarle.',
    schede: [
      {
        atto: 'L. 30/12/2025 n. 199',
        riferimento: 'art. 1 commi 7, 9, 10-11, 18-21',
        dispone:
          'Introducono quattro imposte sostitutive sul lavoro dipendente: 5% sugli aumenti da rinnovo del contratto nazionale, 1% sui premi di risultato, 15% sulle maggiorazioni per lavoro notturno e a turni, e un trattamento speciale per il turismo.',
        effetto:
          'È la semplificazione più pesante che il calcolatore dichiara. Non resta fuori perché dipende da una scelta individuale — questi regimi sono attivi salvo rinuncia scritta — ma perché non è calcolabile dalla retribuzione lorda da sola: servirebbe sapere quanta parte è aumento da rinnovo, quanta premio, quanta indennità di turno.',
        consultata: '27/08/2026',
        note: [
          'Il regime al 5% sostituisce anche le addizionali, non solo l’IRPEF, e si applica a chi ha reddito di lavoro dipendente 2025 non superiore a 33.000 euro — cioè esattamente la fascia dei dipendenti delle piccole e medie imprese.',
          'Chi ne beneficia ha un netto reale più alto di quello calcolato: su 1.000 euro di aumento da rinnovo, circa 205 euro che il calcolatore non mostra, fino a circa 305 per chi sta fra 28.000 e 33.000 euro.',
          'Per questi commi non abbiamo registrato una data di vigenza.',
        ],
      },
      {
        atto: 'DL 27/03/2026 n. 38, conv. con mod. dalla L. 22/05/2026 n. 88',
        riferimento: 'art. 2-bis',
        dispone:
          'Esclude dalla base imponibile i redditi dei lavoratori marittimi imbarcati per più di 183 giorni su navi battenti bandiera estera.',
        vigenza: 'dal 23/05/2026',
        effetto:
          'Resta fuori perché riguarda una categoria che il calcolo non copre. È l’articolo che ha modificato gli artt. 3 e 51 del TUIR nel 2026, e L’abbiamo letto per intero proprio per accertare che nessuno dei commi che contano fosse toccato.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
        note: [
          'Il c. 3 contiene una clausola per cui l’esclusione non deve far guadagnare detrazioni e benefici legati a requisiti reddituali. È lo stesso scopo del c. 9 della L. 207/2024, con tecnica opposta: impedire che un’agevolazione ne generi un’altra a cascata.',
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 386',
        dispone:
          'Esclude dal reddito, entro 5.000 euro annui, i rimborsi del datore per canoni di locazione dei neoassunti, precisando che l’esclusione non rileva ai fini contributivi.',
        effetto:
          'Resta fuori dal calcolo, ma è la prova testuale che la base fiscale e quella contributiva possono divergere per disposizione espressa. Che coincidano è una proprietà del caso standard, non del sistema.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 175',
        dispone:
          'Consente a chi ha il primo accredito contributivo dopo il 2025 di versare volontariamente fino a due punti di aliquota in più, deducibili per metà dell’importo.',
        effetto:
          'Resta fuori, ma è l’esempio che spiega perché i contributi obbligatori non sono una deduzione: la legge dimostra di saper usare la deduzione quando il contributo è facoltativo.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 385',
        dispone:
          'Riduce al 5% l’imposta sostitutiva sui premi di produttività per il 2025.',
        effetto:
          'Resta fuori: dipende dalla contrattazione di secondo livello, che il caso standard non ha. Per il 2026 il regime è stato sostituito da quello all’1% della legge di bilancio successiva.',
        portale: 'def.finanze.it',
        consultata: '27/08/2026',
        note: [
          'Su questo comma abbiamo imparato una cosa: l’annotazione «modificato da» dice che un comma è stato toccato, non come. Ricostruirne il senso senza leggere l’atto modificante è un’inferenza, e in questo caso si è rivelata sbagliata nel verso.',
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 17',
        dispone: 'Disciplina la tassazione separata, che governa il trattamento di fine rapporto.',
        effetto:
          'Resta fuori perché il TFR non entra nel netto annuo, ma è l’articolo da citare per spiegare dove sia scritto che il TFR non segue il regime ordinario.',
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
      {
        atto: 'INPS, circolare n. 101 del 29/11/2024',
        dispone:
          'Tratta il regime contributivo dei magistrati onorari, e nel farlo richiama l’aliquota generale del 33% ripartita in 23,81% a carico del datore e 9,19% a carico del lavoratore.',
        effetto:
          'Non è la fonte citata dal calcolatore, ma resta un riscontro: il valore è corretto e la fonte è primaria, però i valori generali compaiono in un richiamo di contesto dentro una circolare su una categoria specifica.',
        consultata: '27/08/2026',
        note: [
          'C’è qui una trappola: la stessa aliquota del 33% compare anche per la Gestione separata, con una ripartizione completamente diversa. Prenderla dalla circolare sbagliata produce un’aliquota errata di quasi due punti.',
          'Di questo documento non abbiamo un indirizzo stabile da citare.',
        ],
      },
      {
        atto: 'INPS, circolare n. 8 del 2026',
        dispone: 'Disciplina le aliquote della Gestione separata.',
        effetto:
          'Resta fuori perché non riguarda il lavoro dipendente. Conferma però il massimale di 122.295 euro.',
        consultata: '27/08/2026',
        note: ['Di questo documento non abbiamo un indirizzo stabile da citare.'],
      },
      {
        atto: 'DL 19/09/1992 n. 384',
        riferimento: 'art. 6 c. 11',
        dispone:
          'Fissava il contributo per il Servizio sanitario nazionale a carico dei lavoratori dipendenti, per l’1% più un’ulteriore aliquota dello 0,80%.',
        effetto:
          'Non si applica più: quei contributi sono stati aboliti dall’art. 36 del D.Lgs. 446/1997, cioè dallo stesso atto che istituisce l’addizionale regionale. È la prova documentale del legame fra le due cose.',
        portale: 'def.finanze.it',
        identificativo: 'atto id {2E278145-81A8-4B7C-9ED2-7A9CAF61DA6C}',
        url: DEF_FINANZE,
        consultata: '27/08/2026',
      },
      {
        atto: 'L. 29/12/2021 n. 234',
        riferimento: 'art. 1 commi 565–580',
        dispone:
          'Disciplina la potestà dei Comuni di articolare l’addizionale per scaglioni di reddito.',
        effetto:
          'Non serve per l’anno d’imposta 2026: per quell’anno la potestà nasce direttamente dai commi 727 e 751 della legge di bilancio 2025.',
        consultata: '27/08/2026',
      },
      {
        atto: 'DPR 600/1973',
        dispone: 'Contiene le regole sugli arrotondamenti delle ritenute.',
        effetto:
          'Resta fuori: gli arrotondamenti sulla singola ritenuta, il conguaglio e la rateizzazione delle addizionali riguardano quando il denaro si muove, non quanto spetta per l’anno.',
        consultata: '27/08/2026',
      },
    ],
  },
]
