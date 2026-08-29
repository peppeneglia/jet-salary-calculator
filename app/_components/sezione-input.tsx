'use client'

import { useId, useRef, useState } from 'react'
import type { Mensilita, TipoContratto } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import type { Errore, RichiestaCalcolo } from '../_lib/api'
import type { ComuneSelezionabile } from '../_lib/comuni'
import { messaggioErrore } from '../_lib/errori'
import { etichettaContratto } from '../_lib/testi'
import { leggiRal, validaComune } from '../_lib/validazione'
import { Avviso } from './avviso'
import { SceltaComune } from './scelta-comune'
import { Sezione } from './sezione'

const TIPI: readonly TipoContratto[] = ['indeterminato', 'determinato', 'apprendistato']
const MENSILITA: readonly Mensilita[] = [12, 13, 14]

/**
 * L'involucro di un campo: etichetta, marcatore facoltativo, controllo.
 *
 * ⚠️ **Due markup e non uno, perché sono due cose diverse.**
 *
 * Con `htmlFor` c'è un controllo solo, e l'elemento giusto è `<label>`.
 *
 * Senza, il campo è un **gruppo di radio** — contratto, mensilità — e
 * `<label>` era sbagliato: un `<label>` senza `for` e senza controllo dentro
 * è una label orfana, che non etichetta niente. Reggeva soltanto perché il
 * `role="radiogroup"` più in basso portava un `aria-label` con lo stesso
 * testo: l'etichetta visibile e quella accessibile erano due stringhe separate
 * che si somigliavano per abitudine, non per costruzione.
 *
 * `<fieldset>` più `<legend>` è il markup che l'HTML ha per questo, e non
 * richiede ARIA: il gruppo si annuncia da sé, e l'etichetta annunciata **è**
 * quella che si legge. Da qui la sparizione di `role="radiogroup"` e del suo
 * `aria-label` in `Segmenti`.
 */
