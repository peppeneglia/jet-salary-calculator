'use client'

/**
 * «Dove vanno i tuoi soldi» — D-034.
 *
 * Il titolo non è decorativo e non poteva essere «trattenute»: la traccia
 * ammette voci di segno positivo, e un elenco di trattenute che ne
 * contiene una è incoerente. *Dove vanno* regge entrambi i segni, perché per
 * una voce che aggiunge la risposta è *restano a te*.
 *
 * E si salda con le quattro nature: non sono quattro categorie contabili, sono
 * quattro destinazioni — la pensione futura, lo Stato, Regione e Comune, e
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
import { ripartizione } from '../_lib/uscite'
import { Fonti } from './fonte'
import { GraficoUscite } from './grafico-uscite'
import { MappaRegione } from './mappa-regione'
import { RigaPasso } from './passo'
import { Sankey } from './sankey'
import { Sezione } from './sezione'
import { TabellaNumeri } from './tabella-numeri'

/**
 * La riga del fallback, quando l'ente non ha deliberato.
 *
 * ⚠️ **È tutto ciò che sopravvive del blocco «Chi incassa le addizionali».**
 * Quel blocco aveva due schede e ripeteva tre cose su quattro: il **nome
 * dell'ente** è già l'etichetta della voce (*Addizionale regionale —
 * Lombardia*), lo **stato** è già la sua spiegazione (*il comune non ha
 * deliberato: per legge restano le aliquote del 2025*), e le **aliquote** sono
 * già sotto `Fonte:`. Tre duplicati e un'informazione vera.
 *
 * L'informazione vera è questa: quando l'ente eredita, ci sono **due**
 * citazioni e non una — l'atto da cui i valori vengono, e **la norma che
 * impone di ereditarli**, cioè il c. 752. La seconda non compare da nessun'altra
 * parte, e per Milano è il ramo principale del calcolo, non un caso limite: al
 * 31/08 riguarda il 61% dei comuni italiani. Quella resta; il resto è sparito.
 */
function NormaDiFallback<P>({ ente, tributo }: { ente: EnteRisolto<P>; tributo: string }) {
  if (ente.stato !== 'ereditato') return null
  return <Fonti fonti={[ente.normaDiFallback]} titolo={tributo} accanto />
}

