/**
 * Il catalogo delle assunzioni dichiarate.
 *
 * ⚠️ Ogni assunzione ha due testi, perché ha due pubblici (D-039).
 *
 * Qui vive il testo rivolto all'utente: chi legge è un dipendente o chi
 * gestisce il personale, e sta guardando il proprio stipendio. Frasi corte, si
 * dà del tu, e ogni voce dice da che parte il numero è impreciso — che è
 * l'informazione utile, non la giustificazione della scelta.
 *
 * La versione argomentata resta su *Semplificazioni* in Notion, collegata a
 * questa per `id`. Quella parla a chi valuta il lavoro e deve restare
 * argomentata; questa parla a chi legge il proprio netto. Non sono due copie
 * della stessa frase: sono due frasi diverse per due lettori diversi, e
 * costringerle a coincidere rompe la seconda.
 *
 * È la stessa doppia forma che `Passo` ha già: `regola` in linguaggio
 * normativo, `spiegazione` in linguaggio da mostrare, e a nessuno è mai venuto
 * in mente di fonderle. La differenza è che qui la versione argomentata vive in
 * Notion e non nel tipo, perché serve al colloquio e non al prodotto.
 *
 * Il collegamento è l'`id`, ed è il vincolo che tiene. Se una voce
 * cambia in *Semplificazioni* e non qui, la mappa di coerenza prima della
 * consegna lo trova. Per la stessa ragione il catalogo contiene solo voci
 * `S-xxx`: un id di altra famiglia risulterebbe spaiato alla verifica.
 *
 * Non stanno nel `Regime` perché non sono parametri normativi: sono
 * dichiarazioni di perimetro, cioè cosa questo calcolatore ha scelto di non
 * modellare. Confondere le due cose mescolerebbe *quanto vale una cosa per
 * legge* con *cosa non calcoliamo* (D-031).
 *
 * Ogni voce porta la condizione che la rende applicabile a un calcolo, come
 * dato e non come funzione. Il motore riceve il catalogo e restituisce il
 * sottoinsieme applicabile, così la pagina non può mostrare un'assunzione che
 * il motore non ha considerato.
 */

import { euro, type AssunzioneDichiarata, type Fonte } from '../core/types'

/*
 * ⚠️ **Qui c'era una `Fonte` che citava questo stesso progetto**, e undici
 * assunzioni la portavano:
 *
 *     atto: 'Jet Salary Calculator — Semplificazioni'
 *
 * In pagina usciva sotto l'intestazione *Riferimento*, accanto a citazioni
 * come *L. 30/12/2024 n. 207, art. 1 c. 6*. È una categoria diversa messa
 * nella stessa casella: una norma è verificabile da chiunque, una nostra
 * pagina di appunti no, e affiancarle suggerisce che la seconda abbia lo
 * stesso peso della prima. Peggio: dichiarava `provenienza: 'verificata'`,
 * cioè si autocertificava.
 *
 * Le assunzioni che non poggiano su un atto **non portano più alcuna fonte**.
 * Il campo è facoltativo proprio per questo, e un campo vuoto dice la verità —
 * *questa è una nostra scelta di perimetro* — meglio di una citazione
 * circolare. Restano citate le tre che una norma ce l'hanno davvero: S-002
 * sul massimale, S-013 sulle imposte sostitutive, S-014 sull'apprendistato.
 *
 * Il legame con la pagina *Semplificazioni* non si perde: è l'`id`, ed è per
 * quello che l'`id` esiste (D-039).
 */

