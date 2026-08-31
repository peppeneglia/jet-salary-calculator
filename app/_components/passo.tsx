'use client'

/**
 * Un passo della traccia, reso.
 *
 * È rendering, non logica riscritta. Nessun calcolo, nessun numero
 * derivato: ogni cifra in questo file esce da un campo di `Passo`. Il segno
 * arriva già dal motore — `effettoSulNetto` è negativo per le voci che
 * sottraggono — e qui si decide solo come scriverlo.
 *
 * E nessuna prosa, nemmeno adesso che le lingue sono due. `etichetta`,
 * `regola`, `spiegazione` e `ragione` arrivano dal motore già nella lingua
 * giusta (D-041): qui si traducono soltanto le etichette che la traccia non
 * porta — *Non dovuto*, *Il valore applicato* — che sono vocabolario di
 * interfaccia.
 *
 * Le tre varianti di `Esito` si rendono in tre modi diversi, ed è il punto:
 *
 * - `applicato` — una riga con il suo effetto;
 * - `nonDovuto` — si mostra, con la sua ragione. Non sparisce e non
 *   diventa una riga a zero: un numero mancante senza spiegazione è la forma
 *   peggiore di errore, perché è plausibile (D-033);
 * - `verifica` — si mostra come passaggio anche quando si apre. Un gate reso
 *   solo da chiuso sembrerebbe un errore invece di un passaggio della catena.
 *
 * I passi annidati stanno dentro il proprio blocco: è così che IRPEF lorda
 * → detrazioni → IRPEF netta si legge come una cosa sola, ed è ciò che rende
 * visibile il pavimento a zero (D-018).
 */

import type { Fonte, Parametro, Passo } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { Fonti } from './fonte'

function ValoreParametro({ parametro }: { parametro: Parametro }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inPercentuale } = formato(lingua)

  switch (parametro.tipo) {
    case 'aliquota':
      return <span className="cifre">{inPercentuale(parametro.valore)}</span>
    case 'importo':
    case 'soglia':
      return <span className="cifre">{inEuro(parametro.valore)}</span>
    case 'scaglioni':
      return parametro.valore.forma === 'unica' ? (
        <span className="cifre">{inPercentuale(parametro.valore.aliquota)}</span>
      ) : (
        <span>{t('passo.aliquoteAScaglioni')}</span>
      )
    case 'formula':
      return (
        <span className="cifre">
          {parametro.espressione}
          <span className="text-inchiostro-tenue"> → {parametro.applicata}</span>
        </span>
      )
  }
}

/**
 * Due `Fonte` sono la stessa citazione quando indicano lo stesso punto dello
 * stesso atto. L'URL e la data di consultazione non entrano nel confronto:
 * sono attributi della lettura, non della norma.
 */
const stessaFonte = (a: Fonte, b: Fonte): boolean =>
  a.atto === b.atto && a.riferimento === b.riferimento

/**
 * Il valore applicato, su una riga.
 *
 * ⚠️ **Qui c'era una card**, con bordo, fondo proprio e tre righe dentro, per
 * contenere `9,19%`. Un riquadro è un contenitore: promette che dentro ci sia
 * un contenuto strutturato, e dentro c'era mezza riga. Su una voce con tre
 * righe di prosa sopra, quella cornice era l'elemento più pesante del blocco e
 * conteneva la cosa più corta.
 *
 * Ora è una riga come le altre: etichetta, due punti, valore. Il valore resta
 * in evidenza perché è in `font-semibold` e in `cifre`, non perché ha una
 * scatola intorno.
 */
