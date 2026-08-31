'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Mensilita, Risultato, TipoContratto } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import {
  eErrore,
  type Errore,
  type RichiestaCalcolo,
  type RispostaCalcolo,
} from '../_lib/api'
import { perLaPagina } from '../_lib/arrotonda'
import { messaggioErrore } from '../_lib/errori'
import { moduloRicordato, type ModuloRicordato } from '../_lib/sessione'
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
 * Non calcola. Non conosce aliquote, non conosce soglie, non sa cosa sia
 * una detrazione: sa fare una POST e distinguere un risultato da un errore. Il
 * calcolo sta dietro `/api/calcola`, ed è lì che si innesterà il dataset MEF
 * senza che questo file cambi di una riga (D-004).
 *
 * ⚠️ **Il caso di partenza non arriva più calcolato dal server, e D-036 va
 * emendata.** Fino a ieri la pagina rendeva server-side il netto di RAL 30.000
 * a Milano, e le sezioni 2 e 3 si aprivano su quello senza attendere la rete.
 * Ora i due campi partono vuoti con un segnaposto, quindi non esiste un caso da
 * precalcolare: un risultato pronto per dei valori che nessuno ha inserito
 * sarebbe il numero di qualcun altro, mostrato al primo click sotto le
 * etichette dell'utente.
 *
 * Quello che D-036 comprava — nessuna attesa alla prima apertura delle sezioni —
 * si perde, e costa poco: il calcolo è una POST senza I/O su un handler locale.
 * Quello che D-036 **proteggeva** — i confini del modello non devono dipendere
 * da un bottone premuto — regge intatto: «Cosa non copre questo calcolatore» è
 * una pagina raggiungibile dal piede, sempre, anche senza calcolare nulla.
 */
