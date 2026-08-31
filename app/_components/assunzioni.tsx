'use client'

/**
 * Le assunzioni dichiarate, rese in pagina.
 *
 * È un vincolo del progetto, non un extra (D-008): quello che il calcolo
 * non copre si dice, con la motivazione di ciascuna voce. Dichiarare i confini
 * è di per sé un segnale di controllo del dominio.
 *
 * Il componente serve due posti diversi:
 *
 * - accanto al numero, con le assunzioni che il motore ha selezionato per
 *   quel calcolo (D-031): la pagina non può mostrarne una che il motore non ha
 *   considerato;
 * - nella pagina «Cosa questo calcolatore non copre», con il catalogo intero e
 *   la condizione di ciascuna scritta accanto.
 *
 * ⚠️ È qui, e in nessun altro posto, che il testo di un'assunzione sceglie la
 * propria lingua. Il catalogo porta entrambe (D-041) e il motore le lascia
 * intatte, proprio perché una delle due pagine non passa dal motore: con la
 * risoluzione a monte le strade sarebbero due, e la stessa voce potrebbe
 * leggersi diversa a seconda di dove compare.
 */

import type { Assunzione } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { Apribile } from './apribile'
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
      {/*
        ⚠️ **La sigla non è più in pagina.** Ogni voce si apriva con un chip
        che diceva `S-004`, `S-013`. È l'identificativo con cui la voce si
        ritrova nella pagina *Semplificazioni*: serve a chi lavora al progetto,
        e a chi legge il proprio netto non dice niente — anzi, occupa il posto
        più visibile della voce con l'unica informazione che non può usare.
        Peggio, un codice messo in evidenza si legge come se avesse un
        significato normativo, e non ne ha alcuno: è un numero d'ordine dei
        nostri appunti.

        L'`id` resta nel dato e resta il legame con *Semplificazioni* (D-039):
        cambia dove lo si legge, non che esista.

        Quello che resta è il segno, e conta quanto l'assunzione stessa: dire
        da che parte il conto si sposta la trasforma da lacuna in limite
        conosciuto.
      */}
      <span className="inline-block rounded-voce bg-fondo px-2 py-0.5 text-xs text-inchiostro-tenue select-none">
        {direzione}
      </span>

      {quando ? <p className="mt-2 text-xs font-medium text-inchiostro">{quando}</p> : null}

      <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
        {assunzione.testo[lingua]}
      </p>

      {/*
        ⚠️ *Fonte*, non *Riferimento*, e sotto ci stanno solo atti.

        Undici assunzioni citavano qui una `Fonte` che era questo stesso
        progetto — *Jet Salary Calculator — Semplificazioni* — accanto a
        citazioni come *L. 30/12/2024 n. 207, art. 1 c. 6*. Una norma la può
        verificare chiunque, una nostra pagina di appunti no: metterle nella
        stessa casella dice che pesano uguale. Quelle citazioni sono state
        tolte dal dato, non nascoste qui; le voci che una norma non ce l'hanno
        non mostrano più alcuna riga. Vedi la nota in `data/assunzioni.ts`.
      */}
      {assunzione.fonte ? (
        <div className="mt-3">
          <Fonti fonti={[assunzione.fonte]} titolo={t('fonte.titolo')} />
        </div>
      ) : null}
    </li>
  )
}

/**
 * Il blocco accanto al numero, richiudibile.
 *
 * ⚠️ **Chiuso di partenza, e la scelta va difesa perché tocca un vincolo del
 * progetto.** *Le semplificazioni sono un blocco visibile in pagina* è un
 * requisito, non una preferenza: quello che il calcolo non copre si dice.
 *
 * Ma il vincolo riguarda **la pagina che le elenca** — `/cosa-non-copre`, che
 * usa `VoceAssunzione` direttamente e resta un elenco aperto e per intero.
 * Qui siamo accanto al numero, dove le voci sono due o tre e arrivano subito
 * dopo la cifra che qualcuno stava aspettando: srotolate, sono due paragrafi
 * di cautele fra il netto e la sua scomposizione, letti da nessuno proprio
 * perché nessuno li ha chiesti in quel momento.
 *
 * `<details>` nativo e non un accordion costruito a mano: si apre senza
 * JavaScript, è annunciato da sé come gruppo espandibile, e il testo dentro
 * resta trovabile dalla ricerca del browser. La domanda in chiaro sul
 * riassunto è ciò che rende la chiusura onesta — dice cosa c'è sotto, non lo
 * nasconde.
 */
export function BloccoAssunzioni({
  assunzioni,
  collocazione,
  titolo,
  occhiello,
  extra,
}: {
  assunzioni: readonly Assunzione[]
  collocazione: Assunzione['collocazione']
  titolo: string
  occhiello?: string
  /**
   * Voci che non sono assunzioni ma rispondono alla stessa domanda.
   *
   * ⚠️ Ci finisce la nota sul tipo di contratto, che stava in fondo al blocco
   * dei contributi in sezione 3 e lì era un non sequitur: chi scorre i
   * contributi non si sta chiedendo niente sul contratto. La domanda *il tipo
   * di contratto cambia quello che prendo?* è invece esattamente della specie
   * che questo blocco raccoglie — *che cosa vuol dire esattamente questa
   * cifra* — e sta bene accanto alle altre. D-011 resta soddisfatta: il campo
   * non resta senza spiegazione, cambia dove la spiegazione vive.
   */
  extra?: React.ReactNode
}) {
  const voci = assunzioni.filter((a) => a.collocazione === collocazione)
  if (voci.length === 0 && extra === undefined) return null

  return (
    <Apribile titolo={titolo}>
      {occhiello ? (
        <p className="text-sm leading-relaxed text-inchiostro-tenue">{occhiello}</p>
      ) : null}
      <ul className="mt-3 space-y-3">
        {voci.map((a) => (
          <VoceAssunzione key={a.id} assunzione={a} />
        ))}
        {extra}
      </ul>
    </Apribile>
  )
}