function ValoreApplicato({ parametro }: { parametro: Parametro }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inPercentuale } = formato(lingua)

  /*
    ⚠️ **Le fasce si disegnano, non si scrivono.** Qui c'era la stringa
    *«aliquote a scaglioni»*, cioè il nome della cosa al posto della cosa: chi
    legge scopriva che ce ne sono diverse ma non quante, né quanto distanti.

    La barra misura **l'aliquota**, non l'ampiezza della fascia, ed è la scelta
    che rende la figura onesta: la progressività è una scala di aliquote, e una
    barra proporzionale all'ampiezza direbbe che il primo scaglione «pesa» più
    dell'ultimo perché è più largo. È lo stesso grafico di `/spiegazione`, qui
    sui valori del calcolo appena fatto.

    ⚠️ **Non ripete i passi annidati.** Quelli dicono *quanta imposta* ha
    prodotto ciascuna fascia sul tuo reddito, e si fermano dove il reddito
    finisce; questa dice *com'è fatta la scala*, per intero, comprese le fasce
    che non ti riguardano — che è l'unico modo di vedere dove ti trovi dentro.
  */
  /*
    ⚠️ Solo le due forme a scaglioni, non `fasce-intere`. Il Friuli Venezia
    Giulia applica l'aliquota **all'intero imponibile** oltre una soglia, non
    per quote: disegnarla con le stesse barre direbbe che è progressiva come le
    altre, che è esattamente l'errore da 79,50 euro che il Caso 4 esiste per
    prendere. Quella forma resta scritta, non disegnata.
  */
  if (
    parametro.tipo === 'scaglioni' &&
    (parametro.valore.forma === 'scaglioni-vigenti' ||
      parametro.valore.forma === 'scaglioni-previgenti')
  ) {
    const scaglioni = parametro.valore.scaglioni
    const massima = Math.max(...scaglioni.map((x) => x.aliquota))
    return (
      <div className="mt-2">
        <p className="text-sm text-inchiostro-tenue select-none">
          {t('passo.valoreApplicato')}:
        </p>
        <ul className="mt-1.5 space-y-2">
          {scaglioni.map((x) => (
            <li key={`${x.da}-${x.a ?? 'oltre'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="text-xs text-inchiostro-tenue">
                  {x.a === null
                    ? t('passo.scaglioneOltre', { da: inEuro(x.da) })
                    : t('passo.scaglioneDaA', { da: inEuro(x.da), a: inEuro(x.a) })}
                </span>
                <span className="cifre text-xs font-semibold text-inchiostro">
                  {inPercentuale(x.aliquota)}
                </span>
              </div>
              <div
                aria-hidden
                className="mt-1 h-2 w-full overflow-hidden rounded-full bg-bordo-decorativo"
              >
                <div
                  className="h-full rounded-full bg-verde"
                  style={{ width: `${(x.aliquota / massima) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <p className="mt-2 text-sm text-inchiostro-tenue">
      <span className="select-none">{t('passo.valoreApplicato')}: </span>
      <span className="font-semibold text-inchiostro">
        <ValoreParametro parametro={parametro} />
      </span>
    </p>
  )
}

function Etichetta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-voce border border-bordo-decorativo bg-carta px-2 py-0.5 text-xs font-medium text-inchiostro-tenue">
      {children}
    </span>
  )
}

/**
 * Il valore mostrato accanto all'etichetta.
 *
 * Per una voce che muove il netto è l'effetto sul netto, col suo segno.
 * Per un passo neutro — che espone una grandezza intermedia senza muovere
 * nulla — è la grandezza: scrivere «+0,00 €» accanto al reddito complessivo
 * direbbe una cosa vera e priva di senso.
 */
function Valore({ passo, apertura = false }: { passo: Passo; apertura?: boolean }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inEuroConSegno } = formato(lingua)
  const esito = passo.esito

  if (esito.stato === 'nonDovuto') {
    return <Etichetta>{t('passo.nonDovuto')}</Etichetta>
  }

  /*
    La cifra che apre la catena: stessa misura delle voci sotto, così la
    colonna di destra si legge dall'alto come una sequenza sola. Senza segno,
    perché non è un effetto sul netto ma il valore da cui si parte.
  */
  if (apertura && esito.stato === 'applicato') {
    return (
      <span className="cifre text-xl font-semibold text-inchiostro">{inEuro(esito.esce)}</span>
    )
  }

  if (esito.stato === 'verifica') {
    return (
      <span className="flex items-center gap-2">
        <Etichetta>
          {esito.superata ? t('passo.presuppostoSoddisfatto') : t('passo.presuppostoAssente')}
        </Etichetta>
        <span className="cifre text-sm text-inchiostro-tenue">{inEuro(esito.grandezzaLetta)}</span>
      </span>
    )
  }

  if (esito.segno === 'neutro') {
    /*
      Un passo neutro non muove il netto: espone una grandezza. Mostrare
      `entra → esce` quando differiscono è ciò che rende leggibile la catena
      annidata — IRPEF lorda, poi ogni detrazione che si accumula, poi il
      pavimento a zero. Non è un calcolo: sono due campi dello stesso esito.
    */
    /*
      ⚠️ **Un passo neutro pesa meno della voce che lo contiene**, e prima
      pesava uguale: *Base contributiva 30.000,00* era in `text-lg` esattamente
      come i *−2.757,00 €* dei contributi che gli stanno sopra. Due numeri
      della stessa grandezza a due righe di distanza si leggono come due voci
      pari, mentre uno è la base su cui l'altro si calcola — e per giunta il
      più grande dei due era quello che non muove niente.
    */
    return esito.entra === esito.esce ? (
      <span className="cifre text-sm text-inchiostro-tenue">{inEuro(esito.esce)}</span>
    ) : (
      <span className="cifre text-sm text-inchiostro-tenue">
        <span className="text-inchiostro-nota">{inEuro(esito.entra)} → </span>
        {inEuro(esito.esce)}
      </span>
    )
  }

  /*
    ⚠️ Questa è la cifra della voce, ed è la più grande della riga: `text-xl`
    contro il `text-sm` dei passaggi interni. La gerarchia della riga si legge
    ora nell'ordine giusto — quanto pesa, su cosa si calcola, con quale
    parametro, per quale norma.

    Il verde ha un significato solo: quello che resta al dipendente. Per questo
    lo prende soltanto una voce che **aggiunge**, mai una che sottrae.
  */
  return (
    <span
      className={`cifre text-xl font-semibold ${
        esito.segno === 'aggiunge' ? 'text-verde-testo' : 'text-inchiostro'
      }`}
    >
      {inEuroConSegno(esito.effettoSulNetto)}
    </span>
  )
}

/**
 * La ragione, quando il passo ne ha una da dare.
 *
 * ⚠️ **Il riquadro verde è sparito, e diceva la cosa sbagliata nel modo più
 * appariscente della pagina.**
 *
 * Un presupposto soddisfatto riempiva di `verde-velo` una fascia a tutta
 * larghezza sotto la voce, alta due righe. Il verde di questo prodotto
 * significa una cosa sola, *quello che resta al dipendente*, e qui stava
 * annunciando l'esatto contrario: il presupposto soddisfatto è la condizione
 * per cui **si pagano** le due addizionali. Chi scorre e legge i colori prima
 * delle parole leggeva una buona notizia dove c'è un prelievo.
 *
 * E aveva un secondo difetto, indipendente dal significato: era il solo blocco
 * pieno di tutta la sezione, quindi pesava più delle voci che portano una
 * cifra, per dire una cosa che è un passaggio di verifica. Un fondo esteso è
 * una promessa di importanza che il contenuto non manteneva.
 *
 * Ora la ragione è prosa come le spiegazioni delle altre voci, e a marcare
 * l'esito è la pastiglia accanto all'etichetta, che quel lavoro lo faceva già.
 */
function Ragione({ passo }: { passo: Passo }) {
  const esito = passo.esito
  if (esito.stato === 'applicato') return null

  return (
    <p className="mt-2 max-w-prose text-sm leading-relaxed text-inchiostro-tenue">
      {esito.ragione}
    </p>
  )
}

/**
 * ⚠️ **Il rilievo della riga dice se la voce è stata applicata**, e prima non
 * lo diceva nessuno: una voce applicata e una non dovuta avevano lo stesso
 * riquadro bianco, lo stesso bordo e lo stesso peso, e a distinguerle restava
 * una pastiglia grigia di due parole in fondo alla riga. Su un elenco di dieci
 * voci di cui tre non si applicano, la cosa che conta — *questa mi tocca
 * davvero* — era l'unica non visibile a colpo d'occhio.
 *
 * Ora: **applicata** ha carta piena e una barra verde sul fianco; **non
 * dovuta** e **verifica** hanno fondo tenue, nessuna barra, titolo smorzato.
 * La voce non dovuta non sparisce e non diventa una riga a zero: un numero
 * mancante senza spiegazione è la forma peggiore di errore, perché è plausibile
 * (D-033).
 */
export function RigaPasso({
  passo,
  annidato = false,
  apertura = false,
}: {
  passo: Passo
  annidato?: boolean
  /**
   * Il passo che apre la catena, cioè la RAL.
   *
   * ⚠️ **Non è un passaggio intermedio, ed è la ragione per cui esiste
   * questa distinzione.** I passi neutri portano il proprio valore in piccolo
   * sotto l'etichetta, e ha senso: *base contributiva* e *reddito
   * complessivo* sono grandezze di servizio, incolonnarle a destra le
   * farebbe leggere come addendi accanto ai `−2.757,00 €` dei contributi.
   *
   * La RAL non è una di quelle. È **la cifra da cui parte tutto**, l'unica che
   * chi legge ha scritto di persona, e scriverla in corpo minore in fondo a
   * sinistra la faceva sparire proprio in cima all'elenco che dovrebbe
   * aprire. Va dove vanno le cifre che contano: a destra e grande, come le
   * voci sotto. Resta in inchiostro e non in verde, perché non è una somma che
   * si aggiunge: è il punto di partenza.
   */
  apertura?: boolean
}) {
  const { t, lingua } = useTraduzione()
  const { inEuro } = formato(lingua)
  const esito = passo.esito

  const applicata = esito.stato === 'applicato' && esito.segno !== 'neutro'
  const spenta = esito.stato === 'nonDovuto'
  const neutro = esito.stato === 'applicato' && esito.segno === 'neutro' && !apertura

  /*
    ⚠️ **La barra è verde, e basta un colore.** Ci avevo messo la tinta della
    natura — una per contributi, una per IRPEF, una per le addizionali — per
    legare la riga al segmento del grafico. Legava anche tre colori nuovi a un
    prodotto che ne ha uno, e la palette è verde e grigi.

    Qui il verde non dice *questi soldi restano a te*: dice **questa voce è
    stata applicata**, che è l'unica distinzione che la riga deve fare a colpo
    d'occhio. Il significato «quello che resta» vive sulle **cifre**, e lì
    resta intatto: `verde-testo` lo prendono solo il netto e le voci che
    aggiungono.
  */
  const accento = applicata ? 'border-l-4 border-l-verde' : ''

  /*
    Le fonti del passo più quella del parametro, senza doppioni: `stessaFonte`
    confronta atto e riferimento, cioè il punto della norma, e ignora URL e
    data di consultazione — che sono attributi della lettura, non dell'atto.
  */
  const fonti: Fonte[] = [...(passo.fonti ?? [])]
  if (passo.parametro && !fonti.some((f) => stessaFonte(f, passo.parametro!.fonte))) {
    fonti.push(passo.parametro.fonte)
  }

  return (
    <li
      className={[
        annidato ? 'rounded-voce px-3 py-3 sm:px-4' : 'rounded-blocco px-4 py-4 sm:px-5',
        'border border-bordo-decorativo',
        spenta || esito.stato === 'verifica' ? 'bg-fondo' : 'bg-carta',
        accento,
      ].join(' ')}
    >
      {/*
        ⚠️ **La cifra a destra è riservata a chi muove il netto**, e prima non
        lo era: *Base contributiva — 30.000,00 €* stava nella stessa colonna di
        destra dei *−2.757,00 €* dei contributi, incolonnata con loro. Due
        numeri incolonnati si leggono come due addendi, e quello è invece la
        base su cui il primo si calcola: la colonna diceva *sono voci pari*
        mentre la gerarchia dice il contrario.

        I passi neutri portano ora il proprio valore **in linea sotto
        l'etichetta**, dove si legge come ciò che è — una grandezza esposta, non
        un addendo.
      */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4
          className={`${annidato ? 'text-sm' : 'text-base'} ${
            spenta ? 'font-normal text-inchiostro-tenue' : 'font-medium text-inchiostro'
          }`}
        >
          {passo.etichetta}
        </h4>
        {neutro ? null : <Valore passo={passo} apertura={apertura} />}
      </div>

      {neutro ? (
        <p className="mt-0.5 text-sm">
          <Valore passo={passo} />
        </p>
      ) : null}

      {applicata ? (
        <p className="mt-0.5 text-xs text-inchiostro-tenue">
          {t('passo.calcolataSu')} <span className="cifre">{inEuro(esito.entra)}</span>
        </p>
      ) : null}

      {/* Facoltativa dal 31/08: un passo che non ha nulla da aggiungere non aggiunge nulla. */}
      {passo.spiegazione ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-inchiostro-tenue">
          {passo.spiegazione}
        </p>
      ) : null}

      <Ragione passo={passo} />

      {passo.parametro ? <ValoreApplicato parametro={passo.parametro} /> : null}

      {/*
        ⚠️ **La regola non si apre più: è una frase dopo i due punti.**

        Era dietro un `<details>`, e il concetto era sbagliato prima ancora
        della resa. Un elemento apribile promette *qui sotto c'è dell'altro*, e
        chi legge deve decidere se aprirlo — cioè spendere un gesto per sapere
        se gli interessa. Ma la regola in linguaggio normativo è **una riga**,
        ed è la riga che risponde alla domanda per cui esiste questo progetto:
        *da dove viene questo numero*. Nasconderla dietro un clic la trattava
        come materiale accessorio proprio nella pagina che la dichiara centrale.

        Aperta costa due righe e si salta con gli occhi; chiusa costava un
        gesto a chiunque la volesse. La forma apribile resta dov'è utile — le
        domande della FAQ, che sono paragrafi interi e sono davvero
        facoltative.
      */}
      {passo.regola ? (
        <p className="mt-2 max-w-prose text-xs leading-relaxed text-inchiostro-tenue">
          <span className="font-medium text-inchiostro-nota select-none">
            {t('passo.regolaNormativa')}:{' '}
          </span>
          {passo.regola}
        </p>
      ) : null}

      {/*
        ⚠️ **Una sola sezione «Fonte», e prima erano due con due nomi
        diversi.**

        C'era *Regola applicata* sotto il passo e *Da dove viene il numero*
        dentro la card del parametro, con una regola — D-026 — che decideva
        quale mostrare e quale no in base a se coincidessero. Il risultato in
        pagina: alcune voci con la fonte dentro un riquadro, altre con la fonte
        fuori, altre con entrambe. Tre trattamenti per la stessa cosa, e la
        differenza non era leggibile da fuori.

        La distinzione di D-026 resta vera nel **dato** — la norma che dice
        *si fa così* e la fonte che dice *il numero è questo* sono campi diversi
        di `Passo` — ma non è una distinzione che serva a chi legge: chi vuole
        verificare vuole l'elenco degli atti da aprire. Qui si uniscono in una
        lista sola, **deduplicata**, sotto un'etichetta sola.
      */}
      {fonti.length > 0 ? (
        <div className="mt-2">
          <Fonti fonti={fonti} titolo={t('fonte.titolo')} accanto />
        </div>
      ) : null}

      {passo.dettaglio && passo.dettaglio.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l-2 border-bordo-decorativo pl-2.5 sm:pl-4">
          {passo.dettaglio.map((p) => (
            <RigaPasso key={p.id} passo={p} annidato />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
