/**
 * I testi della traccia, indicizzati per lingua — D-041.
 *
 * ⚠️ **File separato dai parametri normativi, e la separazione è il punto.**
 * `regime-2026.ts` e `caso-base.ts` sono la sede citabile dei valori: ogni
 * numero lì dentro porta accanto la propria fonte, e chi verifica il
 * calcolatore apre quei file. Mescolarci dentro trecento righe di prosa
 * renderebbe illeggibile proprio la parte che deve restare verificabile.
 * Qui non c'è nessun valore normativo: solo il modo in cui si raccontano.
 *
 * ⚠️ **Sono modelli, non funzioni.** I valori entrano al posto dei segnaposti
 * `{nome}`, e a sostituirli è `core/`. Una funzione qui sarebbe logica in
 * `data/`, ed è la stessa ragione per cui `CondizioneAssunzione` è un dato
 * dichiarativo e non un predicato.
 *
 * ---
 *
 * **Cosa non si traduce, ed è sostanza (D-041).**
 *
 * Restano in italiano in entrambe le lingue: i riferimenti normativi, i nomi
 * degli atti, i nomi propri di enti e comuni, e **i nomi degli istituti
 * italiani che non hanno equivalente** — IRPEF, RAL, addizionale regionale e
 * comunale, trattamento integrativo, cuneo fiscale, apprendistato.
 *
 * In inglese l'istituto porta una **glossa fra parentesi alla prima
 * occorrenza**, e poi torna nudo: *addizionale comunale (municipal income tax
 * surcharge)*. Tradurlo e basta farebbe perdere il riferimento a chi poi deve
 * cercarlo, che è l'opposto dello scopo di uno strumento che cita le proprie
 * fonti.
 *
 * **Dove sta la prima occorrenza, in pratica.** Le tre nature del prelievo —
 * contributi, IRPEF, addizionali — sono introdotte dai titoli dei gruppi, che
 * stanno in `app/` e portano lì la loro glossa; le etichette dei passi che
 * ricadono sotto quei titoli usano quindi il nome nudo. Restano glossati qui
 * gli istituti che nessun titolo di gruppo annuncia: RAL, reddito complessivo,
 * cuneo fiscale, trattamento integrativo, apprendistato.
 */

import type { CodiceLingua, Lingua, TestiTraccia } from '../core/types'
import { TAG } from './tag-lingua'

// ---------------------------------------------------------------------------
// Italiano
//
// ⚠️ Sono le frasi che stavano dentro `core/calcola.ts` fino al 28/08/2026,
// riportate **alla lettera**: la traduzione non è l'occasione per riscrivere
// l'italiano. Ogni riga di questa tabella è già passata dall'audit del registro
// (D-039), e cambiarla qui la farebbe uscire da quella verifica senza che
// nessuno se ne accorga.
// ---------------------------------------------------------------------------

