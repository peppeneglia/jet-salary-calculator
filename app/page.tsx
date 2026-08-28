/**
 * La pagina.
 *
 * È un server component, e resta tale: il catalogo dei comuni si legge qui, e
 * al client attraversano il confine soltanto nome, provincia, codice catastale
 * e — per i comuni non calcolabili — la ragione. Aliquote, scaglioni e
 * citazioni degli enti restano server-side, ed è la ragione per cui il
 * progetto ha scelto Next (D-004).
 *
 * Il caso di partenza è calcolato **qui**, dalla stessa funzione che sta
 * dietro `/api/calcola` (D-036): una funzione, due chiamanti.
 */

import { Calcolatore } from './_components/calcolatore'
import type { RichiestaCalcolo } from './_lib/api'
import { eseguiCalcolo } from './_lib/calcolo'
import { comuniSelezionabili } from './_lib/comuni'

export default function Home() {
  const comuni = comuniSelezionabili()

  /**
   * Il caso di partenza, derivato dal catalogo e non riscritto a mano: il
   * comune iniziale è il primo calcolabile, così l'arrivo del dataset MEF non
   * lascia qui un codice catastale orfano.
   *
   * ⚠️ La RAL è un **esempio**, e l'etichetta accanto al campo lo dice: è la
   * conseguenza da gestire di D-036, perché un netto che l'utente non ha
   * chiesto non deve poter essere scambiato per il proprio.
   */
  const iniziale: RichiestaCalcolo = {
    ral: 30_000,
    codiceCatastale: comuni.find((c) => c.calcolabile)?.codiceCatastale ?? '',
    tipoContratto: 'indeterminato',
    mensilita: 13,
  }

  const esito = eseguiCalcolo(iniziale)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          Dalla RAL al netto, voce per voce
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          Quanto resta davvero di uno stipendio lordo, e dove finisce tutto il resto: contributi,
          IRPEF, addizionali di Regione e Comune, e le somme che invece si aggiungono. Per ogni
          voce trovi la regola che la determina e la norma da cui viene il numero.
        </p>
      </div>

      <main>
        <Calcolatore
          comuni={comuni}
          iniziale={iniziale}
          risultatoIniziale={esito.stato === 'ok' ? esito.risultato : null}
          erroreIniziale={esito.stato === 'errore' ? esito.errore : null}
        />
      </main>
    </div>
  )
}
