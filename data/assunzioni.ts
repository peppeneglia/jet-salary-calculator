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
      testo: {
        it: 'Non consideriamo coniuge e figli a carico. Le detrazioni per la famiglia dipendono dal reddito di altre persone, che dalla busta paga non si vede. Chi ha familiari a carico ha un netto più alto.',
        en: 'We do not take a spouse or dependent children into account. Family tax credits depend on other people’s income, which a payslip does not show. Anyone with dependants takes home more than this.',
      },
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
      testo: {
        it: 'Sopra una certa retribuzione i contributi smettono di crescere, ma solo per chi ha iniziato a lavorare dal 1996 in poi. Non sappiamo quando hai cominciato, quindi abbiamo calcolato senza quel tetto. Se hai iniziato dopo il 1995, il tuo netto reale è più alto di quello che vedi.',
        en: 'Above a certain level of pay contributions stop growing, but only for people who started working from 1996 onwards. We do not know when you started, so we have calculated without that cap. If you started after 1995, your real net pay is higher than what you see here.',
      },
      direzione: 'netto-reale-piu-alto',
      collocazione: 'accanto-al-numero',
      fonte: massimaleContributivo,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-003',
      testo: {
        it: 'Calcoliamo quello che arriva a te, non quanto spende l\'azienda. Sopra il tuo lordo c\'è un altro livello — contributi a carico del datore, TFR — che non fa parte di questo strumento.',
        en: 'We work out what reaches you, not what your employer spends. Above your gross figure there is another layer — employer contributions, TFR (severance accrual) — that is not part of this tool.',
      },
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
      testo: {
        it: 'Questo è il netto di un anno intero. Una singola busta paga contiene voci che riguardano anni diversi: per esempio le addizionali dell\'anno scorso, trattenute quest\'anno un po\' per volta. Se confronti con la tua busta i numeri non coincideranno, e nessuno dei due è sbagliato: rispondono a due domande diverse.',
        en: 'This is the net pay of a full year. A single payslip contains items belonging to different years: last year’s addizionali (local income tax surcharges), for instance, withheld a little at a time over this one. If you compare it with your payslip the numbers will not match, and neither of them is wrong: they answer two different questions.',
      },
      direzione: 'nessuna',
      collocazione: 'accanto-al-numero',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-005',
      testo: {
        it: 'Assumiamo che tu abbia lavorato tutto l\'anno. Chi ha lavorato solo alcuni mesi ha detrazioni e agevolazioni proporzionalmente più basse.',
        en: 'We assume you worked the whole year. Anyone who worked only part of it gets proportionally smaller tax credits and reliefs.',
      },
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-005-bis',
      testo: {
        it: 'Assumiamo che lo stipendio sia distribuito in modo uniforme nell\'anno. Su alcune trattenute il calcolo mese per mese può dare qualche euro di differenza, che di norma si sistema a fine anno.',
        en: 'We assume your pay is spread evenly across the year. On some withholdings a month-by-month calculation can differ by a few euros, which is normally settled at year end.',
      },
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-006',
      testo: {
        it: 'Non consideriamo fondo pensione integrativo, casse sanitarie e fondi previsti dal contratto collettivo. Dipendono dal contratto applicato e da scelte tue. Chi vi aderisce paga meno tasse ma riceve meno in busta.',
        en: 'We do not take supplementary pension funds, health funds or schemes set by your collective agreement into account. They depend on which agreement applies to you and on choices you have made. Joining one means paying less tax but receiving less in your payslip.',
      },
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-007',
      testo: {
        it: 'Non consideriamo buoni pasto, auto aziendale e altri benefit. Attenzione al verso: oltre una certa soglia non sono una trattenuta, sono reddito in più, e fanno salire le tasse.',
        en: 'We do not take meal vouchers, a company car or other benefits into account. Watch the direction: above a certain threshold they are not a deduction, they are extra income, and they push your tax up.',
      },
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-008',
      testo: {
        it: 'Non consideriamo cessione del quinto, pignoramenti, quote sindacali, mensa o prestiti aziendali. Sono soldi che escono dal netto già calcolato, non tasse.',
        en: 'We do not take salary-backed loans, garnishments, union dues, canteen charges or company loans into account. That is money leaving the net pay we have already worked out, not tax.',
      },
      direzione: 'netto-reale-piu-basso',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-009',
      testo: {
        it: 'Il calcolo vale per un impiegato del settore privato. Contratti collettivi e qualifiche diverse hanno regole proprie.',
        en: 'The calculation is for an office employee in the private sector. Other collective agreements and job categories have rules of their own.',
      },
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-010',
      testo: {
        it: 'Non consideriamo le agevolazioni per chi rientra dall\'estero o per i ricercatori. Dipendono da una condizione personale, non dallo stipendio.',
        en: 'We do not take the reliefs for people moving back to Italy or for researchers into account. They depend on a personal circumstance, not on your salary.',
      },
      direzione: 'netto-reale-piu-alto',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-011',
      testo: {
        it: 'Le aliquote di Regione e Comune vengono dagli elenchi del Ministero dell\'Economia, alla data indicata in fondo alla pagina. Milano e Lombardia le abbiamo controllate una per una; per gli altri comuni ci fidiamo dell\'elenco.',
        en: 'The regional and municipal rates come from the Ministry of Economy and Finance lists, as at the date shown at the foot of the page. We checked Milano and Lombardia one by one; for other municipalities we rely on the list.',
      },
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
      fonte: semplificazioni,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-013',
      testo: {
        it: 'Nel 2026 alcune parti dello stipendio pagano molto meno tasse del resto: gli aumenti da rinnovo del contratto nazionale, i premi di risultato, le maggiorazioni per lavoro notturno o a turni. Dal solo stipendio lordo non possiamo sapere quanto della tua retribuzione sia fatto di queste voci. Se ne hai, il tuo netto reale è più alto di quello che vedi, anche di duecento euro ogni mille euro di aumento contrattuale.',
        en: 'In 2026 some parts of your pay are taxed far less than the rest: increases from national collective bargaining renewals, performance bonuses, and premiums for night or shift work. From your gross salary alone we cannot tell how much of your pay is made up of these. If you have any, your real net pay is higher than what you see here — by as much as two hundred euros for every thousand euros of bargained increase.',
      },
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
      testo: {
        it: 'Chi ha concluso un apprendistato da meno di un anno continua a pagare contributi ridotti, anche se il contratto è ormai a tempo indeterminato. Se sei in questa situazione, il tuo netto reale è più alto di circa mille euro l\'anno su uno stipendio di trentamila.',
        en: 'Anyone who finished an apprendistato (apprenticeship contract) less than a year ago carries on paying reduced contributions, even though the contract is now permanent. If that is your case, your real net pay is roughly a thousand euros a year higher on a salary of thirty thousand.',
      },
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