const it: TestiTraccia = {
  // RAL
  'ral.etichetta': 'Retribuzione annua lorda',
  'ral.regola': 'Punto di partenza dichiarato dall’utente.',
  'ral.spiegazione':
    'La RAL comprende già le mensilità aggiuntive: il netto annuo non cambia con 12, 13 o 14 mensilità, cambia solo il divisore.',

  // Contributi
  'contributi.etichetta': 'Contributi previdenziali IVS',
  'contributi.regola':
    'Aliquota a carico del lavoratore sulla retribuzione imponibile, assunta al lordo di qualsiasi contributo e trattenuta.',
  'contributi.spiegazione.ordinaria':
    'Non è una tassa: è contribuzione che genera un diritto pensionistico. Esce dalla busta e torna come prestazione futura.',
  'contributi.spiegazione.apprendista':
    'Non è una tassa: è contribuzione che genera un diritto pensionistico. L’aliquota dell’apprendista è ridotta rispetto a quella ordinaria, ed è l’unico valore del tipo di contratto che muove il netto.',
  'base-contributiva.etichetta': 'Base contributiva',
  'base-contributiva.regola':
    'Le somme si assumono al lordo di qualsiasi contributo e trattenuta: la base è la retribuzione lorda.',
  'base-contributiva.spiegazione':
    'Nel caso standard coincide con la RAL, e non per approssimazione: le voci che la legge esclude non rientrano in questo calcolo.',

  // Quota aggiuntiva 1%
  'quota.etichetta': 'Quota aggiuntiva 1%',
  'quota.regola.regime':
    'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile, per i regimi con aliquote a carico del lavoratore inferiori al 10 per cento.',
  'quota.regola':
    'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile.',
  'quota.spiegazione.regime':
    'Il presupposto è del regime pensionistico, non del singolo lavoratore: qui l’aliquota ordinaria non sta sotto il limite, quindi il contributo si spegne per effetto della legge stessa.',
  'quota.ragione.regime':
    'L’aliquota ordinaria a carico del lavoratore ({aliquotaOrdinaria}) non è inferiore al limite del {limite} previsto dalla norma.',
  'quota.spiegazione.sotto-soglia':
    'È l’unica soglia sui contributi. Sotto la prima fascia non si applica.',
  'quota.ragione.sotto-soglia':
    'La retribuzione imponibile ({retribuzione}) non supera la prima fascia di retribuzione pensionabile, pari a {soglia}.',
  'quota.spiegazione.applicata':
    'Si applica solo alla parte di retribuzione oltre {soglia}, non all’intera retribuzione.',

  // Dal lordo all'imponibile fiscale
  'reddito-complessivo.etichetta': 'Reddito complessivo',
  'reddito-complessivo.regola':
    'I contributi previdenziali obbligatori non concorrono a formare il reddito: è un’esclusione, non una deduzione.',
  'reddito-complessivo.spiegazione':
    'Il reddito su cui si calcolano le imposte nasce già al netto dei contributi. Per questo il loro impatto sul netto è maggiore del loro valore nominale: abbassano anche l’imposta.',

  // Ramo erariale
  'irpef-lorda.etichetta': 'IRPEF lorda',
  'irpef-lorda.regola': 'Aliquote per scaglioni di reddito.',
  'irpef-lorda.spiegazione':
    'Ogni scaglione è tassato alla propria aliquota: solo la parte di reddito che supera una soglia sconta l’aliquota più alta.',
  'detrazione.etichetta': 'Detrazione per lavoro dipendente',
  'detrazione.regola':
    'Detrazione a tratti sul reddito complessivo; dove è una formula, il risultato del rapporto si assume nelle prime quattro cifre decimali.',
  'detrazione.spiegazione':
    'Non è una trattenuta: è uno sconto sull’imposta. Nella fascia in cui decresce, ogni euro in più di reddito viene tassato e riduce anche la detrazione.',
  'detrazione-incremento.etichetta': 'Incremento fascia {da}–{a}',
  'detrazione-incremento.regola':
    'La detrazione spettante ai sensi del comma 1 è aumentata di un importo fisso.',
  'detrazione-incremento.spiegazione':
    'Un importo fisso che compare a una soglia e sparisce a un’altra: è un gradino, non una curva.',
  'detrazione-cuneo.etichetta': 'Ulteriore detrazione (cuneo)',
  'detrazione-cuneo.regola':
    'Ulteriore detrazione dall’imposta lorda, decrescente per fasce di reddito complessivo.',
  'detrazione-cuneo.spiegazione':
    'La seconda gamba del taglio del cuneo fiscale: sotto la soglia di accesso è una somma erogata, sopra diventa una detrazione.',
  'irpef-netta.etichetta': 'IRPEF netta',
  'irpef-netta.regola':
    'Le detrazioni si operano sull’imposta lorda fino alla concorrenza del suo ammontare.',
  'irpef-netta.spiegazione.capiente':
    'Le detrazioni non generano credito: l’imposta ha un pavimento a zero. Qui la capienza c’è.',
  'irpef-netta.spiegazione.incapiente':
    'Le detrazioni superano l’imposta lorda, ma non generano credito: l’imposta si ferma a zero e l’eccedenza si perde.',
  'irpef.etichetta': 'IRPEF',
  'irpef.regola':
    'Imposta progressiva per scaglioni sul reddito complessivo al netto degli oneri deducibili, ridotta dalle detrazioni fino alla concorrenza dell’imposta lorda.',
  'irpef.spiegazione':
    'L’imposta erariale, quella che va allo Stato. Le detrazioni non sono una trattenuta: riducono l’imposta già calcolata, e non possono portarla sotto zero.',

  // Gli scaglioni descrivono se stessi
  'scaglione.etichetta': 'Da {da} a {a} — {aliquota}',
  'scaglione.etichetta.ultimo': 'Oltre {da} — {aliquota}',
  'scaglione.regola': 'Applicabile a scaglione di reddito da euro {da} fino a euro {a}.',
  'scaglione.regola.ultimo': 'Applicabile a scaglione di reddito da euro {da}.',
  'scaglione.spiegazione':
    'L’aliquota si applica alla sola quota di reddito compresa nella fascia: {quota}.',

  // Il gate delle addizionali
  'gate.etichetta.aperto': 'Le addizionali sono dovute',
  'gate.etichetta.chiuso': 'Le addizionali non sono dovute',
  'gate.regola':
    'Le addizionali sono dovute se, per lo stesso anno, l’IRPEF al netto delle detrazioni e dei crediti risulta dovuta.',
  'gate.spiegazione':
    'Il presupposto è binario: se l’imposta è dovuta, le addizionali si applicano sull’intera base; se non lo è, non si applicano affatto.',
  'gate.ragione.aperto':
    'L’IRPEF netta è {netta} e risulta dovuta: il presupposto delle addizionali è soddisfatto, quindi si applicano sull’intera base imponibile.',
  'gate.ragione.chiuso':
    'L’IRPEF netta è zero perché le detrazioni superano l’imposta lorda: il presupposto non è soddisfatto e nessuna delle due addizionali è dovuta.',
  'addizionale.spiegazione.gate':
    'Non dipende solo dal tuo reddito. Se l’IRPEF che devi risulta zero, l’addizionale non si paga affatto — non si riduce: non è dovuta.',
  'addizionale.ragione.gate':
    'L’IRPEF netta è zero, quindi il presupposto delle addizionali non è soddisfatto.',

  // Addizionale regionale
  'regionale.etichetta': 'Addizionale regionale — {ente}',
  'regionale.regola.non-istituita': 'L’addizionale è dovuta all’ente impositore che l’ha istituita.',
  'regionale.spiegazione.non-istituita':
    'Non è un’aliquota pari a zero: il tributo non esiste per questo ente.',
  'regionale.ragione.non-istituita': 'L’addizionale regionale non è istituita per {ente}.',
  'regionale.regola.gate':
    'L’addizionale regionale è dovuta se per lo stesso anno l’IRPEF risulta dovuta.',
  'regionale.regola':
    'Aliquota deliberata dall’ente impositore, applicata al reddito complessivo al netto degli oneri deducibili.',
  'regionale.spiegazione':
    'Si calcola sulla stessa base dell’IRPEF, non su quello che resta dopo averla pagata. E le detrazioni non la toccano.',
  'regionale.fascia-intera.etichetta': 'Aliquota {aliquota} sull’intero imponibile',
  'regionale.fascia-intera.regola':
    'Aliquota deliberata dall’ente per fascia di reddito e applicata all’intero imponibile, non per scaglioni.',
  'regionale.fascia-intera.spiegazione':
    'Qui l’aliquota non cambia pendenza al confine della fascia: cambia tutta. Superata la soglia si applica la nuova aliquota all’intero reddito, non solo alla parte eccedente.',
  'detrazioni-regionali.etichetta': 'Detrazione regionale',
  'detrazioni-regionali.regola':
    'Detrazione dall’addizionale regionale spettante per fascia di reddito, fino a concorrenza dell’imposta dovuta e senza dare luogo a credito.',
  'detrazioni-regionali.spiegazione':
    '{ente} prevede {quante} dall’addizionale regionale per chi sta in questa fascia di reddito, e si sottraggono dall’imposta già calcolata.',
  'detrazioni-regionali.spiegazione.pavimento':
    'La detrazione spettante è di {dovuta}, ma l’addizionale dovuta è minore: se ne usa {usata} e l’addizionale si ferma a zero. Il residuo non diventa un credito — lo dice l’ente stesso.',
  'detrazioni-regionali.una': 'una detrazione propria',
  'detrazioni-regionali.molte': '{n} detrazioni proprie',

  // Addizionale comunale
  'comunale.etichetta': 'Addizionale comunale — {ente}',
  'comunale.regola.non-istituita': 'L’addizionale è dovuta al comune che l’ha istituita.',
  'comunale.spiegazione.non-istituita':
    'Non è un’aliquota pari a zero: il tributo non esiste in questo comune. Sono due modi diversi di non pagare nulla.',
  'comunale.ragione.non-istituita':
    'L’addizionale comunale non è istituita nel comune di {ente}.',
  'comunale.regola.gate':
    'L’addizionale comunale è dovuta se per lo stesso anno risulta dovuta l’IRPEF.',
  'comunale.regola.esente':
    'L’addizionale non è dovuta al di sotto della soglia di esenzione deliberata dal comune.',
  'comunale.spiegazione.esente':
    'Sono due condizioni distinte. Qui l’IRPEF è dovuta, ma il tuo Comune non fa pagare l’addizionale a chi resta sotto una certa soglia di reddito.',
  'comunale.ragione.esente':
    'Il reddito complessivo ({rc}) non supera la soglia di esenzione di {soglia} deliberata dal comune di {ente}.',
  'comunale.regola':
    'Aliquota deliberata dal comune, applicata al reddito complessivo al netto degli oneri deducibili, salva la soglia di esenzione.',
  'comunale.spiegazione.ereditato':
    'Il comune non ha deliberato per l’anno d’imposta: per legge si applicano aliquota ed esenzione già vigenti nel {anno}.',
  'comunale.spiegazione.deliberato':
    'Si calcola sulla stessa base dell’IRPEF, e le detrazioni non la toccano.',
  'regionale.regola.esente':
    'Soglia di esenzione deliberata dall’ente impositore, in ragione del possesso di specifici requisiti reddituali.',
  'regionale.spiegazione.esente':
    'Anche l’addizionale regionale può avere una soglia sotto la quale non è dovuta. Qui il reddito ci sta sotto, quindi non si paga nulla all’ente.',
  'regionale.ragione.esente':
    'Il reddito complessivo ({rc}) non supera la soglia di esenzione di {soglia} deliberata da {ente}.',
  'soglia-esenzione-regionale.regola':
    'Soglia di esenzione in ragione del possesso di specifici requisiti reddituali, deliberata dall’ente impositore. La norma statale che l’autorizza non è stata reperita: la base è il provvedimento dell’ente.',
  'soglia-esenzione.etichetta': 'Soglia di esenzione: {soglia}',
  'soglia-esenzione.regola':
    'Soglia di esenzione in ragione del possesso di specifici requisiti reddituali, stabilita con regolamento comunale.',
  'soglia-esenzione.spiegazione.esente':
    'Il reddito complessivo non supera {soglia}: l’addizionale non è dovuta affatto.',
  'soglia-esenzione.spiegazione.dovuta':
    'È una soglia secca, non una franchigia: superata di un euro si paga sull’intero reddito, non sull’eccedenza. Qui il reddito la supera.',
  'soglia-esenzione.ragione.esente':
    'Il reddito complessivo ({rc}) non supera la soglia di esenzione di {soglia}.',
  'soglia-esenzione.ragione.dovuta':
    'Il reddito complessivo ({rc}) supera la soglia di esenzione di {soglia}, quindi l’addizionale è dovuta sull’intera base.',

  // Ramo che aggiunge
  'somma-cuneo.etichetta': 'Somma per il taglio del cuneo',
  'somma-cuneo.regola.non-dovuta':
    'Somma che non concorre alla formazione del reddito, in percentuale sul reddito di lavoro dipendente, per reddito complessivo non superiore alla soglia di accesso.',
  'somma-cuneo.spiegazione.non-dovuta':
    'Sopra la soglia il beneficio non sparisce: cambia forma e diventa la detrazione applicata sull’IRPEF.',
  'somma-cuneo.ragione.non-dovuta':
    'Il reddito complessivo ({rc}) supera la soglia di accesso di {soglia}. Sopra questa soglia opera l’ulteriore detrazione, non la somma.',
  'somma-cuneo.regola':
    'Somma che non concorre alla formazione del reddito, pari a una percentuale dell’intero reddito di lavoro dipendente.',
  'somma-cuneo.spiegazione':
    'Non è una detrazione e non passa dalle imposte: è denaro erogato che si somma al netto. La percentuale colpisce tutto il reddito, non la parte eccedente la soglia della fascia.',
  'trattamento-integrativo.etichetta': 'Trattamento integrativo',
  'trattamento-integrativo.regola.spetta':
    'Somma che non concorre alla formazione del reddito, a condizione che l’imposta lorda superi la detrazione dell’art. 13 c. 1 diminuita di un importo fisso.',
  'trattamento-integrativo.spiegazione.spetta':
    'È denaro che si somma al netto senza passare dalle imposte. Spetta a chi ha imposta da pagare, e la soglia non coincide con il punto in cui l’IRPEF netta diventa positiva.',
  'trattamento-integrativo.regola.non-spetta':
    'Somma che non concorre alla formazione del reddito per reddito complessivo non superiore alla soglia, e a condizione che l’imposta lorda superi la detrazione dell’art. 13 c. 1 diminuita di un importo fisso.',
  'trattamento-integrativo.spiegazione.non-spetta':
    'Quando spetta, è denaro che si somma al netto senza passare dalle imposte.',
  'trattamento-integrativo.ragione.sopra-soglia':
    'Il reddito complessivo ({rc}) supera il limite di {soglia} previsto per il trattamento integrativo.',
  'trattamento-integrativo.ragione.incapiente':
    'L’imposta lorda ({lorda}) non supera la detrazione per lavoro dipendente diminuita di {scarto}, pari a {sogliaGate}: il trattamento integrativo non spetta.',
}

