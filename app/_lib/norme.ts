/**
 * L'archivio delle norme che determinano la retribuzione netta in Italia.
 *
 * ⚠️ Nessun collegamento al motore, ed è una proprietà voluta. Questa non è
 * la lista delle citazioni del calcolo — quelle stanno accanto alle voci del
 * risultato, dove servono. Qui c'è un archivio consultabile, leggibile anche da
 * chi non ha calcolato niente, e che comprende atti letti e rimasti fuori
 * dal perimetro: cose che il motore non tocca e che quindi non potrebbe mai
 * citare.
 *
 * ⚠️ Ogni riga viene dalla pagina *Fonti*, e da nient'altro. Nessuna data
 * di vigenza, nessun comma, nessun numero che *Fonti* non riporti. Dove *Fonti*
 * tace, il campo resta vuoto: su una pagina intitolata alle norme una data
 * di vigenza inventata è l'errore che costa più di tutti, e il metodo del
 * progetto dice che le fonti primarie le reperisce l'autore.
 *
 * Se una voce di *Fonti* cambia, cambia questo file — non il contrario.
 */

export interface Scheda {
  /**
   * L'ancora della scheda in pagina, e la destinazione di ogni citazione.
   *
   * ⚠️ **Esiste perché le fonti del calcolo puntino qui invece che fuori.**
   * Prima ogni citazione accanto a una voce del risultato apriva il portale
   * ministeriale: chi voleva capire da dove venisse un numero usciva dal sito e
   * atterrava su un testo di legge grezzo, senza sapere quale comma guardare né
   * che effetto avesse sul proprio netto. Ora atterra sulla scheda che quel
   * lavoro l'ha già fatto, e da lì trova il link al portale se lo vuole.
   *
   * È una stringa scritta a mano e non derivata dall'atto: un'ancora deve
   * restare stabile anche quando la citazione si precisa, altrimenti ogni
   * ritocco a un `riferimento` romperebbe i link già condivisi.
   */
  readonly id: string
  /**
   * L'atto per esteso, come va citato.
   *
   * ⚠️ Non si traduce, ed è sostanza (D-041). *L. 30/12/2024 n. 207* è la
   * chiave con cui si cerca il testo su Normattiva: tradurla la renderebbe
   * inservibile proprio a chi volesse verificarla. Vale per `riferimento` e
   * `portale` per la stessa ragione.
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
  /** Link diretto, solo dove *Fonti* riporta un URL completo. */
  readonly url?: string
  /**
   * Data di lettura, in ISO 8601.
   *
   * In ISO e non `28/08/2026`: la forma la sceglie la lingua di chi legge, e
   * un dato che porta dentro di sé una convenzione di scrittura non può farlo.
   */
  readonly consultata: string
  /**
   * Cose che chi legge la norma ha interesse a sapere.
   *
   * ⚠️ **Non sono più il quaderno di lavoro, e il cambiamento è di
   * destinatario.** Qui finivano anche le ambiguità dichiarate, i rinvii che
   * non si sono potuti seguire, i portali che non portavano l'atto intero, le
   * verifiche rimaste da fare e le distinzioni fra ciò che è stato letto e ciò
   * che è stato dedotto. Erano appunti veri e utili, ma utili **a chi scrive il
   * calcolatore**: a chi lo legge dicevano soltanto che qualcuno, da qualche
   * parte, non era sicuro.
   *
   * Il criterio ora è uno: una nota resta se dice qualcosa **sulla norma o sul
   * calcolo** che chi legge non ricaverebbe dal testo dell'atto. Se parla del
   * processo di ricerca, non sta qui. Quel materiale non si perde e non è meno
   * importante: vive nella documentazione di progetto, che è il posto che gli
   * spetta.
   */
  readonly note?: readonly Multilingua[]
}

export interface SezioneNorme {
  readonly id: string
  readonly titolo: Multilingua
  readonly occhiello: Multilingua
  readonly schede: readonly Scheda[]
}

import type { Multilingua } from '../../core/types'

/**
 * L'ordine è quello della catena di calcolo, non alfabetico: chi legge ritrova
 * la sequenza in cui una retribuzione lorda diventa netta.
 */
