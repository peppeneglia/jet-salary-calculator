'use client'

import { useId, useState } from 'react'
import type { Mensilita, TipoContratto } from '../../core/types'
import type { RichiestaCalcolo } from '../_lib/api'
import type { ComuneSelezionabile } from '../_lib/comuni'
import { CONTRATTI } from '../_lib/testi'
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
  const idRal = useId()
  const idComune = useId()

  const [ral, setRal] = useState(String(iniziale.ral))
  const [codiceCatastale, setCodiceCatastale] = useState(iniziale.codiceCatastale)
  const [tipoContratto, setTipoContratto] = useState<TipoContratto>(iniziale.tipoContratto)
  const [mensilita, setMensilita] = useState<Mensilita>(iniziale.mensilita ?? 13)

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
    onCalcola({ ral: Number(ral), codiceCatastale, tipoContratto, mensilita })
  }

  return (
    <Sezione
      numero="1"
      titolo="I tuoi dati"
      occhiello="Impiegato del settore privato, assunto per tutto l’anno."
    >
      <form onSubmit={invia} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Campo
            etichetta="Retribuzione annua lorda"
            htmlFor={idRal}
            marcatore={ralIntatta ? 'esempio da modificare' : undefined}
          >
            <div className="flex items-center rounded-voce border border-bordo bg-carta focus-within:border-bordo-forte">
              <input
                id={idRal}
                name="ral"
                type="number"
                inputMode="decimal"
                min={1}
                step={100}
                required
                value={ral}
                onChange={(e) => setRal(e.target.value)}
                className="cifre w-full rounded-voce bg-transparent px-3 py-2.5 text-lg outline-none"
              />
              <span aria-hidden className="pr-3 text-inchiostro-tenue">
                €
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-inchiostro-tenue">
              {ralIntatta
                ? 'Abbiamo messo una cifra di esempio per mostrarti come funziona. Sostituiscila con la tua: è quella scritta sul contratto, prima di ogni trattenuta.'
                : 'È lo stipendio annuo scritto sul contratto, prima di ogni trattenuta.'}
            </p>
          </Campo>

          <Campo etichetta="Comune in cui vivi" htmlFor={idComune}>
            <select
              id={idComune}
              name="codiceCatastale"
              required
              value={codiceCatastale}
              onChange={(e) => setCodiceCatastale(e.target.value)}
              className="w-full rounded-voce border border-bordo bg-carta px-3 py-2.5 text-lg outline-none focus:border-bordo-forte"
            >
              {comuni.map((c) => (
                <option key={c.codiceCatastale} value={c.codiceCatastale}>
                  {c.nome} ({c.provincia}){c.calcolabile ? '' : ' — calcolo non disponibile'}
                </option>
              ))}
            </select>

            {/*
              D-037: i comuni non calcolabili si marcano **prima** della
              selezione, non solo nella risposta d'errore. Chi apre l'elenco
              vede il limite, e chi sceglie Trento o Bolzano ne legge la ragione
              senza dover premere niente.
            */}
            {comuneScelto && !comuneScelto.calcolabile && comuneScelto.ragione ? (
              <p className="mt-2 rounded-voce border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                <strong className="font-semibold">
                  Per {comuneScelto.nome} non possiamo calcolare il netto.
                </strong>{' '}
                {comuneScelto.ragione}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-inchiostro-tenue">
                Serve per le addizionali di Regione e Comune. Conta dove avevi il domicilio fiscale
                al 1° gennaio. Per ora l’elenco contiene i comuni che abbiamo verificato uno per
                uno.
              </p>
            )}
          </Campo>
        </div>

        <Campo etichetta="Tipo di contratto">
          <Segmenti
            nome="Tipo di contratto"
            opzioni={TIPI}
            valore={tipoContratto}
            etichettaDi={(t) => CONTRATTI[t]}
            onCambia={setTipoContratto}
          />
          {/*
            D-011: un input che non fa nulla è peggio di un input assente. Questo
            campo cambia davvero un numero, ma in uno solo dei tre casi — e senza
            la nota che spiega perché, la cosa si legge come un difetto.
          */}
          <p className="mt-3 rounded-voce border border-bordo bg-fondo px-3 py-2.5 text-xs leading-relaxed text-inchiostro-tenue">
            <strong className="font-medium text-inchiostro">
              Determinato e indeterminato danno lo stesso netto.
            </strong>{' '}
            Non è una scorciatoia: sui contratti a termine c’è un contributo in più, ma lo paga
            l’azienda e non passa dalla tua busta paga.{' '}
            <strong className="font-medium text-inchiostro">L’apprendistato invece cambia</strong>:
            lì la legge riduce i contributi a carico tuo, e il netto sale davvero.
          </p>
        </Campo>

        <Campo etichetta="In quante mensilità" marcatore="facoltativo">
          <Segmenti
            nome="Mensilità"
            opzioni={MENSILITA}
            valore={mensilita}
            etichettaDi={(m) => String(m)}
            onCambia={setMensilita}
          />
          <p className="mt-2 text-xs text-inchiostro-tenue">
            Cambia in quante parti si divide lo stipendio, non quanto prendi in un anno.
          </p>
        </Campo>

        <button
          type="submit"
          disabled={inCorso}
          className="w-full rounded-voce bg-verde px-6 py-3.5 text-base font-semibold text-inchiostro transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {inCorso ? 'Calcolo in corso…' : 'Calcola il netto'}
        </button>
      </form>
    </Sezione>
  )
}