export function Calcolatore({
  codiciSuggeriti,
  contrattoIniziale,
  mensilitaIniziale,
}: {
  codiciSuggeriti: readonly string[]
  contrattoIniziale: TipoContratto
  mensilitaIniziale: Mensilita
}) {
  const { t, lingua } = useTraduzione()

  /**
   * Il modulo ripreso dalla sessione, letto una volta sola al montaggio.
   *
   * ⚠️ **Si legge in un inizializzatore pigro e non in un effetto**, e le
   * ragioni sono due. La prima: `SezioneInput` lo usa come valore iniziale dei
   * propri campi, e letto in un effetto arriverebbe dopo il primo disegno, con
   * il modulo che compare vuoto per un fotogramma e poi si riempie. La seconda
   * è che da qui discendono `mostrato` e `inCorso`, e ricavarli è ciò che
   * evita di doverli *impostare* dentro un effetto.
   *
   * Il valore non cambia mai dopo il montaggio: da lì in poi comanda lo stato
   * dei campi, e questo resta la fotografia con cui la pagina è ripartita.
   */
  const [ripreso] = useState<ModuloRicordato | null>(() =>
    typeof window === 'undefined' ? null : moduloRicordato(),
  )

  const [risultato, setRisultato] = useState<Risultato | null>(null)

  /*
   * Il risultato come la pagina lo scrive: stessi passi, stesso ordine, importi
   * arrotondati in modo che ogni totale sia la somma di ciò che gli sta sotto.
   * Il `risultato` grezzo resta quello del motore, ed è quello che l'handler
   * restituisce a chi chiama l'API.
   */
  const mostrabile = useMemo(() => (risultato === null ? null : perLaPagina(risultato)), [risultato])
  const [errore, setErrore] = useState<Errore | null>(null)
  /*
    ⚠️ I due partono **accesi** quando la sessione aveva un modulo, e non è un
    dettaglio di comodità: è ciò che evita di chiamare `setState` dentro
    l'effetto che rifà il calcolo. Se una sessione ricordava qualcosa, allora
    al primo disegno una richiesta sta per partire e le sezioni stanno per
    aprirsi: sono fatti noti prima di rendere, quindi si ricavano invece di
    essere impostati dopo.
  */
  const [inCorso, setInCorso] = useState(ripreso !== null)
  const [mostrato, setMostrato] = useState(ripreso !== null)

  const esito = useRef<HTMLDivElement>(null)

  /**
   * L'ultima cosa che è stata chiesta, oppure `null` se non è stato chiesto
   * ancora niente.
   *
   * In un `ref` e non in uno stato perché non si rende: serve solo a poter
   * rifare la stessa domanda quando cambia la lingua. Tenerlo in uno stato
   * aggiungerebbe un render a ogni calcolo senza cambiare un pixel.
   *
   * ⚠️ **`null` è lo stato iniziale, e prima non lo era.** Il ref partiva
   * dalla richiesta d'esempio precalcolata dal server. Senza quella, seminarlo
   * con una richiesta finta avrebbe un effetto preciso e sbagliato: chi cambia
   * lingua prima di aver calcolato vedrebbe comparire il risultato di RAL
   * 30.000 a Milano, che non ha chiesto. Il `null` è anche ciò che rende
   * inutile la vecchia bandiera `primoGiro`.
   */
  const ultimaRichiesta = useRef<RichiestaCalcolo | null>(null)

  /**
   * Il numero d'ordine dell'ultima domanda fatta.
   *
   * ⚠️ Esiste perché le domande partono da due strade e le risposte non
   * tornano in ordine. Il bottone si disabilita mentre una richiesta è in
   * volo, quindi due click non si accavallano; ma un cambio di lingua non
   * passa dal bottone, e chi cambia lingua mentre un calcolo è in corso apre
   * una seconda richiesta accanto alla prima. Da lì decide la rete: se la
   * prima risponde per ultima, in pagina resta il risultato della domanda
   * più vecchia, con la traccia nella lingua di prima.
   *
   * La guardia `annullato` che c'era nell'effetto non poteva vederlo: annulla
   * sé stessa, non l'altra strada. Il contatore invece è uno solo per
   * entrambe, ed è il pezzo che mancava.
   *
   * In un `ref` e non in uno stato: non si rende, e tenerlo in uno stato
   * aggiungerebbe un render a ogni richiesta senza cambiare un pixel.
   */
  const numeroRichiesta = useRef(0)

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

  /**
   * Chiede, e applica solo se nel frattempo non è stato chiesto altro.
   *
   * ⚠️ Spegne *in corso* qui dentro, e non da chi chiama. Una risposta
   * sorpassata non deve riaprire il bottone, perché la domanda buona è ancora
   * in volo; ma se fosse chi chiama a spegnerlo, il calcolo sorpassato da un
   * cambio di lingua non lo spegnerebbe mai — e il bottone resterebbe
   * disabilitato per sempre, perché l'effetto sulla lingua non lo aveva acceso
   * e non pensa a spegnerlo. Una sola sede per l'accensione e una per lo
   * spegnimento, sulla strada che vince.
   */
  const chiediEApplica = useCallback(
    async (richiesta: RichiestaCalcolo): Promise<void> => {
      const mio = ++numeroRichiesta.current
      const risposta = await interroga(richiesta)
      if (mio !== numeroRichiesta.current) return
      applica(risposta)
      setInCorso(false)
    },
    [applica],
  )

  /**
   * ⚠️ **Il calcolo ripreso si rifà, non si ridisegna.**
   *
   * Al montaggio, se la sessione ricordava un modulo, si rimanda la stessa
   * domanda. `mostrato` e `inCorso` sono già accesi dall'inizializzatore, quindi
   * qui non si imposta niente: il corpo dell'effetto fa **solo** la richiesta, e
   * resta dentro la regola che questo file già segue — nessun `setState`
   * sincrono in un effetto, che è ciò che aveva fatto scartare `useEffect` in
   * D-036.
   *
   * ⚠️ Non si scorre e non si sposta il fuoco. Chi torna da `/norme` sta
   * rientrando dove era, e il browser gli ha già restituito la posizione:
   * portarlo altrove sarebbe un secondo spostamento che non ha chiesto. È
   * l'unica differenza rispetto a `calcola`, ed è la ragione per cui questo
   * effetto non lo riusa.
   */
  const ripresoAvviato = useRef(false)
  useEffect(() => {
    if (ripresoAvviato.current || ripreso === null) return
    ripresoAvviato.current = true

    const richiesta: RichiestaCalcolo = {
      ral: Number(ripreso.ral.replace(',', '.')),
      codiceCatastale: ripreso.comune.codiceCatastale,
      tipoContratto: ripreso.tipoContratto,
      mensilita: ripreso.mensilita,
      lingua,
    }
    ultimaRichiesta.current = richiesta
    void chiediEApplica(richiesta)
  }, [ripreso, lingua, chiediEApplica])

  const calcola = useCallback(
    async (richiesta: RichiestaCalcolo) => {
      ultimaRichiesta.current = richiesta

      /*
        ⚠️ Il risultato precedente si azzera qui, e senza questa riga la
        sezione mostrerebbe il netto della domanda di prima sotto il riepilogo
        della domanda nuova — per tutto il tempo della richiesta. Con il caso
        d'esempio precalcolato non si notava, perché il primo calcolo trovava
        già il posto occupato da un numero coerente; ora il primo calcolo parte
        da vuoto e ogni calcolo successivo cambierebbe le etichette prima dei
        numeri. È lo stesso difetto di D-024 — ciò che si vede deve essere
        coerente con sé stesso — spostato nel tempo invece che nello spazio.
      */
      setRisultato(null)
      setErrore(null)

      setMostrato(true)
      setInCorso(true)

      await chiediEApplica(richiesta)

      /**
       * ⚠️ **Lo scorrimento va dopo la risposta, e prima non funzionava.**
       *
       * Stava sopra, subito dopo `setMostrato(true)`, e chiedeva al browser di
       * portare in cima un contenitore **ancora vuoto**: React non aveva
       * ancora reso nulla, e le sezioni 2 e 3 non esistevano nel documento.
       * Un browser non scorre oltre la fine della pagina — se sotto non c'è
       * niente, non c'è dove andare — quindi la pagina restava dov'era, e
       * quando poi il risultato compariva nessuno lo portava in vista. Da qui
       * *«si vede ancora troppa sezione dei dati»*: non era il bersaglio
       * sbagliato, era il momento sbagliato.
       *
       * Con il caso precalcolato il difetto era mascherato a metà, perché
       * qualcosa da mostrare c'era già. Tolto quello, si vede sempre.
       *
       * `requestAnimationFrame` e non un `setTimeout` a caso: serve il primo
       * fotogramma **dopo** che React ha scritto nel DOM, che è esattamente
       * ciò che rAF garantisce. Un ritardo a tempo indovinerebbe.
       */
      requestAnimationFrame(() => {
        esito.current?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        })
      })
    },
    [chiediEApplica],
  )

  /**
   * Al cambio di lingua, la stessa domanda si rifà.
   *
   * ⚠️ Non è un vezzo: senza, metà pagina resterebbe nella lingua di prima.
   * Il server rende di nuovo la pagina nella lingua nuova, ma il `Risultato`
   * che sta qui è stato prodotto prima, e porta dentro di sé la prosa della
   * traccia — `regola`, `spiegazione`, `ragione` — che il motore ha scritto
   * nella lingua vecchia (D-041). L'unico modo di aggiornarla è richiederla.
   *
   * ⚠️ **La condizione d'uscita è «non è stato chiesto niente», non «è il
   * primo giro».** Erano la stessa cosa finché il server precalcolava un caso:
   * al primo giro c'era già un risultato giusto da non rifare. Ora al primo
   * giro non c'è nessun risultato, e la domanda da porsi è un'altra — *c'è
   * qualcosa da ritradurre?* Una bandiera sul primo giro lascerebbe passare
   * ogni cambio di lingua successivo anche a schermo vuoto, e ognuno
   * calcolerebbe una richiesta che nessuno ha fatto.
   *
   * Nessun `setState` sincrono nel corpo dell'effetto — solo dopo la risposta —
   * che è la ragione per cui questo non ricade nel difetto che aveva fatto
   * scartare `useEffect` in D-036.
   */
  useEffect(() => {
    const precedente = ultimaRichiesta.current
    if (precedente === null) return

    // ⚠️ La guardia allo smontaggio non serve più, e non è stata dimenticata:
    // `chiediEApplica` scarta ogni risposta sorpassata, e questa lo è per
    // definizione appena parte la richiesta successiva. Una seconda guardia
    // accanto direbbe la stessa cosa in un modo che vale solo per metà dei casi.
    void chiediEApplica({ ...precedente, lingua })
  }, [lingua, chiediEApplica])

  return (
    <div className="space-y-6">
      <SezioneInput
        ripreso={ripreso}
        codiciSuggeriti={codiciSuggeriti}
        contrattoIniziale={contrattoIniziale}
        mensilitaIniziale={mensilitaIniziale}
        inCorso={inCorso}
        onCalcola={calcola}
      />

      <div ref={esito} className="scroll-mt-6 space-y-6">
        {mostrato && errore ? (
          <Sezione numero="2" titolo={t('errori.titolo')} occhiello={t('errori.occhiello')}>
            <Avviso vivo>{messaggioErrore(errore, t, lingua)}</Avviso>
          </Sezione>
        ) : null}

        {/*
          ⚠️ L'arrotondamento si applica qui, una volta sola (D-066).

          Le due sezioni devono leggere gli stessi numeri: se ciascuna
          arrotondasse per conto proprio, il netto della testata e le voci del
          dettaglio potrebbero divergere di un centesimo — che è esattamente il
          difetto che D-066 chiude, riprodotto un livello più in basso.
        */}
        {mostrato && mostrabile ? (
          <>
            <SezioneRisultato risultato={mostrabile} />
            <SezioneDettaglio risultato={mostrabile} />
          </>
        ) : null}
      </div>
    </div>
  )
}
