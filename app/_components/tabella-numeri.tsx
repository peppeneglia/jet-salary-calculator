'use client'

/**
 * Tutti i numeri della traccia, senza una parola di spiegazione.
 *
 * ⚠️ **Esiste perché il conto si possa rifare, non perché si capisca.** Il
 * blocco spiegato più sotto risponde a *perché*; questa tabella risponde a
 * *torna?*. Sono due letture diverse dello stesso oggetto e servono a due
 * persone diverse — o alla stessa persona in due momenti — e mescolarle
 * significa che nessuna delle due funziona: la prosa fra una cifra e l'altra
 * impedisce di incolonnare, e le colonne fra un paragrafo e l'altro
 * impediscono di leggere.
 *
 * ⚠️ **Nessun numero nasce qui, nemmeno il progressivo.** Le colonne sono
 * campi di `Esito`: `entra`, `esce`, `effettoSulNetto`. L'unica somma è quella
 * che accumula il netto riga per riga, ed è la stessa identità che il motore
 * usa e che `perLaPagina` ricalcola sui valori mostrati — quindi l'ultima riga
 * fa il netto della sezione sopra al centesimo, per costruzione e non per
 * fortuna.
 *
 * ⚠️ La tabella scorre dentro il proprio contenitore. Cinque colonne di cifre
 * non stanno su un telefono, e il rimedio non è togliere una colonna: è
 * lasciare che quella scorra invece di far scorrere la pagina.
 */

import type { Passo } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { righeTabella, type Ripartizione, type RigaTabella } from '../_lib/uscite'

/** La cella di un valore che il passo non espone: un trattino, non uno zero. */
const VUOTO = <span className="text-inchiostro-nota">—</span>

/**
 * Il netto riga per riga, calcolato **prima** di rendere.
 *
 * ⚠️ **Non è organizzazione del codice.** Accumulando dentro la `.map` del
 * JSX — `let corrente` mutata a ogni riga — il compilatore React lo rifiuta,
 * *cannot reassign variable after render completes*, e ha ragione: un render
 * ripetuto o interrotto ripartirebbe da un accumulatore già avanzato, e la
 * colonna mostrerebbe numeri che crescono a ogni ridisegno. Qui l'accumulo è
 * una funzione pura che riceve i passi e restituisce un array.
 *
 * Somma i soli passi di primo livello: i passi annidati scompongono un effetto
 * che il padre ha già portato, e contarli entrambi conterebbe l'IRPEF due
 * volte.
 */
function progressivi(righe: readonly RigaTabella[], lordo: number): readonly (number | null)[] {
  const out: (number | null)[] = []
  let corrente = lordo
  for (const { passo, livello } of righe) {
    const e = passo.esito
    if (livello === 0 && e.stato === 'applicato' && e.segno !== 'neutro') {
      corrente += e.effettoSulNetto
      out.push(corrente)
    } else {
      out.push(null)
    }
  }
  return out
}

export function TabellaNumeri({
  passi,
  dati,
}: {
  passi: readonly Passo[]
  dati: Ripartizione
}) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inEuroConSegno, inPercentuale } = formato(lingua)

  const righe = righeTabella(passi)
  const netti = progressivi(righe, dati.lordo)

  return (
    <div className="overflow-x-auto rounded-blocco border border-bordo-decorativo">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <caption className="sr-only">{t('dettaglio.tabellaTitolo')}</caption>
        <thead>
          <tr className="border-b border-bordo-decorativo bg-fondo text-left">
            <th scope="col" className="px-3 py-2 font-medium text-inchiostro-nota select-none">
              {t('dettaglio.tabellaVoce')}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-inchiostro-nota select-none">
              {t('dettaglio.tabellaBase')}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-inchiostro-nota select-none">
              {t('dettaglio.tabellaValore')}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-inchiostro-nota select-none">
              {t('dettaglio.tabellaEffetto')}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-inchiostro-nota select-none">
              {t('dettaglio.tabellaProgressivo')}
            </th>
          </tr>
        </thead>
        <tbody>
          {righe.map(({ passo, livello }, indice) => {
            const esito = passo.esito
            const primoLivello = livello === 0
            const muove = esito.stato === 'applicato' && esito.segno !== 'neutro'
            const progressivo = netti[indice]

            const parametro = passo.parametro
            const valore =
              parametro === undefined
                ? VUOTO
                : parametro.tipo === 'aliquota'
                  ? inPercentuale(parametro.valore)
                  : parametro.tipo === 'importo' || parametro.tipo === 'soglia'
                    ? inEuro(parametro.valore)
                    : parametro.tipo === 'formula'
                      ? parametro.applicata
                      : parametro.valore.forma === 'unica'
                        ? inPercentuale(parametro.valore.aliquota)
                        : VUOTO

            return (
              <tr
                key={passo.id}
                className={`border-b border-bordo-decorativo last:border-b-0 ${
                  primoLivello ? 'bg-carta' : 'bg-fondo'
                }`}
              >
                <th
                  scope="row"
                  className={`px-3 py-2 text-left font-normal ${
                    primoLivello ? 'text-inchiostro' : 'text-inchiostro-tenue'
                  }`}
                  /* Il rientro dice l'annidamento senza aggiungere una colonna. */
                  style={livello > 0 ? { paddingLeft: `${0.75 + livello * 1}rem` } : undefined}
                >
                  {passo.etichetta}
                </th>

                <td className="cifre px-3 py-2 text-right text-inchiostro-tenue">
                  {esito.stato === 'applicato' && esito.segno !== 'neutro'
                    ? inEuro(esito.entra)
                    : esito.stato === 'applicato'
                      ? inEuro(esito.entra)
                      : esito.stato === 'verifica'
                        ? inEuro(esito.grandezzaLetta)
                        : VUOTO}
                </td>

                <td className="cifre px-3 py-2 text-right text-inchiostro-tenue">{valore}</td>

                <td className="cifre px-3 py-2 text-right">
                  {muove ? (
                    <span
                      className={`font-semibold ${
                        esito.segno === 'aggiunge' ? 'text-verde-testo' : 'text-inchiostro'
                      }`}
                    >
                      {inEuroConSegno(esito.effettoSulNetto)}
                    </span>
                  ) : esito.stato === 'nonDovuto' ? (
                    <span className="text-inchiostro-nota">{t('passo.nonDovuto')}</span>
                  ) : esito.stato === 'applicato' ? (
                    /* Un passo neutro non muove il netto: espone la grandezza che produce. */
                    <span className="text-inchiostro-tenue">{inEuro(esito.esce)}</span>
                  ) : (
                    VUOTO
                  )}
                </td>

                <td className="cifre px-3 py-2 text-right">
                  {progressivo === null || progressivo === undefined ? (
                    VUOTO
                  ) : (
                    <span className="font-medium text-inchiostro">{inEuro(progressivo)}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-bordo-decorativo-forte bg-verde-velo">
            <th scope="row" className="px-3 py-2.5 text-left font-semibold text-inchiostro">
              {t('dettaglio.tabellaNetto')}
            </th>
            <td colSpan={3} />
            <td className="cifre px-3 py-2.5 text-right text-base font-semibold text-verde-testo">
              {inEuro(dati.netto)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