function Campo({
  etichetta,
  htmlFor,
  idEtichetta,
  marcatore,
  children,
}: {
  etichetta: string
  htmlFor?: string
  /** Serve quando l'etichetta entra in un `aria-labelledby` composto. */
  idEtichetta?: string
  /** Chip accanto all'etichetta: «facoltativo», «esempio da modificare». */
  marcatore?: string
  children: React.ReactNode
}) {
  const testo = (
    <>
      {etichetta}
      {marcatore ? (
        <span className="rounded-voce border border-bordo-decorativo bg-fondo px-2 py-0.5 text-xs font-normal text-inchiostro-tenue">
          {marcatore}
        </span>
      ) : null}
    </>
  )
  const classi = 'flex flex-wrap items-baseline gap-2 text-sm font-medium text-inchiostro'

  if (htmlFor === undefined) {
    return (
      <fieldset className="min-w-0">
        <legend className={classi}>{testo}</legend>
        <div className="mt-2">{children}</div>
      </fieldset>
    )
  }

  return (
    <div>
      <label id={idEtichetta} htmlFor={htmlFor} className={classi}>
        {testo}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

/**
 * Controllo a segmenti: un gruppo di radio, non un `select`.
 *
 * Le opzioni sono poche e vanno viste tutte insieme — vale per il tipo di
 * contratto, dove la differenza fra i tre casi è il motivo per cui il campo
 * esiste, e vale per le mensilità.
 */
function Segmenti<T extends string | number>({
  nome,
  opzioni,
  valore,
  etichettaDi,
  onCambia,
}: {
  /**
   * L'attributo `name` dei radio. **Una chiave stabile, non l'etichetta
   * tradotta**: prima era il testo visibile, e cambiava con la lingua.
   */
  nome: string
  opzioni: readonly T[]
  valore: T
  etichettaDi: (o: T) => string
  onCambia: (o: T) => void
}) {
  return (
    /* Niente `role="radiogroup"`: il gruppo è il `<fieldset>` di `Campo`. */
    <div className="flex gap-2">
      {opzioni.map((o) => {
        const scelto = o === valore
        return (
          /*
            ⚠️ **`fuoco-dentro` sulla label, `fuoco-delegato` sull'input.**
            L'input è `sr-only`, cioè un rettangolo di 1px fuori schermo:
            l'anello di fuoco ci finiva sopra, e sul segmento visibile non
            arrivava niente. Chi naviga da tastiera non aveva modo di sapere
            dove fosse — su quattro gruppi di controlli della pagina.

            Il bordo è `bordo-controllo` (D-047): con `bordo-decorativo` il
            segmento non selezionato stava a 1,24:1 contro la carta, cioè non
            si vedeva che fosse un controllo.

            `min-h-11` sono i 44px delle linee guida touch; `py-2.5` ne dava 38.
          */
          <label
            key={String(o)}
            className={`fuoco-dentro flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-voce border px-3 py-2.5 text-center text-sm transition-colors active:scale-[0.98] ${
              scelto
                ? 'border-inchiostro bg-inchiostro font-medium text-carta'
                : 'border-bordo-controllo bg-carta text-inchiostro-tenue hover:border-bordo-controllo-forte hover:text-inchiostro'
            }`}
          >
            <input
              type="radio"
              name={nome}
              value={String(o)}
              checked={scelto}
              onChange={() => onCambia(o)}
              className="fuoco-delegato sr-only"
            />
            {etichettaDi(o)}
          </label>
        )
      })}
    </div>
  )
}

export function SezioneInput({
  comuni,
  iniziale,
  inCorso,
  onCalcola,
}: {
  comuni: readonly ComuneSelezionabile[]
  /** Il caso di partenza, deciso da chi orchestra: qui non si duplica un default. */
  iniziale: RichiestaCalcolo
  inCorso: boolean
  onCalcola: (richiesta: RichiestaCalcolo) => void
}) {
  const { t, lingua } = useTraduzione()

  const idRal = useId()
  const idComune = useId()
  const idErroreRal = `${idRal}-errore`
  const idAiutoRal = `${idRal}-aiuto`
  const idErroreComune = `${idComune}-errore`
  const idAiutoComune = `${idComune}-aiuto`
  const idEtichettaRal = `${idRal}-etichetta`
  const idUnitaRal = `${idRal}-unita`

  const campoRal = useRef<HTMLInputElement>(null)
  const campoComune = useRef<HTMLInputElement>(null)

  const [ral, setRal] = useState(String(iniziale.ral))
  const [codiceCatastale, setCodiceCatastale] = useState(iniziale.codiceCatastale)
  const [tipoContratto, setTipoContratto] = useState<TipoContratto>(iniziale.tipoContratto)
  /*
    Nessun ripiego: `iniziale` porta sempre il campo (D-052), e il valore da cui
    si parte lo decide `MENSILITA_INIZIALE` in `_lib/calcolo.ts`. Un `?? 12`
    qui sarebbe la terza sede dello stesso numero.
  */
  const [mensilita, setMensilita] = useState<Mensilita>(iniziale.mensilita)

  /**
   * Gli errori del modulo, per campo — D-043.
   *
   * ⚠️ **La validazione nativa del browser è spenta** (`noValidate`), e il campo
   * RAL è `type="text"` e non `type="number"`. Due ragioni, e nessuna delle due
   * è estetica: le bolle del browser stanno fuori dalla nostra grafica e
   * parlano la lingua del sistema operativo, non quella scelta in fondo alla
   * pagina; e `type="number"` **rifiuta le lettere prima ancora che arrivino**,
   * il che sembra un vantaggio ma rende impossibile spiegare cosa scrivere a
   * chi ha incollato un valore con dentro un simbolo. Un campo che non accetta
   * un errore non può nemmeno correggerlo.
   */
  const [errori, setErrori] = useState<{ ral?: Errore; comune?: Errore }>({})

  /**
   * ⚠️ Conseguenza di D-036, da gestire in pagina.
   *
   * Il campo si apre con una RAL che l'utente non ha inserito. Finché non la
   * tocca, va detto che è un esempio: senza, qualcuno legge un netto che non
   * ha chiesto e lo prende per proprio.
   */
  const ralIntatta = ral === String(iniziale.ral)

  /** Il comune scelto, per marcarlo **prima** che si prema il bottone (D-037). */
  const comuneScelto = comuni.find((c) => c.codiceCatastale === codiceCatastale)

  const invia = (e: React.FormEvent) => {
    e.preventDefault()

    const lettura = leggiRal(ral, lingua)
    const erroreComune = validaComune(codiceCatastale)

    if (!lettura.ok || erroreComune !== undefined) {
      setErrori({
        ral: lettura.ok ? undefined : lettura.errore,
        comune: erroreComune,
      })
      // Il fuoco va sul primo campo da correggere: chi naviga da tastiera non
      // deve cercare dove sia il problema.
      if (!lettura.ok) campoRal.current?.focus()
      else campoComune.current?.focus()
      return
    }

    setErrori({})
    onCalcola({
      ral: lettura.valore,
      codiceCatastale,
      tipoContratto,
      mensilita,
      lingua,
    })
  }

  return (
    <Sezione numero="1" titolo={t('input.titolo')} occhiello={t('input.occhiello')}>
      {/*
        `noValidate`: la validazione è nostra, e deve restare nostra. Vedi la
        nota su `errori`.
      */}
      <form onSubmit={invia} noValidate className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Campo
            etichetta={t('input.ralEtichetta')}
            htmlFor={idRal}
            idEtichetta={idEtichettaRal}
            marcatore={ralIntatta ? t('input.ralMarcatore') : undefined}
          >
            {/*
              ⚠️ **L'anello di fuoco sta sulla cornice, non sull'input.**

              L'input è largo quanto il campo meno il simbolo €, che gli sta
              accanto come fratello. Con l'anello disegnato sull'input e
              `outline-offset: 2px`, il bordo verde tagliava dentro il simbolo
              di valuta: si leggeva come un difetto di allineamento, ed era
              invece la geometria dell'anello.

              `outline-none` non bastava a spegnerlo: le utility di Tailwind
              stanno in `@layer utilities` e la regola `:focus-visible` globale
              è senza layer, quindi vince. Serve `fuoco-delegato`, che è quella
              regola scritta con la stessa forza.

              ⚠️ **Il bordo passa da 1,24:1 a 3,29:1, e al fuoco a 6,56**
              (D-047). Prima andava da `bordo` a `bordo-forte`, cioè da 1,24 a
              1,49: una transizione che nessun occhio distingue, su un campo che
              già da fermo non si vedeva.
            */}
            <div
              className={`fuoco-dentro flex items-center rounded-voce border bg-carta transition-colors ${
                errori.ral
                  ? 'border-avviso-bordo'
                  : 'border-bordo-controllo hover:border-bordo-controllo-forte focus-within:border-bordo-controllo-forte'
              }`}
            >
              <input
                ref={campoRal}
                id={idRal}
                name="ral"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={errori.ral ? true : undefined}
                aria-describedby={errori.ral ? idErroreRal : idAiutoRal}
                /*
                  ⚠️ **L'unità entra nel nome accessibile del campo.** Il
                  simbolo € era `aria-hidden` e stava **dopo** l'input: chi usa
                  un lettore di schermo sentiva *Retribuzione annua lorda* e non
                  sapeva in che unità scrivere — su un campo dove la differenza
                  fra euro e migliaia di euro è tutto il risultato.

                  `aria-labelledby` che punta a etichetta **e** simbolo compone
                  il nome dai due pezzi che già esistono in pagina: nessuna
                  stringa nuova da tradurre, e niente `aria-label` che
                  sovrascriverebbe l'etichetta visibile con una copia a parte
                  destinata a divergere.
                */
                aria-labelledby={`${idEtichettaRal} ${idUnitaRal}`}
                value={ral}
                onChange={(e) => {
                  setRal(e.target.value)
                  // L'errore sparisce appena si mette mano al campo: tenerlo
                  // finché non si ripreme il bottone farebbe leggere un
                  // rimprovero su un valore già corretto.
                  if (errori.ral) setErrori((p) => ({ ...p, ral: undefined }))
                }}
                /* `text-base` come minimo: sotto i 16px iOS ingrandisce la
                   pagina al fuoco del campo e non la rimpicciolisce più. */
                className="cifre fuoco-delegato min-h-11 w-full rounded-voce bg-transparent px-3 py-2.5 text-base outline-none sm:text-lg"
              />
              <span id={idUnitaRal} className="pr-3.5 pl-1 text-inchiostro-tenue">
                €
              </span>
            </div>

            {errori.ral ? (
              <Avviso id={idErroreRal} misura="compatta" vivo>
                {messaggioErrore(errori.ral, t, lingua)}
              </Avviso>
            ) : (
              <p id={idAiutoRal} className="mt-2 text-xs leading-relaxed text-inchiostro-tenue">
                {ralIntatta ? t('input.ralAiutoEsempio') : t('input.ralAiuto')}
              </p>
            )}
          </Campo>

          <Campo etichetta={t('input.comuneEtichetta')} htmlFor={idComune}>
            <SceltaComune
              id={idComune}
              campo={campoComune}
              comuni={comuni}
              valore={codiceCatastale}
              invalido={errori.comune !== undefined}
              descrittoDa={errori.comune ? idErroreComune : idAiutoComune}
              onCambia={(codice) => {
                setCodiceCatastale(codice)
                if (errori.comune) setErrori((p) => ({ ...p, comune: undefined }))
              }}
            />

            {errori.comune ? (
              <Avviso id={idErroreComune} misura="compatta" vivo>
                {messaggioErrore(errori.comune, t, lingua)}
              </Avviso>
            ) : /*
              D-037: i comuni non calcolabili si marcano **prima** della
              selezione, non solo nella risposta d'errore. Chi apre l'elenco
              vede il limite, e chi sceglie Trento o Bolzano ne legge la ragione
              senza dover premere niente.
            */
            comuneScelto && !comuneScelto.calcolabile && comuneScelto.ragione ? (
              <Avviso id={idAiutoComune} misura="compatta">
                <strong className="font-semibold">
                  {t('input.comuneNonCalcolabile', { comune: comuneScelto.nome })}
                </strong>{' '}
                {comuneScelto.ragione[lingua]}
              </Avviso>
            ) : (
              <p id={idAiutoComune} className="mt-2 text-xs leading-relaxed text-inchiostro-tenue">
                {t('input.comuneAiuto')}
              </p>
            )}
          </Campo>
        </div>

        <Campo etichetta={t('input.contrattoEtichetta')}>
          <Segmenti
            nome="tipoContratto"
            opzioni={TIPI}
            valore={tipoContratto}
            etichettaDi={(x) => etichettaContratto(x, t)}
            onCambia={setTipoContratto}
          />
          {/*
            D-011: un input che non fa nulla è peggio di un input assente. Questo
            campo cambia davvero un numero, ma in uno solo dei tre casi — e senza
            la nota che spiega perché, la cosa si legge come un difetto.
          */}
          <p className="mt-3 max-w-prose rounded-voce border border-bordo-decorativo bg-fondo px-3 py-2.5 text-xs leading-relaxed text-inchiostro-tenue">
            <strong className="font-medium text-inchiostro">
              {t('input.contrattoNotaTitolo')}
            </strong>{' '}
            {t('input.contrattoNotaCorpo')}{' '}
            <strong className="font-medium text-inchiostro">
              {t('input.contrattoNotaApprendistato')}
            </strong>
            {t('input.contrattoNotaCoda')}
          </p>
        </Campo>

        <Campo etichetta={t('input.mensilitaEtichetta')} marcatore={t('input.mensilitaMarcatore')}>
          <Segmenti
            nome="mensilita"
            opzioni={MENSILITA}
            valore={mensilita}
            etichettaDi={(m) => String(m)}
            onCambia={setMensilita}
          />
          <p className="mt-2 text-xs text-inchiostro-tenue">{t('input.mensilitaAiuto')}</p>
        </Campo>

        <button
          type="submit"
          disabled={inCorso}
          /*
            ⚠️ **Il bottone verde pieno non si vedeva** (D-047): #66C239
            contro la carta bianca vale 2,25:1, sotto il 3:1 che WCAG 1.4.11
            chiede al contorno di un controllo. `bordo-azione` è il rim che lo
            delimita — 5,25 sul tema chiaro. Sul tema scuro il token coincide
            col riempimento, perché lì il verde su carta scura vale già 7,68 e
            un rim aggiungerebbe una riga che non serve.
          */
          className="min-h-12 w-full rounded-voce border border-bordo-azione bg-verde px-6 py-3.5 text-base font-semibold text-su-verde transition-opacity hover:opacity-90 active:opacity-75 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {inCorso ? t('input.inCorso') : t('input.calcola')}
        </button>
      </form>
    </Sezione>
  )
}
