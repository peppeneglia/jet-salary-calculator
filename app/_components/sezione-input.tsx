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
import { Sezione } from './sezione'

const TIPI: readonly TipoContratto[] = ['indeterminato', 'determinato', 'apprendistato']
const MENSILITA: readonly Mensilita[] = [12, 13, 14]

function Campo({
  etichetta,
  htmlFor,
  marcatore,
  children,
}: {
  etichetta: string
  htmlFor?: string
  /** Chip accanto all'etichetta: «facoltativo», «esempio da modificare». */
  marcatore?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex flex-wrap items-baseline gap-2 text-sm font-medium text-inchiostro"
      >
        {etichetta}
        {marcatore ? (
          <span className="rounded-voce border border-bordo bg-fondo px-2 py-0.5 text-xs font-normal text-inchiostro-tenue">
            {marcatore}
          </span>
        ) : null}
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
  nome: string
  opzioni: readonly T[]
  valore: T
  etichettaDi: (o: T) => string
  onCambia: (o: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={nome} className="flex gap-2">
      {opzioni.map((o) => {
        const scelto = o === valore
        return (
          <label
            key={String(o)}
            className={`flex-1 cursor-pointer rounded-voce border px-3 py-2.5 text-center text-sm transition-colors ${
              scelto
                ? 'border-inchiostro bg-inchiostro font-medium text-carta'
                : 'border-bordo bg-carta text-inchiostro-tenue hover:border-bordo-forte'
            }`}
          >
            <input
              type="radio"
              name={nome}
              value={String(o)}
              checked={scelto}
              onChange={() => onCambia(o)}
              className="sr-only"
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

  const campoRal = useRef<HTMLInputElement>(null)
  const campoComune = useRef<HTMLSelectElement>(null)

  const [ral, setRal] = useState(String(iniziale.ral))
  const [codiceCatastale, setCodiceCatastale] = useState(iniziale.codiceCatastale)
  const [tipoContratto, setTipoContratto] = useState<TipoContratto>(iniziale.tipoContratto)
  const [mensilita, setMensilita] = useState<Mensilita>(iniziale.mensilita ?? 13)

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
            marcatore={ralIntatta ? t('input.ralMarcatore') : undefined}
          >
            <div
              className={`flex items-center rounded-voce border bg-carta ${
                errori.ral ? 'border-avviso-bordo' : 'border-bordo focus-within:border-bordo-forte'
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
                value={ral}
                onChange={(e) => {
                  setRal(e.target.value)
                  // L'errore sparisce appena si mette mano al campo: tenerlo
                  // finché non si ripreme il bottone farebbe leggere un
                  // rimprovero su un valore già corretto.
                  if (errori.ral) setErrori((p) => ({ ...p, ral: undefined }))
                }}
                className="cifre w-full rounded-voce bg-transparent px-3 py-2.5 text-lg outline-none"
              />
              <span aria-hidden className="pr-3 text-inchiostro-tenue">
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
            <select
              ref={campoComune}
              id={idComune}
              name="codiceCatastale"
              aria-invalid={errori.comune ? true : undefined}
              aria-describedby={errori.comune ? idErroreComune : idAiutoComune}
              value={codiceCatastale}
              onChange={(e) => {
                setCodiceCatastale(e.target.value)
                if (errori.comune) setErrori((p) => ({ ...p, comune: undefined }))
              }}
              className={`w-full rounded-voce border bg-carta px-3 py-2.5 text-lg outline-none ${
                errori.comune ? 'border-avviso-bordo' : 'border-bordo focus:border-bordo-forte'
              }`}
            >
              {comuni.map((c) => (
                <option key={c.codiceCatastale} value={c.codiceCatastale}>
                  {c.nome} ({c.provincia})
                  {c.calcolabile ? '' : t('input.comuneNonDisponibile')}
                </option>
              ))}
            </select>

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
            nome={t('input.contrattoEtichetta')}
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
          <p className="mt-3 rounded-voce border border-bordo bg-fondo px-3 py-2.5 text-xs leading-relaxed text-inchiostro-tenue">
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
            nome={t('input.mensilitaEtichetta')}
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
          className="w-full rounded-voce bg-verde px-6 py-3.5 text-base font-semibold text-su-verde transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {inCorso ? t('input.inCorso') : t('input.calcola')}
        </button>
      </form>
    </Sezione>
  )
}