export const SEZIONI: readonly SezioneNorme[] = [
  {
    id: 'contributi',
    titolo: { it: 'Contributi previdenziali', en: 'Social security contributions' },
    occhiello:
      { it: 'Il primo prelievo, e l’unico che non è una tassa. Determina quanto esce dalla retribuzione per la pensione, e su quale base si calcola.', en: 'The first deduction, and the only one that is not a tax. It determines how much leaves your pay for your pension, and on what base it is worked out.' },
    schede: [
      {
        id: 'l153-1969-art12',
        atto: 'L. 30/04/1969 n. 153',
        riferimento: 'art. 12',
        dispone:
          { it: 'Stabilisce su quale retribuzione si calcolano i contributi: le somme si assumono al lordo di qualsiasi contributo e trattenuta, meno un elenco tassativo di esclusioni.', en: 'Sets out which pay contributions are computed on: sums are taken gross of any contribution or withholding, less an exhaustive list of exclusions.' },
        effetto:
          { it: 'È la norma per cui i contributi si calcolano sulla retribuzione lorda, non su una grandezza ridotta. Nel caso standard la base coincide con la RAL, perché tutte le voci escluse dall’elenco tassativo sono già fuori dal calcolo: TFR, previdenza complementare, casse sanitarie, premi da contrattazione di secondo livello.', en: 'This is the rule under which contributions are computed on gross pay, not on some reduced figure. In the standard case the base coincides with the RAL, because everything the exhaustive list excludes is already outside this calculation: TFR (severance accrual), supplementary pensions, health funds, second-level bargaining bonuses.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1969-04-30;153~art12!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'Due rinvii alla numerazione del TUIR anteriore al 2004: il c. 1 rinvia all’art. 46 e i c. 2 e 3 all’art. 48, che oggi sono gli artt. 49 e 51.', en: 'Two cross-references to the pre-2004 numbering of the TUIR: subsection 1 points to art. 46 and subsections 2 and 3 to art. 48, which today are artt. 49 and 51.' },
          { it: 'Il criterio temporale è diverso da quello fiscale: qui i redditi sono quelli «maturati» nel periodo, mentre l’art. 51 TUIR conta le somme «percepite». Contributivo per maturazione, fiscale per cassa allargata, nella stessa busta paga.', en: 'The timing rule differs from the tax one: here income is what has “accrued” in the period, whereas art. 51 TUIR counts sums “received”. Accrual on the contributions side, extended cash basis on the tax side, in the same payslip.' },
        ],
      },
      {
        id: 'dl338-1989-art1',
        atto: 'DL 09/10/1989 n. 338, conv. con mod. dalla L. 07/12/1989 n. 389',
        riferimento: 'art. 1 c. 1',
        dispone:
          { it: 'Pone il primo dei due pavimenti alla base contributiva: la retribuzione su cui si calcolano i contributi non può essere inferiore a quella stabilita da leggi, regolamenti o contratti collettivi.', en: 'Sets the first of the two floors under the contribution base: the pay on which contributions are computed may not be lower than the amount set by law, regulation or collective agreement.' },
        effetto:
          { it: 'Il calcolatore non lo applica, e lo dichiara: non sa quale contratto collettivo ti riguardi, e il minimo dipende da quello. Dove la paga reale sta sotto il minimo contrattuale, i contributi veri sono più alti di quelli mostrati.', en: 'The calculator does not apply it, and says so: it does not know which collective agreement covers you, and the floor depends on that. Where actual pay falls below the contractual minimum, real contributions are higher than the ones shown.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:1989-10-09;338~art1!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'Vincola anche i datori che non aderiscono, «neppure di fatto», alla disciplina collettiva: il minimo si applica a prescindere dall’adesione. Dove esistono più contratti per la stessa categoria vale quello delle organizzazioni comparativamente più rappresentative, per norma di interpretazione autentica (art. 2 c. 25 della L. 549/1995).', en: 'It binds even employers that do not adhere, “not even in fact”, to the collective agreement: the floor applies regardless of membership. Where several agreements exist for the same category, the one from the comparatively most representative organisations prevails, by authentic interpretation (art. 2 c. 25 of L. 549/1995).' },
          { it: 'Il c. 2 dello stesso articolo alza dal 7,50% al 9,50% la percentuale del minimale giornaliero, con effetto dal 1° gennaio 1989. I due pavimenti nascono quindi dallo stesso decreto, ed è il motivo per cui vanno letti insieme.', en: 'Subsection 2 of the same article raises the daily floor from 7.50% to 9.50%, with effect from 1 January 1989. The two floors therefore come from the same decree, which is why they are read together.' },
        ],
      },
      {
        id: 'dl463-1983-art7',
        atto: 'DL 12/09/1983 n. 463, conv. con mod. dalla L. 11/11/1983 n. 638',
        riferimento: 'art. 7 c. 1, secondo periodo',
        dispone:
          { it: 'Pone il secondo pavimento: la retribuzione giornaliera imponibile non può essere inferiore al 9,50% del trattamento minimo mensile di pensione del Fondo pensioni lavoratori dipendenti.', en: 'Sets the second floor: daily taxable pay may not fall below 9.50% of the monthly minimum pension of the employees’ pension fund (FPLD).' },
        ultimaModifica: { it: 'DL 09/10/1989 n. 338, art. 1 c. 2 — dal 7,50% al 9,50%', en: 'DL 09/10/1989 n. 338, art. 1 c. 2 — from 7.50% to 9.50%' },
        effetto:
          { it: 'Per il 2026 il trattamento minimo è 611,85 euro al mese, quindi il minimale è 58,13 euro per ogni giornata retribuita. Il calcolatore non lo applica perché non chiede quante giornate hai lavorato: è la ragione dell’avvertenza che compare accanto al numero sotto una certa retribuzione.', en: 'For 2026 the minimum pension is 611.85 euros a month, so the floor is 58.13 euros for every paid day. The calculator does not apply it because it does not ask how many days you worked: that is the reason for the caveat shown next to the figure below a certain level of pay.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:1983-09-12;463~art7!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'È un pavimento giornaliero, non annuale, e la legge non ne dà una versione annuale. Chi lavora poche giornate ha un minimale proporzionalmente più basso: è la ragione per cui una retribuzione annua piccola non è di per sé sbagliata.', en: 'It is a daily floor, not an annual one, and the law gives no annual version. Anyone working few days has a proportionally lower floor: that is why a small annual figure is not wrong in itself.' },
          { it: 'Il minimale non si osserva quando il datore eroga trattamenti integrativi di prestazioni mutualistiche di importo inferiore al limite: è l’unica eccezione che la circolare INPS 6/2026 richiama.', en: 'The floor does not apply where the employer pays supplementary mutual-benefit treatments below the limit: it is the only exception the INPS circular 6/2026 recalls.' },
        ],
      },
      {
        id: 'inps-circ40-2011',
        atto: 'INPS, circolare n. 40 del 22/02/2011',
        riferimento: 'par. 1.1.1',
        dispone:
          { it: 'Riporta l’aliquota per invalidità, vecchiaia e superstiti: 33% in totale, di cui 9,19% a carico del lavoratore.', en: 'States the rate for invalidity, old age and survivors: 33% in total, of which 9.19% borne by the employee.' },
        effetto:
          { it: 'È la fonte dell’aliquota che si vede in busta paga. La circolare è rivolta ai datori di lavoro in genere, non a una categoria specifica, ed è per questo che sostituisce come citazione principale la circolare sui magistrati onorari.', en: 'This is the source of the rate you see on a payslip. The circular is addressed to employers in general, not to a specific category, and that is why it replaces the circular on honorary magistrates as the primary citation.' },
        portale: 'INPS',
        url: 'https://servizi2.inps.it/servizi/Bussola/visualizzadoc.aspx?svirtualurl=%2Fcircolari%2Fcircolare+numero+40+del+22-02-2011.htm',
        consultata: '2026-08-31',
        note: [
          { it: 'Esistono due aliquote a carico del lavoratore, e la differenza è il contributo ex GESCAL: 9,19% dove si applica, 8,84% nei settori che ne sono esclusi. Per l’impiegato del settore privato vale il 9,19%.', en: 'There are two employee rates, and the difference is the former GESCAL contribution: 9.19% where it applies, 8.84% in the sectors excluded from it. For an office employee in the private sector the 9.19% applies.' },
          { it: 'La scomposizione riportata dalla circolare: 32% dal decreto interministeriale del 21/02/1996 in attuazione dell’art. 3 c. 23 della L. 335/1995, più 0,70 punti ex GESCAL, più 0,30 punti dall’art. 1 c. 769 della L. 296/2006.', en: 'The breakdown the circular gives: 32% from the inter-ministerial decree of 21/02/1996 implementing art. 3 c. 23 of L. 335/1995, plus 0.70 points of former GESCAL, plus 0.30 points from art. 1 c. 769 of L. 296/2006.' },
          { it: 'La circolare è del 2011 e resta la fonte giusta per il 2026, perché la quota a carico del lavoratore ha smesso di muoversi nel 2002: la circolare stessa scrive che l’adeguamento «risulta esaurito» e che l’aliquota «ha già raggiunto la misura piena». Gli aumenti pubblicati ogni anno da allora cadono sulla quota del datore di lavoro.', en: 'The circular dates from 2011 and remains the right source for 2026, because the employee share stopped moving in 2002: the circular itself states that the adjustment “is exhausted” and that the rate “has already reached its full measure”. The increases published every year since then fall on the employer’s share.' },
        ],
      },
      {
        id: 'dl384-1992-art3ter',
        atto: 'DL 19/09/1992 n. 384, conv. con mod. dalla L. 14/11/1992 n. 438',
        riferimento: 'art. 3-ter',
        dispone:
          { it: 'Aggiunge un punto percentuale di contributo sulla parte di retribuzione che supera la prima fascia di retribuzione pensionabile, per i regimi che prevedono aliquote a carico del lavoratore inferiori al 10 per cento.', en: 'Adds one percentage point of contribution on the part of pay above the first pensionable earnings band, for schemes whose employee rate is below 10 per cent.' },
        vigenza: { it: 'dal 19/11/1992, con decorrenza degli effetti dal 1° gennaio 1993', en: 'in force from 19 Nov 1992, taking effect from 1 January 1993' },
        ultimaModifica:
          { it: 'L. 14/11/1992 n. 438, in sede di conversione. Mai modificato dopo.', en: 'L. 14/11/1992 n. 438, on conversion into law. Never amended since.' },
        effetto:
          { it: 'È l’unica soglia sul versante contributivo: sotto la prima fascia i contributi sono una moltiplicazione, sopra il ramo acquista la stessa forma di quello fiscale.', en: 'It is the only threshold on the contributions side: below the first band contributions are a multiplication, above it the branch takes on the same shape as the tax one.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:1992-09-19;384~art3ter!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il testo non attribuisce il contributo al lavoratore dipendente. L’attribuzione espressa esiste solo per i lavoratori autonomi; per i dipendenti la fonte del soggetto passivo è la circolare INPS. La citazione è doppia per necessità, non per eleganza.', en: 'The text does not attribute the contribution to the employee. The express attribution exists only for the self-employed; for employees the source for who bears it is the INPS circular. The double citation is a necessity, not an elegance.' },
          { it: 'Il rinvio per la soglia non arriva a destinazione: rimanda all’art. 21 c. 6 della L. 67/1988, che a sua volta rinvia a una tabella allegata che non è nell’export dell’atto.', en: 'The cross-reference for the threshold does not reach its destination: it points to art. 21 c. 6 of L. 67/1988, which in turn points to an annexed table that is not in the exported act.' },
          { it: 'La condizione del 10 per cento è riferita al regime pensionistico, non al singolo lavoratore: la verifica va fatta sull’aliquota ordinaria del regime, non su quella ridotta dell’apprendista.', en: 'The 10 per cent condition refers to the pension scheme, not to the individual worker: the check is made against the scheme’s ordinary rate, not against the reduced apprenticeship one.' },
          { it: 'L’articolo non ha commi: è un unico periodo non numerato, quindi la citazione corretta non indica un comma.', en: 'The article has no subsections: it is a single unnumbered sentence, so the correct citation does not name one.' },
        ],
      },
      {
        id: 'l67-1988-art21',
        atto: 'L. 11/03/1988 n. 67',
        riferimento: 'art. 21 c. 6',
        dispone:
          { it: 'Dispone che la retribuzione oltre il limite massimo pensionabile sia computata secondo le aliquote di una tabella allegata, e che la pensione così ottenuta diventi parte integrante di quella ordinaria.', en: 'Provides that pay above the maximum pensionable limit is computed at the rates of an annexed table, and that the pension so obtained becomes an integral part of the ordinary one.' },
        effetto:
          { it: 'È la norma a cui rinvia il contributo aggiuntivo dell’1%, ma non porta al parametro: non fissa la soglia, non dice chi la fissa, e non contiene mai l’espressione «prima fascia». Il valore in euro sta quindi in una circolare annuale.', en: 'It is the rule the additional 1% contribution refers to, but it does not lead to the figure: it does not set the threshold, does not say who sets it, and never uses the phrase “first band”. The amount in euros therefore lives in an annual circular.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1988-03-11;67~art21!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'inps-circ6-2026',
        atto: 'INPS, circolare n. 6 del 30/01/2026',
        riferimento: 'par. 5 e 6',
        dispone:
          { it: 'Fissa per il 2026 la prima fascia di retribuzione pensionabile a 56.224,00 euro e il massimale della base contributiva a 122.295,00 euro, e conferma che il contributo aggiuntivo dell’1% è a carico del lavoratore.', en: 'Sets, for 2026, the first pensionable earnings band at 56,224.00 euros and the cap on the contributory base at 122,295.00 euros, and confirms that the additional 1% contribution is borne by the employee.' },
        effetto:
          { it: 'Dà il valore della soglia oltre la quale scatta il contributo aggiuntivo: il numero che la legge non contiene.', en: 'It gives the value of the threshold above which the additional contribution starts: the number the statute does not contain.' },
        portale: 'INPS',
        url: 'https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2026/01/Circolare_15151/Allegati/16546_Circolare-numero-6-del-30-01-2026.pdf',
        consultata: '2026-08-27',
        note: [
          { it: 'Il massimale opera anche ai fini dell’1%: sopra 122.295 il contributo aggiuntivo si ferma. Il calcolatore non modella il massimale, perché dipende dalla data di prima iscrizione previdenziale, e assume quindi un lavoratore iscritto prima del 1996.', en: 'The cap applies to the 1% as well: above 122,295 the additional contribution stops. The calculator does not model the cap, because it depends on the date of first registration with the social security system, and it therefore assumes someone registered before 1996.' },
          { it: 'Il contributo aggiuntivo segue il criterio della mensilizzazione, mese per mese sulla quota eccedente 4.685 euro. Il calcolatore adotta l’equivalente annuo, che è il risultato a cui il conguaglio di fine anno dovrebbe ricondurre.', en: 'The additional contribution follows a month-by-month rule, on the part above 4,685 euros each month. The calculator uses the annual equivalent, which is what the year-end reconciliation should arrive at.' },
          { it: 'Il massimale è quello dell’art. 2 c. 18, secondo periodo, della L. 08/08/1995 n. 335, rivalutato sull’indice ISTAT dei prezzi al consumo per famiglie di operai e impiegati. Valore 2026: 122.295,40, arrotondato a 122.295,00.', en: 'The cap is the one in art. 2 c. 18, second sentence, of L. 08/08/1995 n. 335, revalued on the ISTAT consumer price index for blue- and white-collar households. 2026 value: 122,295.40, rounded to 122,295.00.' },
        ],
      },
      {
        id: 'l41-1986-art21',
        atto: 'L. 28/02/1986 n. 41',
        riferimento: 'art. 21',
        dispone:
          { it: 'Estende agli apprendisti la disciplina contributiva della generalità dei lavoratori dipendenti, con una riduzione di tre punti dell’aliquota.', en: 'Extends to apprentices the contribution rules applying to employees generally, with a three-point reduction in the rate.' },
        vigenza: { it: 'dal 28/02/1986', en: 'in force from 28 Feb 1986' },
        effetto:
          { it: 'È la ragione per cui l’apprendistato cambia davvero il netto, mentre tempo determinato e indeterminato no. Non fissa un’aliquota propria: sottrae tre punti a quella ordinaria, quindi è un rinvio che si muove da sé se l’aliquota ordinaria cambia.', en: 'It is the reason an apprendistato really does change net pay, while fixed-term and permanent do not. It sets no rate of its own: it subtracts three points from the ordinary one, so it is a cross-reference that moves by itself if the ordinary rate changes.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1986-02-28;41~art21!vig=',
        consultata: '2026-08-28',
        note: [
          { it: 'La lettera b) dell’articolo è esaurita: riduceva il contributo per il Servizio sanitario nazionale, e quei contributi sono stati aboliti dall’art. 36 c. 1 lett. a) del D.Lgs. 446/1997.', en: 'Letter b) of the article is spent: it reduced the contribution for the national health service, and those contributions were abolished by art. 36 c. 1 lett. a) of D.Lgs. 446/1997.' },
          { it: 'Da dove viene il 5,84% che INPS applica, e perché non si ottiene sottraendo tre punti a 9,19. La base non è il 9,19% ma l’8,84%: la differenza fra le due è il contributo ex GESCAL, 0,35 punti, che l’aliquota dei settori esclusi non porta. Da 8,84 meno tre punti si ottiene esattamente 5,84.', en: 'Where the 5.84% that INPS applies comes from, and why it is not 9.19 minus three points. The base is not 9.19% but 8.84%: the difference between the two is the former GESCAL contribution, 0.35 points, which the rate in the excluded sectors does not carry. From 8.84 less three points you get exactly 5.84.' },
          { it: 'La stessa aritmetica chiude anche all’indietro: prima del 2007 la base era 8,84 − 0,30 = 8,54, e meno tre punti dà 5,54 — la cifra che le fonti di prassi riportano per gli anni anteriori. I 0,30 punti dell’art. 1 c. 769 della L. 296/2006, che portarono il lavoratore ordinario da 8,89 a 9,19, riportano l’apprendista da 5,54 a 5,84.', en: 'The same arithmetic also closes backwards: before 2007 the base was 8.84 − 0.30 = 8.54, and less three points gives 5.54 — the figure practice sources report for the earlier years. The 0.30 points of art. 1 c. 769 of L. 296/2006, which took the ordinary employee from 8.89 to 9.19, take the apprentice from 5.54 to 5.84.' },
          { it: 'È una ricostruzione che torna da due direzioni indipendenti, non una catena accertata: nessuno degli atti letti dice che l’apprendista sia escluso dal contributo ex GESCAL. Il 5,84% resta verificato su due documenti INPS, ed è la ragione per cui il calcolatore lo usa; quello che manca è l’atto che lo deriva.', en: 'This is a reconstruction that closes from two independent directions, not an established chain: none of the acts read says that apprentices are excluded from the former GESCAL contribution. The 5.84% remains verified on two INPS documents, and that is why the calculator uses it; what is missing is the act that derives it.' },
        ],
      },
      {
        id: 'l335-1995-art2',
        atto: 'L. 08/08/1995 n. 335',
        riferimento: 'art. 2 c. 18, secondo periodo',
        dispone:
          { it: 'Fissa un massimale annuo alla retribuzione su cui si versano i contributi, per chi si è iscritto alla previdenza obbligatoria dal 1° gennaio 1996 in poi, e ne dispone la rivalutazione annuale.', en: 'Sets an annual cap on the pay contributions are paid on, for anyone who first registered with compulsory social security from 1 January 1996 onwards, and provides for it to be revalued each year.' },
        effetto:
          { it: 'Sopra il massimale i contributi si fermano, e con loro il contributo aggiuntivo dell’1%. Il calcolatore non lo applica, perché dipende dalla data di prima iscrizione previdenziale, che una RAL non dice: chi si è iscritto dal 1996 e guadagna sopra il massimale ha quindi un netto reale più alto di quello calcolato.', en: 'Above the cap contributions stop, and with them the additional 1% contribution. The calculator does not apply it, because it depends on the date of first registration with the social security system, which a gross salary does not tell you: someone who registered from 1996 onwards and earns above the cap therefore has a higher real net pay than the one calculated.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1995-08-08;335~art2!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il valore non sta nella legge: si rivaluta ogni anno sull’indice ISTAT dei prezzi al consumo per famiglie di operai e impiegati, e il numero dell’anno lo pubblica una circolare INPS. Per il 2026 vale 122.295,00 euro.', en: 'The figure is not in the statute: it is revalued each year on the ISTAT consumer price index for blue- and white-collar households, and the year’s number is published in an INPS circular. For 2026 it is 122,295.00 euros.' },
        ],
      },
      {
        id: 'dlgs81-2015-art47',
        atto: 'D.Lgs. 15/06/2015 n. 81',
        riferimento: 'art. 47 c. 7',
        dispone:
          { it: 'Mantiene i benefici contributivi dell’apprendistato per un anno dalla prosecuzione del rapporto al termine del periodo di formazione.', en: 'Keeps the apprenticeship contribution benefits for one year after the relationship continues at the end of the training period.' },
        effetto:
          { it: 'È la ragione per cui l’aliquota ridotta dell’apprendista non finisce con il periodo di formazione. Il calcolatore non modella quell’anno di coda: chi ha concluso un apprendistato da meno di un anno risulta a tempo indeterminato e riceve l’aliquota piena, quindi il suo netto reale è più alto di quello calcolato.', en: 'It is the reason the apprentice’s reduced rate does not end with the training period. The calculator does not model that trailing year: anyone who finished an apprenticeship less than a year ago shows up as permanent and gets the full rate, so their real net pay is higher than the one calculated.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2015-06-15;81~art47!vig=',
        consultata: '2026-08-28',
      },
      {
        id: 'inps-msg3618-2023',
        atto: 'INPS, messaggio n. 3618 del 17/10/2023 e circolare n. 70 del 15/06/2022',
        dispone:
          { it: 'Dichiarano che l’aliquota a carico dell’apprendista è pari al 5,84% della retribuzione imponibile, per tutta la durata del periodo di formazione e per un anno dalla prosecuzione del rapporto.', en: 'They state that the apprentice’s rate is 5.84% of contributory earnings, for the whole training period and for one year after the relationship continues.' },
        effetto:
          { it: 'Dà il valore dell’aliquota dell’apprendista. La circolare 70/2022 aggiunge che quell’aliquota «rimane» tale anche dove il datore è integralmente esonerato: nessuna agevolazione a carico dell’azienda tocca il lavoratore.', en: 'It gives the value of the apprentice’s rate. Circular 70/2022 adds that the rate “remains” the same even where the employer is fully exempted: no relief granted to the company touches the worker.' },
        portale: 'INPS',
        url: 'https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2023/10/Circolare_14297/Allegati/14420_Messaggio-numero-3618-del-17-10-2023.pdf',
        consultata: '2026-08-28',
        note: [
          { it: 'I codici Uniemens lo mostrano dall’altro lato: l’aliquota a carico del datore varia con l’anzianità di apprendistato, quella del lavoratore no. Basta quindi sapere che il contratto è di apprendistato, senza chiedere l’anno né la dimensione aziendale.', en: 'The Uniemens codes show it from the other side: the employer’s rate varies with length of apprenticeship, the employee’s does not. It is therefore enough to know that the contract is an apprenticeship, without asking the year or the size of the company.' },
          { it: 'Ne discende un limite dichiarato del calcolatore: chi ha concluso un apprendistato da meno di un anno risulta a tempo indeterminato e riceve l’aliquota piena, quindi il suo netto reale è più alto di quello calcolato.', en: 'A declared limit of the calculator follows: anyone who finished an apprenticeship less than a year ago shows up as permanent and gets the full rate, so their real net pay is higher than the one calculated.' },
          { it: 'Il messaggio afferma il 5,84% e rinvia all’art. 21 della L. 41/1986, che però dispone una riduzione di tre punti e non un’aliquota. Come i tre punti arrivino a 5,84 è spiegato nella scheda di quell’articolo, con la riserva che merita.', en: 'The message states the 5.84% and refers to art. 21 of L. 41/1986, which however provides a three-point reduction and not a rate. How those three points land on 5.84 is explained in that article’s card, with the caveat it deserves.' },
        ],
      },
    ],
  },

  {
    id: 'imponibile',
    titolo: { it: 'Dal lordo all’imponibile', en: 'From gross pay to the taxable base' },
    occhiello:
      { it: 'Il passaggio che decide su quale cifra si calcolano le imposte. È corto (poche norme), ma se si sbaglia qui sbaglia tutto quello che viene dopo.', en: 'The step that decides which figure the taxes are computed on. It is short (a handful of rules), but get it wrong and everything downstream is wrong.' },
    schede: [
      {
        id: 'tuir-art51',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 51 c. 2 lett. a)',
        dispone:
          { it: 'Stabilisce che i contributi previdenziali e assistenziali obbligatori non concorrono a formare il reddito.', en: 'Provides that compulsory social security and welfare contributions do not form part of taxable income.' },
        vigenza: { it: 'dal 23/05/2026', en: 'in force from 23 May 2026' },
        ultimaModifica: { it: 'DL 27/03/2026 n. 38, art. 2-bis', en: 'DL 27/03/2026 n. 38, art. 2-bis' },
        effetto:
          { it: 'È la ragione per cui il reddito su cui si pagano le imposte nasce già al netto dei contributi. I contributi non sono una deduzione ma un’esclusione, e da qui discende che pesano più del loro valore nominale: abbassano anche l’imposta.', en: 'It is the reason the income you pay tax on is already net of contributions. Contributions are not a deduction but an exclusion, and it follows that they weigh more than their face value: they bring the tax down too.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art51!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 1 dello stesso articolo determina il reddito per cassa allargata: contano le somme percepite nell’anno, più quelle corrisposte entro il 12 gennaio successivo. È la ragione per cui il progetto non usa la parola «competenza», che appartiene ai redditi d’impresa.', en: 'Subsection 1 of the same article sets income on an extended cash basis: what counts is the sums received in the year, plus those paid by 12 January of the following one. It is the reason this project never uses the word “accrual”, which belongs to business income.' },
          { it: 'La lett. h) esclude dal reddito le somme trattenute per oneri deducibili: per un dipendente gli oneri sono neutralizzati alla fonte, e non è una coincidenza numerica se le due basi coincidono.', en: 'Letter h) excludes from income the sums withheld for deductible charges: for an employee those charges are neutralised at source, and it is no numerical coincidence that the two bases coincide.' },
        ],
      },
      {
        id: 'tuir-art3',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 3',
        dispone:
          { it: 'Definisce la base imponibile dell’imposta: il reddito complessivo al netto degli oneri deducibili.', en: 'Defines the taxable base of the tax: total income net of deductible charges.' },
        vigenza: { it: 'dal 23/05/2026', en: 'in force from 23 May 2026' },
        ultimaModifica: { it: 'DL 27/03/2026 n. 38, art. 2-bis', en: 'DL 27/03/2026 n. 38, art. 2-bis' },
        effetto:
          { it: 'È la formula da cui parte il conto delle imposte. Nel caso standard gli oneri deducibili valgono zero, quindi la base coincide con il reddito complessivo.', en: 'It is the formula the tax calculation starts from. In the standard case deductible charges are zero, so the base coincides with total income.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art3!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'tuir-art49',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 49',
        dispone:
          { it: 'Definisce quali redditi sono di lavoro dipendente, per la loro provenienza e non per il loro importo.', en: 'Defines which income is employment income, by where it comes from and not by how much it is.' },
        effetto:
          { it: 'Individua chi ha diritto alle misure sul cuneo, che spettano ai titolari di reddito di lavoro dipendente ed escludono i redditi di pensione.', en: 'It identifies who is entitled to the tax wedge measures, which go to holders of employment income and exclude pension income.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art49!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'tuir-art8',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 8',
        dispone: { it: 'Definisce il reddito complessivo come somma dei redditi di ogni categoria.', en: 'Defines total income as the sum of income of every category.' },
        effetto:
          { it: 'Nel caso standard il reddito complessivo coincide con il solo reddito di lavoro dipendente. È la grandezza su cui si misurano le fasce delle detrazioni e le soglie del cuneo.', en: 'In the standard case total income coincides with employment income alone. It is the figure the tax credit bands and the tax wedge thresholds are measured against.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art8!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'tuir-art10',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 10 c. 3-bis',
        dispone:
          { it: 'Prevede la deduzione del reddito dell’abitazione principale fino alla rendita catastale.', en: 'Provides for a deduction of the income of the main residence up to its cadastral value.' },
        effetto:
          { it: 'Non entra nel calcolo direttamente, ma spiega perché le grandezze di reddito coincidono anche per chi possiede la casa in cui vive: è il meccanismo a cui rinviano sei istituti diversi con la stessa formula.', en: 'It does not enter the calculation directly, but it explains why the income figures coincide even for someone who owns the home they live in: it is the mechanism six different rules cross-refer to with the same formula.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art10!vig=',
        consultata: '2026-08-27',
      },
    ],
  },

  {
    id: 'irpef',
    titolo: { it: 'IRPEF e detrazioni', en: 'IRPEF and tax credits' },
    occhiello:
      { it: 'L’imposta sul reddito e gli sconti che la riducono. È il ramo più lungo, ed è quello in cui si concentrano quasi tutte le soglie del sistema.', en: 'The income tax and the reliefs that reduce it. It is the longest branch, and the one where almost every threshold in the system is concentrated.' },
    schede: [
      {
        id: 'tuir-art11',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 11',
        dispone:
          { it: 'Fissa gli scaglioni e le aliquote dell’imposta (23% fino a 28.000, 33% fino a 50.000, 43% oltre) e stabilisce che le detrazioni si operano sull’imposta lorda fino alla concorrenza del suo ammontare.', en: 'Sets the brackets and rates of the tax (23% up to 28,000, 33% up to 50,000, 43% above) and provides that credits are applied against gross tax up to its full amount.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 3', en: 'L. 30/12/2025 n. 199, art. 1 c. 3' },
        effetto:
          { it: 'Determina quanta imposta si deve prima degli sconti, e fissa il limite per cui le detrazioni non possono portare l’imposta sotto zero: se valgono più dell’imposta, l’eccedenza si perde.', en: 'It determines how much tax is due before reliefs, and sets the limit under which credits cannot push the tax below zero: if they are worth more than the tax, the excess is lost.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art11!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'La modifica del 2026 ha sostituito l’aliquota centrale del 35% con il 33%: i confini degli scaglioni non sono cambiati.', en: 'The 2026 amendment replaced the middle rate of 35% with 33%: the bracket boundaries did not change.' },
        ],
      },
      {
        id: 'l199-2025',
        atto: 'L. 30/12/2025 n. 199 (Legge di bilancio 2026)',
        riferimento: 'art. 1 commi 3, 4, 649 e 650',
        dispone:
          { it: 'Abbassa dal 35% al 33% l’aliquota del secondo scaglione IRPEF, ritocca il tetto sugli oneri detraibili per i redditi alti, e proroga al 2026 la facoltà di regioni e comuni di usare gli scaglioni in vigore prima del 2025.', en: 'Cuts the second IRPEF bracket rate from 35% to 33%, adjusts the ceiling on deductible charges for higher incomes, and extends to 2026 the power of regions and municipalities to use the brackets in force before 2025.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        effetto:
          { it: 'È la legge che rende diverso il 2026 dal 2025 in questo calcolo. Il taglio di due punti sul secondo scaglione vale fino a 440 euro l’anno per chi arriva in cima alla fascia, ed è la sola modifica alla scala dell’imposta.', en: 'It is the law that makes 2026 different from 2025 in this calculation. The two-point cut on the second bracket is worth up to 440 euros a year for someone at the top of the band, and it is the only change to the tax scale.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2025-12-30;199~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'I confini degli scaglioni non si sono mossi: cambia l’aliquota centrale, non la fascia a cui si applica.', en: 'The bracket boundaries did not move: what changed is the middle rate, not the band it applies to.' },
          { it: 'I commi 649 e 650 non hanno solo esteso gli anni: il 650 ha portato al 15 aprile 2026 il termine entro cui i Comuni potevano deliberare per il 2026, mentre le regioni non hanno avuto la stessa proroga.', en: 'Subsections 649 and 650 did not only extend the years: 650 moved to 15 April 2026 the deadline by which municipalities could adopt figures for 2026, while regions were given no equivalent extension.' },
        ],
      },
      {
        id: 'tuir-art13',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 13',
        dispone:
          { it: 'Riconosce a chi ha reddito di lavoro dipendente una detrazione che decresce al crescere del reddito, con un importo fisso in più nella fascia intermedia.', en: 'Grants those with employment income a credit that tapers as income rises, with a fixed extra amount in the middle band.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        ultimaModifica: { it: 'L. 30/12/2024 n. 207, art. 1 c. 2', en: 'L. 30/12/2024 n. 207, art. 1 c. 2' },
        effetto:
          { it: 'È lo sconto principale sull’imposta. Si calcola sul reddito complessivo, non sull’imponibile, e nella fascia in cui decresce ogni euro in più di reddito viene tassato e riduce anche la detrazione.', en: 'It is the main relief against the tax. It is computed on total income, not on the taxable base, and in the band where it tapers every extra euro of income is both taxed and shrinks the credit.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art13!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Attraversando i 15.000 euro di reddito complessivo la detrazione sale di circa 1.145 euro: è una discontinuità nella direzione contraria a quella che ci si aspetta.', en: 'Crossing 15,000 euros of total income the credit rises by about 1,145 euros: a discontinuity running in the opposite direction to the one you would expect.' },
          { it: 'Il c. 6 impone di assumere il risultato dei rapporti nelle prime quattro cifre decimali. Non è un arrotondamento di busta paga: è parte della formula.', en: 'Subsection 6 requires the result of the ratios to be taken to the first four decimal places. This is not payslip rounding: it is part of the formula.' },
          { it: 'Il troncamento non è una peculiarità di questa detrazione: la stessa formula compare identica all’art. 12 c. 4, ed è una convenzione del testo unico per le detrazioni a formula.', en: 'The truncation is not peculiar to this credit: the same wording appears identically in art. 12 c. 4, and it is a convention of the consolidated act for formula-based credits.' },
        ],
      },
      {
        id: 'l207-2024-c6',
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 6',
        dispone:
          { it: 'Riconosce un’ulteriore detrazione dall’imposta lorda a chi ha un reddito complessivo fra 20.000 e 40.000 euro: 1.000 euro fino a 32.000, poi decrescente fino ad azzerarsi.', en: 'Grants a further credit against gross tax to those with total income between 20,000 and 40,000 euros: 1,000 euros up to 32,000, then tapering to zero.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'È la seconda gamba del taglio del cuneo fiscale. Sotto i 20.000 euro il beneficio esiste ma ha un’altra forma: è una somma erogata, non uno sconto sull’imposta.', en: 'It is the second leg of the cuneo fiscale (tax wedge) cut. Below 20,000 euros the benefit exists but takes another shape: it is a cash payment, not a relief against tax.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'È una detrazione vera e non porta alcuna deroga, quindi ricade nella regola generale dell’art. 11 c. 3: si consuma sull’imposta lorda e non genera credito.', en: 'It is a genuine tax credit and carries no derogation, so it falls under the general rule of art. 11 c. 3: it is consumed against gross tax and generates no refund.' },
          { it: 'Nella fascia fra 32.000 e 40.000 euro agiscono insieme tre riduzioni (l’aliquota del 33%, la decrescenza della detrazione dell’art. 13 e quella di questa), per un prelievo effettivo su ogni euro in più attorno al 54%, prima delle addizionali.', en: 'In the band between 32,000 and 40,000 euros three reductions act together (the 33% rate, the taper of the art. 13 credit and the taper of this one), for an effective take on every extra euro of around 54%, before the addizionali.' },
          { it: 'Il raccordo con la somma sotto i 20.000 è calibrato e leggermente favorevole: superando la soglia non si perde nulla, si guadagnano circa 40 euro.', en: 'The join with the cash payment below 20,000 is calibrated and slightly favourable: crossing the threshold you lose nothing, you gain about 40 euros.' },
        ],
      },
      {
        id: 'tuir-art12',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 12',
        dispone:
          { it: 'Disciplina le detrazioni per coniuge e figli a carico, a condizione che il familiare abbia un reddito proprio sotto una soglia.', en: 'Governs the credits for a dependent spouse and children, on condition that the family member’s own income is below a threshold.' },
        vigenza: { it: 'dal 20/12/2025', en: 'in force from 20 Dec 2025' },
        ultimaModifica: { it: 'D.Lgs. 18/12/2025 n. 192, art. 1', en: 'D.Lgs. 18/12/2025 n. 192, art. 1' },
        effetto:
          { it: 'Resta fuori dal calcolo, e l’articolo serve a difendere l’esclusione invece che a implementarla: la detrazione dipende dal reddito di un’altra persona, che dalla busta paga non si vede.', en: 'It stays outside the calculation, and the article serves to defend the exclusion rather than to implement it: the credit depends on another person’s income, which a payslip does not show.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art12!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Per i figli sotto i 21 anni la detrazione non esiste più, e il comma che prevedeva l’ulteriore detrazione per famiglie numerose è stato abrogato dal D.Lgs. 29/12/2021 n. 230, il decreto che ha istituito l’Assegno Unico. L’abrogazione porta la firma dell’atto che l’ha sostituita.', en: 'For children under 21 the credit no longer exists, and the subsection providing the further credit for large families was repealed by D.Lgs. 29/12/2021 n. 230, the decree that created the Assegno Unico (single family allowance). The repeal bears the signature of the act that replaced it.' },
          { it: 'Il c. 4 contiene un terzo limite, distinto dagli altri due del sistema: se i rapporti sono pari a zero, minori di zero o uguali a uno, le detrazioni non spettano.', en: 'Subsection 4 contains a third limit, distinct from the other two in the system: if the ratios come out at zero, below zero or equal to one, the credits are not due.' },
        ],
      },
      {
        id: 'tuir-art16ter',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 16-ter',
        dispone:
          { it: 'Pone un tetto complessivo agli oneri e alle spese detraibili per chi ha un reddito complessivo sopra i 75.000 euro, e ne riduce l’ammontare sopra i 200.000.', en: 'Sets an overall ceiling on deductible charges and expenses for those with total income above 75,000 euros, and reduces the amount above 200,000.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 4', en: 'L. 30/12/2025 n. 199, art. 1 c. 4' },
        effetto:
          { it: 'Non tocca questo calcolo, e la ragione è testuale: il tetto riguarda «oneri e spese», mentre la detrazione per lavoro dipendente e quella da cuneo sono legate al tipo di reddito e non a un esborso.', en: 'It does not touch this calculation, and the reason is textual: the ceiling concerns “charges and expenses”, whereas the employment income credit and the tax wedge credit are tied to the type of income and not to an outlay.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art16ter!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Sono tre i meccanismi sovrapposti che limitano le detrazioni ai redditi alti (art. 15 c. 3-bis, art. 16-ter c. 1–5 e art. 16-ter c. 5-bis), e nessuno dei tre tocca le detrazioni legate alla tipologia di reddito.', en: 'Three overlapping mechanisms limit credits for higher incomes (art. 15 c. 3-bis, art. 16-ter c. 1–5 and art. 16-ter c. 5-bis), and none of the three touches credits tied to the type of income.' },
        ],
      },
      {
        id: 'tuir-art15',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 15',
        dispone: { it: 'Disciplina le detrazioni per oneri e spese sostenute dal contribuente.', en: 'Governs the credits for charges and expenses borne by the taxpayer.' },
        effetto:
          { it: 'Resta fuori: nel caso standard gli oneri detraibili valgono zero. Ne teniamo i commi 3-bis e 3-ter, che servono a delimitare l’art. 16-ter.', en: 'It stays outside: in the standard case deductible expenses are zero. We keep subsections 3-bis and 3-ter, which serve to bound art. 16-ter.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art15!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'dlgs117-2026',
        atto: 'D.Lgs. 19/06/2026 n. 117',
        riferimento: 'artt. 376 e 377',
        dispone:
          { it: 'Approva il nuovo Testo unico delle imposte sui redditi, destinato a sostituire il TUIR del 1986. L’art. 377 fissa la decorrenza: le sue disposizioni si applicano dal 1° gennaio 2027. L’art. 376 dispone le abrogazioni a partire da quella stessa data.', en: 'It approves the new consolidated income tax act, meant to replace the 1986 TUIR. Art. 377 sets the start date: its provisions apply from 1 January 2027. Art. 376 provides for the repeals from that same date.' },
        vigenza: { it: 'in vigore dal 04/07/2026, con applicazione dal 01/01/2027', en: 'in force from 4 Jul 2026, applying from 1 Jan 2027' },
        effetto:
          { it: 'Non cambia nulla in questo calcolo. L’anno d’imposta è il 2026, e per il 2026 il TUIR del 1986 è pienamente in vigore: ogni articolo citato in questa pagina si applica. È qui perché chi apre il TUIR su un portale normativo trova già oggi l’avviso di abrogazione, e senza questa scheda penserebbe che il calcolatore poggi su una legge morta.', en: 'It changes nothing in this calculation. The tax year is 2026, and for 2026 the 1986 TUIR is fully in force: every article cited on this page applies. It is here because anyone opening the TUIR on a legal database already sees the repeal notice, and without this card would think the calculator rests on a dead law.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2026-06-19;117~art377!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'Il nuovo testo unico riordina e rinumera: molti articoli richiamano espressamente la disposizione corrispondente del DPR 917/1986. Per il calcolo del netto è la prova più netta del perché i parametri normativi stiano nei dati e non nel codice — qui a cambiare non è un’aliquota, è la numerazione di un testo intero.', en: 'The new consolidated act reorganises and renumbers: many articles expressly refer to the corresponding provision of the 1986 TUIR. For net pay this is the clearest demonstration of why tax parameters belong in data and not in code — what changes here is not a rate, it is the numbering of an entire text.' },
          { it: 'L’abrogazione riguarda il solo TUIR: gli altri atti citati da questo archivio — il D.Lgs. 446/1997, il D.Lgs. 360/1998, il D.Lgs. 68/2011 e il DL 3/2020 — restano in vigore e non sono toccati.', en: 'The repeal concerns the TUIR alone: the other acts cited in this archive — Legislative Decrees 446/1997, 360/1998 and 68/2011, and Decree-Law 3/2020 — remain in force and are untouched.' },
        ],
      },
      {
        id: 'tuir-art165',
        atto: 'TUIR (DPR 917/1986)',
        riferimento: 'art. 165',
        dispone: { it: 'Riconosce un credito per le imposte pagate all’estero sui redditi ivi prodotti.', en: 'Grants a credit for taxes paid abroad on income produced there.' },
        vigenza: { it: 'dal 07/10/2015', en: 'in force from 7 Oct 2015' },
        effetto:
          { it: 'Nel caso standard vale zero, ma è il riferimento esatto della condizione che accende l’addizionale comunale, che guarda l’imposta al netto delle detrazioni e di questo credito.', en: 'In the standard case it is zero, but it is the exact reference in the condition that switches on the addizionale comunale, which looks at the tax net of credits and of this relief.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art165!vig=',
        consultata: '2026-08-27',
      },
    ],
  },

  {
    id: 'addizionali',
    titolo: { it: 'Addizionale regionale e comunale', en: 'Addizionale regionale e comunale' },
    occhiello:
      { it: 'Le stesse imposte, incassate da Regione e Comune. Hanno la base dell’IRPEF ma una disciplina propria, e due norme istitutive che, lette una accanto all’altra, non si somigliano quanto ci si aspetterebbe.', en: 'The same tax, collected by the region and the municipality. They share the IRPEF base but have rules of their own, and two founding provisions which, read side by side, resemble each other less than you would expect.' },
    schede: [
      {
        id: 'dlgs446-1997-art50',
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 50',
        dispone:
          { it: 'Istituisce l’addizionale regionale, ne fissa la base e stabilisce che è dovuta soltanto se per lo stesso anno l’IRPEF risulta dovuta. L’aliquota, che il testo originario poneva allo 0,9% maggiorabile fino all’1,4%, oggi non si legge più qui: la determina l’art. 6 del D.Lgs. 68/2011.', en: 'Creates the addizionale regionale, sets its base and provides that it is due only if IRPEF is itself due for the same year. The rate, which the original text set at 0.9% raisable to 1.4%, is no longer read here: it is set by art. 6 of D.Lgs. 68/2011.' },
        vigenza: { it: 'dal 13/12/2014', en: 'in force from 13 Dec 2014' },
        ultimaModifica: { it: 'D.Lgs. 21/11/2014 n. 175, art. 8', en: 'D.Lgs. 21/11/2014 n. 175, art. 8' },
        effetto:
          { it: 'Determina quando l’addizionale regionale si paga e su quale base. La condizione è binaria: se l’imposta è dovuta si applica sull’intera base, se non lo è non si applica affatto.', en: 'It determines when the addizionale regionale is paid and on what base. The condition is binary: if the tax is due it applies to the whole base, if it is not it does not apply at all.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art50!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Due rinvii alla numerazione del TUIR anteriore al 2004. Il c. 2 rinvia ai crediti «di cui agli articoli 14 e 15», che oggi non hanno più quel contenuto; il c. 4 rinvia ai redditi di lavoro dipendente «di cui agli articoli 46 e 47», che oggi sono il 49 e il 50. La norma gemella sull’addizionale comunale è stata riallineata, questa no. E sono state modificate dallo stesso atto nello stesso giorno.', en: 'Two cross-references to the pre-2004 numbering of the TUIR. Subsection 2 refers to the credits “under articles 14 and 15”, which no longer carry that content; subsection 4 refers to employment income “under articles 46 and 47”, which today are 49 and 50. The twin provision on the addizionale comunale was realigned, this one was not. And both were amended by the same act on the same day.' },
          { it: 'Quindici enti su ventuno hanno almeno un’aliquota sopra l’1,4%, e non è una deroga: è il tetto sbagliato. Quello applicabile lo pone l’art. 6 del D.Lgs. 68/2011, che fissa una base dell’1,23% più una maggiorazione fino a 2,1 punti, cioè 3,33%. Chi lo supera lo fa per un automatismo sanitario che l’art. 6 c. 10 mette espressamente fuori dai tetti.', en: 'Fifteen authorities out of twenty-one have at least one rate above 1.4%, and it is not a derogation: it is the wrong ceiling. The applicable one is set by art. 6 of D.Lgs. 68/2011, which sets a 1.23% base plus an increase of up to 2.1 points, i.e. 3.33%. Those above it are there through a healthcare automatism that art. 6 c. 10 expressly places outside the caps.' },
          { it: 'Due enti su ventuno hanno due provvedimenti per lo stesso anno, e si applica il più recente. Molise e Puglia: per entrambi una rideterminazione pubblicata a metà 2026 sostituisce quella di gennaio, e vale sull’intero periodo d’imposta. Il massimo d’Italia è quindi il 3,63% del Molise, non il 3,33%.', en: 'Two authorities out of twenty-one have two measures for the same year, and the later one applies. Molise and Puglia: for both, a re-determination published in mid-2026 replaces January’s and applies to the whole tax year. Italy’s highest rate is therefore Molise’s 3.63%, not 3.33%.' },
          { it: 'L’aliquota di un anno non è congelata, e non cambia solo in meglio. Il c. 3 consente di applicare retroattivamente una maggiorazione più favorevole; ma l’art. 1 c. 174 della L. 311/2004 fa il contrario, e vince: se una regione in piano di rientro non ripiana il disavanzo entro il 31 maggio, le maggiorazioni scattano nell’anno in corso. È successo nel 2026 a Puglia e Molise, in peggio e con effetto da gennaio.', en: 'A given year’s rate is not frozen, and it does not only change for the better. Subsection 3 allows a more favourable increase to be applied retroactively; but art. 1 c. 174 of L. 311/2004 does the opposite, and prevails: if a region under a recovery plan has not covered its deficit by 31 May, the increases take effect in the year in progress. It happened in 2026 to Puglia and Molise, for the worse and backdated to January.' },
          { it: 'Contraddizione interna: il c. 2 individua l’aliquota con la residenza, il c. 5 destina il gettito al domicilio fiscale al 1° gennaio. Due criteri diversi nella stessa norma.', en: 'An internal contradiction: subsection 2 identifies the rate by residence, subsection 5 allocates the revenue by tax domicile on 1 January. Two different criteria in the same provision.' },
        ],
      },
      {
        id: 'dlgs68-2011-art6',
        atto: 'D.Lgs. 06/05/2011 n. 68, come mod. dall’art. 28 del D.L. 06/12/2011 n. 201',
        riferimento: 'art. 6 c. 1',
        dispone:
          { it: 'Fissa all’1,23% l’aliquota di base dell’addizionale regionale, e consente a ciascuna regione di maggiorarla fino a 2,1 punti, con un limite più stretto sul primo scaglione.', en: 'Sets the base rate of the addizionale regionale at 1.23%, and lets each region increase it by up to 2.1 points, with a tighter limit on the first bracket.' },
        vigenza: { it: 'dal 2011', en: 'in force from 2011' },
        ultimaModifica: { it: 'D.L. 06/12/2011 n. 201, art. 28 c. 1 e 2', en: 'D.L. 06/12/2011 n. 201, art. 28 c. 1 and 2' },
        effetto:
          { it: 'È l’aliquota che si applica dove la regione non ne delibera una propria, e la base su cui si sommano le maggiorazioni di chi la delibera. L’1,23% è l’aliquota intera di sei enti e la prima fascia di altri quattro. Il c. 2 dell’art. 28 estende la misura alle regioni a statuto speciale e alle province autonome.', en: 'It is the rate that applies where a region adopts none of its own, and the base the increases are added to where one is adopted. The 1.23% is the whole rate for six authorities and the first band for four more. Subsection 2 of art. 28 extends the measure to the special-statute regions and the autonomous provinces.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2011-05-06;68~art6!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'È l’articolo che porta l’1,23%, e non l’art. 50 del D.Lgs. 446/1997, che nel testo vigente legge ancora «0,9 per cento». Il prospetto ministeriale attribuisce la modifica al 446: l’art. 28 c. 1 del D.L. 201/2011 modifica invece questo decreto.', en: 'This is the article carrying the 1.23%, not art. 50 of D.Lgs. 446/1997, whose text in force still reads “0.9 per cent”. The ministerial table attributes the amendment to the 446: art. 28 c. 1 of D.L. 201/2011 amends this decree instead.' },
          { it: 'I due limiti si leggono nelle aliquote pubblicate: sul primo scaglione la maggiorazione non può superare 0,5 punti, sugli altri arriva a 2,1. Il Piemonte pubblica le proprie aliquote già scomposte in base più maggiorazione, e i suoi quattro valori cadono esattamente dentro quei due limiti.', en: 'The two limits can be read off the published rates: on the first bracket the increase may not exceed 0.5 points, on the others it reaches 2.1. Piemonte publishes its rates already broken down into base plus increase, and its four values fall exactly within those two limits.' },
          { it: 'Il c. 3 pone un secondo tetto, più stretto e spesso ignorato: sul primo scaglione la maggiorazione non può superare 0,5 punti. È il motivo per cui tante regioni si fermano a 1,73% sulla prima fascia pur avendo aliquote alte sulle altre.', en: 'Subsection 3 sets a second, tighter and often overlooked cap: on the first bracket the increase may not exceed 0.5 points. It is why so many regions stop at 1.73% on the first band while carrying high rates on the others.' },
          { it: 'Il c. 10 è una clausola di salvezza, e senza di essa il prospetto ministeriale sembrerebbe illegittimo: mette gli automatismi legati ai disavanzi sanitari fuori dai tetti dell’articolo. È lì che stanno il 3,63% del Molise e il 3,33% della Puglia.', en: 'Subsection 10 is a saving clause, and without it the ministerial table would look unlawful: it places the automatisms tied to healthcare deficits outside the article’s caps. That is where Molise’s 3.63% and Puglia’s 3.33% sit.' },
          { it: 'Il c. 4 vieta di inventare scaglioni: le aliquote possono essere differenziate solo in relazione agli scaglioni di reddito dell’IRPEF statale. È la norma che rende leggibile il dato importato, dove ogni ente usa uno di due soli set di confini.', en: 'Subsection 4 forbids inventing brackets: rates may be differentiated only in relation to the state IRPEF brackets. It is the provision that makes the imported data legible, where every authority uses one of only two sets of boundaries.' },
          { it: 'Il c. 6 autorizza le detrazioni regionali, ma solo «in luogo dell’erogazione di sussidi», e il c. 9 sospende quel potere alle regioni sotto piano di rientro. Le tre detrazioni che il calcolatore applica stanno tutte dentro questa cornice.', en: 'Subsection 6 authorises regional tax credits, but only “in place of paying subsidies”, and subsection 9 suspends that power for regions under a recovery plan. The three credits the calculator applies all sit within this frame.' },
        ],
      },
      {
        id: 'dlgs360-1998-art1',
        atto: 'D.Lgs. 28/09/1998 n. 360',
        riferimento: 'art. 1',
        dispone:
          { it: 'Istituisce l’addizionale comunale, la calcola sul reddito complessivo al netto degli oneri deducibili, la subordina al fatto che l’IRPEF risulti dovuta, e consente al Comune una soglia di esenzione per requisiti reddituali.', en: 'Creates the addizionale comunale, computes it on total income net of deductible charges, makes it conditional on IRPEF being due, and lets the municipality set an exemption threshold based on income requirements.' },
        vigenza: { it: 'art. 1 dal 13/12/2014; artt. 2 e 3 dal 18/05/1999', en: 'art. 1 in force from 13 Dec 2014; artt. 2 and 3 from 18 May 1999' },
        ultimaModifica: { it: 'D.Lgs. 21/11/2014 n. 175, art. 8', en: 'D.Lgs. 21/11/2014 n. 175, art. 8' },
        effetto:
          { it: 'Determina quando si paga l’addizionale comunale e su quale base, e autorizza la soglia sotto la quale un Comune può non farla pagare affatto. Il Comune è quello del domicilio fiscale al 1° gennaio: chi trasloca a marzo paga per tutto l’anno al Comune di partenza.', en: 'It determines when the addizionale comunale is paid and on what base, and authorises the threshold below which a municipality may not charge it at all. The municipality is the one of tax domicile on 1 January: someone who moves in March pays for the whole year to the municipality they left.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'La soglia di esenzione è un limite secco e non una franchigia: superata di un euro, l’addizionale si paga sull’intero reddito e non sull’eccedenza. La lettura è confermata dal modello dati ministeriale, che la espone come «esenzione per redditi imponibili fino a euro X».', en: 'The exemption threshold is a hard limit and not an allowance: one euro over it and the addizionale is paid on the whole income, not on the excess. The reading is confirmed by the ministerial data model, which presents it as “exemption for taxable income up to X euros”.' },
          { it: 'Il c. 8 prevede che per quanto non disciplinato si applichino le regole dell’IRPEF. Non ne discende che le detrazioni abbattano l’addizionale: il rinvio copre ciò che non è disciplinato, e base e presupposto sono disciplinati espressamente.', en: 'Subsection 8 provides that, for whatever is not governed expressly, the IRPEF rules apply. It does not follow that tax credits reduce the addizionale: the cross-reference covers what is not governed, and both the base and the condition are governed expressly.' },
          { it: 'La quota provinciale non è una seconda aliquota da sommare: vive dentro la compartecipazione statale, e Comune e Provincia se la dividono a valle.', en: 'The provincial share is not a second rate to be added on: it lives inside the state shared portion, and the municipality and the province divide it downstream.' },
        ],
      },
      {
        id: 'l207-2024-c727',
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 727 e 728',
        dispone:
          { it: 'Consente a regioni e province autonome di applicare aliquote differenziate sugli scaglioni IRPEF in vigore prima del 2025, e stabilisce che l’ente che non delibera applica scaglioni e aliquote già vigenti nell’anno precedente.', en: 'Lets regions and autonomous provinces apply differentiated rates on the IRPEF brackets in force before 2025, and provides that an authority which does not adopt new figures applies the brackets and rates already in force the previous year.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 649', en: 'L. 30/12/2025 n. 199, art. 1 c. 649' },
        effetto:
          { it: 'Determina quali strutture di aliquota un ente può usare, e cosa si applica quando non delibera. Il fallback non è aliquota zero: è la prosecuzione dell’anno precedente.', en: 'It determines which rate structures an authority may use, and what applies when it adopts nothing. The fallback is not a zero rate: it is the previous year carrying on.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il comma attribuisce la potestà a «le regioni e le province autonome di Trento e di Bolzano». Ne discende che per un comune del Trentino-Alto Adige l’ente che fissa l’addizionale «regionale» non è la regione: sono le due province, separatamente. Il prospetto ministeriale le porta come righe distinte, e il Trentino-Alto Adige come ente impositore non esiste.', en: 'The subsection confers the power on “the regions and the autonomous provinces of Trento and Bolzano”. It follows that for a municipality in Trentino-Alto Adige the authority setting the “regional” surcharge is not the region: it is the two provinces, separately. The ministerial table carries them as distinct rows, and Trentino-Alto Adige as a levying authority does not exist.' },
          { it: 'Gli scaglioni delle addizionali non sono quelli dell’IRPEF: l’ente sceglie fra due set autorizzati. Riusare le costanti dell’IRPEF produce numeri plausibili e sbagliati.', en: 'The brackets of the addizionali are not the IRPEF ones: the authority picks between two authorised sets. Reusing the IRPEF constants produces plausible, wrong numbers.' },
          { it: 'Sulle 21 righe del prospetto regionale le uniche soglie usate sono 15.000, 28.000 e 50.000: nessun ente si è inventato soglie proprie.', en: 'Across the 21 rows of the regional table the only thresholds used are 15,000, 28,000 and 50,000: no authority has invented thresholds of its own.' },
        ],
      },
      {
        id: 'l207-2024-c751',
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 751 e 752',
        dispone:
          { it: 'Fa per i Comuni quello che i commi 727 e 728 fanno per le regioni: autorizza gli scaglioni previgenti e stabilisce che chi non delibera applica l’anno precedente.', en: 'Does for municipalities what subsections 727 and 728 do for regions: authorises the previous brackets and provides that an authority adopting nothing applies the previous year.' },
        vigenza: { it: 'dal 01/01/2026', en: 'in force from 1 Jan 2026' },
        ultimaModifica: { it: 'L. 30/12/2025 n. 199, art. 1 c. 650', en: 'L. 30/12/2025 n. 199, art. 1 c. 650' },
        effetto:
          { it: 'È la norma che regge il caso base del calcolatore: Milano non ha deliberato per il 2026, quindi si applicano aliquota ed esenzione del 2025. Alla data di estrazione dei dati riguardava il 61% dei Comuni italiani.', en: 'It is the rule holding up the calculator’s base case: Milano adopted nothing for 2026, so the 2025 rate and exemption apply. At the date the data were extracted it concerned 61% of Italian municipalities.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 650 non ha solo esteso gli anni: ha anche portato al 15 aprile 2026 il termine entro cui i Comuni potevano deliberare per il 2026. Le regioni non hanno avuto la stessa proroga, quindi i due dataset hanno finestre di stabilità diverse e nessuna coincide con il 1° gennaio.', en: 'Subsection 650 did not only extend the years: it also moved to 15 April 2026 the deadline by which municipalities could adopt figures for 2026. Regions were given no equivalent extension, so the two datasets have different windows of stability and neither coincides with 1 January.' },
        ],
      },
      {
        id: 'dlgs446-1997-art52',
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'art. 52',
        dispone:
          { it: 'Riconosce a Province e Comuni la potestà di disciplinare le proprie entrate con regolamento, escluse la fattispecie imponibile, i soggetti passivi e l’aliquota massima.', en: 'Recognises the power of provinces and municipalities to govern their own revenue by regulation, save for the taxable event, the taxpayers and the maximum rate.' },
        effetto:
          { it: 'Non entra nel calcolo, ma è l’argomento per cui la soglia di esenzione comunale è un’esenzione soggettiva e non una franchigia: il Comune non può ridefinire la base imponibile.', en: 'It does not enter the calculation, but it is the argument for treating the municipal exemption threshold as a personal exemption and not an allowance: the municipality cannot redefine the taxable base.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art52!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Il c. 2 è stato abrogato dal DL 34/2019 art. 15-bis: la vecchia regola sull’efficacia temporale dei regolamenti non sta più qui.', en: 'Subsection 2 was repealed by DL 34/2019 art. 15-bis: the old rule on when regulations take effect no longer lives here.' },
        ],
      },
      {
        id: 'dlgs446-1997-art36',
        atto: 'D.Lgs. 15/12/1997 n. 446',
        riferimento: 'artt. 36 e 38',
        dispone:
          { it: 'Aboliscono i contributi per il Servizio sanitario nazionale a carico dei lavoratori e destinano alle regioni il gettito dell’addizionale regionale.', en: 'They abolish the national health service contributions borne by workers and allocate the revenue of the addizionale regionale to the regions.' },
        effetto:
          { it: 'Non cambia un numero, ma spiega da dove viene l’addizionale regionale: nasce nella stessa riforma che abolisce un contributo sanitario che il lavoratore pagava comunque, ed è destinata a finanziare la sanità regionale. È una sostituzione funzionale, non aritmetica.', en: 'It does not change a figure, but it explains where the addizionale regionale comes from: it is born in the same reform that abolishes a health contribution the worker was paying anyway, and it is earmarked to fund regional healthcare. A functional substitution, not an arithmetical one.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art36!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'mef-elenchi',
        atto: 'MEF, Dipartimento delle Finanze — Fiscalità regionale e locale',
        riferimento:
          'elenco addizionale comunale 2026 (7.897 comuni), elenco annuale 2025 aggiornato al 13/03/2026 (7.896 comuni), prospetto addizionale regionale 2026 (21 enti)',
        dispone:
          { it: 'Pubblicano le aliquote, gli scaglioni e le soglie di esenzione deliberate da ciascun ente.', en: 'They publish the rates, brackets and exemption thresholds adopted by each authority.' },
        effetto:
          { it: 'Danno i valori che le norme non contengono. Sono la fonte delle aliquote di Regione e Comune usate dal calcolatore.', en: 'They give the figures the statutes do not contain. They are the source of the regional and municipal rates the calculator uses.' },
        portale: 'MEF, Dipartimento delle Finanze',
        url: 'https://www.finanze.gov.it/it/fiscalita/fiscalita-regionale-e-locale/Addizionale-comunale-allIRPEF/aliquote-applicabili/Elenchi-generali-aggiornati-quotidianamente/',
        consultata: '2026-08-28',
        note: [
          { it: 'Gli elenchi sono aggiornati quotidianamente e non portano un timbro di versione: la data di estrazione è l’unico riferimento, e per questo è dichiarata accanto al dato.', en: 'The lists are updated daily and carry no version stamp: the extraction date is the only reference, and that is why it is declared next to the figure.' },
          { it: 'La dicitura «0*» non significa aliquota zero: alla data di estrazione indica un Comune che non ha ancora deliberato per l’anno in corso. Milano, Roma, Trento e Bolzano risultano «0*» nell’elenco 2026.', en: 'The marking “0*” does not mean a zero rate: at the extraction date it flags a municipality that has not yet adopted figures for the current year. Milano, Roma, Trento and Bolzano all show “0*” in the 2026 list.' },
          { it: 'L’elenco annuale distingue due modi diversi di non pagare nulla: Bolzano ha un’aliquota deliberata pari a zero, Trento risulta «0*» anche a consolidamento avvenuto, cioè non ha mai istituito il tributo.', en: 'The annual list distinguishes two different ways of paying nothing: Bolzano has an adopted rate of zero, Trento shows “0*” even after consolidation, meaning it never introduced the tax at all.' },
          { it: 'Il tetto comunale di 0,8 punti non è assoluto: sei aliquote lo superano, con un massimo dell’1,2%. Il file etichetta esplicitamente gli enti in dissesto e predissesto finanziario.', en: 'The municipal ceiling of 0.8 points is not absolute: six rates exceed it, with a maximum of 1.2%. The file explicitly labels authorities in financial distress and pre-distress.' },
        ],
      },
    ],
  },

  {
    id: 'regionali',
    titolo: { it: 'Gli atti dei ventuno enti regionali', en: 'The acts of the twenty-one regional authorities' },
    occhiello:
      { it: 'L’addizionale regionale la fissa il tuo ente, non lo Stato: sotto la stessa norma statale ci sono ventun discipline diverse. Qui c’è l’atto di ciascuna, con quello che dispone.', en: 'The regional surcharge is set by your own authority, not by the State: under the same national rule there are twenty-one different regimes. Here is each one’s act, with what it provides.' },
    schede: [
      {
        id: 'reg-lombardia',
        atto: 'L.R. Lombardia 14/07/2003 n. 10',
        riferimento: 'art. 72 c. 1',
        dispone:
          { it: 'Fissa quattro aliquote sugli scaglioni previgenti: 1,23% fino a 15.000 euro, 1,58% fino a 28.000, 1,72% fino a 50.000, 1,73% oltre.', en: 'Sets four rates on the pre-2025 brackets: 1.23% up to 15,000 euros, 1.58% up to 28,000, 1.72% up to 50,000, 1.73% above.' },
        effetto:
          { it: 'È la scala che si applica a chi risiede in Lombardia, Milano compresa. La prima fascia sta esattamente all’aliquota di base statale: la Regione maggiora solo sopra i 15.000 euro.', en: 'This is the scale applied to residents of Lombardy, Milan included. The first band sits exactly at the national base rate: the Region only adds a surcharge above 15,000 euros.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef',
        consultata: '2026-08-31',
        note: [
          { it: 'Il testo unico dei tributi lombardi si modifica in luogo, quindi citarne un articolo significa citarne la versione vigente: le quattro fasce sono arrivate con la l.r. 5/2022, non con il testo del 2003.', en: 'The Lombard consolidated tax act is amended in place, so citing one of its articles means citing the version in force: the four bands arrived with regional law 5/2022, not with the 2003 text.' },
          { it: 'Limite dichiarato: la banca dati del Consiglio regionale non ha restituito il testo dell’articolo. È accertato quale atto fissa le aliquote e quali sono, non la lettera del comma.', en: 'Declared limit: the regional council database did not return the text of the article. Which act sets the rates, and what they are, is established; the wording of the subsection is not.' },
        ],
      },
      {
        id: 'reg-lazio',
        atto: 'L.R. Lazio 31/12/2025 n. 20 (Legge di stabilità regionale 2026), BUR n. 108 straordinario del 31/12/2025',
        riferimento: 'art. 2 commi 1, 2 e 3',
        dispone:
          { it: 'Il c. 1 fissa le aliquote per il triennio 2026-2028: 1,73% fino a 15.000 euro e 3,33% su tutti gli scaglioni superiori. Il c. 2, per il solo 2026, applica l’1,73% sull’intero imponibile a chi non supera 28.000 euro. Il c. 3 dispone una detrazione di 60 euro fra 28.001 e 30.000 euro.', en: 'Subsection 1 sets the rates for 2026-2028: 1.73% up to 15,000 euros and 3.33% on every higher bracket. Subsection 2, for 2026 only, applies 1.73% to the whole taxable amount for those not above 28,000 euros. Subsection 3 grants a 60-euro deduction between 28,001 and 30,000 euros.' },
        effetto:
          { it: 'È l’unico ente in cui convivono tutte e tre le forme che il calcolatore modella: una progressione per scaglioni, una fascia intera sotto una soglia, e una detrazione legata al solo reddito.', en: 'It is the only authority where all three shapes the calculator models coexist: a bracket progression, a whole-band rate below a threshold, and a deduction tied to income alone.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.consiglio.regione.lazio.it/consiglio-regionale/?vw=leggiregionalidettaglio&id=9524&sv=vigente',
        consultata: '2026-08-31',
        note: [
          { it: 'La durata non è uniforme: le aliquote valgono per il triennio, la fascia intera e la detrazione per il solo 2026. Il dato importato è per anno e non porta questa distinzione.', en: 'The duration is not uniform: the rates run for three years, the whole-band rate and the deduction for 2026 only. The imported data is per year and does not carry that distinction.' },
          { it: 'Il pavimento a zero è testuale: non può derivarne il riconoscimento di alcun credito d’imposta. E il c. 3 dichiara di disporre la detrazione ai sensi dell’art. 6 c. 6 del D.Lgs. 68/2011.', en: 'The floor at zero is in the text: no tax credit may arise from it. And subsection 3 states that the deduction is granted under art. 6(6) of Legislative Decree 68/2011.' },
        ],
      },
      {
        id: 'reg-valle-aosta',
        atto: 'L.R. Valle d’Aosta 23/12/2025 n. 29 art. 1 c. 1 (esenzione), su aliquota di base ex art. 6 c. 1 del D.Lgs. 68/2011 come mod. dall’art. 28 c. 1 del D.L. 201/2011',
        dispone:
          { it: 'Esenta dall’addizionale regionale chi ha un reddito complessivo fino a 15.000 euro; oltre quella soglia si applica l’aliquota ordinaria sull’intero imponibile.', en: 'Exempts from the regional surcharge anyone with total income up to 15,000 euros; above that threshold the ordinary rate applies to the whole taxable amount.' },
        effetto:
          { it: 'È l’unico ente con una soglia di esenzione sull’addizionale regionale. È una soglia secca e non una franchigia: a 15.000 euro l’imposta è zero, a 15.000,01 si paga sull’intero.', en: 'It is the only authority with an exemption threshold on the regional surcharge. It is a cliff, not an allowance: at 15,000 euros the tax is zero, at 15,000.01 it is due on the whole amount.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.consiglio.vda.it/app/leggieregolamenti/dettaglio?pk_lr=11701',
        consultata: '2026-08-31',
        note: [
          { it: 'La Regione non fissa l’aliquota: rinvia a quella ordinaria. L’1,23% viene dall’art. 6 c. 1 del D.Lgs. 68/2011, esteso alle autonomie speciali dall’art. 28 c. 2 del D.L. 201/2011.', en: 'The Region does not set the rate: it defers to the ordinary one. The 1.23% comes from art. 6(1) of Legislative Decree 68/2011, extended to the special-statute regions by art. 28(2) of Decree-Law 201/2011.' },
          { it: 'La soglia si misura sul reddito complessivo determinato ai fini IRPEF, non sul solo imponibile dell’addizionale. Il prospetto ministeriale attribuisce per errore la modifica al D.Lgs. 446/1997 invece che al D.Lgs. 68/2011.', en: 'The threshold is measured on total income as determined for IRPEF, not on the surcharge base alone. The ministerial table wrongly attributes the amendment to Legislative Decree 446/1997 instead of 68/2011.' },
        ],
      },
      {
        id: 'reg-piemonte',
        atto: 'L.R. Piemonte 28/03/2022 n. 4',
        riferimento: 'art. 1 ter',
        dispone:
          { it: 'Fissa maggiorazioni di 0,39 · 1,45 · 2,08 · 2,10 punti sull’aliquota di base, da cui le aliquote 1,62% · 2,68% · 3,31% · 3,33% sugli scaglioni previgenti.', en: 'Sets surcharges of 0.39, 1.45, 2.08 and 2.10 points over the base rate, giving 1.62%, 2.68%, 3.31% and 3.33% on the pre-2025 brackets.' },
        effetto:
          { it: 'Le maggiorazioni piemontesi cadono tutte dentro i limiti statali: 0,39 punti sul primo scaglione stanno sotto il tetto di mezzo punto, e 2,10 sull’ultimo è il massimo consentito dal 2015.', en: 'The Piedmont surcharges all fall inside the national limits: 0.39 points on the first bracket is below the half-point cap, and 2.10 on the top bracket is the maximum allowed since 2015.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://arianna.cr.piemonte.it/iterlegcoordweb/dettaglioLegge.do?urnLegge=urn:nir:regione.piemonte:legge:2022-03-28%3B4',
        consultata: '2026-08-31',
        note: [
          { it: 'La Regione pubblica le aliquote già scomposte in aliquota di base più maggiorazione: è la stessa aritmetica dell’art. 6 del D.Lgs. 68/2011, confermata da un ente che non aveva ragione di confermarla.', en: 'The Region publishes its rates already split into base rate plus surcharge: the same arithmetic as art. 6 of Legislative Decree 68/2011, confirmed by an authority that had no reason to confirm it.' },
          { it: 'Servono due leggi: la l.r. 4/2022 fissa 0,39 · 0,90 · 1,52 · 2,10, e la l.r. 16/2025 aggiunge per il 2026-2027 0,55 punti sulla seconda fascia e 0,56 sulla terza. Le detrazioni piemontesi sono per carichi di famiglia, quindi fuori dal perimetro.', en: 'Two laws are needed: regional law 4/2022 sets 0.39, 0.90, 1.52 and 2.10, and regional law 16/2025 adds, for 2026-2027, 0.55 points on the second band and 0.56 on the third. The Piedmont deductions are for dependants, so outside this scope.' },
        ],
      },
      {
        id: 'reg-trento',
        atto: 'L.P. Trento 23/12/2019 n. 13',
        riferimento: 'art. 1 commi 2-quater, 2-sexies e 3-bis',
        dispone:
          { it: 'Riconosce una deduzione di 30.000 euro dalla base dell’addizionale a chi ha un imponibile non superiore a 30.000 euro, e fissa le aliquote all’1,23% fino a 50.000 euro e all’1,73% oltre.', en: 'Grants a 30,000-euro deduction from the surcharge base to those with taxable income no higher than 30,000 euros, and sets rates at 1.23% up to 50,000 euros and 1.73% above.' },
        effetto:
          { it: 'È l’unico ente che agisce sulla base imponibile invece che sull’aliquota o sull’imposta: la deduzione azzera la base, quindi sotto i 30.000 euro l’addizionale è applicata e vale zero, non «non dovuta».', en: 'It is the only authority that acts on the taxable base rather than on the rate or the tax: the deduction wipes out the base, so below 30,000 euros the surcharge is applied and comes to zero, not "not due".' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.consiglio.provincia.tn.it/leggi-e-archivi/codice-provinciale/Pages/legge.aspx?uid=34300',
        consultata: '2026-08-31',
        note: [
          { it: 'I due numeri coincidono — 30.000 di deduzione fino a 30.000 di imponibile — e restano due campi distinti: se la Provincia ne cambiasse uno solo, un modello a soglia darebbe un numero sbagliato senza che nulla se ne accorga.', en: 'The two figures coincide — a 30,000 deduction up to 30,000 of taxable income — and remain two separate fields: were the Province to change only one, a threshold model would produce a wrong figure with nothing noticing.' },
          { it: 'La detrazione trentina di 246 euro per figlio a carico è per carichi di famiglia, quindi fuori perimetro. Limite dichiarato: le pagine del Consiglio provinciale non restituiscono l’articolato, e i parametri sono confermati sulla scheda ministeriale.', en: 'The Trento deduction of 246 euros per dependent child is a family-related relief, so outside this scope. Declared limit: the provincial council pages do not return the articles, and the parameters are confirmed on the ministerial sheet.' },
        ],
      },
      {
        id: 'reg-bolzano',
        atto: 'L.P. Bolzano 11/08/1998 n. 9',
        riferimento: 'art. 21/sexiesdecies',
        dispone:
          { it: 'Fissa le aliquote all’1,23% fino a 50.000 euro e all’1,73% oltre, e prevede due detrazioni legate al solo reddito: 430,50 euro per chi non supera 90.000 euro di imponibile, e una detrazione a formula pari a 125,00 moltiplicato per il rapporto fra l’imponibile diminuito di 50.000 e 25.000, con massimo 125,00 euro, per chi supera i 50.000.', en: 'Sets rates at 1.23% up to 50,000 euros and 1.73% above, and provides two income-only deductions: 430.50 euros for those not above 90,000 euros of taxable income, and a formula-based deduction of 125.00 times the ratio of taxable income less 50,000 to 25,000, capped at 125.00 euros, for those above 50,000.' },
        effetto:
          { it: 'Il calcolatore applica la prima detrazione e non la seconda, e su questo sovrastima l’imposta fino a 125 euro nei comuni altoatesini. La seconda non è un dettaglio: 125 euro è lo 0,50% di 25.000, cioè il salto di aliquota moltiplicato per l’ampiezza della banda. La Provincia non alza l’aliquota con un gradino, la fa entrare gradualmente.', en: 'The calculator applies the first deduction and not the second, and on that it overstates the tax by up to 125 euros in South Tyrolean municipalities. The second is no detail: 125 euros is 0.50% of 25,000, that is the rate step multiplied by the width of the band. The Province does not raise the rate with a step, it phases it in.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://lexbrowser.provinz.bz.it/doc/it/lp-1998-9_3/legge_provinciale_11_agosto_1998_n_9.aspx?view=1',
        consultata: '2026-08-31',
        note: [
          { it: 'È una differenza dichiarata e non ancora chiusa: il tipo che descrive le detrazioni locali porta un importo fisso entro una banda di reddito e non sa esprimere una formula. Il verso dell’errore è noto — imposta più alta, netto più basso del reale.', en: 'This is a declared and still-open gap: the type describing local deductions carries a fixed amount within an income band and cannot express a formula. The direction of the error is known — higher tax, lower net pay than in reality.' },
        ],
      },
      {
        id: 'reg-abruzzo',
        atto: 'L.R. Abruzzo 12/12/2006 n. 44',
        riferimento: 'art. 1 c. 8',
        dispone:
          { it: 'Fissa maggiorazioni di 0,44 · 1,64 · 2,10 punti sull’aliquota di base, da cui 1,67% · 2,87% · 3,33%, sugli scaglioni IRPEF vigenti.', en: 'Sets surcharges of 0.44, 1.64 and 2.10 points over the base rate, giving 1.67%, 2.87% and 3.33%, on the current IRPEF brackets.' },
        effetto:
          { it: 'È il primo ente che usa gli scaglioni vigenti e non i previgenti, e lo scrive: rinvia espressamente all’art. 11 c. 1 del TUIR come modificato dalla L. 207/2024. Non si è avvalso della facoltà di tenere i quattro scaglioni vecchi.', en: 'It is the first authority to use the current brackets rather than the pre-2025 ones, and it says so: it expressly refers to art. 11(1) TUIR as amended by Law 207/2024. It did not take up the option of keeping the four old brackets.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'http://www2.consiglio.regione.abruzzo.it/leggi_tv/abruzzo_lr/2025/lr25009/Articolato.asp',
        consultata: '2026-08-31',
        note: [
          { it: 'Sul primo scaglione la maggiorazione è stata abbassata dallo 0,50 flat applicato fino al 2024 a 0,44, e alzata sugli altri due.', en: 'On the first bracket the surcharge was lowered from the flat 0.50 applied until 2024 to 0.44, and raised on the other two.' },
        ],
      },
      {
        id: 'reg-campania',
        atto: 'L.R. Campania 28/12/2021 n. 31',
        riferimento: 'art. 1',
        dispone:
          { it: 'Fissa maggiorazioni di 0,20 · 1,43 · 1,67 · 1,80 punti su una base già maggiorata all’1,53%, da cui 1,73% · 2,96% · 3,20% · 3,33% sugli scaglioni previgenti.', en: 'Sets surcharges of 0.20, 1.43, 1.67 and 1.80 points over a base already raised to 1.53%, giving 1.73%, 2.96%, 3.20% and 3.33% on the pre-2025 brackets.' },
        effetto:
          { it: 'La base campana non è 1,23% ma 1,53%, perché la Regione è in piano di rientro sanitario e subisce l’incremento automatico di 0,30 punti. Sul primo scaglione i due pezzi sommano mezzo punto esatto: la manovra regionale è calibrata su ciò che resta sotto il tetto.', en: 'The Campania base is not 1.23% but 1.53%, because the Region is under a healthcare recovery plan and takes the automatic 0.30-point increase. On the first bracket the two pieces add to exactly half a point: the regional decision is calibrated on what is left under the cap.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://entrate.regione.campania.it/ca/addizionale-irpef',
        consultata: '2026-08-31',
        note: [
          { it: 'Le detrazioni campane — 30 euro per figlio e 40 per figlio con disabilità — dipendono dal numero dei figli e non dal solo reddito, quindi restano fuori perimetro. La legge di stabilità regionale 2026 non contiene la parola addizionale.', en: 'The Campania deductions — 30 euros per child and 40 for a child with a disability — depend on the number of children and not on income alone, so they stay outside this scope. The 2026 regional budget law does not contain the word "addizionale".' },
        ],
      },
      {
        id: 'reg-emilia-romagna',
        atto: 'L.R. Emilia-Romagna 20/12/2006 n. 19',
        riferimento: 'art. 2 c. 2',
        dispone:
          { it: 'Fissa, per il 2026, maggiorazioni di 0,10 · 0,70 · 1,55 · 2,10 punti sull’aliquota di base, da cui 1,33% · 1,93% · 2,78% · 3,33% sugli scaglioni previgenti.', en: 'Sets, for 2026, surcharges of 0.10, 0.70, 1.55 and 2.10 points over the base rate, giving 1.33%, 1.93%, 2.78% and 3.33% on the pre-2025 brackets.' },
        effetto:
          { it: 'La legge non scrive mai aliquote piene: scrive maggiorazioni rispetto all’aliquota di base. Le quattro percentuali del prospetto ministeriale sono un calcolo del ministero, non un numero che stia nella legge.', en: 'The law never writes full rates: it writes surcharges over the base rate. The four percentages in the ministerial table are the ministry’s arithmetic, not a figure found in the law.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://demetra.regione.emilia-romagna.it/al/articolo?urn=er:assemblealegislativa:legge:2006;19',
        consultata: '2026-08-31',
        note: [
          { it: 'Il 2026 differisce dal 2025 su un solo scaglione: sul terzo la maggiorazione scende da 1,70 a 1,55, e scenderà a 1,40 nel 2027. Dal 2028 le maggiorazioni emiliane non risultano disciplinate.', en: '2026 differs from 2025 on one bracket only: on the third the surcharge falls from 1.70 to 1.55, and will fall to 1.40 in 2027. From 2028 the Emilia-Romagna surcharges are not governed by any provision.' },
        ],
      },
      {
        id: 'reg-basilicata',
        atto: 'D.Lgs. 06/05/2011 n. 68',
        riferimento: 'art. 6 c. 1 — la Basilicata non deroga',
        dispone:
          { it: 'Non esiste una legge regionale lucana che fissi l’addizionale per il 2026: si applica l’aliquota di base dell’1,23%, unica su tutto il reddito.', en: 'There is no Basilicata regional law setting the surcharge for 2026: the 1.23% base rate applies, flat across all income.' },
        effetto:
          { it: 'È uno dei sei enti che non maggiorano affatto. Chi risiede in Basilicata paga l’aliquota statale di base, senza scaglioni, senza soglie e senza detrazioni.', en: 'It is one of the six authorities that add nothing at all. Basilicata residents pay the national base rate, with no brackets, no thresholds and no deductions.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/addregirpef.php?reg=02',
        consultata: '2026-08-31',
        note: [
          { it: 'Non significa che non abbia mai legiferato: dal 2014 al 2021 applicava maggiorazioni sui redditi alti, cessate senza un atto di abrogazione perché le soglie avevano smesso di corrispondere agli scaglioni statali. Questa ricostruzione è coerente con le norme ma non è affermata testualmente da alcuna fonte reperita.', en: 'That does not mean it never legislated: from 2014 to 2021 it applied surcharges on higher incomes, which lapsed without any repealing act because the thresholds stopped matching the national brackets. This reconstruction is consistent with the rules but is not stated in so many words by any source found.' },
        ],
      },
      {
        id: 'reg-liguria',
        atto: 'L.R. Liguria 09/10/2024 n. 17 art. 2 bis (inserito dalla L.R. 31/03/2025 n. 3), che richiama l’art. 2 bis della L.R. Liguria 28/12/2023 n. 19',
        dispone:
          { it: 'Fissa, per gli anni 2025-2027, maggiorazioni di 0,00 · 1,95 · 2,00 punti sull’aliquota di base, da cui 1,23% · 3,18% · 3,23% sugli scaglioni IRPEF vigenti.', en: 'Sets, for 2025-2027, surcharges of 0.00, 1.95 and 2.00 points over the base rate, giving 1.23%, 3.18% and 3.23% on the current IRPEF brackets.' },
        effetto:
          { it: 'Il primo scaglione non è esente: la legge scrive maggiorazione dello 0,00 per cento, quindi si paga comunque l’aliquota di base dell’1,23%. Chi legge «niente addizionale sotto i 28.000» sta leggendo un titolo, non la norma.', en: 'The first bracket is not exempt: the law writes a surcharge of 0.00 per cent, so the 1.23% base rate is still due. Anyone reading "no surcharge below 28,000" is reading a headline, not the rule.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://lrv.regione.liguria.it/liguriass_prod/articolo?urndoc=urn:nir:regione.liguria:legge:2023-12-28;19',
        consultata: '2026-08-31',
        note: [
          { it: 'Il prospetto ministeriale cita la disciplina a regime della l.r. 3/2022, ma i numeri del 2026 non stanno lì: stanno nella deroga richiamata dalla l.r. 17/2024.', en: 'The ministerial table cites the standing rules of regional law 3/2022, but the 2026 figures are not there: they are in the derogation referred to by regional law 17/2024.' },
        ],
      },
      {
        id: 'reg-calabria',
        atto: 'L.R. Calabria 07/08/2002 n. 30',
        riferimento: 'art. 1 c. 1',
        dispone:
          { it: 'Fissa una maggiorazione di mezzo punto sull’aliquota di base, da cui un’aliquota unica dell’1,73% su tutto il reddito.', en: 'Sets a half-point surcharge over the base rate, giving a single 1.73% rate across all income.' },
        effetto:
          { it: 'La scelta è del 2002 e vale ancora, riparametrata sulla base dell’1,23% dall’art. 29 c. 14 del D.L. 216/2011. Gli scaglioni introdotti nel 2007 furono abrogati nel 2008: da allora l’aliquota è unica.', en: 'The decision dates from 2002 and still stands, re-based onto 1.23% by art. 29(14) of Decree-Law 216/2011. The brackets introduced in 2007 were repealed in 2008: since then the rate has been flat.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.consiglioregionale.calabria.it/bdf/api/BDF?numero=30&anno=2002',
        consultata: '2026-08-31',
        note: [
          { it: 'La Calabria è in piano di rientro sanitario, ma l’incremento automatico di 0,30 punti non le è applicato: se lo fosse, l’aliquota sarebbe 2,03%. Essere in piano di rientro non implica la maggiorazione.', en: 'Calabria is under a healthcare recovery plan, but the automatic 0.30-point increase is not applied to it: were it applied, the rate would be 2.03%. Being under a recovery plan does not imply the surcharge.' },
        ],
      },
      {
        id: 'reg-marche',
        atto: 'L.R. Marche 23/03/2022 n. 5',
        riferimento: 'art. 1 c. 1',
        dispone:
          { it: 'Fissa maggiorazioni di 0 · 0,30 · 0,47 · 0,50 punti sull’aliquota di base, da cui 1,23% · 1,53% · 1,70% · 1,73% sugli scaglioni previgenti.', en: 'Sets surcharges of 0, 0.30, 0.47 and 0.50 points over the base rate, giving 1.23%, 1.53%, 1.70% and 1.73% on the pre-2025 brackets.' },
        effetto:
          { it: 'È la manovra più contenuta fra gli enti a scaglioni: il primo scaglione sta esattamente alla base e il massimo arriva a base più mezzo punto.', en: 'It is the lightest set of surcharges among the bracketed authorities: the first bracket sits exactly at the base and the top reaches base plus half a point.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.consiglio.marche.it/banche_dati_e_documentazione/leggi/dettaglio.php?arc=vig&idl=2241',
        consultata: '2026-08-31',
        note: [
          { it: 'Né per il 2025 né per il 2026 la Regione ha approvato una legge sull’addizionale: le aliquote si applicano per il trascinamento dell’art. 1 c. 728 della L. 207/2024, che non crea il contenuto ma lo mantiene.', en: 'The Region passed no law on the surcharge for either 2025 or 2026: the rates apply through the carry-over in art. 1(728) of Law 207/2024, which does not create the content but keeps it alive.' },
        ],
      },
      {
        id: 'reg-friuli',
        atto: 'L.R. Friuli Venezia Giulia 25/07/2012 n. 14',
        riferimento: 'art. 1 c. 5',
        dispone:
          { it: 'Riduce di 0,53 punti l’aliquota per i soggetti con reddito imponibile non superiore a 15.000 euro, da cui lo 0,70%; sopra quella soglia resta l’aliquota di base dell’1,23%.', en: 'Cuts the rate by 0.53 points for taxpayers whose taxable income is no higher than 15,000 euros, giving 0.70%; above that threshold the 1.23% base rate stands.' },
        effetto:
          { it: 'Non sono due scaglioni: la legge non crea fasce, condiziona la riduzione al soggetto. Chi supera i 15.000 euro non è fra i beneficiari e resta sull’aliquota unica e piatta. È il motivo per cui il calcolatore lo tratta come fascia intera e non come progressione.', en: 'These are not two brackets: the law does not create bands, it makes the reduction depend on who the taxpayer is. Anyone above 15,000 euros is not among the beneficiaries and stays on the single flat rate. That is why the calculator treats it as a whole-band rate and not as a progression.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://lexview-int.regione.fvg.it/fontinormative/xml/scarico.aspx?ANN=2012&LEX=0014&tip=0&lang=ita',
        consultata: '2026-08-31',
        note: [
          { it: 'Lo 0,70% non compare nella legge: è 1,23 meno 0,53. E la soglia si misura sul reddito imponibile ai fini dell’addizionale, non sul reddito complessivo.', en: 'The 0.70% does not appear in the law: it is 1.23 minus 0.53. And the threshold is measured on income taxable for the surcharge, not on total income.' },
        ],
      },
      {
        id: 'reg-sardegna',
        atto: 'D.Lgs. 06/05/2011 n. 68',
        riferimento: 'art. 6 c. 1 — la Sardegna non deroga',
        dispone:
          { it: 'La Sardegna non fissa alcuna maggiorazione: si applica l’aliquota di base dell’1,23%, unica su tutto il reddito.', en: 'Sardinia sets no surcharge: the 1.23% base rate applies, flat across all income.' },
        effetto:
          { it: 'Chi risiede in Sardegna paga l’aliquota statale di base. La legge regionale che il prospetto ministeriale cita non fissa un’aliquota: novella soltanto una detrazione.', en: 'Sardinia residents pay the national base rate. The regional law cited by the ministerial table sets no rate: it merely amends a deduction.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.sardegnaentrate.it/index.php?xsl=1131&s=34&v=9&c=94067',
        consultata: '2026-08-31',
        note: [
          { it: 'Esiste una detrazione di 200 euro per figlio minorenne a carico, più 100 per figlio con disabilità, che il calcolatore non porta: il reddito è solo la condizione di accesso, mentre l’importo dipende dal numero dei figli. È per carichi di famiglia, quindi fuori perimetro.', en: 'There is a deduction of 200 euros per dependent minor child, plus 100 for a child with a disability, which the calculator does not carry: income is only the access condition, while the amount depends on the number of children. It is a family-related relief, so outside this scope.' },
        ],
      },
      {
        id: 'reg-toscana',
        atto: 'L.R. Toscana 27/12/2012 n. 77',
        riferimento: 'art. 4 c. 1',
        dispone:
          { it: 'Fissa maggiorazioni di 0,19 · 0,20 · 2,09 · 2,10 punti sull’aliquota di base, da cui 1,42% · 1,43% · 3,32% · 3,33% sugli scaglioni previgenti.', en: 'Sets surcharges of 0.19, 0.20, 2.09 and 2.10 points over the base rate, giving 1.42%, 1.43%, 3.32% and 3.33% on the pre-2025 brackets.' },
        effetto:
          { it: 'Il gradino di quasi due punti fra il secondo e il terzo scaglione non è un’anomalia del dato: è voluto, perché la novella del 2023 ha sostituito le sole due lettere alte lasciando ferme le due basse.', en: 'The near two-point jump between the second and third brackets is not a data glitch: it is deliberate, because the 2023 amendment replaced only the two upper points and left the two lower ones untouched.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://raccoltanormativa.consiglio.regione.toscana.it/articolo?urndoc=urn%3Anir%3Aregione.toscana%3Alegge%3A2012-12-27%3B77&pr=idx%2C0%3Bartic%2C1%3Barticparziale%2C0&anc=art4',
        consultata: '2026-08-31',
        note: [
          { it: 'Il prospetto ministeriale cita l’atto modificativo invece della sede vigente: la l.r. 48/2023 ha cambiato le aliquote, ma le maggiorazioni vivono nell’art. 4 c. 1 della l.r. 77/2012.', en: 'The ministerial table cites the amending act instead of the provision in force: regional law 48/2023 did change the rates, but the surcharges live in art. 4(1) of regional law 77/2012.' },
          { it: 'Le detrazioni toscane per carichi di famiglia stavano nell’art. 5 della stessa legge, abrogato dal 2013: qui non c’è nulla, nemmeno fuori perimetro.', en: 'The Tuscan family-related deductions were in art. 5 of the same law, repealed since 2013: here there is nothing at all, not even outside scope.' },
        ],
      },
      {
        id: 'reg-umbria',
        atto: 'L.R. Umbria 11/04/2025 n. 2',
        riferimento: 'art. 1 commi 1, 2 e 3',
        dispone:
          { it: 'Il c. 1 fissa maggiorazioni di 0,50 · 1,79 · 1,89 · 2,10 punti sull’aliquota di base. Il c. 2 disapplica le prime due fino a 28.000 euro di imponibile. Il c. 3 dispone una detrazione di 150 euro fra 28.001 e 50.000 euro.', en: 'Subsection 1 sets surcharges of 0.50, 1.79, 1.89 and 2.10 points over the base rate. Subsection 2 disapplies the first two up to 28,000 euros of taxable income. Subsection 3 grants a 150-euro deduction between 28,001 and 50,000 euros.' },
        effetto:
          { it: 'Sotto i 28.000 euro restano gli scaglioni con la sola aliquota di base, cioè 1,23% su entrambi. La soglia è secca: a 28.000,01 euro le maggiorazioni tornano anche sulle prime due fasce.', en: 'Below 28,000 euros the brackets remain with the base rate alone, that is 1.23% on both. The threshold is a cliff: at 28,000.01 euros the surcharges return on the first two bands as well.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://leggi.alumbria.it/mostra_atto.php?id=249873',
        consultata: '2026-08-31',
        note: [
          { it: 'Il c. 3 si fonda espressamente sull’art. 6 c. 6 del D.Lgs. 68/2011 — secondo ente, dopo il Lazio, a nominare quella norma.', en: 'Subsection 3 expressly rests on art. 6(6) of Legislative Decree 68/2011 — the second authority, after Lazio, to name that provision.' },
          { it: 'La misura è temporanea: l’efficacia è limitata agli anni 2025-2027, non è a regime.', en: 'The measure is temporary: it is limited to 2025-2027 and is not permanent.' },
        ],
      },
      {
        id: 'reg-sicilia',
        atto: 'L.R. Sicilia 09/02/2015 n. 4',
        riferimento: 'art. 1 c. 10-quater',
        dispone:
          { it: 'Azzera dal 2019 la maggiorazione regionale siciliana, lasciando in vigore la sola aliquota di base dell’1,23%.', en: 'From 2019 it zeroes the Sicilian regional surcharge, leaving only the 1.23% base rate in force.' },
        effetto:
          { it: 'È il movimento inverso rispetto agli altri enti: una maggiorazione che c’era ed è stata spenta. La Sicilia aveva mezzo punto dal 2007 per il risanamento sanitario, ridotto nel 2018 e azzerato dal 2019.', en: 'It is the opposite move to the other authorities: a surcharge that existed and was switched off. Sicily had half a point from 2007 for healthcare rebalancing, reduced in 2018 and zeroed from 2019.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.regione.sicilia.it/istituzioni/regione/strutture-regionali/assessorato-economia/dipartimento-finanze-credito/portale-tributi/addizionale-irpef',
        consultata: '2026-08-31',
        note: [
          { it: 'La Sicilia è in piano di rientro sanitario e sta all’aliquota di base: insieme alla Calabria smonta l’idea che il piano di rientro implichi un’aliquota maggiorata.', en: 'Sicily is under a healthcare recovery plan and sits at the base rate: together with Calabria it dismantles the idea that a recovery plan implies a higher rate.' },
        ],
      },
      {
        id: 'reg-veneto',
        atto: 'L.R. Veneto 26/11/2005 n. 19',
        riferimento: 'art. 1 c. 5',
        dispone:
          { it: 'Il Veneto non deroga sull’aliquota ordinaria e applica l’aliquota di base dell’1,23%. L’unica norma vigente è un’aliquota agevolata dello 0,9% per i disabili e per chi ha un disabile fiscalmente a carico, con imponibile fino a 50.000 euro.', en: 'Veneto does not depart from the ordinary rate and applies the 1.23% base rate. The only provision in force is a reduced 0.9% rate for people with disabilities and for those with a dependant with a disability, up to 50,000 euros of taxable income.' },
        effetto:
          { it: 'L’agevolazione dipende dalla disabilità e non dal solo reddito, quindi resta fuori perimetro: il calcolatore applica a tutti l’aliquota di base.', en: 'The relief depends on disability and not on income alone, so it stays outside this scope: the calculator applies the base rate to everyone.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.regione.veneto.it/web/tributi-regionali/addirpef-determinazione-dellimposta',
        consultata: '2026-08-31',
        note: [
          { it: 'Nel 2005 lo 0,9% era la vecchia aliquota di base, e quel comma la manteneva per i disabili mentre gli altri la alzavano. Quando nel 2011 la base è salita a 1,23%, quello 0,9% è diventato di fatto una riduzione sotto la base, senza che nessuno l’abbia deliberata come tale.', en: 'In 2005 the 0.9% was the old base rate, and that subsection kept it for people with disabilities while others raised it. When the base rose to 1.23% in 2011, that 0.9% became in effect a cut below the base, without anyone having decided it as such.' },
        ],
      },
      {
        id: 'reg-puglia',
        atto: 'Decreto n. 3 del 28/05/2026 del Presidente della Regione Puglia in qualità di Commissario ad acta, ex art. 1 c. 174 della L. 311/2004',
        dispone:
          { it: 'Rideterminata le aliquote pugliesi per coprire il disavanzo del servizio sanitario, portandole a 1,33% · 2,13% · 3,23% · 3,33% sugli scaglioni previgenti, con effetto sull’intero periodo d’imposta in corso.', en: 'It re-determines the Apulian rates to cover the healthcare deficit, setting them at 1.33%, 2.13%, 3.23% and 3.33% on the pre-2025 brackets, with effect for the whole current tax period.' },
        effetto:
          { it: 'È il caso che mostra perché un provvedimento di metà anno può valere da gennaio: se il commissario non ripiana entro il 31 maggio, le maggiorazioni si applicano nell’anno in corso. Un calcolatore che tenesse il provvedimento pubblicato per primo sottostimerebbe l’imposta fino a 739 euro.', en: 'It is the case that shows why a mid-year measure can apply from January: if the commissioner does not close the gap by 31 May, the surcharges apply in the current year. A calculator keeping the earliest published measure would understate the tax by up to 739 euros.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www.regione.puglia.it/web/tributi/addizionale-regionale-irpef/aliquote',
        consultata: '2026-08-31',
        note: [
          { it: 'Le detrazioni pugliesi — 20 euro per figlio a chi ha più di tre figli, con maggiorazione per figlio con disabilità — sono per carichi di famiglia e restano fuori perimetro.', en: 'The Apulian deductions — 20 euros per child for those with more than three children, with an increase for a child with a disability — are family-related and stay outside this scope.' },
        ],
      },
      {
        id: 'reg-molise',
        atto: 'Art. 2 della L.R. Molise 9/2013 e art. 1 della L.R. Molise 15/12/2023 n. 5, con la maggiorazione automatica dell’art. 2 c. 86 della L. 191/2009',
        dispone:
          { it: 'Alle aliquote di fonte regionale si somma l’incremento automatico di 0,30 punti scattato per il mancato raggiungimento degli obiettivi del piano di rientro, da cui 2,03% · 2,23% · 3,63% · 3,63% sugli scaglioni previgenti.', en: 'On top of the regionally set rates comes the automatic 0.30-point increase triggered by the failure to meet the recovery-plan targets, giving 2.03%, 2.23%, 3.63% and 3.63% on the pre-2025 brackets.' },
        effetto:
          { it: 'È l’unico ente d’Italia sopra il tetto ordinario del 3,33%, e non è una violazione: l’art. 6 c. 10 del D.Lgs. 68/2011 mette espressamente gli automatismi sanitari fuori dai tetti. È anche il motivo per cui il primo scaglione può stare al 2,03% dove il tetto lo fermerebbe all’1,73%.', en: 'It is the only authority in Italy above the ordinary 3.33% cap, and this is no breach: art. 6(10) of Legislative Decree 68/2011 expressly places healthcare automatisms outside the caps. It is also why the first bracket can sit at 2.03% where the cap would stop it at 1.73%.' },
        portale: 'Banca dati dell’ente impositore',
        url: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/addregirpef.php?reg=12',
        consultata: '2026-08-31',
        note: [
          { it: 'I due provvedimenti dell’anno non sono concorrenti ma sequenziali: il primo fotografa le aliquote di fonte regionale, il secondo recepisce l’incremento automatico dopo la verifica annuale. È un meccanismo ricorrente, ripetuto nel 2023, 2024 e 2025.', en: 'The two measures of the year are not competing but sequential: the first records the regionally set rates, the second takes up the automatic increase after the annual review. It is a recurring mechanism, repeated in 2023, 2024 and 2025.' },
        ],
      },
    ],
  },
  {
    id: 'aggiungono',
    titolo: { it: 'Voci che non concorrono al reddito', en: 'Sums that do not count as income' },
    occhiello:
      { it: 'Somme che la legge non considera reddito: non vengono tassate e si sommano a quello che resta. Sono l’unico ramo del sistema che va nella direzione del lavoratore.', en: 'Sums the law does not treat as income: they are not taxed and they add to what is left. They are the only branch of the system that runs in the worker’s favour.' },
    schede: [
      {
        id: 'l207-2024-c4',
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 4 e 5',
        dispone:
          { it: 'Riconosce a chi ha un reddito complessivo fino a 20.000 euro una somma che non concorre a formare il reddito, pari a una percentuale del reddito di lavoro dipendente che decresce per fasce.', en: 'Grants those with total income up to 20,000 euros a sum that does not form part of taxable income, equal to a percentage of employment income that steps down by band.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'È denaro che si aggiunge al netto senza passare per le imposte: non riduce l’imponibile, non ha effetti a cascata sulle detrazioni, e spetta anche a chi non ha imposta da pagare.', en: 'It is money that adds to net pay without passing through the tax: it does not reduce the taxable base, it has no knock-on effect on tax credits, and it goes even to those with no tax to pay.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'Le fasce non sono scaglioni: la percentuale si applica all’intero reddito, non alla parte eccedente. Ogni confine è quindi un salto secco verso il basso: circa 153 euro a 8.500 euro di reddito, circa 75 a 15.000.', en: 'The bands are not brackets: the percentage applies to the whole income, not to the part above the threshold. Every boundary is therefore a sharp step down: about 153 euros at 8,500 euros of income, about 75 at 15,000.' },
          { it: 'Il c. 8 mostra la meccanica: il datore anticipa denaro proprio e lo recupera dallo Stato in compensazione. Una detrazione non funziona così, e questa è la prova che non è una riduzione d’imposta.', en: 'Subsection 8 shows the mechanics: the employer advances its own money and recovers it from the state by offset. A tax credit does not work like that, and this is the proof that it is not a reduction in tax.' },
          { it: 'Il c. 5 ragguaglia il reddito all’intero anno ai soli fini della scelta della percentuale, non per la base: è una regola di ragguaglio diversa da quella dell’art. 13 e da quella del c. 6.', en: 'Subsection 5 annualises income solely for the purpose of picking the percentage, not for the base: it is a pro-rating rule different from the one in art. 13 and from the one in subsection 6.' },
        ],
      },
      {
        id: 'l207-2024-c9',
        atto: 'L. 30/12/2024 n. 207',
        riferimento: 'art. 1 c. 9',
        dispone:
          { it: 'Definisce le grandezze di reddito usate dalle misure sul cuneo, includendo la quota esente dei redditi agevolati e assumendo il reddito complessivo al netto dell’abitazione principale.', en: 'Defines the income figures used by the tax wedge measures, including the exempt portion of relieved income and taking total income net of the main residence.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        effetto:
          { it: 'Chiude quale reddito si guarda per la soglia e quale per l’importo. Una sola definizione di reddito complessivo attraversa tutto il calcolo.', en: 'It settles which income is looked at for the threshold and which for the amount. A single definition of total income runs through the whole calculation.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
        consultata: '2026-08-27',
      },
      {
        id: 'dl3-2020-art1',
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 1',
        dispone:
          { it: 'Riconosce un trattamento integrativo di 1.200 euro a chi ha un reddito complessivo fino a 15.000 euro, a condizione che l’imposta lorda superi la detrazione per lavoro dipendente diminuita di 75 euro.', en: 'Grants a trattamento integrativo of 1,200 euros to those with total income up to 15,000 euros, on condition that the gross tax exceeds the employment income credit reduced by 75 euros.' },
        vigenza: { it: 'dal 01/01/2025', en: 'in force from 1 Jan 2025' },
        ultimaModifica: { it: 'L. 30/12/2024 n. 207, art. 1 c. 3', en: 'L. 30/12/2024 n. 207, art. 1 c. 3' },
        effetto:
          { it: 'È il terzo istituto che si somma al netto, e coesiste con le due misure sul cuneo. La condizione lo riserva a chi ha imposta da pagare, non agli incapienti, e questo lo rende l’unica voce di questo ramo che dipende dall’esito del ramo fiscale.', en: 'It is the third measure that adds to net pay, and it coexists with the two tax wedge measures. The condition reserves it for those with tax to pay, not for those without, and that makes it the only item in this branch that depends on the outcome of the tax branch.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2020-02-05;3~art1!vig=',
        consultata: '2026-08-27',
        note: [
          { it: 'I 75 euro non sono una tolleranza: la stessa legge che li ha inseriti ha alzato la detrazione da 1.880 a 1.955 euro, e 1.955 meno 75 fa esattamente l’importo precedente. Servono a lasciare ferma la soglia di accesso.', en: 'The 75 euros are not a tolerance: the same law that inserted them raised the credit from 1,880 to 1,955 euros, and 1,955 minus 75 is exactly the previous amount. They exist to leave the entry threshold where it was.' },
          { it: 'Ne discende un effetto collaterale involontario: fra circa 8.174 e 8.500 euro di reddito complessivo il trattamento spetta mentre l’imposta netta è già zero. Quella banda non esisteva prima del 2025.', en: 'An unintended side effect follows: between roughly 8,174 and 8,500 euros of total income the payment is due while the net tax is already zero. That band did not exist before 2025.' },
          { it: 'Il secondo periodo estende il trattamento fino a 28.000 euro se la somma di un elenco chiuso di detrazioni supera l’imposta lorda. Nel caso standard non si attiva mai, e la detrazione da cuneo non può entrare in quell’elenco perché l’elenco è del 2020 e la detrazione del 2025.', en: 'The second sentence extends the payment up to 28,000 euros where the sum of a closed list of credits exceeds the gross tax. In the standard case it never triggers, and the tax wedge credit cannot enter that list because the list is from 2020 and the credit from 2025.' },
        ],
      },
      {
        id: 'l234-2021-art1',
        atto: 'L. 30/12/2021 n. 234',
        riferimento: 'art. 1 c. 3',
        dispone:
          { it: 'Abbassa da 28.000 a 15.000 euro la soglia di reddito complessivo del trattamento integrativo, e vi aggiunge la finestra fra 15.000 e 28.000 euro in cui spetta solo se la somma delle detrazioni supera l’imposta lorda.', en: 'It lowers the total-income threshold for the trattamento integrativo from 28,000 to 15,000 euros, and adds the window between 15,000 and 28,000 euros where it is due only if the sum of tax credits exceeds gross tax.' },
        vigenza: { it: 'dal 01/01/2022', en: 'in force from 1 Jan 2022' },
        effetto:
          { it: 'È la norma che sposta il gradino più grande del sistema. I 1.200 euro del trattamento integrativo cadono a 15.000 euro di reddito complessivo perché questo comma li ha portati lì: senza, la soglia sarebbe ancora 28.000.', en: 'This is the rule that moves the biggest step in the system. The 1,200 euros of the trattamento integrativo fall at 15,000 euros of total income because this subsection put them there: without it, the threshold would still be 28,000.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2021-12-30;234~art1!vig=',
        consultata: '2026-08-31',
        note: [
          { it: 'Lo stesso comma riscrive l’art. 11 del TUIR sugli scaglioni 15.000 / 28.000 / 50.000 al 23, 25, 35 e 43 per cento: sono gli scaglioni che la L. 207/2024 chiama previgenti e che regioni e comuni possono continuare a usare per le proprie addizionali.', en: 'The same subsection rewrites art. 11 TUIR on the 15,000 / 28,000 / 50,000 brackets at 23, 25, 35 and 43 per cent: these are the brackets Law 207/2024 calls pre-existing and which regions and municipalities may keep using for their own surcharges.' },
        ],
      },
      {
        id: 'dl3-2020-art3',
        atto: 'DL 05/02/2020 n. 3',
        riferimento: 'art. 3',
        dispone:
          { it: 'Abroga il vecchio bonus che stava dentro il TUIR e definisce il reddito complessivo ai fini del trattamento integrativo.', en: 'Repeals the old bonus that lived inside the TUIR and defines total income for the purposes of the trattamento integrativo.' },
        effetto:
          { it: 'Non cambia un numero, ma spiega la stratificazione: il vecchio bonus non è stato eliminato, è stato spostato fuori dal testo unico.', en: 'It does not change a figure, but it explains the layering: the old bonus was not eliminated, it was moved out of the consolidated act.' },
        portale: 'Normattiva',
        url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2020-02-05;3~art3!vig=',
        consultata: '2026-08-27',
      },
    ],
  },
]

// ── Dalla citazione alla scheda ─────────────────────────────────────────────

/**
 * L'ancora della scheda che ospita una `Fonte`, se l'archivio ne ha una.
 *
 * ⚠️ **Perché non un confronto fra stringhe.** La citazione accanto a una voce
 * del calcolo e la scheda dell'archivio parlano dello stesso atto con due
 * livelli di precisione diversi, ed è giusto così: `data/` cita il **comma** che
 * fissa il parametro — *art. 13 c. 1 lett. a)* — mentre l'archivio descrive
 * l'**articolo**, che è l'unità che si legge. Confrontando le stringhe intere
 * non combacerebbe quasi nulla: su venticinque citazioni del regime ne
 * combaciavano quattro.
 *
 * ⚠️ **E nemmeno una tabella di corrispondenze scritta a mano**, che avrebbe
 * funzionato subito e sarebbe scaduta al primo parametro nuovo: chi aggiunge una
 * riga a `data/` non ha ragione di sapere che esiste una tabella in `app/` da
 * aggiornare, e la citazione tornerebbe muta senza che nessuno se ne accorga.
 *
 * Qui si normalizzano le due parti della citazione e si confrontano quelle:
 * dall'atto si toglie la coda delle modifiche — *«come mod. dall'art. 1 c. 3
 * della L. 199/2025»* è un'informazione sulla versione, non sull'atto — e dal
 * riferimento si tiene la sola testa, cioè l'articolo o il paragrafo. Quello che
 * resta è la coppia che identifica una scheda.
 *
 * Chi resta fuori non è un errore: le aliquote di ogni ente vengono dall'atto
 * dell'ente, che l'archivio non contiene. Lì la citazione resta scritta e non
 * cliccabile, che è meglio di un link che porta altrove.
 */

/**
 * Via la coda delle modifiche e delle conferme: resta l'atto.
 *
 * ⚠️ Niente `\b` dopo `mod\.`: fra un punto e uno spazio il confine di parola
 * non esiste, quindi l'alternativa non avrebbe mai combaciato e ogni citazione
 * con la coda *«come mod. dall'art. …»* sarebbe restata muta — cioè proprio le
 * norme toccate dalle ultime due leggi di bilancio, che sono quelle su cui la
 * domanda «da dove viene questo numero» si fa più spesso.
 */
const attoNudo = (atto: string): string =>
  atto
    .split(/,?\s+(?:come mod\.|come sostituito|conv\. con mod\.|confermato da)/u)[0]!
    .replace(/\s*\(.*?\)\s*$/u, '')
    .trim()

/**
 * Le chiavi di un riferimento, dalla più precisa alla più generica.
 *
 * ⚠️ **Per una legge di bilancio l'articolo non identifica niente.** L'art. 1
 * della L. 207/2024 ha novecento commi, e il calcolatore ne cita quattro che
 * l'archivio tiene in quattro schede diverse. Fermandosi all'articolo, le
 * quattro citazioni collassavano sulla stessa chiave e la mappa teneva
 * l'ultima: *il trattamento integrativo* portava alla scheda sulle *soglie
 * regionali*. Un link che porta al posto sbagliato è peggio di nessun link,
 * perché chi lo segue crede di aver letto la norma giusta.
 *
 * Quindi la chiave porta il comma quando c'è, e l'articolo resta come ripiego
 * per gli atti in cui l'articolo è davvero l'unità che si legge.
 */
const chiaviRiferimento = (riferimento: string | undefined): readonly string[] => {
  if (riferimento === undefined) return ['']
  const testa = /^(artt?\.|par\.)\s*([0-9]+(?:-[a-z]+)?)/u.exec(riferimento.trim())
  if (testa === null) return ['']
  const articolo = `${testa[1]} ${testa[2]}`

  /* I commi citati: `c. 4 e 5` e `commi 1, 2 e 3` valgono per ciascuno. */
  const commi = [...riferimento.matchAll(/\b(?:c\.|commi|comma)\s*([0-9]+(?:-[a-z]+)?)/gu)].map(
    (m) => `${articolo} c. ${m[1]}`,
  )
  const altri = [...riferimento.matchAll(/(?:,|\be\b)\s*([0-9]+(?:-[a-z]+)?)\b/gu)].map(
    (m) => `${articolo} c. ${m[1]}`,
  )

  return [...new Set([...commi, ...altri, articolo])]
}

const chiave = (atto: string, riferimento: string): string => `${atto} ||| ${riferimento}`

/**
 * Ogni scheda si registra su tutte le proprie chiavi, e la più precisa vince.
 *
 * Le chiavi con il comma si scrivono per prime e non si sovrascrivono; quella
 * del solo articolo la può reclamare una scheda sola, la prima che arriva. Così
 * *art. 1* del TUIR resta libera per la scheda che descrive l'articolo intero,
 * e le schede sui singoli commi non se la contendono.
 */
const perChiave = new Map<string, string>()
const TUTTE = SEZIONI.flatMap((s) => s.schede)

/* Primo giro: le chiavi con il comma, che sono quelle che identificano. */
for (const sc of TUTTE) {
  const atto = attoNudo(sc.atto)
  for (const k of chiaviRiferimento(sc.riferimento)) {
    if (!k.includes(' c. ')) continue
    const piena = chiave(atto, k)
    if (!perChiave.has(piena)) perChiave.set(piena, sc.id)
  }
}

/*
 * ⚠️ Secondo giro: la chiave del solo articolo, **e solo dove l'articolo ha
 * una scheda sola.**
 *
 * Senza questa condizione il ripiego faceva danno invece di aiutare. L'art. 1
 * della L. 207/2024 ha cinque schede, una per gruppo di commi: la citazione del
 * *comma 3* non trovava la propria chiave, ricadeva su `art. 1` e atterrava
 * sulla prima scheda che se l'era presa, cioè quella del *comma 6*. Portava a
 * una norma esistente, pertinente e sbagliata, che è il modo peggiore di
 * sbagliare un link.
 *
 * Dove l'articolo ospita una scheda sola — il TUIR, il D.Lgs. 360/1998, la
 * legge di bilancio 2026 — l'ambiguità non esiste e il ripiego è esattamente
 * ciò che serve, perché `data/` cita il comma e l'archivio l'articolo.
 */
const quanteSchede = new Map<string, number>()
for (const sc of TUTTE) {
  const testa = chiaviRiferimento(sc.riferimento).at(-1)!
  const piena = chiave(attoNudo(sc.atto), testa)
  quanteSchede.set(piena, (quanteSchede.get(piena) ?? 0) + 1)
}
for (const sc of TUTTE) {
  const testa = chiaviRiferimento(sc.riferimento).at(-1)!
  const piena = chiave(attoNudo(sc.atto), testa)
  if (quanteSchede.get(piena) === 1 && !perChiave.has(piena)) perChiave.set(piena, sc.id)
}

/**
 * ⚠️ Le citazioni che l'archivio nomina in un altro modo.
 *
 * Sono i soli casi in cui una tabella scritta a mano è inevitabile: `data/`
 * cita il singolo documento che porta il parametro, l'archivio raccoglie sotto
 * una scheda i documenti che vanno letti insieme. Non è un disallineamento da
 * sanare — sono due esigenze diverse — ma il ponte fra le due va dichiarato.
 */
const ALIAS: Readonly<Record<string, string>> = {
  /*
   * Il c. 3 della L. 207/2024 non ha una scheda propria perché non dispone
   * nulla per conto suo: modifica il trattamento integrativo, ed è là che chi
   * segue la citazione vuole arrivare.
   */
  'L. 30/12/2024 n. 207 ||| art. 1 c. 3': 'dl3-2020-art1',
  'INPS, messaggio n. 3618 del 17/10/2023': 'inps-msg3618-2023',
  /*
   * ⚠️ Due enti regionali il cui `atto` non si riduce alla forma della scheda,
   * e che senza queste due righe non porterebbero da nessuna parte.
   *
   * La citazione delle **Marche** porta dentro il proprio titolo la ragione per
   * cui vale nel 2026 — *applicata per effetto dell'art. 1 c. 728* — e quella
   * della **Sicilia** dice che la maggiorazione è azzerata, cioè descrive un
   * atto che *toglie* invece di fissare. In entrambi i casi la stringa è più
   * lunga del nome dell'atto, e la riduzione automatica non la accorcia.
   *
   * ⚠️ **Basilicata e Sardegna non sono qui, ed è voluto.** Le loro citazioni
   * risolvono alla scheda del D.Lgs. 68/2011, che è la norma che davvero
   * applicano: nessuna delle due deroga. Le loro schede restano consultabili
   * nell'archivio — che si legge anche senza aver calcolato niente — ma non
   * sono la destinazione di una citazione, perché le due `Fonte` sono
   * identiche fra loro e non si potrebbero distinguere.
   */
  'L.R. Marche 23/03/2022 n. 5, applicata al 2026 per effetto dell’art. 1 c. 728 della L. 30/12/2024 n. 207': 'reg-marche',
  'D.Lgs. 06/05/2011 n. 68 art. 6 c. 1 — la maggiorazione siciliana è azzerata dall’art. 1 c. 10-quater della L.R. Sicilia 09/02/2015 n. 4, inserito dall’art. 8 della L.R. Sicilia 11/08/2017 n. 15': 'reg-sicilia',
  'MEF, Dipartimento delle Finanze — prospetto addizionale regionale IRPEF 2026': 'mef-elenchi',
  'MEF, Dipartimento delle Finanze — elenco addizionale comunale 2026': 'mef-elenchi',
  'MEF, Dipartimento delle Finanze — elenco annuale addizionale comunale 2025': 'mef-elenchi',
}

export const ancoraFonte = (fonte: {
  readonly atto: string
  readonly riferimento?: string
}): string | undefined => {
  const atto = attoNudo(fonte.atto)

  /* L'alias sulla citazione intera vince: è stato scritto per quel caso. */
  const perCitazione = ALIAS[chiave(atto, fonte.riferimento?.trim() ?? '')]
  if (perCitazione !== undefined) return perCitazione

  for (const k of chiaviRiferimento(fonte.riferimento)) {
    const trovata = perChiave.get(chiave(atto, k))
    if (trovata !== undefined) return trovata
  }
  return ALIAS[atto] ?? ALIAS[fonte.atto]
}

/** L'indirizzo della scheda in pagina. */
export const indirizzoNorma = (ancora: string): string => `/norme#${ancora}`
