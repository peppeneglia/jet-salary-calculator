/**
 * «Cosa questo calcolatore non copre».
 *
 * D-008 chiede che i confini del modello siano visibili in pagina, con la
 * motivazione di ciascuno. Stanno qui, raggiungibili dal footer di ogni
 * schermata: non dipendono dall'aver premuto un bottone, che era il vincolo
 * che D-036 proteggeva.
 *
 * ⚠️ Differenza da tenere ferma rispetto al blocco accanto al numero. Là le
 * assunzioni arrivano dal risultato, e sono quelle che il motore ha
 * selezionato per quel calcolo (D-031): la pagina non può mostrarne una che il
 * motore non ha considerato. Qui il calcolo non c'è, quindi si mostra il
 * catalogo intero — e ogni voce condizionata porta scritto *quando* vale,
 * invece di lasciar credere che valga sempre. Sono due cose diverse e non
 * vanno confuse: l'una dice *cosa è stato assunto per te*, l'altra *cosa
 * questo strumento non fa, in generale*.
 *
 * ⚠️ È la pagina che non passa dal motore, ed è la ragione per cui il testo
 * di un'assunzione resta multilingua fino al rendering (D-041). Se la lingua
 * si risolvesse dentro `calcolaNetto`, qui bisognerebbe risolverla una seconda
 * volta, in un secondo posto.
 */

import type { Metadata } from 'next'
import type { CondizioneAssunzione } from '../../core/types'
import { assunzioni } from '../../data/assunzioni'
import { Fonti } from '../_components/fonte'
import { traduzione } from '../_i18n/server'
import { formato } from '../_lib/formato'
import { etichettaContratto } from '../_lib/testi'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await traduzione()
  return {
    title: t('meta.titoloNonCopre'),
    description: t('meta.descrizioneNonCopre'),
  }
}

export default async function CosaNonCopre() {
  const { t, lingua } = await traduzione()
  const { inEuro } = formato(lingua)

  /**
   * La condizione, in parole.
   *
   * `data/` dice *quando* un'assunzione vale, come dato e non come funzione; qui
   * quel dato si legge senza eseguirlo. Le voci incondizionate non ricevono
   * etichetta: scrivere «vale sempre» su quasi tutte aggiungerebbe rumore.
   */
  const quandoVale = (condizione: CondizioneAssunzione): string | undefined => {
    switch (condizione.tipo) {
      case 'sempre':
        return undefined
      case 'ral-supera':
        return t('nonCopre.quandoRalSupera', { soglia: inEuro(condizione.soglia.valore) })
      case 'ral-sotto':
        return t('nonCopre.quandoRalSotto', { soglia: inEuro(condizione.soglia.valore) })
      case 'contratto-diverso-da':
        return t('nonCopre.quandoContrattoDiverso', {
          contratto: etichettaContratto(condizione.contratto, t).toLowerCase(),
        })
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-inchiostro sm:text-4xl">
          {t('nonCopre.titolo')}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {t('nonCopre.paragrafo1')}
        </p>
        <p className="mt-3 max-w-2xl leading-relaxed text-inchiostro-tenue">
          {t('nonCopre.paragrafo2')}
        </p>
      </div>

      {/*
        ⚠️ **Erano quindici riquadri, ora è un elenco puntato.**

        Ogni voce stava in una card con bordo, fondo proprio e in cima una
        pastiglia grigia con dentro *Non cambia la cifra* o *In questo caso
        prendi più di quanto calcoliamo*. Le pastiglie erano tre stringhe
        ripetute quindici volte: la cosa più visibile di ogni riquadro era anche
        quella che non distingueva un riquadro dall'altro, e chi scorreva la
        pagina leggeva tre etichette alternate invece di quindici limiti.

        E i riquadri promettevano una struttura che non c'era. Una card dice
        *qui dentro c'è un oggetto con delle parti*; dentro c'era un paragrafo.
        Quindici contenitori per quindici paragrafi sono quindici cornici da
        attraversare per leggere un testo che si sarebbe letto meglio di
        seguito.

        Ora è prosa con un elenco: il verso in cui il conto si sposta resta,
        ma **in coda alla frase** invece che sopra, dove pesa quanto pesa. La
        struttura di `data/assunzioni.ts` non cambia di un campo: cambia come si
        rende.
      */}
      <main>
        <ul className="max-w-2xl space-y-5">
          {assunzioni.map(({ assunzione, condizione }) => {
            const quando = quandoVale(condizione)
            const direzione =
              assunzione.direzione === 'nessuna'
                ? undefined
                : assunzione.direzione === 'netto-reale-piu-alto'
                  ? t('assunzioni.direzionePiuAlto')
                  : t('assunzioni.direzionePiuBasso')

            return (
              <li key={assunzione.id} className="flex gap-3 leading-relaxed">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-inchiostro-nota" />
                <div>
                  <p className="text-inchiostro-tenue">{assunzione.testo[lingua]}</p>

                  {/*
                    ⚠️ Condizione e verso in una riga sola sotto il testo, e
                    solo dove ci sono. *Non cambia la cifra* non si scrive: è
                    l'assenza di conseguenza, e dirla su otto voci su quindici
                    riempie l'elenco di righe che non aggiungono niente.
                  */}
                  {quando || direzione ? (
                    <p className="mt-1 text-sm text-inchiostro-nota">
                      {[quando, direzione].filter(Boolean).join(' ')}
                    </p>
                  ) : null}

                  {assunzione.fonte ? (
                    <div className="mt-2">
                      <Fonti fonti={[assunzione.fonte]} titolo={t('fonte.titolo')} accanto />
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-10 max-w-2xl border-t border-bordo-decorativo pt-6">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {t('nonCopre.percheTitolo')}
          </h2>
          <p className="mt-2 leading-relaxed text-inchiostro-tenue">{t('nonCopre.percheTesto')}</p>
        </div>
      </main>
    </div>
  )
}
