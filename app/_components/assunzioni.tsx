'use client'

/**
 * Le assunzioni dichiarate, rese in pagina.
 *
 * **È un vincolo del progetto, non un extra** (D-008): quello che il calcolo
 * non copre si dice, con la motivazione di ciascuna voce. Dichiarare i confini
 * è di per sé un segnale di controllo del dominio.
 *
 * Il componente serve due posti diversi:
 *
 * - accanto al numero, con le assunzioni che il **motore** ha selezionato per
 *   quel calcolo (D-031): la pagina non può mostrarne una che il motore non ha
 *   considerato;
 * - nella pagina «Cosa questo calcolatore non copre», con il catalogo intero e
 *   la condizione di ciascuna scritta accanto.
 *
 * ⚠️ **È qui, e in nessun altro posto, che il testo di un'assunzione sceglie la
 * propria lingua.** Il catalogo porta entrambe (D-041) e il motore le lascia
 * intatte, proprio perché una delle due pagine non passa dal motore: con la
 * risoluzione a monte le strade sarebbero due, e la stessa voce potrebbe
 * leggersi diversa a seconda di dove compare.
 */

import type { Assunzione } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { Fonti } from './fonte'

export function VoceAssunzione({
  assunzione,
  quando,
}: {
  assunzione: Assunzione
  /** Quando la voce si applica. Usata dal catalogo, dove le condizioni contano. */
  quando?: string
}) {
  const { t, lingua } = useTraduzione()

  const direzione =
    assunzione.direzione === 'nessuna'
      ? t('assunzioni.direzioneNessuna')
      : assunzione.direzione === 'netto-reale-piu-alto'
        ? t('assunzioni.direzionePiuAlto')
        : t('assunzioni.direzionePiuBasso')

  return (
    <li className="rounded-blocco border border-bordo-decorativo bg-carta px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="cifre rounded-voce border border-bordo-decorativo bg-fondo px-2 py-0.5 text-xs font-medium text-inchiostro-tenue">
          {assunzione.id}
        </span>
        {/*
          Il segno conta quanto l'assunzione stessa: dire da che parte il conto
          si sposta la trasforma da lacuna in limite conosciuto.
        */}
        <span className="rounded-voce bg-fondo px-2 py-0.5 text-xs text-inchiostro-tenue">
          {direzione}
        </span>
      </div>

      {quando ? <p className="mt-2 text-xs font-medium text-inchiostro">{quando}</p> : null}

      <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
        {assunzione.testo[lingua]}
      </p>

      {assunzione.fonte ? (
        <div className="mt-3">
          <Fonti fonti={[assunzione.fonte]} titolo={t('fonte.riferimento')} />
        </div>
      ) : null}
    </li>
  )
}

export function BloccoAssunzioni({
  assunzioni,
  collocazione,
  titolo,
  occhiello,
}: {
  assunzioni: readonly Assunzione[]
  collocazione: Assunzione['collocazione']
  titolo: string
  occhiello?: string
}) {
  const voci = assunzioni.filter((a) => a.collocazione === collocazione)
  if (voci.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold tracking-tight text-inchiostro">{titolo}</h3>
      {occhiello ? (
        <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">{occhiello}</p>
      ) : null}
      <ul className="mt-3 space-y-3">
        {voci.map((a) => (
          <VoceAssunzione key={a.id} assunzione={a} />
        ))}
      </ul>
    </div>
  )
}
