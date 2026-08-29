'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Risultato } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import {
  eErrore,
  type Errore,
  type RichiestaCalcolo,
  type RispostaCalcolo,
} from '../_lib/api'
import type { ComuneSelezionabile } from '../_lib/comuni'
import { messaggioErrore } from '../_lib/errori'
import { Avviso } from './avviso'
import { Sezione } from './sezione'
import { SezioneDettaglio } from './sezione-dettaglio'
import { SezioneInput } from './sezione-input'
import { SezioneRisultato } from './sezione-risultato'

/**
 * La sola chiamata di rete del progetto.
 *
 * Vive fuori dal componente perché non ha bisogno di nulla che stia dentro, e
 * perché così non entra nelle dipendenze di nessun hook. `null` significa *non
 * ha risposto*, che è diverso da *ha risposto un errore*: nel primo caso non
 * dipende dai dati inseriti, e il messaggio lo dice.
 */
async function interroga(richiesta: RichiestaCalcolo): Promise<RispostaCalcolo | null> {
  try {
    const risposta = await fetch('/api/calcola', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(richiesta),
    })
    // L'unico punto in cui si asserisce un tipo su dati che arrivano dalla
    // rete. È il confine del contratto: oltre, il risultato è garantito dal
    // motore che l'ha prodotto.
    return (await risposta.json()) as RispostaCalcolo
  } catch {
    return null
  }
}

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
  erroreIniziale: Errore | null
}) {
  const { t, lingua } = useTraduzione()

  const [risultato, setRisultato] = useState<Risultato | null>(risultatoIniziale)
  const [errore, setErrore] = useState<Errore | null>(erroreIniziale)
  const [inCorso, setInCorso] = useState(false)
  const [mostrato, setMostrato] = useState(false)

  const esito = useRef<HTMLDivElement>(null)

  /**
   * L'ultima cosa che è stata chiesta.
   *
   * In un `ref` e non in uno stato perché **non si rende**: serve solo a poter
   * rifare la stessa domanda quando cambia la lingua. Tenerlo in uno stato
   * aggiungerebbe un render a ogni calcolo senza cambiare un pixel.
   */
  const ultimaRichiesta = useRef<RichiestaCalcolo>(iniziale)

  const applica = useCallback((risposta: RispostaCalcolo | null) => {
    if (risposta === null) {
      setErrore({ codice: 'rete' })
      setRisultato(null)
      return
    }
    if (eErrore(risposta)) {
      setErrore(risposta.errore)
      setRisultato(null)
    } else {
      setRisultato(risposta)
      setErrore(null)
    }
  }, [])

  const calcola = useCallback(
    async (richiesta: RichiestaCalcolo) => {
      ultimaRichiesta.current = richiesta

      // Le sezioni si aprono subito, sul risultato che il server ha già
      // preparato: chi preme non aspetta la rete per vedere qualcosa.
      setMostrato(true)
      setInCorso(true)

      esito.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })

      applica(await interroga(richiesta))
      setInCorso(false)
    },
    [applica],
  )

  /**
   * Al cambio di lingua, la stessa domanda si rifà.
   *
   * ⚠️ **Non è un vezzo: senza, metà pagina resterebbe nella lingua di prima.**
   * Il server rende di nuovo la pagina nella lingua nuova, ma il `Risultato`
   * che sta qui è stato prodotto **prima**, e porta dentro di sé la prosa della
   * traccia — `regola`, `spiegazione`, `ragione` — che il motore ha scritto
   * nella lingua vecchia (D-041). L'unico modo di aggiornarla è richiederla.
   *
   * Il primo giro si salta: quello che c'è arriva dal server ed è già giusto.
   * Nessun `setState` sincrono nel corpo dell'effetto — solo dopo la risposta —
   * che è la ragione per cui questo non ricade nel difetto che aveva fatto
   * scartare `useEffect` in D-036.
   */
  const primoGiro = useRef(true)
  useEffect(() => {
    if (primoGiro.current) {
      primoGiro.current = false
      return
    }

    let annullato = false
    void (async () => {
      const risposta = await interroga({ ...ultimaRichiesta.current, lingua })
      if (!annullato) applica(risposta)
    })()

    return () => {
      annullato = true
    }
  }, [lingua, applica])

  return (
    <div className="space-y-6">
      <SezioneInput comuni={comuni} iniziale={iniziale} inCorso={inCorso} onCalcola={calcola} />

      <div ref={esito} className="scroll-mt-6 space-y-6">
        {mostrato && errore ? (
          <Sezione numero="2" titolo={t('errori.titolo')} occhiello={t('errori.occhiello')}>
            <Avviso vivo>{messaggioErrore(errore, t, lingua)}</Avviso>
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