/** [S-002] Il massimale, che il perimetro esclude ma la cui soglia serve come condizione. */
const massimaleContributivo: Fonte = {
  atto: 'L. 08/08/1995 n. 335',
  riferimento: 'art. 2 c. 18, secondo periodo — valore 2026 da INPS circ. 6/2026 par. 6',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [S-017] Il minimale, cioè il pavimento della base contributiva.
 *
 * ⚠️ **Fino al 31/08/2026 il perimetro dichiarava il tetto e taceva sul
 * pavimento.** S-002 avvisa chi supera il massimale; sotto il minimale non
 * c'era nulla, e il verso dell'errore è quello pericoloso — contributi
 * sottostimati, quindi netto mostrato più alto del reale.
 *
 * I pavimenti sono **due**, entrambi citati dalla circolare INPS 6/2026 §1:
 * il **minimo contrattuale** dell'art. 1 c. 1 del D.L. 338/1989 — che vincola
 * *«anche i datori di lavoro non aderenti, neppure di fatto»* alla disciplina
 * collettiva — e il **minimale di retribuzione giornaliera** dell'art. 7 c. 1
 * del D.L. 463/1983, che non può scendere sotto il 9,50% del trattamento
 * minimo FPLD. Qui si cita il secondo, perché è l'unico con un valore
 * nazionale: il primo dipende dal CCNL applicato, che l'app non conosce.
 */
const minimaleContributivo: Fonte = {
  atto: 'D.L. 12/09/1983 n. 463, conv. dalla L. 11/11/1983 n. 638, come mod. dall’art. 1 c. 2 del D.L. 09/10/1989 n. 338',
  riferimento: 'art. 7 c. 1 secondo periodo — 9,50% del trattamento minimo FPLD; per il 2026 58,13 € al giorno (INPS circ. 6/2026 §1)',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:1983-09-12;463~art7',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/*
 * ⚠️ **S-015 non è più qui, ed è una decisione di prodotto, non una
 * dimenticanza.**
 *
 * La voce diceva che a Bolzano, sopra i 50.000 euro di imponibile, esiste una
 * seconda detrazione dall'addizionale regionale che il motore non applica.
 * Era vera, ed era **l'unica voce dell'elenco che riguardasse un solo ente
 * impositore su ventuno**: su una pagina che dichiara i confini del calcolo a
 * chiunque la apra, una riga che parla di una provincia sola sta accanto a
 * quattordici righe che parlano di tutti.
 *
 * ⚠️ E soprattutto: se una cosa si può applicare, va applicata invece che
 * dichiarata. La detrazione altoatesina è `125 × (reddito − 50.000) / 25.000`
 * con un massimo di 125, cioè una formula continua, mentre
 * `DetrazioneLocale` esprime un importo fisso entro una banda. **Il lavoro da
 * fare non è scriverne il limite: è estendere il tipo**, come D-064 ha già
 * fatto per la deduzione trentina — che infatti oggi si calcola, e la cui
 * semplificazione S-016 è caduta insieme.
 *
 * Finché il tipo non la esprime, resta un caso noto della documentazione di
 * progetto, non una riga in pagina.
 */

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
    /*
     * ⚠️ **La soglia è una soglia di visualizzazione, non un parametro del
     * calcolo, e va letta sapendo com'è costruita.**
     *
     * 18.136,56 = **58,13 × 312**. Il 58,13 è citato: lo fissa la circolare
     * INPS 6/2026 §1 come 9,50% del trattamento minimo FPLD (611,85 €). Il
     * **312 no**: è la convenzione delle giornate retribuite per il lavoro
     * mensilizzato — 26 al mese per dodici — e nella circolare non compare,
     * perché il minimale è **giornaliero** e la legge non ne dà un annuale.
     *
     * Serve a decidere *a chi mostrare la voce*, non a calcolare nulla: chi
     * ha lavorato meno di un anno sta sotto la soglia senza che il suo netto
     * sia sbagliato, e per questo il testo dice «se il rapporto copre l'anno».
     * Se un giorno l'app chiedesse le giornate, questa diventerebbe un vero
     * parametro e andrebbe rifatta.
     */
    condizione: { tipo: 'ral-sotto', soglia: { valore: euro(18_136.56), fonte: minimaleContributivo } },
    assunzione: {
      id: 'S-017',
      testo: {
        it: 'Non applichiamo il minimo di legge sui contributi. I contributi vanno calcolati su almeno 58,13 euro per ogni giornata retribuita, anche quando la paga effettiva è più bassa. Non sappiamo quante giornate hai lavorato, quindi abbiamo usato il tuo lordo così com’è: se è basso perché il rapporto copre tutto l’anno, i contributi reali sono più alti e il tuo netto è più basso di quello che vedi.',
        en: 'We do not apply the statutory floor on contributions. Contributions must be computed on at least 58.13 euros for every paid day, even when actual pay is lower. We do not know how many days you worked, so we have used your gross figure as it stands: if it is low because the contract runs for the whole year, your real contributions are higher and your take-home pay is lower than what you see here.',
      },
      direzione: 'netto-reale-piu-basso',
      collocazione: 'accanto-al-numero',
      fonte: minimaleContributivo,
    },
  },
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-003',
      testo: {
        it: 'Calcoliamo quello che arriva a te, non quanto spende l\'azienda. Sopra il tuo lordo c\'è un altro livello (contributi a carico del datore, TFR) che non fa parte di questo strumento.',
        en: 'We work out what reaches you, not what your employer spends. Above your gross figure there is another layer that is not part of this tool: employer contributions and TFR (severance accrual).',
      },
      direzione: 'nessuna',
      collocazione: 'blocco-semplificazioni',
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
    },
  },
  /*
   * ⚠️ **S-011 non è più qui, e a farla cadere è stato il lavoro sulle
   * fonti.**
   *
   * Diceva che le aliquote di Regione e Comune vengono dagli elenchi
   * ministeriali, alla data di estrazione, e che un ente deliberando dopo
   * quella data può aver cambiato il numero. Aveva senso finché il prospetto
   * MEF era **l'unica** cosa che si potesse citare per il livello regionale.
   *
   * Da quando gli atti degli enti sono stati reperiti e letti uno per uno,
   * quella citazione non è più il ripiego di prima: diciannove enti su
   * ventuno portano ora la propria legge regionale, con articolo e comma, e
   * per loro la data di estrazione dell'elenco non è più il solo riferimento
   * disponibile. Tenere una voce che dichiara come limite ciò che nel
   * frattempo è stato chiuso è il difetto che S-016 aveva già mostrato: una
   * semplificazione che sopravvive alla propria chiusura dice al lettore che
   * il numero è meno solido di quanto sia.
   *
   * Quello che resta vero — gli elenchi si aggiornano e un ente può deliberare
   * dopo — non sparisce dal prodotto: è la data di estrazione, che continua a
   * viaggiare **dentro il dato** e a comparire accanto a ogni citazione
   * importata (D-005). Lì qualifica il numero che sta accanto, invece di
   * qualificare l'intero calcolatore.
   */
  {
    condizione: { tipo: 'sempre' },
    assunzione: {
      id: 'S-013',
      testo: {
        it: 'Nel 2026 alcune parti dello stipendio pagano molto meno tasse del resto: gli aumenti da rinnovo del contratto nazionale, i premi di risultato, le maggiorazioni per lavoro notturno o a turni. Dal solo stipendio lordo non possiamo sapere quanto della tua retribuzione sia fatto di queste voci. Se ne hai, il tuo netto reale è più alto di quello che vedi, anche di duecento euro ogni mille euro di aumento contrattuale.',
        en: 'In 2026 some parts of your pay are taxed far less than the rest: increases from national collective bargaining renewals, performance bonuses, and premiums for night or shift work. From your gross salary alone we cannot tell how much of your pay is made up of these. If you have any, your real net pay is higher than what you see here, by as much as two hundred euros for every thousand euros of bargained increase.',
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
