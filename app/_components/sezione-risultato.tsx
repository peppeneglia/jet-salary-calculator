'use client'

/**
 * Il numero, e le sue tre divisioni.
 *
 * Le tre mensilità si mostrano insieme, con in evidenza quella scelta.
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
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { etichettaContratto } from '../_lib/testi'
import { BloccoAssunzioni } from './assunzioni'
import { GraficoLordoNetto } from './grafico-lordo-netto'
import { Sezione } from './sezione'

const DIVISIONI: readonly Mensilita[] = [12, 13, 14]

export function SezioneRisultato({ risultato }: { risultato: Risultato }) {
  const { t, lingua } = useTraduzione()
  const { inEuro } = formato(lingua)
  const { enti, input } = risultato

  return (
    <Sezione numero="2" titolo={t('risultato.titolo')}>
      <div className="space-y-6">
        {/*
          ⚠️ Il risultato riscrive i propri input (D-063).

          È il presidio di D-036, spostato e reso più forte. Prima un'etichetta
          accanto al campo diceva *questa cifra è un esempio*; adesso il numero
          dichiara da cosa nasce, e lo fa anche quando i dati sono davvero
          quelli dell'utente — dove serve a confermare cosa è stato calcolato.

          ⚠️ **E ora lo fa una volta sola.** Le stesse informazioni comparivano
          in tre posti a distanza di due righe: l'occhiello della sezione
          diceva *Tempo indeterminato, Milano, anno 2026*, questa riga ripeteva
          comune e contratto, e una pastiglia sotto il numero ripeteva l'anno.
          Tre volte il contratto, tre volte il comune, due volte l'anno, due
          volte la RAL — con `daUnaRal` che sotto la cifra rileggeva la RAL già
          scritta qui.

          Ripetere non rafforza: un dato scritto tre volte in tre forme diverse
          fa cercare la differenza fra le tre, e non ce n'era nessuna.
          L'occhiello e la pastiglia sono spariti, l'anno è entrato in questa
          riga, e ogni fatto sta esattamente in un posto. La proprietà che
          D-063 chiedeva — *il risultato dichiara da cosa nasce* — è intatta:
          è questa riga, ed è sopra il numero.
        */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-inchiostro-tenue">
          <span className="font-medium text-inchiostro-nota select-none">
            {t('risultato.riepilogoTitolo')}
          </span>
          <span className="cifre font-medium text-inchiostro">{inEuro(input.ral)}</span>
          <span aria-hidden>·</span>
          <span className="font-medium text-inchiostro">{enti.comunale.nome}</span>
          <span aria-hidden>·</span>
          <span>{etichettaContratto(input.tipoContratto, t)}</span>
          <span aria-hidden>·</span>
          <span>{t('risultato.riepilogoMensilita', { n: risultato.mensilita })}</span>
          <span aria-hidden>·</span>
          {/*
            L'anno arriva da `risultato.annoImposta`, cioè dal regime che il
            motore ha davvero applicato. Scritto a mano nella traduzione
            sarebbe rimasto indietro al primo cambio di regime — in due lingue,
            in silenzio.
          */}
          <span>{t('risultato.riepilogoAnno', { anno: risultato.annoImposta })}</span>
        </div>

        <div className="rounded-blocco border border-verde-bordo bg-verde-velo px-4 py-6 text-center sm:px-6 sm:py-7">
          <p className="text-sm font-medium text-inchiostro-tenue select-none">
            {t('risultato.nettoAnnuo')}
          </p>
          <p className="cifre mt-1 text-3xl font-semibold tracking-tight text-verde-testo break-words sm:text-5xl">
            {inEuro(risultato.nettoAnnuo)}
          </p>
        </div>

        {/*
          ⚠️ Il grafico sta fra il numero e le tre divisioni, e la posizione è
          la sua ragione d'essere. Sopra c'è quanto resta; sotto, in sezione 3,
          dove va il resto. Qui in mezzo c'è la sola cosa che nessuno dei due
          dice: **la proporzione**. La barra non scompone la differenza — quella
          è la domanda della sezione dopo, e anticiparla qui la renderebbe una
          legenda di quattro colori al posto di una figura con un messaggio.
        */}
        <GraficoLordoNetto risultato={risultato} />

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIVISIONI.map((m) => {
              const scelta = m === risultato.mensilita
              return (
                <div
                  key={m}
                  aria-current={scelta ? 'true' : undefined}
                  className={`rounded-blocco border px-4 py-4 text-center ${
                    scelta ? 'border-verde-bordo bg-verde-velo' : 'border-bordo-decorativo bg-carta'
                  }`}
                >
                  <p className="text-xs font-medium text-inchiostro-tenue select-none">
                    {t('risultato.suMensilita', { n: m })}
                    {/*
                      ⚠️ Il separatore sta nel JSX e non in coda alla stringa
                      tradotta. Uno spazio iniziale dentro una traduzione è
                      invisibile a chi la rilegge e sparisce al primo strumento
                      che fa trim: qui mancava, e si leggeva «mensilità— la».
                    */}
                    {scelta ? (
                      <span className="sr-only">
                        {' — '}
                        {t('risultato.mensilitaSelezionata')}
                      </span>
                    ) : null}
                  </p>
                  <p
                    className={`cifre mt-1 font-semibold tracking-tight break-words ${
                      scelta
                        ? 'text-xl text-verde-testo sm:text-2xl'
                        : 'text-lg text-inchiostro-tenue sm:text-xl'
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
              {t('risultato.notaMensilitaTitolo')}
            </strong>{' '}
            {t('risultato.notaMensilitaCorpo')}
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
          titolo={t('risultato.assunzioniTitolo')}
          occhiello={t('risultato.assunzioniOcchiello')}
          extra={
            <li className="rounded-blocco border border-bordo-decorativo bg-carta px-5 py-4">
              <p className="text-sm font-medium text-inchiostro">
                {t('risultato.notaContrattoDomanda')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                <strong className="font-medium text-inchiostro">
                  {t('risultato.notaContrattoTitolo')}
                </strong>{' '}
                {t('risultato.notaContrattoCorpo')}
              </p>
            </li>
          }
        />
      </div>
    </Sezione>
  )
}
