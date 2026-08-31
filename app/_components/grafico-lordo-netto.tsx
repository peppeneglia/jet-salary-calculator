'use client'

/**
 * Quanto del lordo diventa netto, in una barra sola.
 *
 * ⚠️ **Dice due cose e si ferma lì, ed è il punto.** La barra ha due
 * segmenti — quello che resta e quello che non arriva — e il secondo non è
 * scomposto. Dove finisca quella differenza è esattamente la domanda a cui
 * risponde la sezione 3, voce per voce e con la norma accanto: anticiparla qui
 * con quattro colori significherebbe dare la risposta prima della domanda, e
 * costringere a leggere una legenda di quattro voci per capire una figura che
 * ne vuole comunicare una sola.
 *
 * Il grafico serve a far vedere **la proporzione**, che è la cosa che un
 * numero da solo non dice: *23.425 su 30.000* si legge, ma non si vede.
 *
 * ⚠️ **I due numeri non sono ricalcolati, sono quelli mostrati.** Arrivano dal
 * `Risultato` già passato per `perLaPagina`, e la differenza è la sottrazione
 * fra i due valori che si leggono in pagina — non fra quelli a precisione
 * piena del motore. È D-024 e D-066: ciò che si vede deve tornare con ciò che
 * si vede. Un grafico che usasse i numeri esatti disegnerebbe una proporzione
 * di mezzo centesimo diversa da quella che le cifre accanto dichiarano.
 *
 * ⚠️ **La larghezza vive in un attributo `style`, e la CSP lo consente
 * apposta.** È una percentuale calcolata su dati che si conoscono solo a
 * runtime, quindi non può stare in un foglio scritto prima: `proxy.ts`
 * dichiara `style-src-attr 'unsafe-inline'` proprio per questo caso, che fino a
 * ieri riguardava il solo grafico degli scaglioni in `/spiegazione`.
 */

import type { Risultato } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'

export function GraficoLordoNetto({ risultato }: { risultato: Risultato }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inPercentuale } = formato(lingua)

  const lordo = risultato.input.ral as number
  const netto = risultato.nettoAnnuo as number

  /**
   * ⚠️ **Il netto può superare il lordo, e non è un caso di scuola: succede
   * nella fascia che questo progetto dichiara di voler curare.**
   *
   * A RAL 9.500 a Milano il netto è **10.148,87** — il 106,83% del lordo.
   * Non è un difetto: il trattamento integrativo e la somma del cuneo sono
   * *somme che non concorrono a formare il reddito*, quindi si aggiungono al
   * netto invece di ridurlo, e a quel livello valgono più di tutto ciò che
   * viene trattenuto. È la quarta natura, ed è la ragione per cui la traccia
   * del motore ha un segno.
   *
   * Un grafico a due segmenti che assumesse `netto ≤ lordo` qui produrrebbe
   * una larghezza negativa: la barra si romperebbe **proprio sul caso che il
   * progetto considera più interessante di tutti**. Quindi ci sono due
   * letture, e la seconda non è un ripiego — dice una cosa vera che vale la
   * pena vedere.
   */
  const inPiu = netto > lordo
  const scarto = Math.abs(lordo - netto)

  /*
    ⚠️ La seconda quota è il complemento della prima, non un secondo rapporto
    calcolato: arrotondando due divisioni per conto proprio le due percentuali
    possono sommare a 99,9 o 100,1, e una barra i cui pezzi non fanno un intero
    è il difetto di D-024 disegnato invece che scritto.

    Entrambe restano quote **del lordo**, anche nella lettura rovesciata: lì la
    prima supera cento e la seconda è quanto la eccede.
  */
  const quotaNetto = lordo > 0 ? (netto / lordo) * 100 : 0
  const quotaScarto = Math.abs(100 - quotaNetto)

  /*
    La barra si misura sul maggiore dei due, così il segmento pieno è sempre
    quello più grande e nessuna larghezza va sotto zero.
  */
  const totale = Math.max(lordo, netto)
  const larghezzaNetto = totale > 0 ? (Math.min(lordo, netto) / totale) * 100 : 0
  const larghezzaScarto = 100 - larghezzaNetto

  return (
    <figure>
      <figcaption className="text-sm font-medium text-inchiostro-nota select-none">
        {t('risultato.graficoTitolo')}
      </figcaption>

      {/*
        ⚠️ La barra è `aria-hidden` e la figura porta un testo equivalente.

        Non è una scorciatoia: una barra divisa in due non ha nulla da
        annunciare che i numeri qui sotto non dicano meglio, e marcarla come
        immagine con un `aria-label` farebbe leggere due volte la stessa cosa.
        La descrizione completa sta in `graficoDescrizione`, che è una frase
        vera e non una didascalia di servizio — visibile a tutti, non solo a
        chi ascolta.

        `min-w` sui due segmenti: a RAL molto basse una delle due quote può
        valere pochi decimi, e un segmento largo zero pixel sparirebbe invece
        di risultare piccolo.
      */}
      <div
        aria-hidden
        className="mt-2 flex h-7 w-full overflow-hidden rounded-voce border border-bordo-decorativo"
      >
        <div className="min-w-1 bg-verde" style={{ width: `${larghezzaNetto}%` }} />
        {/*
          Il secondo segmento cambia tinta con il verso: grigio quando è ciò
          che non arriva, verde tenue quando è ciò che si aggiunge. Il colore
          dice il segno prima che si legga l'etichetta — ed è lo stesso
          principio per cui il netto è l'unica cosa verde della pagina.
        */}
        <div
          className={`min-w-1 border-l border-carta ${inPiu ? 'bg-verde-velo' : 'bg-bordo-decorativo-forte'}`}
          style={{ width: `${larghezzaScarto}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Voce
          etichetta={t('risultato.graficoNetto')}
          importo={inEuro(netto)}
          quota={inPercentuale(quotaNetto)}
          pastiglia="bg-verde"
          forte
        />
        <Voce
          etichetta={inPiu ? t('risultato.graficoInPiu') : t('risultato.graficoDifferenza')}
          importo={inEuro(scarto)}
          quota={inPercentuale(quotaScarto)}
          pastiglia={inPiu ? 'bg-verde-velo' : 'bg-bordo-decorativo-forte'}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-inchiostro-tenue">
        {t(inPiu ? 'risultato.graficoDescrizioneInPiu' : 'risultato.graficoDescrizione', {
          lordo: inEuro(lordo),
          netto: inEuro(netto),
          quota: inPercentuale(quotaNetto),
          differenza: inEuro(scarto),
        })}
      </p>
    </figure>
  )
}

function Voce({
  etichetta,
  importo,
  quota,
  pastiglia,
  forte,
}: {
  etichetta: string
  importo: string
  quota: string
  pastiglia: string
  forte?: boolean
}) {
  return (
    <span className="flex items-baseline gap-2">
      <span aria-hidden className={`h-2.5 w-2.5 shrink-0 translate-y-px rounded-full ${pastiglia}`} />
      <span className="text-inchiostro-tenue select-none">{etichetta}</span>
      <span className={`cifre font-semibold ${forte ? 'text-verde-testo' : 'text-inchiostro'}`}>
        {importo}
      </span>
      <span className="cifre text-xs text-inchiostro-tenue">{quota}</span>
    </span>
  )
}