export function SezioneDettaglio({ risultato }: { risultato: Risultato }) {
  const { t } = useTraduzione()
  const blocchi = disponiInBlocchi(risultato.passi)
  const dati = ripartizione(risultato)

  return (
    <Sezione numero="3" titolo={t('dettaglio.titolo')} occhiello={t('dettaglio.occhiello')}>
      <div className="space-y-8">
        {/*
          ⚠️ **Tre letture dello stesso calcolo, in ordine di impegno
          crescente**, e l'ordine è la decisione.

          1. **La barra** — la forma, in un colpo d'occhio. Non serve leggere
             niente: si vede quanto resta e quante parti si porta via il resto.
          2. **La tabella** — i numeri nudi, senza una parola. Serve a rifare
             il conto, e chi vuole solo quello non deve attraversare dieci
             paragrafi per incolonnare cinque cifre.
          3. **La spiegazione** — il perché di ogni voce, con la norma.

          Prima c'era solo la terza, ed era l'unica porta d'ingresso: chi
          voleva la proporzione doveva ricavarsela, chi voleva i numeri doveva
          estrarli dalla prosa. Nessuna delle tre sostituisce le altre, e
          nessuna ricalcola: tutte e tre leggono la stessa traccia.
        */}
        <GraficoUscite dati={dati} />

        <div>
          <h3 className="text-base font-semibold tracking-tight text-inchiostro select-none">
            {t('dettaglio.tabellaTitolo')}
          </h3>
          <p className="mt-1 mb-3 max-w-prose text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.tabellaOcchiello')}
          </p>
          <TabellaNumeri passi={risultato.passi} dati={dati} />
        </div>

        {/*
          ⚠️ **Il flusso sta fra la tabella e la spiegazione**, e la posizione
          è la sua ragione. È l'unica figura che mostra **l'ordine** — che le
          imposte non si calcolano sul lordo ma su ciò che resta dopo i
          contributi — e quell'ordine è esattamente la domanda che nasce dopo
          aver visto la tabella: *perché le basi delle righe non sono tutte
          uguali?* Messo in fondo arrivava a domanda già dimenticata; messo in
          cima sarebbe stato un grafico bello e muto.

          Le tre figure hanno ora tre ruoli distinti e nessuna ripete un'altra:
          la barra dice **quanto**, il flusso dice **in che ordine**, la
          spiegazione dice **perché**.
        */}
        <div>
          <h3 className="text-base font-semibold tracking-tight text-inchiostro select-none">
            {t('dettaglio.sankeyTitolo')}
          </h3>
          <p className="mt-1 mb-2 max-w-prose text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.sankeyOcchiello')}
          </p>
          <Sankey dati={dati} />
        </div>

        <div>
          <h3 className="text-base font-semibold tracking-tight text-inchiostro select-none">
            {t('dettaglio.spiegazioneTitolo')}
          </h3>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-inchiostro-tenue">
            {t('dettaglio.spiegazioneOcchiello')}
          </p>
        </div>

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
                  {/*
                    ⚠️ **La mappa affianca l'intestazione intera, non il solo
                    paragrafo.**

                    Affiancata alla sola spiegazione partiva più in basso del
                    titolo ed era più alta del testo che le stava a fianco:
                    avanzava sotto le parole una fascia vuota alta mezza mappa,
                    prima dell'elenco delle voci. Il buco non era spaziatura
                    sbagliata, era **una colonna più corta dell'altra**.

                    Ora le due colonne partono dallo stesso bordo: a sinistra
                    titolo, destinazione e spiegazione; a destra la sagoma.
                    Insieme sono alte quasi uguali, e sotto non resta niente da
                    riempire.

                    ⚠️ **Affiancata solo da `sm` in su.** Sotto i 640px la
                    colonna non regge due cose: il testo scenderebbe a quattro
                    parole per riga accanto a una mappa larga un pollice. Lì
                    torna impilata sopra il testo e centrata.

                    Arriva da `GET /api/geo` e non dal documento: 51 KiB di
                    coordinate per una figura di contorno sono esattamente ciò
                    che D-058 ha già rifiutato per l'elenco dei comuni. Finché
                    non arriva, qui non c'è niente e non manca niente — il testo
                    occupa la larghezza intera e nessun buco resta aperto.
                  */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold tracking-tight text-inchiostro">
                          {natura.titolo}
                        </h3>
                        <p
                          className={`text-sm font-medium ${
                            blocco.natura === 'aggiunge'
                              ? 'text-verde-testo'
                              : 'text-inchiostro-tenue'
                          }`}
                        >
                          {natura.destinazione}
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                        {natura.spiegazione}
                      </p>
                    </div>

                    {blocco.natura === 'locale' ? (
                      <div className="order-first self-center sm:order-none sm:self-start">
                        <MappaRegione ente={risultato.enti.regionale.nome} />
                      </div>
                    ) : null}
                  </div>

                  <ul className="mt-4 space-y-3">
                    {blocco.passi.map((p) => (
                      <RigaPasso key={p.id} passo={p} />
                    ))}
                  </ul>

                  {/*
                    La norma che impone l'eredità delle aliquote, per gli enti
                    che non hanno deliberato. Vedi `NormaDiFallback`.
                  */}
                  {blocco.natura === 'locale' ? (
                    <div className="mt-3 space-y-1">
                      <NormaDiFallback
                        ente={risultato.enti.regionale}
                        tributo={t('dettaglio.fallbackRegionale')}
                      />
                      <NormaDiFallback
                        ente={risultato.enti.comunale}
                        tributo={t('dettaglio.fallbackComunale')}
                      />
                    </div>
                  ) : null}

                </div>
              </li>
            )
          })}
        </ol>

      </div>
    </Sezione>
  )
}
