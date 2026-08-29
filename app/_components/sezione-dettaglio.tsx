'use client'

/**
 * «Dove vanno i tuoi soldi» — D-034.
 *
 * Il titolo non è decorativo e non poteva essere «trattenute»: la traccia
 * ammette voci di **segno positivo**, e un elenco di trattenute che ne
 * contiene una è incoerente. *Dove vanno* regge entrambi i segni, perché per
 * una voce che aggiunge la risposta è *restano a te*.
 *
 * E si salda con le quattro nature: non sono quattro categorie contabili, sono
 * **quattro destinazioni** — la pensione futura, lo Stato, Regione e Comune, e
 * il lavoratore stesso.
 *
 * Qui non si somma nulla. Non ci sono totali di gruppo, e non per dimenticanza:
 * il motore non li emette, e ricavarli in JSX creerebbe una seconda porta
 * d'uscita dalla traccia — cioè la doppia verità che D-003 esiste per
 * impedire. Il totale che conta è uno, ed è il netto della sezione sopra.
 */

import type { EnteRisolto, Risultato } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { disponiInBlocchi } from '../_lib/blocchi'
import { etichettaNatura } from '../_lib/testi'
import { Fonti } from './fonte'
import { RigaPasso } from './passo'
import { Sezione } from './sezione'

/**
 * Come l'ente è stato risolto.
 *
 * Le tre varianti non sono un dettaglio di import: sono tre cose diverse che
 * la pagina deve saper dire. In particolare `ereditato` — l'ente che non ha
 * deliberato e applica i parametri dell'anno prima — non è una correzione, è
 * il ramo principale: al 28/08/2026 riguarda il 61% dei comuni, Milano
 * inclusa.
 */
function SchedaEnte<P>({ ente, tributo }: { ente: EnteRisolto<P>; tributo: string }) {
  const { t } = useTraduzione()

  return (
    <div className="rounded-blocco border border-bordo-decorativo bg-carta px-5 py-4">
      <p className="text-xs font-medium text-inchiostro-nota">{tributo}</p>
      <p className="mt-0.5 font-medium text-inchiostro">{ente.nome}</p>

      {ente.stato === 'nonIstituito' ? (
        <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
          {t('dettaglio.enteNonIstituito')}
        </p>
      ) : null}

      {ente.stato === 'deliberato' ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.enteDeliberato', { anno: ente.annoDelibera })}
          </p>
          <div className="mt-3">
            <Fonti fonti={[ente.fonte]} titolo={t('dettaglio.fontiAliquote')} />
          </div>
        </>
      ) : null}

      {ente.stato === 'ereditato' ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.enteEreditato', { anno: ente.annoDiProvenienza })}
          </p>
          <div className="mt-3 space-y-2">
            <Fonti fonti={[ente.normaDiFallback]} titolo={t('dettaglio.fontiFallback')} />
            <Fonti fonti={[ente.fonte]} titolo={t('dettaglio.fontiAliquote')} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export function SezioneDettaglio({ risultato }: { risultato: Risultato }) {
  const { t } = useTraduzione()
  const blocchi = disponiInBlocchi(risultato.passi)

  return (
    <Sezione numero="3" titolo={t('dettaglio.titolo')} occhiello={t('dettaglio.occhiello')}>
      <div className="space-y-8">
        <ol className="space-y-4">
          {blocchi.map((blocco, i) => {
            if (blocco.tipo === 'passaggio') {
              /*
                Un passo senza natura non è una voce: è un passaggio. Sta al
                proprio posto nella sequenza, non raccolto in fondo — e un gate
                si mostra anche quando si apre, altrimenti apparirebbe solo per
                dare cattive notizie.
              */
              return <RigaPasso key={blocco.passo.id} passo={blocco.passo} />
            }

            const natura = etichettaNatura(blocco.natura, t)
            return (
              <li key={`${blocco.natura}-${i}`}>
                <div className="rounded-blocco border border-bordo-decorativo bg-fondo p-3 sm:p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-inchiostro">
                      {natura.titolo}
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        blocco.natura === 'aggiunge' ? 'text-verde-testo' : 'text-inchiostro-tenue'
                      }`}
                    >
                      {natura.destinazione}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                    {natura.spiegazione}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {blocco.passi.map((p) => (
                      <RigaPasso key={p.id} passo={p} />
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>

        <div>
          {/*
            ⚠️ **`h4` e non `h3`.** Il blocco degli enti sta gerarchicamente
            sotto i gruppi di natura, non accanto a loro: era `h3` come i
            titoli delle nature, quindi un lettore di schermo lo annunciava
            allo stesso livello di *Previdenza* o *Imposte erariali*, mentre
            visivamente sta a 14px contro i 18px di quelli. Markup e occhio
            dicevano due cose diverse, e la dimensione era quella giusta.
          */}
          <h4 className="text-sm font-semibold tracking-tight text-inchiostro">
            {t('dettaglio.entiTitolo')}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.entiOcchiello')}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SchedaEnte ente={risultato.enti.regionale} tributo={t('dettaglio.tributoRegionale')} />
            <SchedaEnte ente={risultato.enti.comunale} tributo={t('dettaglio.tributoComunale')} />
          </div>
        </div>
      </div>
    </Sezione>
  )
}
