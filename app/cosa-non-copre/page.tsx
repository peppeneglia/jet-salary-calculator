/**
 * «Cosa questo calcolatore non copre».
 *
 * D-008 chiede che i confini del modello siano **visibili in pagina**, con la
 * motivazione di ciascuno. Stanno qui, raggiungibili dal footer di ogni
 * schermata: non dipendono dall'aver premuto un bottone, che era il vincolo
 * che D-036 proteggeva.
 *
 * ⚠️ **Differenza da tenere ferma rispetto al blocco accanto al numero.** Là le
 * assunzioni arrivano dal risultato, e sono quelle che il **motore** ha
 * selezionato per quel calcolo (D-031): la pagina non può mostrarne una che il
 * motore non ha considerato. Qui il calcolo non c'è, quindi si mostra il
 * **catalogo intero** — e ogni voce condizionata porta scritto *quando* vale,
 * invece di lasciar credere che valga sempre. Sono due cose diverse e non
 * vanno confuse: l'una dice *cosa è stato assunto per te*, l'altra *cosa
 * questo strumento non fa, in generale*.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import type { CondizioneAssunzione } from '../../core/types'
import { assunzioni } from '../../data/assunzioni'
import { VoceAssunzione } from '../_components/assunzioni'
import { CONTRATTI } from '../_lib/testi'
import { inEuro } from '../_lib/formato'

export const metadata: Metadata = {
  title: 'Cosa questo calcolatore non copre — Jet Salary Calculator',
  description:
    'I confini dichiarati del calcolo: cosa resta fuori, perché, e da che parte si sposta il conto.',
}

/**
 * La condizione, in italiano.
 *
 * `data/` dice *quando* un'assunzione vale, come dato e non come funzione; qui
 * quel dato si legge senza eseguirlo. Le voci incondizionate non ricevono
 * etichetta: scrivere «vale sempre» su quasi tutte aggiungerebbe rumore.
 */
function quandoVale(condizione: CondizioneAssunzione): string | undefined {
  switch (condizione.tipo) {
    case 'sempre':
      return undefined
    case 'ral-supera':
      return `Riguarda solo chi ha una RAL sopra ${inEuro(condizione.soglia.valore)}.`
    case 'contratto-diverso-da':
      return `Riguarda chi non ha dichiarato un contratto di ${CONTRATTI[
        condizione.contratto
      ].toLowerCase()}.`
  }
}

export default function CosaNonCopre() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <Link
          href="/"
          className="rounded-voce text-sm font-medium text-inchiostro-tenue hover:text-inchiostro"
        >
          ← Torna al calcolatore
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          Cosa questo calcolatore non copre
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          Questo strumento parte dallo stipendio lordo annuo e arriva al netto. Alcune cose che
          cambiano la busta paga da quel numero non si possono ricavare: dipendono dalla tua
          famiglia, dal contratto che ti applicano, o da scelte che hai fatto tu.
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          Le trovi qui sotto, ognuna con l’effetto che avrebbe sul risultato se la includessimo.
        </p>
      </div>

      <main>
        <ul className="space-y-3">
          {assunzioni.map(({ assunzione, condizione }) => (
            <VoceAssunzione
              key={assunzione.id}
              assunzione={assunzione}
              quando={quandoVale(condizione)}
            />
          ))}
        </ul>

        <div className="mt-8 rounded-sezione border border-bordo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            Perché non le abbiamo nascoste
          </h2>
          <p className="mt-2 leading-relaxed text-inchiostro-tenue">
            Un calcolatore che tace i propri limiti dà un numero che sembra definitivo. Questo dice
            dove finisce: così puoi capire se la tua situazione rientra nel conto, e di quanto ti
            aspetti che il tuo caso se ne discosti.
          </p>
        </div>
      </main>
    </div>
  )
}
