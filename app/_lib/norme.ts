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
  /**
   * L'atto per esteso, come va citato.
   *
   * ⚠️ **Non si traduce, ed è sostanza** (D-041). *L. 30/12/2024 n. 207* è la
   * chiave con cui si cerca il testo su Normattiva: tradurla la renderebbe
   * inservibile proprio a chi volesse verificarla. Vale per `riferimento`,
   * `portale` e `identificativo` per la stessa ragione.
   */
  readonly atto: string
  /** Articolo o comma. Vuoto se l'atto rileva per intero. */
  readonly riferimento?: string
  /** Cosa dispone, in una frase, in lingua piana. */
  readonly dispone: Multilingua
  /**
   * Vigenza, solo se *Fonti* la riporta.
   *
   * Resta una stringa e non una data: *Fonti* la riporta come prosa —
   * «dal 19/11/1992, con decorrenza degli effetti dal 1° gennaio 1993» — e
   * ridurla a un timestamp perderebbe la seconda metà della frase.
   */
  readonly vigenza?: Multilingua
  /** Ultima modifica, solo se *Fonti* la riporta. */
  readonly ultimaModifica?: Multilingua
  /** Cosa determina nel calcolo del netto, oppure perché resta fuori. */
  readonly effetto: Multilingua
  /** Portale istituzionale su cui l'atto è stato letto, se *Fonti* lo nomina. */
  readonly portale?: string
  /** Identificativo dell'atto sul portale, se *Fonti* lo riporta. */
  readonly identificativo?: string
  /** Link diretto, solo dove *Fonti* riporta un URL completo. */
  readonly url?: string
  /**
   * Data di lettura, in ISO 8601.
   *
   * In ISO e non `28/08/2026`: la forma la sceglie la lingua di chi legge, e
   * un dato che porta dentro di sé una convenzione di scrittura non può farlo.
   */
  readonly consultata: string
  /** Ambiguità, rinvii morti, divergenze — documentate in *Fonti*. */
  readonly note?: readonly Multilingua[]
}

export interface SezioneNorme {
  readonly id: string
  readonly titolo: Multilingua
  readonly occhiello: Multilingua
  readonly schede: readonly Scheda[]
}

import type { Multilingua } from '../../core/types'

const DEF_FINANZE = 'https://def.finanze.it'

/**
 * L'ordine è quello della catena di calcolo, non alfabetico: chi legge ritrova
 * la sequenza in cui una retribuzione lorda diventa netta.
 */
