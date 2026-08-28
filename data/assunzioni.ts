/**
 * Il catalogo delle assunzioni dichiarate.
 *
 * ⚠️ **Ogni assunzione ha due testi, perché ha due pubblici** (D-039).
 *
 * Qui vive il testo **rivolto all'utente**: chi legge è un dipendente o chi
 * gestisce il personale, e sta guardando il proprio stipendio. Frasi corte, si
 * dà del tu, e ogni voce dice **da che parte il numero è impreciso** — che è
 * l'informazione utile, non la giustificazione della scelta.
 *
 * La **versione argomentata** resta su *Semplificazioni* in Notion, collegata a
 * questa per `id`. Quella parla a chi valuta il lavoro e deve restare
 * argomentata; questa parla a chi legge il proprio netto. **Non sono due copie
 * della stessa frase: sono due frasi diverse per due lettori diversi**, e
 * costringerle a coincidere rompe la seconda.
 *
 * È la stessa doppia forma che `Passo` ha già: `regola` in linguaggio
 * normativo, `spiegazione` in linguaggio da mostrare, e a nessuno è mai venuto
 * in mente di fonderle. La differenza è che qui la versione argomentata vive in
 * Notion e non nel tipo, perché serve al colloquio e non al prodotto.
 *
 * **Il collegamento è l'****`id`****, ed è il vincolo che tiene.** Se una voce
 * cambia in *Semplificazioni* e non qui, la mappa di coerenza prima della
 * consegna lo trova. Per la stessa ragione il catalogo contiene **solo voci
 * `S-xxx`**: un id di altra famiglia risulterebbe spaiato alla verifica.
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
        'Non consideriamo coniuge e figli a carico. Le detrazioni per la famiglia dipendono dal reddito di altre persone, che dalla busta paga non si vede. Chi ha familiari a carico ha un netto più alto.',
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
        'Sopra una certa retribuzione i contributi smettono di crescere, ma solo per chi ha iniziato a lavorare dal 1996 in poi. Non sappiamo quando hai cominciato, quindi abbiamo calcolato senza quel tetto. Se hai iniziato dopo il 1995, il tuo netto reale è più alto di quello che vedi.',
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
        'Calcoliamo quello che arriva a te, non quanto spende l\'azienda. Sopra il tuo lordo c\'è un altro livello — contributi a carico del datore, TFR — che non fa parte di questo strumento.',
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    // Assorbe anche il confronto con la busta paga, che prima stava in una voce
    // separata: due voci vicine con lo stesso contenuto, in pagina, si leggono
    // come una svista.
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-004',
      testo:
        'Questo è il netto di un anno intero. Una singola busta paga contiene voci che riguardano anni diversi: per esempio le addizionali dell\'anno scorso, trattenute quest\'anno un po\' per volta. Se confronti con la tua busta i numeri non coincideranno, e nessuno dei due è sbagliato: rispondono a due domande diverse.',
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
        'Assumiamo che tu abbia lavorato tutto l\'anno. Chi ha lavorato solo alcuni mesi ha detrazioni e agevolazioni proporzionalmente più basse.',
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
        'Assumiamo che lo stipendio sia distribuito in modo uniforme nell\'anno. Su alcune trattenute il calcolo mese per mese può dare qualche euro di differenza, che di norma si sistema a fine anno.',
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
        'Non consideriamo fondo pensione integrativo, casse sanitarie e fondi previsti dal contratto collettivo. Dipendono dal contratto applicato e da scelte tue. Chi vi aderisce paga meno tasse ma riceve meno in busta.',
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
        'Non consideriamo buoni pasto, auto aziendale e altri benefit. Attenzione al verso: oltre una certa soglia non sono una trattenuta, sono reddito in più, e fanno salire le tasse.',
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
        'Non consideriamo cessione del quinto, pignoramenti, quote sindacali, mensa o prestiti aziendali. Sono soldi che escono dal netto già calcolato, non tasse.',
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
        'Il calcolo vale per un impiegato del settore privato. Contratti collettivi e qualifiche diverse hanno regole proprie.',
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
        'Non consideriamo le agevolazioni per chi rientra dall\'estero o per i ricercatori. Dipendono da una condizione personale, non dallo stipendio.',
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
        'Le aliquote di Regione e Comune vengono dagli elenchi del Ministero dell\'Economia, alla data indicata in fondo alla pagina. Milano e Lombardia le abbiamo controllate una per una; per gli altri comuni ci fidiamo dell\'elenco.',
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
        'Nel 2026 alcune parti dello stipendio pagano molto meno tasse del resto: gli aumenti da rinnovo del contratto nazionale, i premi di risultato, le maggiorazioni per lavoro notturno o a turni. Dal solo stipendio lordo non possiamo sapere quanto della tua retribuzione sia fatto di queste voci. Se ne hai, il tuo netto reale è più alto di quello che vedi, anche di duecento euro ogni mille euro di aumento contrattuale.',
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
        'Chi ha concluso un apprendistato da meno di un anno continua a pagare contributi ridotti, anche se il contratto è ormai a tempo indeterminato. Se sei in questa situazione, il tuo netto reale è più alto di circa mille euro l\'anno su uno stipendio di trentamila.',
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
]
