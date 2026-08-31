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
import { VoceAssunzione } from '../_components/assunzioni'
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

        <div className="mt-8 rounded-sezione border border-bordo-decorativo bg-carta p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-inchiostro">
            {t('nonCopre.percheTitolo')}
          </h2>
          <p className="mt-2 leading-relaxed text-inchiostro-tenue">{t('nonCopre.percheTesto')}</p>
        </div>
      </main>
    </div>
  )
}
