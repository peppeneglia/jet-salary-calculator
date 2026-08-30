'use client'

/**
 * I due selettori in fondo alla pagina: la lingua e il tema.
 *
 * Stanno nel footer e non nella testata perché non sono azioni del compito:
 * chi arriva vuole calcolare il proprio netto, non scegliere un colore. Sono
 * dove si va a cercarli quando servono.
 *
 * ⚠️ Due preferenze, due meccanismi diversi, e la differenza è il motivo per
 * cui non condividono il codice.
 *
 * Il tema si applica subito, senza rete: cambia un attributo sull'html, e
 * il CSS fa il resto. Nessun contenuto dipende dal tema.
 *
 * La lingua no. Le pagine sono renderizzate sul server, e cambiare lingua
 * significa rifarle: si scrive il cookie e si chiede a Next di rigenerare
 * l'albero. Il `Risultato` già in mano al client viene ricalcolato da sé —
 * porta dentro la prosa della traccia, e quella la scrive il motore (D-041).
 *
 * In entrambi i casi il cookie si scrive prima: chi ricarica la pagina
 * subito dopo la ritrova come l'ha lasciata.
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CodiceLingua } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import {
  COOKIE_LINGUA,
  COOKIE_TEMA,
  LINGUE,
  TEMI,
  attributoTema,
  ricorda,
  type Tema,
} from '../_lib/preferenze'

/**
 * I nomi delle lingue non si traducono: una lingua si chiama come si chiama
 * nella propria lingua. Chi cerca l'inglese cerca *English*, non *Inglese* —
 * e viceversa, chi non capisce l'inglese non troverebbe mai *Italian*.
 */
const NOME_LINGUA: Readonly<Record<CodiceLingua, string>> = {
  it: 'Italiano',
  en: 'English',
}

/**
 * Un gruppo di scelte sulla fascia verde.
 *
 * Radio veri e `sr-only`, non `div` cliccabili: le frecce funzionano e il
 * gruppo si annuncia come tale. È la stessa forma dei segmenti del modulo, con
 * i colori della cornice — che sul verde non cambiano con il tema, perché la
 * fascia non cambia.
 *
 * ⚠️ Qui c'era scritto che il fuoco si vedeva, e non era vero. L'input
 * è `sr-only`, cioè un rettangolo di 1px fuori schermo, e la regola globale
 * `:focus-visible` gli disegnava l'anello sopra: sul segmento visibile non
 * arrivava niente. La forma era giusta — radio veri, frecce funzionanti — ma
 * chi navigava da tastiera non poteva sapere dove fosse. Il commento
 * descriveva l'intenzione e non il risultato, che è il modo in cui un difetto
 * così sopravvive a una rilettura.
 *
 * Ora l'anello lo porta la label, con `fuoco-dentro`; `fuoco-delegato`
 * spegne quello dell'input. Sul verde l'anello è `su-verde` e non
 * `verde-testo`, che lì sparirebbe nel fondo.
 */
function Gruppo<T extends string>({
  nome,
  opzioni,
  valore,
  etichettaDi,
  onCambia,
}: {
  nome: string
  opzioni: readonly T[]
  valore: T
  etichettaDi: (o: T) => string
  onCambia: (o: T) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span id={`etichetta-${nome}`} className="text-xs font-medium text-su-verde-tenue">
        {nome}
      </span>
      {/*
        Il bordo è `bordo-controllo-contro` e non `bordo-controllo`: qui il
        gruppo poggia sulla cornice verde, e un grigio neutro su #66C239 non
        arriva a 3:1 in nessuna variante. Il token dedicato vale 4,08
        (D-047). Prima non c'era bordo affatto: il gruppo si distingueva solo
        per un velo al 10%, che è sotto qualunque soglia.
      */}
      <div
        role="radiogroup"
        aria-labelledby={`etichetta-${nome}`}
        className="flex gap-1 rounded-voce border border-bordo-controllo-contro bg-su-verde/10 p-0.5"
      >
        {opzioni.map((o) => {
          const scelto = o === valore
          return (
            <label
              key={o}
              className={`fuoco-dentro flex min-h-9 cursor-pointer items-center rounded-voce px-3 py-1.5 text-xs transition-colors active:scale-[0.97] ${
                scelto
                  ? 'bg-su-verde font-medium text-su-verde-contro'
                  : 'text-su-verde-tenue hover:bg-su-verde/10 hover:text-su-verde'
              }`}
            >
              <input
                type="radio"
                name={nome}
                value={o}
                checked={scelto}
                onChange={() => onCambia(o)}
                className="fuoco-delegato sr-only"
              />
              {etichettaDi(o)}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function Preferenze({ temaIniziale }: { temaIniziale: Tema }) {
  const { t, lingua } = useTraduzione()
  const router = useRouter()

  /**
   * Il tema vive anche qui, non solo nel cookie: l'attributo sull'html lo
   * scrive il server, e senza uno stato locale il bottone premuto resterebbe
   * indietro fino al prossimo caricamento.
   */
  const [tema, setTema] = useState<Tema>(temaIniziale)
  const [linguaScelta, setLinguaScelta] = useState<CodiceLingua>(lingua)

  const cambiaTema = (nuovo: Tema) => {
    setTema(nuovo)
    ricorda(COOKIE_TEMA, nuovo)

    // L'assenza dell'attributo è lo stato «come il sistema»: si toglie, non
    // si scrive un terzo valore che il CSS dovrebbe poi interpretare.
    const attributo = attributoTema(nuovo)
    if (attributo === undefined) delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = attributo
  }

  const cambiaLingua = (nuova: CodiceLingua) => {
    setLinguaScelta(nuova)
    ricorda(COOKIE_LINGUA, nuova)
    // Le pagine sono rese sul server: la lingua nuova arriva da lì.
    router.refresh()
  }

  const nomeTema = (x: Tema): string =>
    x === 'chiaro'
      ? t('preferenze.temaChiaro')
      : x === 'scuro'
        ? t('preferenze.temaScuro')
        : t('preferenze.temaSistema')

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Gruppo
        nome={t('preferenze.lingua')}
        opzioni={LINGUE}
        valore={linguaScelta}
        etichettaDi={(l) => NOME_LINGUA[l]}
        onCambia={cambiaLingua}
      />
      <Gruppo
        nome={t('preferenze.tema')}
        opzioni={TEMI}
        valore={tema}
        etichettaDi={nomeTema}
        onCambia={cambiaTema}
      />
    </div>
  )
}