// ---------------------------------------------------------------------------
// English
//
// ⚠️ Two rules govern this column, and both come from D-041.
//
// 1. Italian institution names stay in Italian, with a gloss in brackets at
//    first mention. Translating «addizionale comunale» into «municipal
//    surcharge» and stopping there costs the reader the term they would need to
//    search for — the opposite of what a calculator that cites its sources is
//    for.
// 2. Statutory phrasing stays statutory. `regola` is written in the register of
//    the law it restates, in English as in Italian; `spiegazione` is the field
//    that speaks to the reader. Flattening the first into the second would
//    empty it (D-039).
// ---------------------------------------------------------------------------

const en: TestiTraccia = {
  // RAL
  'ral.etichetta': 'RAL (gross annual salary)',
  'ral.regola': 'Starting point, as entered by the user.',
  'ral.spiegazione':
    'The RAL already includes any extra monthly instalments: your annual net pay is the same whether it is paid over 12, 13 or 14 instalments — only the divisor changes.',

  // Contributi
  'contributi.etichetta': 'IVS social security contributions',
  'contributi.regola':
    'Employee rate applied to the contributory earnings base, taken gross of any contribution or withholding.',
  'contributi.spiegazione.ordinaria':
    'This is not a tax: it is a contribution that builds a pension entitlement. It leaves your payslip now and comes back later as a benefit.',
  'contributi.spiegazione.apprendista':
    'This is not a tax: it is a contribution that builds a pension entitlement. Under an apprendistato (apprenticeship contract) the employee rate is reduced, and that is the only way the type of contract moves your net pay.',
  'base-contributiva.etichetta': 'Contributory earnings base',
  'base-contributiva.regola':
    'Sums are taken gross of any contribution or withholding: the base is gross pay.',
  'base-contributiva.spiegazione':
    'In the standard case it matches the RAL, and not by approximation: the items the law excludes are not part of this calculation to begin with.',

  // Quota aggiuntiva 1%
  'quota.etichetta': 'Additional 1% contribution',
  'quota.regola.regime':
    'An additional one percentage point on the portion of pay above the first pensionable earnings band, for schemes whose employee rate is below 10 per cent.',
  'quota.regola':
    'An additional one percentage point on the portion of pay above the first pensionable earnings band.',
  'quota.spiegazione.regime':
    'The condition belongs to the pension scheme, not to the individual worker: here the ordinary rate is not below the limit, so the contribution switches itself off by operation of the law.',
  'quota.ragione.regime':
    'The ordinary employee rate ({aliquotaOrdinaria}) is not below the {limite} limit set by the rule.',
  'quota.spiegazione.sotto-soglia':
    'It is the only threshold on the contributions side. Below the first band it does not apply.',
  'quota.ragione.sotto-soglia':
    'Contributory earnings ({retribuzione}) do not exceed the first pensionable earnings band of {soglia}.',
  'quota.spiegazione.applicata':
    'It applies only to the part of your pay above {soglia}, not to the whole of it.',

  // Dal lordo all'imponibile fiscale
  'reddito-complessivo.etichetta': 'Reddito complessivo (total taxable income)',
  'reddito-complessivo.regola':
    'Compulsory social security contributions do not form part of taxable income: this is an exclusion, not a deduction.',
  'reddito-complessivo.spiegazione':
    'The income your taxes are computed on is already net of contributions. That is why they cost you less than their face value: they bring the tax down as well.',

  // Ramo erariale
  'irpef-lorda.etichetta': 'IRPEF, gross',
  'irpef-lorda.regola': 'Rates by income bracket.',
  'irpef-lorda.spiegazione':
    'Each bracket is taxed at its own rate: only the part of your income above a threshold pays the higher rate, not all of it.',
  'detrazione.etichetta': 'Employment income tax credit',
  'detrazione.regola':
    'A piecewise credit on total taxable income; where it is a formula, the ratio is taken to the first four decimal places.',
  'detrazione.spiegazione':
    'This is not a deduction from your pay: it is a discount on the tax. In the band where it tapers off, every extra euro of income is both taxed and shrinks the credit.',
  'detrazione-incremento.etichetta': 'Top-up for the {da}–{a} band',
  'detrazione-incremento.regola':
    'The credit due under subsection 1 is increased by a fixed amount.',
  'detrazione-incremento.spiegazione':
    'A fixed amount that appears at one threshold and vanishes at another: a step, not a curve.',
  'detrazione-cuneo.etichetta': 'Further tax credit (cuneo fiscale)',
  'detrazione-cuneo.regola':
    'A further credit against gross tax, tapering by bands of total taxable income.',
  'detrazione-cuneo.spiegazione':
    'The second leg of the cuneo fiscale (tax wedge) cut: below the entry threshold it is a cash payment, above it becomes a tax credit.',
  'irpef-netta.etichetta': 'IRPEF, net',
  'irpef-netta.regola': 'Credits are applied against gross tax up to its full amount and no further.',
  'irpef-netta.spiegazione.capiente':
    'Credits do not turn into a refund: the tax has a floor at zero. Here there is enough tax to absorb them.',
  'irpef-netta.spiegazione.incapiente':
    'The credits exceed the gross tax, but they do not turn into a refund: the tax stops at zero and the excess is lost.',
  'irpef.etichetta': 'IRPEF',
  'irpef.regola':
    'A progressive bracket tax on total taxable income net of deductible charges, reduced by credits up to the amount of the gross tax.',
  'irpef.spiegazione':
    'The state income tax. Credits are not a withholding: they reduce a tax that has already been computed, and they cannot push it below zero.',

  // Gli scaglioni descrivono se stessi
  'scaglione.etichetta': 'From {da} to {a} — {aliquota}',
  'scaglione.etichetta.ultimo': 'Above {da} — {aliquota}',
  'scaglione.regola': 'Applies to the income bracket from {da} up to {a}.',
  'scaglione.regola.ultimo': 'Applies to the income bracket from {da} upwards.',
  'scaglione.spiegazione':
    'The rate applies only to the slice of income that falls inside this band: {quota}.',

  // Il gate delle addizionali
  'gate.etichetta.aperto': 'The addizionali are due',
  'gate.etichetta.chiuso': 'The addizionali are not due',
  'gate.regola':
    'The addizionali are due if, for the same year, IRPEF net of credits and tax reliefs is itself due.',
  'gate.spiegazione':
    'The condition is binary: if the tax is due, the addizionali apply to the whole base; if it is not, they do not apply at all.',
  'gate.ragione.aperto':
    'Net IRPEF is {netta} and is therefore due: the condition for the addizionali is met, so they apply to the whole taxable base.',
  'gate.ragione.chiuso':
    'Net IRPEF is zero because the credits exceed the gross tax: the condition is not met and neither addizionale is due.',
  'addizionale.spiegazione.gate':
    'It does not depend on your income alone. If the IRPEF you owe comes out at zero, the addizionale is not paid at all — it is not reduced: it is not due.',
  'addizionale.ragione.gate':
    'Net IRPEF is zero, so the condition for the addizionali is not met.',

  // Addizionale regionale
  'regionale.etichetta': 'Addizionale regionale — {ente}',
  'regionale.regola.non-istituita':
    'The addizionale is owed to the authority that introduced it.',
  'regionale.spiegazione.non-istituita':
    'This is not a rate set to zero: the tax does not exist for this authority.',
  'regionale.ragione.non-istituita':
    'No addizionale regionale has been introduced for {ente}.',
  'regionale.regola.gate':
    'The addizionale regionale is due if IRPEF is itself due for the same year.',
  'regionale.regola':
    'Rate set by the levying authority, applied to total taxable income net of deductible charges.',
  'regionale.spiegazione':
    'It is computed on the same income as IRPEF, not on what is left after paying it. And the tax credits do not touch it.',
  'regionale.fascia-intera.etichetta': 'Rate of {aliquota} on the whole taxable income',
  'regionale.fascia-intera.regola':
    'Rate set by the authority per income band and applied to the whole taxable income, not bracket by bracket.',
  'regionale.fascia-intera.spiegazione':
    'Here the rate does not change slope at the band edge: it changes entirely. Once you cross the threshold the new rate applies to your whole income, not only to the part above it.',
  'detrazioni-regionali.etichetta': 'Regional tax credit',
  'detrazioni-regionali.regola':
    'Credit against the addizionale regionale, due by income band, up to the amount of tax owed and never giving rise to a refund.',
  'detrazioni-regionali.spiegazione':
    '{ente} grants {quante} against the addizionale regionale for this income band, and they come off the tax already computed.',
  'detrazioni-regionali.spiegazione.pavimento':
    'The credit due is {dovuta}, but the addizionale owed is smaller: {usata} of it is used and the addizionale stops at zero. The remainder does not become a refund — the authority says so itself.',
  'detrazioni-regionali.una': 'one credit of its own',
  'detrazioni-regionali.molte': '{n} credits of its own',

  // Addizionale comunale
  'comunale.etichetta': 'Addizionale comunale — {ente}',
  'comunale.regola.non-istituita':
    'The addizionale is owed to the municipality that introduced it.',
  'comunale.spiegazione.non-istituita':
    'This is not a rate set to zero: the tax does not exist in this municipality. They are two different ways of paying nothing.',
  'comunale.ragione.non-istituita':
    'No addizionale comunale has been introduced in {ente}.',
  'comunale.regola.gate':
    'The addizionale comunale is due if IRPEF is itself due for the same year.',
  'comunale.regola.esente':
    'The addizionale is not due below the exemption threshold set by the municipality.',
  'comunale.spiegazione.esente':
    'These are two separate conditions. Here IRPEF is due, but your municipality does not charge the addizionale to anyone staying below a certain income.',
  'comunale.ragione.esente':
    'Total taxable income ({rc}) does not exceed the {soglia} exemption threshold set by {ente}.',
  'comunale.regola':
    'Rate set by the municipality, applied to total taxable income net of deductible charges, subject to the exemption threshold.',
  'comunale.spiegazione.ereditato':
    'The municipality did not adopt new figures for this tax year: by law the rate and exemption already in force in {anno} continue to apply.',
  'comunale.spiegazione.deliberato':
    'It is computed on the same income as IRPEF, and the tax credits do not touch it.',
  'regionale.regola.esente':
    'Exemption threshold set by the levying authority, based on specified income requirements.',
  'regionale.spiegazione.esente':
    'The regional addizionale can have a threshold below which it is not due either. Here your income falls below it, so nothing is owed to the authority.',
  'regionale.ragione.esente':
    'Total taxable income ({rc}) does not exceed the {soglia} exemption threshold set by {ente}.',
  'soglia-esenzione-regionale.regola':
    'Exemption threshold based on specified income requirements, set by the levying authority. The national provision authorising it has not been traced: the basis is the authority’s own act.',
  'soglia-esenzione.etichetta': 'Exemption threshold: {soglia}',
  'soglia-esenzione.regola':
    'Exemption threshold based on specified income requirements, set by municipal regulation.',
  'soglia-esenzione.spiegazione.esente':
    'Total taxable income does not exceed {soglia}: the addizionale is not due at all.',
  'soglia-esenzione.spiegazione.dovuta':
    'It is a hard threshold, not an allowance: one euro over it and you pay on your whole income, not on the excess. Here your income is over it.',
  'soglia-esenzione.ragione.esente':
    'Total taxable income ({rc}) does not exceed the exemption threshold of {soglia}.',
  'soglia-esenzione.ragione.dovuta':
    'Total taxable income ({rc}) exceeds the exemption threshold of {soglia}, so the addizionale is due on the whole base.',

  // Ramo che aggiunge
  'somma-cuneo.etichetta': 'Cuneo fiscale (tax wedge) cash payment',
  'somma-cuneo.regola.non-dovuta':
    'A sum that does not form part of taxable income, as a percentage of employment income, for total taxable income not above the entry threshold.',
  'somma-cuneo.spiegazione.non-dovuta':
    'Above the threshold the benefit does not disappear: it changes shape and becomes the credit applied against IRPEF.',
  'somma-cuneo.ragione.non-dovuta':
    'Total taxable income ({rc}) exceeds the entry threshold of {soglia}. Above this threshold the further tax credit applies instead of the cash payment.',
  'somma-cuneo.regola':
    'A sum that does not form part of taxable income, equal to a percentage of the whole of employment income.',
  'somma-cuneo.spiegazione':
    'It is not a tax credit and it does not pass through the tax at all: it is money paid out that adds to your net pay. The percentage hits your whole income, not just the part above the band threshold.',
  'trattamento-integrativo.etichetta': 'Trattamento integrativo (supplementary payment)',
  'trattamento-integrativo.regola.spetta':
    'A sum that does not form part of taxable income, on condition that the gross tax exceeds the credit under art. 13 c. 1 reduced by a fixed amount.',
  'trattamento-integrativo.spiegazione.spetta':
    'Money that adds to your net pay without passing through the tax. It goes to those who have tax to pay, and the threshold does not coincide with the point where net IRPEF turns positive.',
  'trattamento-integrativo.regola.non-spetta':
    'A sum that does not form part of taxable income where total taxable income is not above the threshold, and on condition that the gross tax exceeds the credit under art. 13 c. 1 reduced by a fixed amount.',
  'trattamento-integrativo.spiegazione.non-spetta':
    'Where it is due, it is money that adds to your net pay without passing through the tax.',
  'trattamento-integrativo.ragione.sopra-soglia':
    'Total taxable income ({rc}) exceeds the {soglia} limit set for the trattamento integrativo.',
  'trattamento-integrativo.ragione.incapiente':
    'The gross tax ({lorda}) does not exceed the employment income credit reduced by {scarto}, that is {sogliaGate}: the trattamento integrativo is not due.',
}

// ---------------------------------------------------------------------------
// Le lingue, montate
// ---------------------------------------------------------------------------

/**
 * Il tag BCP 47 non è cosmetico: decide separatore delle migliaia e dei
 * decimali dentro le frasi della traccia. Vive in `tag-lingua.ts` perché lo
 * legge anche l'interfaccia, e da lì non si tira dietro la prosa.
 */
export const italiano: Lingua = { codice: 'it', tag: TAG.it, testi: it }
export const inglese: Lingua = { codice: 'en', tag: TAG.en, testi: en }

/**
 * `Record` pieno sulle lingue: aggiungerne una senza montarla qui non compila.
 */
export const LINGUE: Readonly<Record<CodiceLingua, Lingua>> = {
  it: italiano,
  en: inglese,
}
