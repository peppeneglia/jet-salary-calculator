/**
 * La pagina.
 *
 * È un server component, e resta tale. Ma dal 29/08 il catalogo non passa più
 * di qui (D-058): nel documento va un comune solo, quello da cui si
 * parte, e i 7.897 li chiede il campo di scelta alla prima apertura. La lista
 * pesava 83 KiB compressi ed era il 78% del trasferimento, pagato da tutti e
 * usato da pochi.
 *
 * Quello che attraversa il confine non cambia — nome, provincia, codice
 * catastale e, per chi non è calcolabile, la ragione. Aliquote, scaglioni e
 * citazioni degli enti restano server-side, ed è la ragione per cui il
 * progetto ha scelto Next (D-004).
 *
 * ⚠️ **Qui non si calcola più niente, e D-036 va emendata.** La pagina rendeva
 * server-side il caso d'esempio — RAL 30.000 a Milano — dalla stessa funzione
 * che sta dietro `/api/calcola`. Ora RAL e comune partono vuoti con un
 * segnaposto: non c'è un caso da precalcolare, e tenerne uno significherebbe
 * avere in pagina il netto di qualcun altro pronto a comparire al primo click.
 * La proprietà *una funzione, due chiamanti* non si perde — resta vera fra
 * l'handler e i test — semplicemente questa pagina non è più il secondo.
 *
 * Quello che attraversa il confine si è ridotto ancora: non più un comune
 * intero, ma i soli codici delle città da suggerire.
 */

import { Calcolatore } from './_components/calcolatore'
import { traduzione } from './_i18n/server'
import { MENSILITA_INIZIALE } from './_lib/calcolo'
import { codiciCittaPrincipali } from './_lib/comuni'

export default async function Home() {
  const { t } = await traduzione()

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {t('home.titolo')}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">{t('home.occhiello')}</p>
      </div>

      <main>
        <Calcolatore
          codiciSuggeriti={codiciCittaPrincipali()}
          contrattoIniziale="indeterminato"
          mensilitaIniziale={MENSILITA_INIZIALE}
        />
      </main>
    </div>
  )
}
