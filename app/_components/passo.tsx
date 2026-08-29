'use client'

/**
 * Un passo della traccia, reso.
 *
 * **È rendering, non logica riscritta.** Nessun calcolo, nessun numero
 * derivato: ogni cifra in questo file esce da un campo di `Passo`. Il segno
 * arriva già dal motore — `effettoSulNetto` è negativo per le voci che
 * sottraggono — e qui si decide solo come scriverlo.
 *
 * **E nessuna prosa, nemmeno adesso che le lingue sono due.** `etichetta`,
 * `regola`, `spiegazione` e `ragione` arrivano dal motore già nella lingua
 * giusta (D-041): qui si traducono soltanto le etichette che la traccia non
 * porta — *Non dovuto*, *Il valore applicato* — che sono vocabolario di
 * interfaccia.
 *
 * Le tre varianti di `Esito` si rendono in tre modi diversi, ed è il punto:
 *
 * - `applicato` — una riga con il suo effetto;
 * - `nonDovuto` — **si mostra, con la sua ragione**. Non sparisce e non
 *   diventa una riga a zero: un numero mancante senza spiegazione è la forma
 *   peggiore di errore, perché è plausibile (D-033);
 * - `verifica` — si mostra come passaggio anche quando si apre. Un gate reso
 *   solo da chiuso sembrerebbe un errore invece di un passaggio della catena.
 *
 * I passi annidati stanno **dentro** il proprio blocco: è così che IRPEF lorda
 * → detrazioni → IRPEF netta si legge come una cosa sola, ed è ciò che rende
 * visibile il pavimento a zero (D-018).
 */

import type { Parametro, Passo } from '../../core/types'
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
      // Le fasce che mordono davvero le espone il motore come passi annidati:
      // ripeterle qui darebbe due elenchi della stessa cosa.
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

/** Il parametro usato dal passo, con la fonte che dice da dove viene il numero. */
function BloccoParametro({ parametro }: { parametro: Parametro }) {
  const { t } = useTraduzione()

  return (
    <div className="mt-3 rounded-voce border border-bordo bg-fondo px-3 py-2">
      {/* «Parametro» è vocabolario interno: chi legge vede un valore. */}
      <p className="text-xs font-medium text-inchiostro-tenue/80">{t('passo.valoreApplicato')}</p>
      <p className="mt-0.5 text-sm text-inchiostro">
        <ValoreParametro parametro={parametro} />
      </p>
      <div className="mt-2">
        <Fonti fonti={[parametro.fonte]} titolo={t('passo.daDoveVieneIlNumero')} />
      </div>
    </div>
  )
}

function Etichetta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-voce border border-bordo bg-carta px-2 py-0.5 text-xs font-medium text-inchiostro-tenue">
      {children}
    </span>
  )
}

/**
 * Il valore mostrato accanto all'etichetta.
 *
 * Per una voce che muove il netto è **l'effetto sul netto**, col suo segno.
 * Per un passo neutro — che espone una grandezza intermedia senza muovere
 * nulla — è la grandezza: scrivere «+0,00 €» accanto al reddito complessivo
 * direbbe una cosa vera e priva di senso.
 */
function Valore({ passo }: { passo: Passo }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inEuroConSegno } = formato(lingua)
  const esito = passo.esito

  if (esito.stato === 'nonDovuto') {
    return <Etichetta>{t('passo.nonDovuto')}</Etichetta>
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
    return esito.entra === esito.esce ? (
      <span className="cifre text-lg text-inchiostro-tenue">{inEuro(esito.esce)}</span>
    ) : (
      <span className="cifre text-lg text-inchiostro-tenue">
        <span className="text-base text-inchiostro-tenue/70">{inEuro(esito.entra)} → </span>
        {inEuro(esito.esce)}
      </span>
    )
  }

  // Il verde ha un significato solo: quello che resta al dipendente.
  return (
    <span
      className={`cifre text-lg font-semibold ${
        esito.segno === 'aggiunge' ? 'text-verde-testo' : 'text-inchiostro'
      }`}
    >
      {inEuroConSegno(esito.effettoSulNetto)}
    </span>
  )
}

/** La ragione, quando il passo ne ha una da dare. */
function Ragione({ passo }: { passo: Passo }) {
  const esito = passo.esito
  if (esito.stato === 'applicato') return null

  return (
    <p
      className={`mt-2 rounded-voce px-3 py-2 text-sm ${
        esito.stato === 'verifica' && esito.superata
          ? 'bg-verde-velo text-inchiostro'
          : 'bg-fondo text-inchiostro'
      }`}
    >
      {esito.ragione}
    </p>
  )
}

export function RigaPasso({ passo, annidato = false }: { passo: Passo; annidato?: boolean }) {
  const { t, lingua } = useTraduzione()
  const { inEuro } = formato(lingua)
  const esito = passo.esito

  return (
    <li
      className={
        annidato
          ? 'rounded-voce border border-bordo bg-carta px-4 py-3'
          : 'rounded-blocco border border-bordo bg-carta px-5 py-4'
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className={`font-medium text-inchiostro ${annidato ? 'text-sm' : 'text-base'}`}>
          {passo.etichetta}
        </h4>
        <Valore passo={passo} />
      </div>

      {esito.stato === 'applicato' && esito.segno !== 'neutro' ? (
        <p className="mt-0.5 text-xs text-inchiostro-tenue">
          {t('passo.calcolataSu')} <span className="cifre">{inEuro(esito.entra)}</span>
        </p>
      ) : null}

      <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">{passo.spiegazione}</p>

      <Ragione passo={passo} />

      {passo.parametro ? <BloccoParametro parametro={passo.parametro} /> : null}

      {passo.fonti ? (
        <div className="mt-3">
          {/*
            Due citazioni diverse e possono coesistere: la norma che dice *si fa
            così* sta sul passo, la fonte che dice *il numero è questo* sta sul
            parametro (D-026).
          */}
          <Fonti fonti={passo.fonti} titolo={t('passo.regolaApplicata')} />
        </div>
      ) : null}

      {/*
        La regola in linguaggio normativo resta accessibile senza affollare la
        riga: la spiegazione è per chi legge, questa è per chi verifica. Sta
        prima dei passi annidati, altrimenti la regola del blocco finirebbe
        sotto le righe che gli appartengono.
      */}
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-inchiostro-tenue/80 hover:text-inchiostro">
          {t('passo.regolaNormativa')}
        </summary>
        <p className="mt-1 leading-relaxed text-inchiostro-tenue">{passo.regola}</p>
      </details>

      {passo.dettaglio && passo.dettaglio.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l-2 border-bordo pl-4">
          {passo.dettaglio.map((p) => (
            <RigaPasso key={p.id} passo={p} annidato />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
