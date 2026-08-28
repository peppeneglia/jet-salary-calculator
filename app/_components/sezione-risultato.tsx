/**
 * Il numero, e le sue tre divisioni.
 *
 * Le tre mensilità si mostrano **insieme**, con in evidenza quella scelta.
 * Non è una scelta estetica: mostrandole tutte e tre si rende visibile che 12,
 * 13 e 14 sono viste della stessa grandezza e non scenari alternativi (D-022).
 * È la trappola risolta per via di interfaccia invece che con una nota — e
 * infatti la nota, sotto, si limita a confermare quello che si vede.
 *
 * Nessun numero è calcolato qui. `nettoMensile` porta già tutte e tre le
 * divisioni: il motore le emette sempre, proprio perché la pagina possa
 * mostrarle insieme senza doverle derivare.
 */

import type { Mensilita, Risultato } from '../../core/types'
import { inEuro } from '../_lib/formato'
import { CONTRATTI } from '../_lib/testi'
import { BloccoAssunzioni } from './assunzioni'
import { Sezione } from './sezione'

const DIVISIONI: readonly Mensilita[] = [12, 13, 14]

export function SezioneRisultato({ risultato }: { risultato: Risultato }) {
  const { enti, input } = risultato

  return (
    <Sezione
      numero="2"
      titolo="Il risultato"
      occhiello={`${CONTRATTI[input.tipoContratto]}, ${enti.comunale.nome}, anno ${risultato.annoImposta}.`}
    >
      <div className="space-y-6">
        <div className="rounded-blocco border border-verde-bordo bg-verde-velo px-6 py-7 text-center">
          <p className="text-sm font-medium text-inchiostro-tenue">Netto annuo</p>
          <p className="cifre mt-1 text-4xl font-semibold tracking-tight text-verde-scuro sm:text-5xl">
            {inEuro(risultato.nettoAnnuo)}
          </p>
          <p className="cifre mt-2 text-sm text-inchiostro-tenue">
            da una RAL di {inEuro(input.ral)}
          </p>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIVISIONI.map((m) => {
              const scelta = m === risultato.mensilita
              return (
                <div
                  key={m}
                  aria-current={scelta ? 'true' : undefined}
                  className={`rounded-blocco border px-4 py-4 text-center ${
                    scelta
                      ? 'border-verde-bordo bg-verde-velo'
                      : 'border-bordo bg-carta'
                  }`}
                >
                  <p className="text-xs font-medium text-inchiostro-tenue">
                    su {m} mensilità
                    {scelta ? <span className="sr-only"> — la mensilità selezionata</span> : null}
                  </p>
                  <p
                    className={`cifre mt-1 font-semibold tracking-tight ${
                      scelta ? 'text-2xl text-verde-scuro' : 'text-xl text-inchiostro-tenue'
                    }`}
                  >
                    {inEuro(risultato.nettoMensile[m])}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-inchiostro-tenue">
            <strong className="font-medium text-inchiostro">
              È sempre lo stesso stipendio, diviso in modi diversi.
            </strong>{' '}
            Il totale dell’anno non cambia: cambia quanto ti arriva ogni volta. Chi ha quattordici
            mensilità non guadagna meno di chi ne ha dodici.
          </p>
        </div>

        {/*
          Alcune assunzioni non possono stare nel blocco in fondo: S-002 va
          accanto al numero, quando la RAL supera il massimale, perché lì è
          l'ipotesi meno probabile. È il motore a decidere quali si applicano,
          non questa pagina.
        */}
        <BloccoAssunzioni
          assunzioni={risultato.assunzioni}
          collocazione="accanto-al-numero"
          titolo="Cosa vuol dire esattamente questa cifra"
          occhiello="Come va letta questa cifra, per il calcolo che hai appena fatto."
        />
      </div>
    </Sezione>
  )
}