export const SEZIONI: readonly SezioneNorme[] = [
  // -------------------------------------------------------------------------
  {
    id: 'contributi',
    titolo: { it: 'Contributi previdenziali', en: 'Social security contributions' },
    occhiello:
      { it: 'Il primo prelievo, e l’unico che non è una tassa. Determina quanto esce dalla retribuzione per la pensione, e su quale base si calcola.', en: 'The first deduction, and the only one that is not a tax. It determines how much leaves your pay for your pension, and on what base it is worked out.' },
    schede: [
      {
        atto: 'L. 30/04/1969 n. 153',
        riferimento: 'art. 12',
        dispone:
          { it: 'Stabilisce su quale retribuzione si calcolano i contributi: le somme si assumono al lordo di qualsiasi contributo e trattenuta, meno un elenco tassativo di esclusioni.', en: 'Sets out which pay contributions are computed on: sums are taken gross of any contribution or withholding, less an exhaustive list of exclusions.' },
        effetto:
          { it: 'È la norma per cui i contributi si calcolano sulla retribuzione lorda, non su una grandezza ridotta. Nel caso standard la base coincide con la RAL, perché tutte le voci escluse dall’elenco tassativo — TFR, previdenza complementare, casse sanitarie, premi da contrattazione di secondo livello — sono già fuori dal calcolo.', en: 'This is the rule under which contributions are computed on gross pay, not on some reduced figure. In the standard case the base coincides with the RAL, because everything the exhaustive list excludes — TFR (severance accrual), supplementary pensions, health funds, second-level bargaining bonuses — is already outside this calculation.' },
        portale: 'Normattiva',
        consultata: '2026-08-28',
        note: [
          { it: 'Non abbiamo la data di vigenza: il testo che abbiamo letto non la riporta, e non indica nemmeno l’atto che ha introdotto il testo sostitutivo. Il contenuto rinvia al D.Lgs. 124/1993 e al DL 67/1997, quindi è posteriore al 1997 — ma «posteriore al 1997» non è «vigente nel 2026». La verifica resta da fare.', en: 'We do not have the date in force: the text we read does not carry it, and does not even name the act that introduced the replacement wording. The content cross-refers to D.Lgs. 124/1993 and DL 67/1997, so it is later than 1997 — but “later than 1997” is not “in force in 2026”. The check remains to be done.' },
          { it: 'Due rinvii alla numerazione del TUIR anteriore al 2004: il c. 1 rinvia all’art. 46 e i c. 2 e 3 all’art. 48, che oggi sono gli artt. 49 e 51.', en: 'Two cross-references to the pre-2004 numbering of the TUIR: subsection 1 points to art. 46 and subsections 2 and 3 to art. 48, which today are artt. 49 and 51.' },
          { it: 'Il criterio temporale è diverso da quello fiscale: qui i redditi sono quelli «maturati» nel periodo, mentre l’art. 51 TUIR conta le somme «percepite». Contributivo per maturazione, fiscale per cassa allargata, nella stessa busta paga.', en: 'The timing rule differs from the tax one: here income is what has “accrued” in the period, whereas art. 51 TUIR counts sums “received”. Accrual on the contributions side, extended cash basis on the tax side, in the same payslip.' },
          { it: 'Ambiguità dichiarata: come si combinano il c. 2, che rinvia all’art. 48 TUIR con le sue esclusioni, e il c. 5, che dichiara tassativo l’elenco del c. 4. Abbiamo adottato la lettura per cui valgono entrambi, perché il c. 3 deroga espressamente alla lett. h) dell’art. 48 — e si deroga solo a ciò che altrimenti varrebbe.', en: 'A declared ambiguity: how subsection 2, which refers to art. 48 TUIR with its exclusions, combines with subsection 5, which declares the list in subsection 4 exhaustive. We have taken the reading under which both apply, because subsection 3 expressly derogates from letter h) of art. 48 — and you only derogate from something that would otherwise apply.' },
          { it: 'Il portale def.finanze non basta per il previdenziale: del testo porta il solo art. 66, perché è un portale tributario.', en: 'The def.finanze portal is not enough for social security law: of this text it carries only art. 66, because it is a tax portal.' },
        ],
      },
      {
        atto: 'INPS, circolare n. 40 del 22/02/2011',
        riferimento: 'par. 1.1.1',
        dispone:
          { it: 'Riporta l’aliquota per invalidità, vecchiaia e superstiti: 33% in totale, di cui 9,19% a carico del lavoratore.', en: 'States the rate for invalidity, old age and survivors: 33% in total, of which 9.19% borne by the employee.' },
        effetto:
          { it: 'È la fonte dell’aliquota che si vede in busta paga. La circolare è rivolta ai datori di lavoro in genere, non a una categoria specifica, ed è per questo che sostituisce come citazione principale la circolare sui magistrati onorari.', en: 'This is the source of the rate you see on a payslip. The circular is addressed to employers in general, not to a specific category, and that is why it replaces the circular on honorary magistrates as the primary citation.' },
        consultata: '2026-08-28',
        note: [
          { it: 'Esistono due aliquote a carico del lavoratore, e la differenza è il contributo ex GESCAL: 9,19% dove si applica, 8,84% nei settori che ne sono esclusi. Per l’impiegato del settore privato vale il 9,19%.', en: 'There are two employee rates, and the difference is the former GESCAL contribution: 9.19% where it applies, 8.84% in the sectors excluded from it. For an office employee in the private sector the 9.19% applies.' },
          { it: 'La scomposizione riportata dalla circolare: 32% dal decreto interministeriale del 21/02/1996 in attuazione dell’art. 3 c. 23 della L. 335/1995, più 0,70 punti ex GESCAL, più 0,30 punti dall’art. 1 c. 769 della L. 296/2006.', en: 'The breakdown the circular gives: 32% from the inter-ministerial decree of 21/02/1996 implementing art. 3 c. 23 of L. 335/1995, plus 0.70 points of former GESCAL, plus 0.30 points from art. 1 c. 769 of L. 296/2006.' },
          { it: 'Cautela sulle date: il +0,30 alla quota del lavoratore è del 2007, non del 2002. E la data del 1° gennaio 2002 compare in un paragrafo sugli equipaggi delle navi da pesca e le aziende agricole — estenderla alla generalità dei dipendenti è un’inferenza, non una lettura.', en: 'A caution about dates: the +0.30 on the employee share is from 2007, not from 2002. And the date of 1 January 2002 appears in a paragraph on fishing-vessel crews and agricultural businesses — extending it to employees in general is an inference, not a reading.' },
          { it: 'Di questo documento non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for this document.' },
        ],
      },
      {
        atto: 'DL 19/09/1992 n. 384, conv. con mod. dalla L. 14/11/1992 n. 438',
        riferimento: 'art. 3-ter',
        dispone:
          { it: 'Aggiunge un punto percentuale di contributo sulla parte di retribuzione che supera la prima fascia di retribuzione pensionabile, per i regimi che prevedono aliquote a carico del lavoratore inferiori al 10 per cento.', en: 'Adds one percentage point of contribution on the part of pay above the first pensionable earnings band, for schemes whose employee rate is below 10 per cent.' },
        vigenza: { it: 'dal 19/11/1992, con decorrenza degli effetti dal 1° gennaio 1993', en: 'in force from 19 Nov 1992, taking effect from 1 January 1993' },
        ultimaModifica:
          { it: 'L. 14/11/1992 n. 438, in sede di conversione. Mai modificato dopo.', en: 'L. 14/11/1992 n. 438, on conversion into law. Never amended since.' },
        effetto:
          { it: 'È l’unica soglia sul versante contributivo: sotto la prima fascia i contributi sono una moltiplicazione, sopra il ramo acquista la stessa forma di quello fiscale.', en: 'It is the only threshold on the contributions side: below the first band contributions are a multiplication, above it the branch takes on the same shape as the tax one.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {2E278145-81A8-4B7C-9ED2-7A9CAF61DA6C}, Articolo 3 ter',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Il testo non attribuisce il contributo al lavoratore dipendente. L’attribuzione espressa esiste solo per i lavoratori autonomi; per i dipendenti la fonte del soggetto passivo è la circolare INPS. La citazione è doppia per necessità, non per eleganza.', en: 'The text does not attribute the contribution to the employee. The express attribution exists only for the self-employed; for employees the source for who bears it is the INPS circular. The double citation is a necessity, not an elegance.' },
          { it: 'Il rinvio per la soglia non arriva a destinazione: rimanda all’art. 21 c. 6 della L. 67/1988, che a sua volta rinvia a una tabella allegata che non è nell’export dell’atto.', en: 'The cross-reference for the threshold does not reach its destination: it points to art. 21 c. 6 of L. 67/1988, which in turn points to an annexed table that is not in the exported act.' },
          { it: 'La condizione del 10 per cento è riferita al regime pensionistico, non al singolo lavoratore: la verifica va fatta sull’aliquota ordinaria del regime, non su quella ridotta dell’apprendista.', en: 'The 10 per cent condition refers to the pension scheme, not to the individual worker: the check is made against the scheme’s ordinary rate, not against the reduced apprenticeship one.' },
          { it: 'L’articolo non ha commi: è un unico periodo non numerato, quindi la citazione corretta non indica un comma.', en: 'The article has no subsections: it is a single unnumbered sentence, so the correct citation does not name one.' },
          { it: 'Domanda che resta aperta: se l’1% aggiuntivo generi montante pensionistico. Il testo non lo dice, e la risposta starebbe nella disciplina del calcolo della pensione, non nella norma istitutiva.', en: 'An open question: whether the additional 1% builds pension entitlement. The text does not say, and the answer would lie in the rules for computing the pension, not in the rule that created the contribution.' },
        ],
      },
      {
        atto: 'L. 11/03/1988 n. 67',
        riferimento: 'art. 21 c. 6',
        dispone:
          { it: 'Dispone che la retribuzione oltre il limite massimo pensionabile sia computata secondo le aliquote di una tabella allegata, e che la pensione così ottenuta diventi parte integrante di quella ordinaria.', en: 'Provides that pay above the maximum pensionable limit is computed at the rates of an annexed table, and that the pension so obtained becomes an integral part of the ordinary one.' },
        effetto:
          { it: 'È la norma a cui rinvia il contributo aggiuntivo dell’1%, ma non porta al parametro: non fissa la soglia, non dice chi la fissa, e non contiene mai l’espressione «prima fascia». Il valore in euro sta quindi in una circolare annuale.', en: 'It is the rule the additional 1% contribution refers to, but it does not lead to the figure: it does not set the threshold, does not say who sets it, and never uses the phrase “first band”. The amount in euros therefore lives in an annual circular.' },
        consultata: '2026-08-27',
        note: [
          { it: 'La tabella allegata a cui il comma rinvia non è presente nell’export dell’atto: la catena dei rinvii si interrompe lì.', en: 'The table the subsection refers to is not present in the exported act: the chain of cross-references breaks there.' },
          { it: 'Verifica svolta sull’intero atto: «prima fascia» compare zero volte, «retribuzione pensionabile» zero volte.', en: 'Checked across the whole act: “prima fascia” appears zero times, “retribuzione pensionabile” zero times.' },
          { it: 'Dà però un elemento in senso opposto: la retribuzione oltre la prima fascia è comunque pensionabile, il che sposta l’onere argomentativo sul dubbio circa l’1%.', en: 'It does give one element pointing the other way: pay above the first band is pensionable all the same, which shifts the burden of argument onto the doubt about the 1%.' },
        ],
      },
      {
        atto: 'INPS, circolare n. 6 del 30/01/2026',
        riferimento: 'par. 5 e 6',
        dispone:
          { it: 'Fissa per il 2026 la prima fascia di retribuzione pensionabile a 56.224,00 euro e il massimale della base contributiva a 122.295,00 euro, e conferma che il contributo aggiuntivo dell’1% è a carico del lavoratore.', en: 'Sets, for 2026, the first pensionable earnings band at 56,224.00 euros and the cap on the contributory base at 122,295.00 euros, and confirms that the additional 1% contribution is borne by the employee.' },
        effetto:
          { it: 'Dà il valore della soglia oltre la quale scatta il contributo aggiuntivo — il numero che la legge non contiene.', en: 'It gives the value of the threshold above which the additional contribution starts — the number the statute does not contain.' },
        consultata: '2026-08-27',
        note: [
          { it: 'Il massimale opera anche ai fini dell’1%: sopra 122.295 il contributo aggiuntivo si ferma. Il calcolatore non modella il massimale, perché dipende dalla data di prima iscrizione previdenziale, e assume quindi un lavoratore iscritto prima del 1996.', en: 'The cap applies to the 1% as well: above 122,295 the additional contribution stops. The calculator does not model the cap, because it depends on the date of first registration with the social security system, and it therefore assumes someone registered before 1996.' },
          { it: 'Il contributo aggiuntivo segue il criterio della mensilizzazione, mese per mese sulla quota eccedente 4.685 euro. Il calcolatore adotta l’equivalente annuo, che è il risultato a cui il conguaglio di fine anno dovrebbe ricondurre.', en: 'The additional contribution follows a month-by-month rule, on the part above 4,685 euros each month. The calculator uses the annual equivalent, which is what the year-end reconciliation should arrive at.' },
          { it: 'Il massimale è quello dell’art. 2 c. 18, secondo periodo, della L. 08/08/1995 n. 335, rivalutato sull’indice ISTAT dei prezzi al consumo per famiglie di operai e impiegati. Valore 2026: 122.295,40, arrotondato a 122.295,00.', en: 'The cap is the one in art. 2 c. 18, second sentence, of L. 08/08/1995 n. 335, revalued on the ISTAT consumer price index for blue- and white-collar households. 2026 value: 122,295.40, rounded to 122,295.00.' },
          { it: 'Di questo documento non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for this document.' },
        ],
      },
      {
        atto: 'L. 28/02/1986 n. 41',
        riferimento: 'art. 21',
        dispone:
          { it: 'Estende agli apprendisti la disciplina contributiva della generalità dei lavoratori dipendenti, con una riduzione di tre punti dell’aliquota.', en: 'Extends to apprentices the contribution rules applying to employees generally, with a three-point reduction in the rate.' },
        vigenza: { it: 'dal 28/02/1986', en: 'in force from 28 Feb 1986' },
        effetto:
          { it: 'È la ragione per cui l’apprendistato cambia davvero il netto, mentre tempo determinato e indeterminato no. Non fissa un’aliquota propria: sottrae tre punti a quella ordinaria, quindi è un rinvio che si muove da sé se l’aliquota ordinaria cambia.', en: 'It is the reason an apprendistato really does change net pay, while fixed-term and permanent do not. It sets no rate of its own: it subtracts three points from the ordinary one, so it is a cross-reference that moves by itself if the ordinary rate changes.' },
        consultata: '2026-08-28',
        note: [
          { it: 'La lettera b) dell’articolo è esaurita: riduceva il contributo per il Servizio sanitario nazionale, e quei contributi sono stati aboliti dall’art. 36 c. 1 lett. a) del D.Lgs. 446/1997.', en: 'Letter b) of the article is spent: it reduced the contribution for the national health service, and those contributions were abolished by art. 36 c. 1 lett. a) of D.Lgs. 446/1997.' },
          { it: 'Che i tre punti si applichino alla base 8,84% e non alla 9,19% è una derivazione aritmetica, non un’affermazione delle fonti: nessuna delle due lo scrive. Il valore finale del 5,84% è invece dichiarato testualmente.', en: 'That the three points come off the 8.84% base and not the 9.19% one is an arithmetical derivation, not a statement of the sources: neither of them writes it. The final 5.84% figure, by contrast, is stated in so many words.' },
          { it: 'Di questo atto non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for this act.' },
        ],
      },
      {
        atto: 'INPS, messaggio n. 3618 del 17/10/2023 e circolare n. 70 del 15/06/2022',
        dispone:
          { it: 'Dichiarano che l’aliquota a carico dell’apprendista è pari al 5,84% della retribuzione imponibile, per tutta la durata del periodo di formazione e per un anno dalla prosecuzione del rapporto.', en: 'They state that the apprentice’s rate is 5.84% of contributory earnings, for the whole training period and for one year after the relationship continues.' },
        effetto:
          { it: 'Dà il valore dell’aliquota dell’apprendista. La circolare 70/2022 aggiunge che quell’aliquota «rimane» tale anche dove il datore è integralmente esonerato: nessuna agevolazione a carico dell’azienda tocca il lavoratore.', en: 'It gives the value of the apprentice’s rate. Circular 70/2022 adds that the rate “remains” the same even where the employer is fully exempted: no relief granted to the company touches the worker.' },
        consultata: '2026-08-28',
        note: [
          { it: 'I codici Uniemens lo mostrano dall’altro lato: l’aliquota a carico del datore varia con l’anzianità di apprendistato, quella del lavoratore no. Basta quindi sapere che il contratto è di apprendistato, senza chiedere l’anno né la dimensione aziendale.', en: 'The Uniemens codes show it from the other side: the employer’s rate varies with length of apprenticeship, the employee’s does not. It is therefore enough to know that the contract is an apprenticeship, without asking the year or the size of the company.' },
          { it: 'Il messaggio cita l’art. 47 c. 7 del D.Lgs. 81/2015, che estende il 5,84% per un anno dalla prosecuzione del rapporto. Quell’articolo però non l’abbiamo letto alla fonte: il testo consultato era l’art. 47-septies, che è tutt’altra disposizione.', en: 'The message cites art. 47 c. 7 of D.Lgs. 81/2015, which extends the 5.84% for one year after the relationship continues. We have not read that article at source, though: the text we consulted was art. 47-septies, which is an entirely different provision.' },
          { it: 'Ne discende un limite dichiarato del calcolatore: chi ha concluso un apprendistato da meno di un anno risulta a tempo indeterminato e riceve l’aliquota piena, quindi il suo netto reale è più alto di quello calcolato.', en: 'A declared limit of the calculator follows: anyone who finished an apprenticeship less than a year ago shows up as permanent and gets the full rate, so their real net pay is higher than the one calculated.' },
          { it: 'Di questi documenti non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for these documents.' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'imponibile',
    titolo: { it: 'Dal lordo all’imponibile', en: 'From gross pay to the taxable base' },
    occhiello:
      { it: 'Il passaggio che decide su quale cifra si calcolano le imposte. È corto — poche norme — ma se si sbaglia qui sbaglia tutto quello che viene dopo.', en: 'The step that decides which figure the taxes are computed on. It is short — a handful of rules — but get it wrong and everything downstream is wrong.' },
    schede: [
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 51 c. 2 lett. a)',
        dispone:
          { it: 'Stabilisce che i contributi previdenziali e assistenziali obbligatori non concorrono a formare il reddito.', en: 'Provides that compulsory social security and welfare contributions do not form part of taxable income.' },
        vigenza: { it: 'dal 23/05/2026', en: 'in force from 23 May 2026' },
        ultimaModifica: { it: 'DL 27/03/2026 n. 38, art. 2-bis', en: 'DL 27/03/2026 n. 38, art. 2-bis' },
        effetto:
          { it: 'È la ragione per cui il reddito su cui si pagano le imposte nasce già al netto dei contributi. I contributi non sono una deduzione ma un’esclusione, e da qui discende che pesano più del loro valore nominale: abbassano anche l’imposta.', en: 'It is the reason the income you pay tax on is already net of contributions. Contributions are not a deduction but an exclusion, and it follows that they weigh more than their face value: they bring the tax down too.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 1 dello stesso articolo determina il reddito per cassa allargata: contano le somme percepite nell’anno, più quelle corrisposte entro il 12 gennaio successivo. È la ragione per cui il progetto non usa la parola «competenza», che appartiene ai redditi d’impresa.', en: 'Subsection 1 of the same article sets income on an extended cash basis: what counts is the sums received in the year, plus those paid by 12 January of the following one. It is the reason this project never uses the word “accrual”, which belongs to business income.' },
          { it: 'La lett. h) esclude dal reddito le somme trattenute per oneri deducibili: per un dipendente gli oneri sono neutralizzati alla fonte, e non è una coincidenza numerica se le due basi coincidono.', en: 'Letter h) excludes from income the sums withheld for deductible charges: for an employee those charges are neutralised at source, and it is no numerical coincidence that the two bases coincide.' },
          { it: 'La modifica del DL 38/2026 riguarda il c. 8-bis, sulle retribuzioni convenzionali per lavoro all’estero: nessuno dei commi che contano per questo calcolo è toccato.', en: 'The 2026 amendment concerns subsection 8-bis, on notional pay for work abroad: none of the subsections that matter for this calculation is touched.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 3',
        dispone:
          { it: 'Definisce la base imponibile dell’imposta: il reddito complessivo al netto degli oneri deducibili.', en: 'Defines the taxable base of the tax: total income net of deductible charges.' },
        vigenza: { it: 'dal 23/05/2026', en: 'in force from 23 May 2026' },
        ultimaModifica: { it: 'DL 27/03/2026 n. 38, art. 2-bis', en: 'DL 27/03/2026 n. 38, art. 2-bis' },
        effetto:
          { it: 'È la formula da cui parte il conto delle imposte. Nel caso standard gli oneri deducibili valgono zero, quindi la base coincide con il reddito complessivo.', en: 'It is the formula the tax calculation starts from. In the standard case deductible charges are zero, so the base coincides with total income.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'La modifica del 2026 va nel c. 3, che è l’elenco delle esclusioni oggettive, e riguarda i lavoratori marittimi. Il c. 1, cioè la formula, non è toccato.', en: 'The 2026 amendment sits in subsection 3, which is the list of objective exclusions, and concerns seafarers. Subsection 1, that is the formula, is untouched.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 49',
        dispone:
          { it: 'Definisce quali redditi sono di lavoro dipendente, per la loro provenienza e non per il loro importo.', en: 'Defines which income is employment income, by where it comes from and not by how much it is.' },
        effetto:
          { it: 'Individua chi ha diritto alle misure sul cuneo, che spettano ai titolari di reddito di lavoro dipendente ed escludono i redditi di pensione.', en: 'It identifies who is entitled to the tax wedge measures, which go to holders of employment income and exclude pension income.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Il testo è fermo dal 2004, ma la data di vigenza non l’abbiamo registrata.', en: 'The text has been unchanged since 2004, but we did not record the date in force.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 8',
        dispone: { it: 'Definisce il reddito complessivo come somma dei redditi di ogni categoria.', en: 'Defines total income as the sum of income of every category.' },
        effetto:
          { it: 'Nel caso standard il reddito complessivo coincide con il solo reddito di lavoro dipendente. È la grandezza su cui si misurano le fasce delle detrazioni e le soglie del cuneo.', en: 'In the standard case total income coincides with employment income alone. It is the figure the tax credit bands and the tax wedge thresholds are measured against.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 10 c. 3-bis',
        dispone:
          { it: 'Prevede la deduzione del reddito dell’abitazione principale fino alla rendita catastale.', en: 'Provides for a deduction of the income of the main residence up to its cadastral value.' },
        effetto:
          { it: 'Non entra nel calcolo direttamente, ma spiega perché le grandezze di reddito coincidono anche per chi possiede la casa in cui vive: è il meccanismo a cui rinviano sei istituti diversi con la stessa formula.', en: 'It does not enter the calculation directly, but it explains why the income figures coincide even for someone who owns the home they live in: it is the mechanism six different rules cross-refer to with the same formula.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'irpef',
    titolo: { it: 'IRPEF e detrazioni', en: 'IRPEF and tax credits' },
    occhiello:
      { it: 'L’imposta sul reddito e gli sconti che la riducono. È il ramo più lungo, ed è quello in cui si concentrano quasi tutte le soglie del sistema.', en: 'The income tax and the reliefs that reduce it. It is the longest branch, and the one where almost every threshold in the system is concentrated.' },
    schede: [
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 11',
        dispone:
          { it: 'Fissa gli scaglioni e le aliquote dell’imposta — 23% fino a 28.000, 33% fino a 50.000, 43% oltre — e stabilisce che le detrazioni si operano sull’imposta lorda fino alla concorrenza del suo ammontare.', en: 'Sets the brackets and rates of the tax — 23% up to 28,000, 33% up to 50,000, 43% above — and provides that credits are applied against gross tax up to its full amount.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 3', en: 'L. 30/12/2025 n. 199, art. 1 c. 3' },
        effetto:
          { it: 'Determina quanta imposta si deve prima degli sconti, e fissa il limite per cui le detrazioni non possono portare l’imposta sotto zero: se valgono più dell’imposta, l’eccedenza si perde.', en: 'It determines how much tax is due before reliefs, and sets the limit under which credits cannot push the tax below zero: if they are worth more than the tax, the excess is lost.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'La modifica del 2026 ha sostituito l’aliquota centrale del 35% con il 33%: i confini degli scaglioni non sono cambiati.', en: 'The 2026 amendment replaced the middle rate of 35% with 33%: the bracket boundaries did not change.' },
          { it: 'Il pavimento a zero del c. 3 non è un principio dedotto ma una citazione, e l’elenco si chiude con «nonché in altre disposizioni di legge» — formula che copre anche le detrazioni nate fuori dal testo unico.', en: 'The floor at zero in subsection 3 is not a principle we inferred but a quotation, and the list closes with “and in other provisions of law” — wording that also covers credits created outside the consolidated act.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 13',
        dispone:
          { it: 'Riconosce a chi ha reddito di lavoro dipendente una detrazione che decresce al crescere del reddito, con un importo fisso in più nella fascia intermedia.', en: 'Grants those with employment income a credit that tapers as income rises, with a fixed extra amount in the middle band.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        ultimaModifica: { it: 'L. 30/12/2024 n. 207, art. 1 c. 2', en: 'L. 30/12/2024 n. 207, art. 1 c. 2' },
        effetto:
          { it: 'È lo sconto principale sull’imposta. Si calcola sul reddito complessivo, non sull’imponibile, e nella fascia in cui decresce ogni euro in più di reddito viene tassato e riduce anche la detrazione.', en: 'It is the main relief against the tax. It is computed on total income, not on the taxable base, and in the band where it tapers every extra euro of income is both taxed and shrinks the credit.' },
        portale: 'def.finanze.it — Documentazione Economica e Finanziaria (MEF)',
        url: 'https://def.finanze.it/DocTribFrontend/getAttoNormativoDetail.do?ACTION=getArticolo&id=%7B31D694E8-4398-4030-873B-FEAF5A6647F9%7D&codiceOrdinamento=0000000000000130000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&articolo=Articolo%2013',
        consultata: '2026-08-27',
        note: [
          { it: 'Attraversando i 15.000 euro di reddito complessivo la detrazione sale di circa 1.145 euro: è una discontinuità nella direzione contraria a quella che ci si aspetta.', en: 'Crossing 15,000 euros of total income the credit rises by about 1,145 euros: a discontinuity running in the opposite direction to the one you would expect.' },
          { it: 'Il c. 6 impone di assumere il risultato dei rapporti nelle prime quattro cifre decimali. Non è un arrotondamento di busta paga: è parte della formula.', en: 'Subsection 6 requires the result of the ratios to be taken to the first four decimal places. This is not payslip rounding: it is part of the formula.' },
          { it: 'Il troncamento non è una peculiarità di questa detrazione: la stessa formula compare identica all’art. 12 c. 4, ed è una convenzione del testo unico per le detrazioni a formula.', en: 'The truncation is not peculiar to this credit: the same wording appears identically in art. 12 c. 4, and it is a convention of the consolidated act for formula-based credits.' },
          { it: 'Ambiguità dichiarata: il testo non dice se l’importo fisso della fascia intermedia si ragguagli al periodo di lavoro prima o dopo essere stato sommato. Sotto l’assunzione di anno intero non cambia nulla.', en: 'A declared ambiguity: the text does not say whether the fixed amount for the middle band is pro-rated to the period worked before or after being added in. Under the whole-year assumption nothing changes.' },
          { it: 'Che nessun atto del 2025 o del 2026 abbia toccato questo articolo è verificato da due lati: dalle note in calce e dal testo della legge che avrebbe potuto toccarlo.', en: 'That no act of 2025 or 2026 touched this article is verified from two sides: from the footnotes and from the text of the law that could have touched it.' },
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 6',
        dispone:
          { it: 'Riconosce un’ulteriore detrazione dall’imposta lorda a chi ha un reddito complessivo fra 20.000 e 40.000 euro: 1.000 euro fino a 32.000, poi decrescente fino ad azzerarsi.', en: 'Grants a further credit against gross tax to those with total income between 20,000 and 40,000 euros: 1,000 euros up to 32,000, then tapering to zero.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'È la seconda gamba del taglio del cuneo fiscale. Sotto i 20.000 euro il beneficio esiste ma ha un’altra forma — è una somma erogata, non uno sconto sull’imposta.', en: 'It is the second leg of the cuneo fiscale (tax wedge) cut. Below 20,000 euros the benefit exists but takes another shape — it is a cash payment, not a relief against tax.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}, Articolo 1 com 6',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'È una detrazione vera e non porta alcuna deroga, quindi ricade nella regola generale dell’art. 11 c. 3: si consuma sull’imposta lorda e non genera credito.', en: 'It is a genuine tax credit and carries no derogation, so it falls under the general rule of art. 11 c. 3: it is consumed against gross tax and generates no refund.' },
          { it: 'Nella fascia fra 32.000 e 40.000 euro agiscono insieme tre riduzioni — l’aliquota del 33%, la decrescenza della detrazione dell’art. 13 e quella di questa — per un prelievo effettivo su ogni euro in più attorno al 54%, prima delle addizionali.', en: 'In the band between 32,000 and 40,000 euros three reductions act together — the 33% rate, the taper of the art. 13 credit and the taper of this one — for an effective take on every extra euro of around 54%, before the addizionali.' },
          { it: 'Il raccordo con la somma sotto i 20.000 è calibrato e leggermente favorevole: superando la soglia non si perde nulla, si guadagnano circa 40 euro.', en: 'The join with the cash payment below 20,000 is calibrated and slightly favourable: crossing the threshold you lose nothing, you gain about 40 euros.' },
          { it: 'Controllando la vigenza comma per comma risulta che i commi 2–10 della legge non sono mai stati modificati da alcun atto successivo.', en: 'Checking the dates subsection by subsection shows that subsections 2–10 of the law have never been amended by any later act.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 12',
        dispone:
          { it: 'Disciplina le detrazioni per coniuge e figli a carico, a condizione che il familiare abbia un reddito proprio sotto una soglia.', en: 'Governs the credits for a dependent spouse and children, on condition that the family member’s own income is below a threshold.' },
        vigenza: { it: 'dal 20/12/2025', en: 'in force from 20 Dec 2025' },
        ultimaModifica: { it: 'D.Lgs. 18/12/2025 n. 192, art. 1', en: 'D.Lgs. 18/12/2025 n. 192, art. 1' },
        effetto:
          { it: 'Resta fuori dal calcolo, e l’articolo serve a difendere l’esclusione invece che a implementarla: la detrazione dipende dal reddito di un’altra persona, che dalla busta paga non si vede.', en: 'It stays outside the calculation, and the article serves to defend the exclusion rather than to implement it: the credit depends on another person’s income, which a payslip does not show.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Per i figli sotto i 21 anni la detrazione non esiste più, e il comma che prevedeva l’ulteriore detrazione per famiglie numerose è stato abrogato dal D.Lgs. 29/12/2021 n. 230 — il decreto che ha istituito l’Assegno Unico. L’abrogazione porta la firma dell’atto che l’ha sostituita.', en: 'For children under 21 the credit no longer exists, and the subsection providing the further credit for large families was repealed by D.Lgs. 29/12/2021 n. 230 — the decree that created the Assegno Unico (single family allowance). The repeal bears the signature of the act that replaced it.' },
          { it: 'Il c. 4 contiene un terzo limite, distinto dagli altri due del sistema: se i rapporti sono pari a zero, minori di zero o uguali a uno, le detrazioni non spettano.', en: 'Subsection 4 contains a third limit, distinct from the other two in the system: if the ratios come out at zero, below zero or equal to one, the credits are not due.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 16-ter',
        dispone:
          { it: 'Pone un tetto complessivo agli oneri e alle spese detraibili per chi ha un reddito complessivo sopra i 75.000 euro, e ne riduce l’ammontare sopra i 200.000.', en: 'Sets an overall ceiling on deductible charges and expenses for those with total income above 75,000 euros, and reduces the amount above 200,000.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 4', en: 'L. 30/12/2025 n. 199, art. 1 c. 4' },
        effetto:
          { it: 'Non tocca questo calcolo, e la ragione è testuale: il tetto riguarda «oneri e spese», mentre la detrazione per lavoro dipendente e quella da cuneo sono legate al tipo di reddito e non a un esborso.', en: 'It does not touch this calculation, and the reason is textual: the ceiling concerns “charges and expenses”, whereas the employment income credit and the tax wedge credit are tied to the type of income and not to an outlay.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Sono tre i meccanismi sovrapposti che limitano le detrazioni ai redditi alti — art. 15 c. 3-bis, art. 16-ter c. 1–5 e art. 16-ter c. 5-bis — e nessuno dei tre tocca le detrazioni legate alla tipologia di reddito.', en: 'Three overlapping mechanisms limit credits for higher incomes — art. 15 c. 3-bis, art. 16-ter c. 1–5 and art. 16-ter c. 5-bis — and none of the three touches credits tied to the type of income.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 15',
        dispone: { it: 'Disciplina le detrazioni per oneri e spese sostenute dal contribuente.', en: 'Governs the credits for charges and expenses borne by the taxpayer.' },
        effetto:
          { it: 'Resta fuori: nel caso standard gli oneri detraibili valgono zero. Ne teniamo i commi 3-bis e 3-ter, che servono a delimitare l’art. 16-ter.', en: 'It stays outside: in the standard case deductible expenses are zero. We keep subsections 3-bis and 3-ter, which serve to bound art. 16-ter.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 165',
        dispone: { it: 'Riconosce un credito per le imposte pagate all’estero sui redditi ivi prodotti.', en: 'Grants a credit for taxes paid abroad on income produced there.' },
        vigenza: { it: 'dal 07/10/2015', en: 'in force from 7 Oct 2015' },
        effetto:
          { it: 'Nel caso standard vale zero, ma è il riferimento esatto della condizione che accende l’addizionale comunale, che guarda l’imposta al netto delle detrazioni e di questo credito.', en: 'In the standard case it is zero, but it is the exact reference in the condition that switches on the addizionale comunale, which looks at the tax net of credits and of this relief.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'addizionali',
    titolo: { it: 'Addizionale regionale e comunale', en: 'Addizionale regionale e comunale' },
    occhiello:
      { it: 'Le stesse imposte, incassate da Regione e Comune. Hanno la base dell’IRPEF ma una disciplina propria — e due norme istitutive che, lette una accanto all’altra, non si somigliano quanto ci si aspetterebbe.', en: 'The same tax, collected by the region and the municipality. They share the IRPEF base but have rules of their own — and two founding provisions which, read side by side, resemble each other less than you would expect.' },
    schede: [
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 50',
        dispone:
          { it: 'Istituisce l’addizionale regionale, la fissa allo 0,9% e consente a ciascuna regione di maggiorarla fino all’1,4%, e stabilisce che è dovuta soltanto se per lo stesso anno l’IRPEF risulta dovuta.', en: 'Creates the addizionale regionale, sets it at 0.9% and lets each region raise it to 1.4%, and provides that it is due only if IRPEF is itself due for the same year.' },
        vigenza: { it: 'dal 13/12/2014', en: 'in force from 13 Dec 2014' },
        ultimaModifica: { it: 'D.Lgs. 21/11/2014 n. 175, art. 8', en: 'D.Lgs. 21/11/2014 n. 175, art. 8' },
        effetto:
          { it: 'Determina quando l’addizionale regionale si paga e su quale base. La condizione è binaria: se l’imposta è dovuta si applica sull’intera base, se non lo è non si applica affatto.', en: 'It determines when the addizionale regionale is paid and on what base. The condition is binary: if the tax is due it applies to the whole base, if it is not it does not apply at all.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
        note: [
          { it: 'Due rinvii alla numerazione del TUIR anteriore al 2004. Il c. 2 rinvia ai crediti «di cui agli articoli 14 e 15», che oggi non hanno più quel contenuto; il c. 4 rinvia ai redditi di lavoro dipendente «di cui agli articoli 46 e 47», che oggi sono il 49 e il 50. La norma gemella sull’addizionale comunale è stata riallineata, questa no — e sono state modificate dallo stesso atto nello stesso giorno.', en: 'Two cross-references to the pre-2004 numbering of the TUIR. Subsection 2 refers to the credits “under articles 14 and 15”, which no longer carry that content; subsection 4 refers to employment income “under articles 46 and 47”, which today are 49 and 50. The twin provision on the addizionale comunale was realigned, this one was not — and both were amended by the same act on the same day.' },
          { it: 'Il tetto dell’1,4% è derogato in modo massiccio: sul prospetto ministeriale 47 aliquote lo superano e 15 enti su 21 ne hanno almeno una sopra il tetto. Solo due citano il disavanzo sanitario. La norma che autorizza la deroga non è stata reperita, e un controllo che tagliasse le aliquote a 1,4 corromperebbe quasi tutto il centro-sud.', en: 'The 1.4% ceiling is derogated from on a large scale: on the ministerial table 47 rates exceed it and 15 authorities out of 21 have at least one above the ceiling. Only two cite a healthcare deficit. We have not traced the rule authorising the derogation, and a check that capped rates at 1.4 would corrupt almost the whole of central and southern Italy.' },
          { it: 'Il massimo del prospetto e il massimo applicato non coincidono, e la differenza non è un arrotondamento. Il prospetto arriva al 3,63% del Molise, ma il calcolatore applica al massimo il 3,33%: il 3,63 sta su un secondo provvedimento molisano pubblicato il 19/06/2026, e l’aliquota di un anno si prende dal provvedimento pubblicato per primo in quell’anno. Quello di giugno è tempestivo per il 2027, non tardivo per il 2026. Riguarda due enti su ventuno — Molise e Puglia — che hanno due provvedimenti ciascuno.', en: 'The highest rate on the table and the highest rate applied are not the same, and the gap is not rounding. The table reaches Molise’s 3.63%, but the calculator applies at most 3.33%: the 3.63 sits on a second Molise measure published on 19 June 2026, and a year’s rate is taken from the measure published first in that year. June’s is timely for 2027, not late for 2026. It affects two authorities out of twenty-one — Molise and Puglia — which have two measures each.' },
          { it: 'L’aliquota di un anno non è congelata: il c. 3 consente a una regione di applicare retroattivamente una maggiorazione più favorevole al periodo d’imposta in corso. Il dato di un anno non è definitivo mentre quell’anno è in corso, e può cambiare solo in meglio.', en: 'A given year’s rate is not frozen: subsection 3 lets a region apply a more favourable increase retroactively to the tax year in progress. A year’s figure is not final while that year is running, and it can only change for the better.' },
          { it: 'Contraddizione interna: il c. 2 individua l’aliquota con la residenza, il c. 5 destina il gettito al domicilio fiscale al 1° gennaio. Due criteri diversi nella stessa norma.', en: 'An internal contradiction: subsection 2 identifies the rate by residence, subsection 5 allocates the revenue by tax domicile on 1 January. Two different criteria in the same provision.' },
          { it: 'Sul testo dell’art. 50 non risultano né soglie di esenzione né detrazioni regionali — e l’argomento dal silenzio, su questo articolo, ha ormai fallito tre volte. Non conosce gli scaglioni, che le regioni usano; non conosce le detrazioni, che i dati ministeriali mostrano per otto enti; non conosce la soglia di esenzione, che la Valle d’Aosta applica ai redditi fino a 15.000 e che il calcolatore applica. L’assenza di una previsione nella norma statale non dice nulla su cosa gli enti deliberano.', en: 'On the text of art. 50 there is neither an exemption threshold nor any regional credit — and the argument from silence, on this article, has now failed three times. It does not know about brackets, which the regions use; it does not know about credits, which the ministerial data show for eight authorities; it does not know about the exemption threshold, which Valle d’Aosta applies to incomes up to 15,000 and which the calculator applies. The absence of a provision in the national rule says nothing about what the authorities enact.' },
        ],
      },
      {
        atto: 'D.Lgs. 28/09/1998 n. 360',
        riferimento: 'art. 1',
        dispone:
          { it: 'Istituisce l’addizionale comunale, la calcola sul reddito complessivo al netto degli oneri deducibili, la subordina al fatto che l’IRPEF risulti dovuta, e consente al Comune una soglia di esenzione per requisiti reddituali.', en: 'Creates the addizionale comunale, computes it on total income net of deductible charges, makes it conditional on IRPEF being due, and lets the municipality set an exemption threshold based on income requirements.' },
        vigenza: { it: 'art. 1 dal 13/12/2014; artt. 2 e 3 dal 18/05/1999', en: 'art. 1 in force from 13 Dec 2014; artt. 2 and 3 from 18 May 1999' },
        ultimaModifica: { it: 'D.Lgs. 21/11/2014 n. 175, art. 8', en: 'D.Lgs. 21/11/2014 n. 175, art. 8' },
        effetto:
          { it: 'Determina quando si paga l’addizionale comunale e su quale base, e autorizza la soglia sotto la quale un Comune può non farla pagare affatto. Il Comune è quello del domicilio fiscale al 1° gennaio: chi trasloca a marzo paga per tutto l’anno al Comune di partenza.', en: 'It determines when the addizionale comunale is paid and on what base, and authorises the threshold below which a municipality may not charge it at all. The municipality is the one of tax domicile on 1 January: someone who moves in March pays for the whole year to the municipality they left.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
        note: [
          { it: 'La soglia di esenzione è un limite secco e non una franchigia: superata di un euro, l’addizionale si paga sull’intero reddito e non sull’eccedenza. La lettura è confermata dal modello dati ministeriale, che la espone come «esenzione per redditi imponibili fino a euro X».', en: 'The exemption threshold is a hard limit and not an allowance: one euro over it and the addizionale is paid on the whole income, not on the excess. The reading is confirmed by the ministerial data model, which presents it as “exemption for taxable income up to X euros”.' },
          { it: 'Il c. 8 prevede che per quanto non disciplinato si applichino le regole dell’IRPEF. Non ne discende che le detrazioni abbattano l’addizionale: il rinvio copre ciò che non è disciplinato, e base e presupposto sono disciplinati espressamente.', en: 'Subsection 8 provides that, for whatever is not governed expressly, the IRPEF rules apply. It does not follow that tax credits reduce the addizionale: the cross-reference covers what is not governed, and both the base and the condition are governed expressly.' },
          { it: 'Ambiguità di lungo corso: il testo descrive l’aliquota comunale come variazione su una compartecipazione statale che avrebbe dovuto essere fissata con decreto. La nostra conclusione è che quella compartecipazione non sia mai stata attivata, perché il decreto avrebbe dovuto ridurre contestualmente le aliquote IRPEF e nell’art. 11 quella riduzione non c’è.', en: 'A long-standing ambiguity: the text describes the municipal rate as a variation on a share of state tax that was supposed to be fixed by decree. Our conclusion is that the shared portion was never activated, because the decree would have had to cut the IRPEF rates at the same time, and in art. 11 that cut is nowhere to be found.' },
          { it: 'La quota provinciale non è una seconda aliquota da sommare: vive dentro la compartecipazione statale, e Comune e Provincia se la dividono a valle.', en: 'The provincial share is not a second rate to be added on: it lives inside the state shared portion, and the municipality and the province divide it downstream.' },
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 727 e 728',
        dispone:
          { it: 'Consente a regioni e province autonome di applicare aliquote differenziate sugli scaglioni IRPEF in vigore prima del 2025, e stabilisce che l’ente che non delibera applica scaglioni e aliquote già vigenti nell’anno precedente.', en: 'Lets regions and autonomous provinces apply differentiated rates on the IRPEF brackets in force before 2025, and provides that an authority which does not adopt new figures applies the brackets and rates already in force the previous year.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 649', en: 'L. 30/12/2025 n. 199, art. 1 c. 649' },
        effetto:
          { it: 'Determina quali strutture di aliquota un ente può usare, e cosa si applica quando non delibera. Il fallback non è aliquota zero: è la prosecuzione dell’anno precedente.', en: 'It determines which rate structures an authority may use, and what applies when it adopts nothing. The fallback is not a zero rate: it is the previous year carrying on.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Il comma attribuisce la potestà a «le regioni e le province autonome di Trento e di Bolzano». Ne discende che per un comune del Trentino-Alto Adige l’ente che fissa l’addizionale «regionale» non è la regione: sono le due province, separatamente. Il prospetto ministeriale le porta come righe distinte, e il Trentino-Alto Adige come ente impositore non esiste.', en: 'The subsection confers the power on “the regions and the autonomous provinces of Trento and Bolzano”. It follows that for a municipality in Trentino-Alto Adige the authority setting the “regional” surcharge is not the region: it is the two provinces, separately. The ministerial table carries them as distinct rows, and Trentino-Alto Adige as a levying authority does not exist.' },
          { it: 'Gli scaglioni delle addizionali non sono quelli dell’IRPEF: l’ente sceglie fra due set autorizzati. Riusare le costanti dell’IRPEF produce numeri plausibili e sbagliati.', en: 'The brackets of the addizionali are not the IRPEF ones: the authority picks between two authorised sets. Reusing the IRPEF constants produces plausible, wrong numbers.' },
          { it: 'Sulle 21 righe del prospetto regionale le uniche soglie usate sono 15.000, 28.000 e 50.000: nessun ente si è inventato soglie proprie.', en: 'Across the 21 rows of the regional table the only thresholds used are 15,000, 28,000 and 50,000: no authority has invented thresholds of its own.' },
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 751 e 752',
        dispone:
          { it: 'Fa per i Comuni quello che i commi 727 e 728 fanno per le regioni: autorizza gli scaglioni previgenti e stabilisce che chi non delibera applica l’anno precedente.', en: 'Does for municipalities what subsections 727 and 728 do for regions: authorises the previous brackets and provides that an authority adopting nothing applies the previous year.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 650', en: 'L. 30/12/2025 n. 199, art. 1 c. 650' },
        effetto:
          { it: 'È la norma che regge il caso base del calcolatore: Milano non ha deliberato per il 2026, quindi si applicano aliquota ed esenzione del 2025. Alla data di estrazione dei dati riguardava il 61% dei Comuni italiani.', en: 'It is the rule holding up the calculator’s base case: Milano adopted nothing for 2026, so the 2025 rate and exemption apply. At the date the data were extracted it concerned 61% of Italian municipalities.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 650 non ha solo esteso gli anni: ha anche portato al 15 aprile 2026 il termine entro cui i Comuni potevano deliberare per il 2026. Le regioni non hanno avuto la stessa proroga, quindi i due dataset hanno finestre di stabilità diverse e nessuna coincide con il 1° gennaio.', en: 'Subsection 650 did not only extend the years: it also moved to 15 April 2026 the deadline by which municipalities could adopt figures for 2026. Regions were given no equivalent extension, so the two datasets have different windows of stability and neither coincides with 1 January.' },
          { it: 'Resta aperto il caso dell’ente che non ha mai deliberato e non ha un anno precedente da cui ereditare.', en: 'The case of an authority that has never adopted anything and has no previous year to inherit from remains open.' },
        ],
      },
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 52',
        dispone:
          { it: 'Riconosce a Province e Comuni la potestà di disciplinare le proprie entrate con regolamento, escluse la fattispecie imponibile, i soggetti passivi e l’aliquota massima.', en: 'Recognises the power of provinces and municipalities to govern their own revenue by regulation, save for the taxable event, the taxpayers and the maximum rate.' },
        effetto:
          { it: 'Non entra nel calcolo, ma è l’argomento per cui la soglia di esenzione comunale è un’esenzione soggettiva e non una franchigia: il Comune non può ridefinire la base imponibile.', en: 'It does not enter the calculation, but it is the argument for treating the municipal exemption threshold as a personal exemption and not an allowance: the municipality cannot redefine the taxable base.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 2 è stato abrogato dal DL 34/2019 art. 15-bis: la vecchia regola sull’efficacia temporale dei regolamenti non sta più qui.', en: 'Subsection 2 was repealed by DL 34/2019 art. 15-bis: the old rule on when regulations take effect no longer lives here.' },
        ],
      },
      {
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'artt. 36 e 38',
        dispone:
          { it: 'Aboliscono i contributi per il Servizio sanitario nazionale a carico dei lavoratori e destinano alle regioni il gettito dell’addizionale regionale.', en: 'They abolish the national health service contributions borne by workers and allocate the revenue of the addizionale regionale to the regions.' },
        effetto:
          { it: 'Non cambia un numero, ma spiega da dove viene l’addizionale regionale: nasce nella stessa riforma che abolisce un contributo sanitario che il lavoratore pagava comunque, ed è destinata a finanziare la sanità regionale. È una sostituzione funzionale, non aritmetica.', en: 'It does not change a figure, but it explains where the addizionale regionale comes from: it is born in the same reform that abolishes a health contribution the worker was paying anyway, and it is earmarked to fund regional healthcare. A functional substitution, not an arithmetical one.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
      },
      {
        atto: 'MEF, Dipartimento delle Finanze — Fiscalità regionale e locale',
        riferimento:
          'elenco addizionale comunale 2026 (7.897 comuni), elenco annuale 2025 aggiornato al 13/03/2026 (7.896 comuni), prospetto addizionale regionale 2026 (21 enti)',
        dispone:
          { it: 'Pubblicano le aliquote, gli scaglioni e le soglie di esenzione deliberate da ciascun ente.', en: 'They publish the rates, brackets and exemption thresholds adopted by each authority.' },
        effetto:
          { it: 'Danno i valori che le norme non contengono. Sono la fonte delle aliquote di Regione e Comune usate dal calcolatore.', en: 'They give the figures the statutes do not contain. They are the source of the regional and municipal rates the calculator uses.' },
        portale: 'MEF, Dipartimento delle Finanze',
        consultata: '2026-08-28',
        note: [
          { it: 'Gli elenchi sono aggiornati quotidianamente e non portano un timbro di versione: la data di estrazione è l’unico riferimento, e per questo è dichiarata accanto al dato.', en: 'The lists are updated daily and carry no version stamp: the extraction date is the only reference, and that is why it is declared next to the figure.' },
          { it: 'La dicitura «0*» non significa aliquota zero: alla data di estrazione indica un Comune che non ha ancora deliberato per l’anno in corso. Milano, Roma, Trento e Bolzano risultano «0*» nell’elenco 2026.', en: 'The marking “0*” does not mean a zero rate: at the extraction date it flags a municipality that has not yet adopted figures for the current year. Milano, Roma, Trento and Bolzano all show “0*” in the 2026 list.' },
          { it: 'L’elenco annuale distingue due modi diversi di non pagare nulla: Bolzano ha un’aliquota deliberata pari a zero, Trento risulta «0*» anche a consolidamento avvenuto, cioè non ha mai istituito il tributo.', en: 'The annual list distinguishes two different ways of paying nothing: Bolzano has an adopted rate of zero, Trento shows “0*” even after consolidation, meaning it never introduced the tax at all.' },
          { it: 'Il tetto comunale di 0,8 punti non è assoluto: sei aliquote lo superano, con un massimo dell’1,2%. Il file etichetta esplicitamente gli enti in dissesto e predissesto finanziario.', en: 'The municipal ceiling of 0.8 points is not absolute: six rates exceed it, with a maximum of 1.2%. The file explicitly labels authorities in financial distress and pre-distress.' },
          { it: 'Riserva sul caso base: per la Lombardia il prospetto cita l’art. 72 c. 1 della legge regionale 14/07/2003 n. 10, che è la legge abilitante. Una legge del 2003 non può avere fissato una struttura a quattro fasce divenuta lecita nel 2025, quindi il provvedimento che fissa le aliquote 2026 non è identificato dal prospetto.', en: 'A caveat on the base case: for Lombardia the table cites art. 72 c. 1 of regional law 14/07/2003 n. 10, which is the enabling law. A law from 2003 cannot have set a four-band structure that only became lawful in 2025, so the act that set the 2026 rates is not identified by the table.' },
          { it: 'Di questi elenchi non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for these lists.' },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'aggiungono',
    titolo: { it: 'Voci che non concorrono al reddito', en: 'Sums that do not count as income' },
    occhiello:
      { it: 'Somme che la legge non considera reddito: non vengono tassate e si sommano a quello che resta. Sono l’unico ramo del sistema che va nella direzione del lavoratore.', en: 'Sums the law does not treat as income: they are not taxed and they add to what is left. They are the only branch of the system that runs in the worker’s favour.' },
    schede: [
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 4 e 5',
        dispone:
          { it: 'Riconosce a chi ha un reddito complessivo fino a 20.000 euro una somma che non concorre a formare il reddito, pari a una percentuale del reddito di lavoro dipendente che decresce per fasce.', en: 'Grants those with total income up to 20,000 euros a sum that does not form part of taxable income, equal to a percentage of employment income that steps down by band.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'È denaro che si aggiunge al netto senza passare per le imposte: non riduce l’imponibile, non ha effetti a cascata sulle detrazioni, e spetta anche a chi non ha imposta da pagare.', en: 'It is money that adds to net pay without passing through the tax: it does not reduce the taxable base, it has no knock-on effect on tax credits, and it goes even to those with no tax to pay.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}, Articolo 1 com 4 e com 5',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'Le fasce non sono scaglioni: la percentuale si applica all’intero reddito, non alla parte eccedente. Ogni confine è quindi un salto secco verso il basso — circa 153 euro a 8.500 euro di reddito, circa 75 a 15.000.', en: 'The bands are not brackets: the percentage applies to the whole income, not to the part above the threshold. Every boundary is therefore a sharp step down — about 153 euros at 8,500 euros of income, about 75 at 15,000.' },
          { it: 'Il c. 8 mostra la meccanica: il datore anticipa denaro proprio e lo recupera dallo Stato in compensazione. Una detrazione non funziona così, e questa è la prova che non è una riduzione d’imposta.', en: 'Subsection 8 shows the mechanics: the employer advances its own money and recovers it from the state by offset. A tax credit does not work like that, and this is the proof that it is not a reduction in tax.' },
          { it: 'Il c. 5 ragguaglia il reddito all’intero anno ai soli fini della scelta della percentuale, non per la base: è una regola di ragguaglio diversa da quella dell’art. 13 e da quella del c. 6.', en: 'Subsection 5 annualises income solely for the purpose of picking the percentage, not for the base: it is a pro-rating rule different from the one in art. 13 and from the one in subsection 6.' },
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 9',
        dispone:
          { it: 'Definisce le grandezze di reddito usate dalle misure sul cuneo, includendo la quota esente dei redditi agevolati e assumendo il reddito complessivo al netto dell’abitazione principale.', en: 'Defines the income figures used by the tax wedge measures, including the exempt portion of relieved income and taking total income net of the main residence.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'Chiude quale reddito si guarda per la soglia e quale per l’importo. Una sola definizione di reddito complessivo attraversa tutto il calcolo.', en: 'It settles which income is looked at for the threshold and which for the amount. A single definition of total income runs through the whole calculation.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {4C29326B-B643-4927-886B-92A1FF640FDC}',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
      {
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 1',
        dispone:
          { it: 'Riconosce un trattamento integrativo di 1.200 euro a chi ha un reddito complessivo fino a 15.000 euro, a condizione che l’imposta lorda superi la detrazione per lavoro dipendente diminuita di 75 euro.', en: 'Grants a trattamento integrativo of 1,200 euros to those with total income up to 15,000 euros, on condition that the gross tax exceeds the employment income credit reduced by 75 euros.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        ultimaModifica: { it: 'L. 30/12/2024 n. 207, art. 1 c. 3', en: 'L. 30/12/2024 n. 207, art. 1 c. 3' },
        effetto:
          { it: 'È il terzo istituto che si somma al netto, e coesiste con le due misure sul cuneo. La condizione lo riserva a chi ha imposta da pagare, non agli incapienti — e questo lo rende l’unica voce di questo ramo che dipende dall’esito del ramo fiscale.', en: 'It is the third measure that adds to net pay, and it coexists with the two tax wedge measures. The condition reserves it for those with tax to pay, not for those without — and that makes it the only item in this branch that depends on the outcome of the tax branch.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {E6D98FB9-4121-4201-9966-37A2987520BA}',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
        note: [
          { it: 'I 75 euro non sono una tolleranza: la stessa legge che li ha inseriti ha alzato la detrazione da 1.880 a 1.955 euro, e 1.955 meno 75 fa esattamente l’importo precedente. Servono a lasciare ferma la soglia di accesso.', en: 'The 75 euros are not a tolerance: the same law that inserted them raised the credit from 1,880 to 1,955 euros, and 1,955 minus 75 is exactly the previous amount. They exist to leave the entry threshold where it was.' },
          { it: 'Ne discende un effetto collaterale involontario: fra circa 8.174 e 8.500 euro di reddito complessivo il trattamento spetta mentre l’imposta netta è già zero. Quella banda non esisteva prima del 2025.', en: 'An unintended side effect follows: between roughly 8,174 and 8,500 euros of total income the payment is due while the net tax is already zero. That band did not exist before 2025.' },
          { it: 'La cumulabilità con la somma sul cuneo è un’assunzione dichiarata, non una lettura: Abbiamo cercato su tutta la legge di bilancio: una clausola che vieti il cumulo non c’è.', en: 'That it can be combined with the tax wedge cash payment is a declared assumption, not a reading: we searched the whole budget law, and there is no clause forbidding the combination.' },
          { it: 'Il secondo periodo estende il trattamento fino a 28.000 euro se la somma di un elenco chiuso di detrazioni supera l’imposta lorda. Nel caso standard non si attiva mai, e la detrazione da cuneo non può entrare in quell’elenco perché l’elenco è del 2020 e la detrazione del 2025.', en: 'The second sentence extends the payment up to 28,000 euros where the sum of a closed list of credits exceeds the gross tax. In the standard case it never triggers, and the tax wedge credit cannot enter that list because the list is from 2020 and the credit from 2025.' },
        ],
      },
      {
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 3',
        dispone:
          { it: 'Abroga il vecchio bonus che stava dentro il TUIR e definisce il reddito complessivo ai fini del trattamento integrativo.', en: 'Repeals the old bonus that lived inside the TUIR and defines total income for the purposes of the trattamento integrativo.' },
        effetto:
          { it: 'Non cambia un numero, ma spiega la stratificazione: il vecchio bonus non è stato eliminato, è stato spostato fuori dal testo unico.', en: 'It does not change a figure, but it explains the layering: the old bonus was not eliminated, it was moved out of the consolidated act.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'fuori',
    titolo: { it: 'Atti letti e rimasti fuori dal calcolo', en: 'Acts read and deliberately left out' },
    occhiello:
      { it: 'Norme aperte, lette e volutamente non applicate. Stanno qui perché sapere cosa è stato escluso, e perché, vale quanto sapere cosa è stato incluso — e perché alcune di queste cambierebbero il numero, se ci fossero gli elementi per applicarle.', en: 'Rules we opened, read and deliberately did not apply. They are here because knowing what was excluded, and why, is worth as much as knowing what was included — and because some of these would change the figure, if there were enough information to apply them.' },
    schede: [
      {
        atto: 'L. 30/12/2025 n. 199',
        riferimento: 'art. 1 commi 7, 9, 10-11, 18-21',
        dispone:
          { it: 'Introducono quattro imposte sostitutive sul lavoro dipendente: 5% sugli aumenti da rinnovo del contratto nazionale, 1% sui premi di risultato, 15% sulle maggiorazioni per lavoro notturno e a turni, e un trattamento speciale per il turismo.', en: 'They introduce four substitute taxes on employment income: 5% on increases from national collective bargaining renewals, 1% on performance bonuses, 15% on premiums for night and shift work, and a special regime for tourism.' },
        effetto:
          { it: 'È la semplificazione più pesante che il calcolatore dichiara. Non resta fuori perché dipende da una scelta individuale — questi regimi sono attivi salvo rinuncia scritta — ma perché non è calcolabile dalla retribuzione lorda da sola: servirebbe sapere quanta parte è aumento da rinnovo, quanta premio, quanta indennità di turno.', en: 'It is the heaviest simplification the calculator declares. It stays out not because it depends on an individual choice — these regimes apply unless waived in writing — but because it cannot be worked out from gross pay alone: you would need to know how much is a bargained increase, how much a bonus, how much a shift allowance.' },
        consultata: '2026-08-27',
        note: [
          { it: 'Il regime al 5% sostituisce anche le addizionali, non solo l’IRPEF, e si applica a chi ha reddito di lavoro dipendente 2025 non superiore a 33.000 euro — cioè esattamente la fascia dei dipendenti delle piccole e medie imprese.', en: 'The 5% regime replaces the addizionali as well, not just IRPEF, and applies to those whose 2025 employment income was not above 33,000 euros — which is precisely the band of employees in small and medium-sized companies.' },
          { it: 'Chi ne beneficia ha un netto reale più alto di quello calcolato: su 1.000 euro di aumento da rinnovo, circa 205 euro che il calcolatore non mostra, fino a circa 305 per chi sta fra 28.000 e 33.000 euro.', en: 'Anyone benefiting has a real net pay higher than the one calculated: on 1,000 euros of bargained increase, roughly 205 euros the calculator does not show, up to about 305 for those between 28,000 and 33,000 euros.' },
          { it: 'Per questi commi non abbiamo registrato una data di vigenza.', en: 'For these subsections we did not record a date in force.' },
        ],
      },
      {
        atto: 'DL 27/03/2026 n. 38, conv. con mod. dalla L. 22/05/2026 n. 88',
        riferimento: 'art. 2-bis',
        dispone:
          { it: 'Esclude dalla base imponibile i redditi dei lavoratori marittimi imbarcati per più di 183 giorni su navi battenti bandiera estera.', en: 'Excludes from the taxable base the income of seafarers on board for more than 183 days on foreign-flagged vessels.' },
        vigenza: { it: 'dal 23/05/2026', en: 'in force from 23 May 2026' },
        effetto:
          { it: 'Resta fuori perché riguarda una categoria che il calcolo non copre. È l’articolo che ha modificato gli artt. 3 e 51 del TUIR nel 2026, e L’abbiamo letto per intero proprio per accertare che nessuno dei commi che contano fosse toccato.', en: 'It stays out because it concerns a category the calculation does not cover. It is the article that amended artt. 3 and 51 of the TUIR in 2026, and we read it in full precisely to establish that none of the subsections that matter was touched.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 3 contiene una clausola per cui l’esclusione non deve far guadagnare detrazioni e benefici legati a requisiti reddituali. È lo stesso scopo del c. 9 della L. 207/2024, con tecnica opposta: impedire che un’agevolazione ne generi un’altra a cascata.', en: 'Subsection 3 contains a clause preventing the exclusion from earning credits and benefits tied to income requirements. It has the same purpose as subsection 9 of L. 207/2024, by the opposite technique: stopping one relief from generating another by knock-on effect.' },
        ],
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 386',
        dispone:
          { it: 'Esclude dal reddito, entro 5.000 euro annui, i rimborsi del datore per canoni di locazione dei neoassunti, precisando che l’esclusione non rileva ai fini contributivi.', en: 'Excludes from income, up to 5,000 euros a year, employer reimbursements of rent for new hires, specifying that the exclusion does not apply for contribution purposes.' },
        effetto:
          { it: 'Resta fuori dal calcolo, ma è la prova testuale che la base fiscale e quella contributiva possono divergere per disposizione espressa. Che coincidano è una proprietà del caso standard, non del sistema.', en: 'It stays outside the calculation, but it is the textual proof that the tax base and the contributory base can diverge by express provision. That they coincide is a property of the standard case, not of the system.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 175',
        dispone:
          { it: 'Consente a chi ha il primo accredito contributivo dopo il 2025 di versare volontariamente fino a due punti di aliquota in più, deducibili per metà dell’importo.', en: 'Lets those whose first contribution credit falls after 2025 pay up to two extra percentage points voluntarily, deductible for half the amount.' },
        effetto:
          { it: 'Resta fuori, ma è l’esempio che spiega perché i contributi obbligatori non sono una deduzione: la legge dimostra di saper usare la deduzione quando il contributo è facoltativo.', en: 'It stays out, but it is the example that explains why compulsory contributions are not a deduction: the law shows it knows how to use a deduction when the contribution is voluntary.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
      },
      {
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 385',
        dispone:
          { it: 'Riduce al 5% l’imposta sostitutiva sui premi di produttività per il 2025.', en: 'Cuts to 5% the substitute tax on productivity bonuses for 2025.' },
        effetto:
          { it: 'Resta fuori: dipende dalla contrattazione di secondo livello, che il caso standard non ha. Per il 2026 il regime è stato sostituito da quello all’1% della legge di bilancio successiva.', en: 'It stays out: it depends on second-level bargaining, which the standard case does not have. For 2026 the regime was replaced by the 1% one in the following budget law.' },
        portale: 'def.finanze.it',
        consultata: '2026-08-27',
        note: [
          { it: 'Su questo comma abbiamo imparato una cosa: l’annotazione «modificato da» dice che un comma è stato toccato, non come. Ricostruirne il senso senza leggere l’atto modificante è un’inferenza, e in questo caso si è rivelata sbagliata nel verso.', en: 'On this subsection we learned something: the note “amended by” tells you a subsection was touched, not how. Reconstructing its meaning without reading the amending act is an inference, and in this case it turned out to be wrong in its direction.' },
        ],
      },
      {
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 17',
        dispone: { it: 'Disciplina la tassazione separata, che governa il trattamento di fine rapporto.', en: 'Governs separate taxation, which applies to severance pay.' },
        effetto:
          { it: 'Resta fuori perché il TFR non entra nel netto annuo, ma è l’articolo da citare per spiegare dove sia scritto che il TFR non segue il regime ordinario.', en: 'It stays out because TFR (severance pay) does not enter annual net pay, but it is the article to cite to show where it is written that TFR does not follow the ordinary regime.' },
        portale: 'def.finanze.it',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
      {
        atto: 'INPS, circolare n. 101 del 29/11/2024',
        dispone:
          { it: 'Tratta il regime contributivo dei magistrati onorari, e nel farlo richiama l’aliquota generale del 33% ripartita in 23,81% a carico del datore e 9,19% a carico del lavoratore.', en: 'Deals with the contribution regime of honorary magistrates, and in doing so recalls the general 33% rate split into 23.81% borne by the employer and 9.19% by the employee.' },
        effetto:
          { it: 'Non è la fonte citata dal calcolatore, ma resta un riscontro: il valore è corretto e la fonte è primaria, però i valori generali compaiono in un richiamo di contesto dentro una circolare su una categoria specifica.', en: 'It is not the source the calculator cites, but it stands as a cross-check: the figure is right and the source is primary, yet the general figures appear in a contextual aside inside a circular about a specific category.' },
        consultata: '2026-08-27',
        note: [
          { it: 'C’è qui una trappola: la stessa aliquota del 33% compare anche per la Gestione separata, con una ripartizione completamente diversa. Prenderla dalla circolare sbagliata produce un’aliquota errata di quasi due punti.', en: 'There is a trap here: the same 33% rate also appears for the Gestione separata scheme, with a completely different split. Taking it from the wrong circular produces a rate wrong by nearly two points.' },
          { it: 'Di questo documento non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for this document.' },
        ],
      },
      {
        atto: 'INPS, circolare n. 8 del 2026',
        dispone: { it: 'Disciplina le aliquote della Gestione separata.', en: 'Governs the rates of the Gestione separata scheme.' },
        effetto:
          { it: 'Resta fuori perché non riguarda il lavoro dipendente. Conferma però il massimale di 122.295 euro.', en: 'It stays out because it does not concern employment. It does confirm the 122,295 euro cap, though.' },
        consultata: '2026-08-27',
        note: [
          { it: 'Di questo documento non abbiamo un indirizzo stabile da citare.', en: 'We have no stable address to cite for this document.' },
        ],
      },
      {
        atto: 'DL 19/09/1992 n. 384',
        riferimento: 'art. 6 c. 11',
        dispone:
          { it: 'Fissava il contributo per il Servizio sanitario nazionale a carico dei lavoratori dipendenti, per l’1% più un’ulteriore aliquota dello 0,80%.', en: 'Set the national health service contribution borne by employees, at 1% plus a further rate of 0.80%.' },
        effetto:
          { it: 'Non si applica più: quei contributi sono stati aboliti dall’art. 36 del D.Lgs. 446/1997, cioè dallo stesso atto che istituisce l’addizionale regionale. È la prova documentale del legame fra le due cose.', en: 'It no longer applies: those contributions were abolished by art. 36 of D.Lgs. 446/1997, that is by the very act that creates the addizionale regionale. It is the documentary proof of the link between the two.' },
        portale: 'def.finanze.it',
        identificativo: 'atto id {2E278145-81A8-4B7C-9ED2-7A9CAF61DA6C}',
        url: DEF_FINANZE,
        consultata: '2026-08-27',
      },
      {
        atto: 'L. 29/12/2021 n. 234',
        riferimento: 'art. 1 commi 565–580',
        dispone:
          { it: 'Disciplina la potestà dei Comuni di articolare l’addizionale per scaglioni di reddito.', en: 'Governs the power of municipalities to structure the addizionale by income bracket.' },
        effetto:
          { it: 'Non serve per l’anno d’imposta 2026: per quell’anno la potestà nasce direttamente dai commi 727 e 751 della legge di bilancio 2025.', en: 'It is not needed for tax year 2026: for that year the power comes directly from subsections 727 and 751 of the 2025 budget law.' },
        consultata: '2026-08-27',
      },
      {
        atto: 'DPR 600/1973',
        dispone: { it: 'Contiene le regole sugli arrotondamenti delle ritenute.', en: 'Contains the rules on rounding withholdings.' },
        effetto:
          { it: 'Resta fuori: gli arrotondamenti sulla singola ritenuta, il conguaglio e la rateizzazione delle addizionali riguardano quando il denaro si muove, non quanto spetta per l’anno.', en: 'It stays out: rounding on an individual withholding, the year-end reconciliation and the instalment payment of the addizionali concern when the money moves, not how much is owed for the year.' },
        consultata: '2026-08-27',
      },
    ],
  },
]
