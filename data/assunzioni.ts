/**
 * Il catalogo delle assunzioni dichiarate.
 *
 * I testi vengono da *Semplificazioni* in Notion: qui non si riformulano, si
 * riportano. Se una voce di quella pagina cambia, cambia questo file — non il
 * contrario.
 *
 * Non stanno nel `Regime` perché **non sono parametri normativi**: sono
 * dichiarazioni di perimetro, cioè cosa questo calcolatore ha scelto di non
 * modellare. Confondere le due cose mescolerebbe *quanto vale una cosa per
 * legge* con *cosa non calcoliamo* (D-031).
 *
 * Ogni voce porta la condizione che la rende applicabile a un calcolo, come
 * dato e non come funzione. Il motore riceve il catalogo e restituisce il
 * sottoinsieme applicabile, così **la pagina non può mostrare un'assunzione che
 * il motore non ha considerato**.
 */

import { euro, type AssunzioneDichiarata, type Fonte } from '../core/types'

const semplificazioni: Fonte = {
  atto: 'Jet Salary Calculator — Semplificazioni',
  consultataIl: '2026-08-28',
  provenienza: 'verificata',
}

/** [S-002] Il massimale, che il perimetro esclude ma la cui soglia serve come condizione. */
const massimaleContributivo: Fonte = {
  atto: 'L. 08/08/1995 n. 335',
  riferimento: 'art. 2 c. 18, secondo periodo — valore 2026 da INPS circ. 6/2026 par. 6',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

export const assunzioni: readonly AssunzioneDichiarata[] = [
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-001',
      testo:
        'Detrazioni per figli e per coniuge: nessun campo, nessuna formula. Il reddito familiare non passa dalla busta paga. Per i figli le detrazioni sono state in larga parte assorbite dall\'Assegno Unico, erogato dall\'INPS su base ISEE e non transitante dal cedolino; per il coniuge servirebbe il suo reddito. Sono inoltre detrazioni che il sostituto applica su richiesta del dipendente: non sono una proprietà automatica del reddito.',
      direzione: 'netto-reale-piu-alto',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    // ⚠️ L'unica assunzione con una soglia da valutare. Se la valutasse
    // l'interfaccia, i 122.295 esisterebbero in due posti che devono restare
    // d'accordo — la doppia verità che D-003 impedisce.
    condizione: { tipo: 'ral-supera', soglia: { valore: euro(122_295), fonte: massimaleContributivo } },
    assunzione: {
      id: 'S-002',
      testo:
        'Il tetto alla base contributiva e pensionabile, pari per il 2026 a 122.295,00 euro, non è modellato: si applica solo ai lavoratori iscritti a forme pensionistiche obbligatorie dopo il 31/12/1995, quindi dipende dalla data di prima iscrizione previdenziale, che l\'utente medio non conosce e non saprebbe dichiarare. Escludendolo, il calcolo assume un lavoratore iscritto prima del 1996. Sopra 122.295 sbaglia in due modi nella stessa direzione: applica l\'aliquota ordinaria su una base che dovrebbe essere tappata, e applica l\'1% aggiuntivo che dovrebbe essersi spento.',
      direzione: 'netto-reale-piu-alto',
      collocazione: 'accanto-al-numero',
      fonte: massimaleContributivo,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-003',
      testo:
        'Restano fuori i contributi a carico del datore, il TFR e il contributo addizionale sui contratti a termine. La task chiede lo stipendio netto e il dettaglio delle trattenute: il costo azienda è un piano superiore, con parametri che variano per settore, dimensione e qualifica in modo molto più frastagliato del lato dipendente.',
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-004',
      testo:
        'Restano fuori conguaglio di fine anno, rate delle addizionali dell\'anno precedente, ritenute calcolate su proiezione e arrotondamenti sulla singola ritenuta mensile. Sono meccanismi di quando il denaro si muove, non di quanto spetta per l\'anno.',
      direzione: 'nessuna',
      collocazione: 'accanto-al-numero',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-005',
      testo:
        'Il calcolo assume un rapporto di lavoro per l\'intero anno e non chiede i giorni effettivamente lavorati. Il caso standard richiesto è un rapporto continuativo, e chiedere i giorni appesantirebbe l\'input per una casistica che il prototipo non deve coprire. Detrazioni e cuneo si ridurrebbero proporzionalmente per chi ha lavorato una frazione d\'anno.',
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-005-bis',
      testo:
        'La retribuzione è assunta distribuita uniformemente nell\'anno. L\'aliquota aggiuntiva dell\'1% segue il criterio della mensilizzazione — si applica mese per mese sulla quota eccedente il dodicesimo della prima fascia — e con 13 o 14 mensilità la retribuzione non è uniforme. Si adotta l\'equivalente annuo, che è il risultato a cui il conguaglio di fine anno dovrebbe ricondurre.',
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-006',
      testo:
        'Restano fuori le quote a carico del dipendente per fondi pensione, fondi sanitari e assistenziali previsti da CCNL. Dipendono dal CCNL applicato e da un\'adesione individuale: agirebbero prima dell\'imponibile, quindi con effetto a cascata, ma non sono derivabili dalla RAL.',
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-007',
      testo:
        'Restano fuori buoni pasto, auto aziendale, beni e servizi. Sono individuali, e vanno chiariti nella direzione: la parte che supera la soglia di esenzione non è una trattenuta, è reddito imponibile in più. Confonderla con una trattenuta produce numeri sbagliati nella direzione opposta.',
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-008',
      testo:
        'Restano fuori cessione del quinto, pignoramenti, quota sindacale, quote per mensa e trasporto, anticipi e prestiti aziendali. Non toccano il conto fiscale: sono destinazioni del netto, individuali e contrattuali.',
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-009',
      testo:
        'Restano fuori le qualifiche diverse dall\'impiegato nel settore privato e le specificità dei singoli CCNL. È il caso standard indicato dalla consegna.',
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-010',
      testo:
        'Restano fuori i regimi agevolati legati alla persona — impatriati, ricercatori e simili. Dipendono da una condizione personale certificata, non dalla retribuzione.',
      direzione: 'netto-reale-piu-alto',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-011',
      testo:
        'Resta fuori la verifica singola delle delibere di ottomila comuni. Milano e Lombardia sono verificate sulle delibere; il resto è importato dal MEF a una data dichiarata in pagina, che viene dal dato stesso e non da una costante scritta a mano. Alla domanda «come garantisci l\'aliquota di un comune qualsiasi?» la risposta è che non la si garantisce singolarmente: origine e data sono dichiarate.',
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-013',
      testo:
        'Restano fuori i quattro regimi di imposta sostitutiva introdotti dalla L. 199/2025: incrementi da rinnovo contrattuale (5%, sostituisce IRPEF e addizionali), premi di produttività (1%), lavoro notturno, festivo e indennità di turno (15%), trattamento integrativo speciale del turismo. Non escono perché dipendono da una dichiarazione individuale — sono automatici, salva espressa rinuncia scritta — ma perché non sono calcolabili dalla RAL da sola: servirebbe la composizione della retribuzione, e quell\'input non c\'è e non può esserci. Per chi nel 2026 ha ricevuto incrementi da rinnovo, premi o indennità di turno il netto reale è più alto di quello calcolato: su 1.000 euro di incremento da rinnovo, circa 205 euro di netto che il calcolatore non mostra, fino a circa 305 per chi sta fra 28.000 e 33.000.',
      direzione: 'netto-reale-piu-alto',
      collocazione: 'accanto-al-numero',
      fonte: {
        atto: 'L. 30/12/2025 n. 199',
        riferimento: 'art. 1 commi 7, 9, 10-11, 18-21',
        consultataIl: '2026-08-27',
        provenienza: 'verificata',
      },
    },
  },
  {
    // La condizione è «non apprendistato», non «apprendistato»: la voce riguarda
    // chi ha *finito* l'apprendistato da meno di un anno e dall'input risulta a
    // tempo indeterminato. A chi dichiara apprendistato il motore applica già
    // l'aliquota ridotta, quindi per lui l'assunzione non morde.
    condizione: { tipo: 'contratto-diverso-da', contratto: 'apprendistato' },
    assunzione: {
      id: 'S-014',
      testo:
        'Restano fuori i dodici mesi successivi al termine dell\'apprendistato, durante i quali l\'aliquota a carico del lavoratore resta al 5,84% anche a rapporto ormai a tempo indeterminato. Dall\'input risulta indeterminato, e il calcolatore non ha modo di sapere che quel rapporto proviene da un apprendistato concluso da meno di un anno: servirebbe la data di fine apprendistato, che non è una proprietà della retribuzione. Per chi si trova in quei dodici mesi il calcolo applica l\'aliquota piena invece di quella ridotta, quindi il netto reale è più alto di circa 3,35 punti di RAL.',
      direzione: 'netto-reale-piu-alto',
      collocazione: 'blocco-semplificazioni',
      fonte: {
        atto: 'D.Lgs. 15/06/2015 n. 81, confermato da INPS messaggio n. 3618 del 17/10/2023',
        riferimento: 'art. 47 c. 7',
        consultataIl: '2026-08-28',
        provenienza: 'verificata',
      },
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'D-015',
      testo:
        'Il risultato è il netto annuo corrispondente a una RAL percepita interamente nell\'anno, non l\'importo di una busta mensile. Una busta del 2026 contiene le rate delle addizionali del 2025 e non quelle del 2026, che si pagheranno nel 2027: nessuno dei due numeri è sbagliato, rispondono a due domande diverse.',
      direzione: 'nessuna',
      collocazione: 'accanto-al-numero',
      fonte: semplificazioni,
    },
  },
]
