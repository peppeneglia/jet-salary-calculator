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
 *
 * ⚠️ **E che scorra bisogna dirlo**, perché la barra del sistema compare solo
 * mentre si scorre: chi non prova a trascinare non scopre che sotto il bordo
 * destro ci sono altre due colonne. Lo dice `Scorrevole`. Su schermo stretto
 * la tabella si stringe anche da sé — corpo minore e meno respiro nelle
 * celle — così lo scorrimento che resta è il meno possibile invece di essere
 * tutto quello che serviva su un foglio pensato per il desktop.
 */

import type { Passo } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { etichettaBreve, righeTabella, type Ripartizione, type RigaTabella } from '../_lib/uscite'
import { Scorrevole } from './scorrevole'

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
    <Scorrevole
      etichetta={t('dettaglio.tabellaTitolo')}
      indicazione={t('dettaglio.scorriColonne')}
    >
      <table className="w-full min-w-[28rem] border-collapse text-xs sm:min-w-[38rem] sm:text-sm">
        <caption className="sr-only">{t('dettaglio.tabellaTitolo')}</caption>
        <thead>
          <tr className="border-b border-bordo-decorativo bg-fondo text-left">
            <th
              scope="col"
              className="px-2 py-2 font-medium text-inchiostro-nota select-none sm:px-3"
            >
              {t('dettaglio.tabellaVoce')}
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-right font-medium text-inchiostro-nota select-none sm:px-3"
            >
              {t('dettaglio.tabellaBase')}
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-right font-medium text-inchiostro-nota select-none sm:px-3"
            >
              {t('dettaglio.tabellaValore')}
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-right font-medium text-inchiostro-nota select-none sm:px-3"
            >
              {t('dettaglio.tabellaEffetto')}
            </th>
            <th
              scope="col"
              className="px-2 py-2 text-right font-medium text-inchiostro-nota select-none sm:px-3"
            >
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

            /*
              ⚠️ **Una riga che muove il netto e una che non lo muove non
              possono avere lo stesso aspetto, ed era il difetto della
              tabella.**

              Cinque colonne piene di cifre, tutte incolonnate nello stesso
              modo: *Base contributiva 30.000,00* e *Contributi −2.757,00*
              stavano sulla stessa scala, e per capire quale delle due entrava
              davvero nel conto bisognava già sapere la risposta. Su una
              tabella che esiste per **rifare il conto**, non distinguere gli
              addendi dalle grandezze di servizio è il difetto che la rende
              inutile a chi la userebbe.

              Ora ci sono due specie di riga, e si vedono senza leggere:

              - **le voci** — quelle che spostano il netto. Carta piena,
                etichetta in inchiostro pieno, la cifra dell'effetto in
                grassetto con il proprio segno, e il netto progressivo che
                avanza. Le voci che **aggiungono** portano il `+` e il verde,
                che qui significa quello che significa ovunque nel prodotto:
                soldi che restano a chi legge.
              - **i passaggi** — RAL, base contributiva, reddito complessivo,
                il presupposto. Fondo tenue, etichetta smorzata, e nella
                colonna dell'effetto **un trattino, non una cifra**: prima ci
                finiva il valore in uscita, che è esattamente ciò che li faceva
                sembrare addendi. Il loro numero resta, ma nella colonna
                *Calcolata su*, dove si legge come ciò che è.

              Restano tutte in tabella, ed è la scelta: toglierle
              renderebbe la tabella più bella e impossibile da verificare,
              perché sparirebbero le basi su cui le voci si calcolano.
            */
            const passaggio = !muove

            return (
              <tr
                key={passo.id}
                className={`border-b border-bordo-decorativo last:border-b-0 ${
                  passaggio ? 'bg-fondo' : primoLivello ? 'bg-carta' : 'bg-carta/60'
                }`}
              >
                <th
                  scope="row"
                  className={`px-2 py-2 text-left sm:px-3 ${
                    passaggio
                      ? 'font-normal text-inchiostro-tenue'
                      : primoLivello
                        ? 'font-medium text-inchiostro'
                        : 'font-normal text-inchiostro'
                  }`}
                  /* Il rientro dice l'annidamento senza aggiungere una colonna. */
                  style={livello > 0 ? { paddingLeft: `${0.75 + livello * 1}rem` } : undefined}
                >
                  {/* Il tipo abbreviato su schermo stretto: vedi il riquadro
                      in `grafico-uscite.tsx`, la ragione è la stessa e qui
                      pesa di più, perché questa colonna decide la larghezza
                      della tabella e quindi quanto bisogna scorrere. */}
                  <span className="sm:hidden">
                    {etichettaBreve(passo.id, passo.etichetta, t)}
                  </span>
                  <span className="hidden sm:inline">{passo.etichetta}</span>
                </th>

                <td className="cifre px-2 py-2 text-right text-inchiostro-tenue sm:px-3">
                  {esito.stato === 'applicato'
                    ? inEuro(esito.entra)
                    : esito.stato === 'verifica'
                      ? inEuro(esito.grandezzaLetta)
                      : VUOTO}
                </td>

                <td className="cifre px-2 py-2 text-right text-inchiostro-tenue sm:px-3">{valore}</td>

                <td className="cifre px-2 py-2 text-right sm:px-3">
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
                  ) : (
                    VUOTO
                  )}
                </td>

                <td className="cifre px-2 py-2 text-right sm:px-3">
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
            <th scope="row" className="px-2 py-2.5 text-left font-semibold text-inchiostro sm:px-3">
              {t('dettaglio.tabellaNetto')}
            </th>
            <td colSpan={3} />
            <td className="cifre px-2 py-2.5 text-right text-sm font-semibold text-verde-testo sm:px-3 sm:text-base">
              {inEuro(dati.netto)}
            </td>
          </tr>
        </tfoot>
      </table>
    </Scorrevole>
  )
}
