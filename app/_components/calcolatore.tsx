'use client'

import { useCallback, useRef, useState } from 'react'
import type { Risultato } from '../../core/types'
import {
  eErrore,
  type ErroreCalcolo,
  type RichiestaCalcolo,
  type RispostaCalcolo,
} from '../_lib/api'
import type { ComuneSelezionabile } from '../_lib/comuni'
import { Sezione } from './sezione'
import { SezioneDettaglio } from './sezione-dettaglio'
import { SezioneInput } from './sezione-input'
import { SezioneRisultato } from './sezione-risultato'

/**
 * L'orchestratore: raccoglie l'input, chiama l'handler, rende quello che
 * torna.
 *
 * **Non calcola.** Non conosce aliquote, non conosce soglie, non sa cosa sia
 * una detrazione: sa fare una POST e distinguere un risultato da un errore. Il
 * calcolo sta dietro `/api/calcola`, ed è lì che si innesterà il dataset MEF
 * senza che questo file cambi di una riga (D-004).
 *
 * Il caso di partenza arriva **già calcolato dal server** (D-036), ma le
 * sezioni 2 e 3 restano chiuse finché non si preme il bottone: la prima
 * schermata è una domanda, non una risposta a una domanda che nessuno ha
 * fatto. Averlo già in mano serve a farle aprire **subito**, senza attesa.
 *
 * Il vincolo che D-036 proteggeva — i confini del modello non devono dipendere
 * da un bottone premuto — regge lo stesso: «Cosa questo calcolatore non copre»
 * è una pagina raggiungibile dal footer, sempre, anche senza calcolare nulla.
 */
export function Calcolatore({
  comuni,
  iniziale,
  risultatoIniziale,
  erroreIniziale,
}: {
  comuni: readonly ComuneSelezionabile[]
  iniziale: RichiestaCalcolo
  risultatoIniziale: Risultato | null
  erroreIniziale: ErroreCalcolo | null
}) {
  const [risultato, setRisultato] = useState<Risultato | null>(risultatoIniziale)
  const [errore, setErrore] = useState<ErroreCalcolo | null>(erroreIniziale)
  const [inCorso, setInCorso] = useState(false)
  const [mostrato, setMostrato] = useState(false)

  const esito = useRef<HTMLDivElement>(null)

  const calcola = useCallback(async (richiesta: RichiestaCalcolo) => {
    // Le sezioni si aprono subito, sul risultato che il server ha già
    // preparato: chi preme non aspetta la rete per vedere qualcosa.
    setMostrato(true)
    setInCorso(true)

    esito.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })

    try {
      const risposta = await fetch('/api/calcola', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(richiesta),
      })

      // L'unico punto in cui si asserisce un tipo su dati che arrivano dalla
      // rete. È il confine del contratto: oltre, il risultato è garantito dal
      // motore che l'ha prodotto.
      const corpo = (await risposta.json()) as RispostaCalcolo

      if (eErrore(corpo)) {
        setErrore(corpo.errore)
        setRisultato(null)
      } else {
        setRisultato(corpo)
        setErrore(null)
      }
    } catch {
      setErrore({
        codice: 'richiesta-non-valida',
        messaggio:
          'Non siamo riusciti a completare il calcolo. Riprova fra poco: se il problema resta, non dipende dai dati che hai inserito.',
      })
      setRisultato(null)
    } finally {
      setInCorso(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      <SezioneInput comuni={comuni} iniziale={iniziale} inCorso={inCorso} onCalcola={calcola} />

      <div ref={esito} className="scroll-mt-6 space-y-6">
        {mostrato && errore ? (
          <Sezione
            numero="2"
            titolo="Non possiamo darti un numero"
            occhiello="Preferiamo dirtelo, invece di mostrarti una cifra che sembra giusta e non lo è."
          >
            <div className="rounded-blocco border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-sm leading-relaxed text-amber-900">{errore.messaggio}</p>
            </div>
          </Sezione>
        ) : null}

        {mostrato && risultato ? (
          <>
            <SezioneRisultato risultato={risultato} />
            <SezioneDettaglio risultato={risultato} />
          </>
        ) : null}
      </div>
    </div>
  )
}
