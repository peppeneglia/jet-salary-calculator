'use client'

/**
 * Il lordo e tutte le voci di uscita, in una barra sola.
 *
 * ⚠️ **Non è il grafico della sezione 2, ed è la differenza che giustifica
 * due grafici invece di uno.** Là la barra ha due segmenti e risponde a
 * *quanto ti resta*; qui ne ha uno per voce e risponde a *in quante parti si
 * divide, e quanto pesa ciascuna*. La prima è una proporzione, la seconda è
 * una ripartizione: chi legge la sezione 3 ha già visto quanto resta ed è
 * arrivato qui per sapere dove va il resto.
 *
 * Apre la sezione perché è la mappa di ciò che segue: sotto, ogni voce torna
 * come riga della tabella e poi come blocco spiegato, nello stesso ordine e
 * con la stessa tinta.
 *
 * ⚠️ La larghezza di ogni segmento vive in un attributo `style`, e la CSP lo
 * consente apposta: `style-src-attr 'unsafe-inline'` in `proxy.ts`.
 */

import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { etichettaBreve, tintaUscita, type Ripartizione } from '../_lib/uscite'

export function GraficoUscite({ dati }: { dati: Ripartizione }) {
  const { t, lingua } = useTraduzione()
  const { inEuro, inPercentuale } = formato(lingua)

  /*
    L'ordine è: prima quello che resta, poi le uscite nell'ordine della catena.
    Il netto in testa e non in coda perché è la risposta, e perché il verde
    all'inizio della barra è la stessa lettura della sezione sopra.

    ⚠️ Le voci che si aggiungono non sono un segmento: sono già dentro il
    netto, e disegnarle a parte le conterebbe due volte. Compaiono invece nel
    totale della barra — vedi la nota su `totale` in `_lib/uscite.ts` — e la
    riga sotto lo dice quando succede.
  */
  const segmenti = [
    {
      chiave: 'netto',
      etichetta: t('dettaglio.graficoResta'),
      importo: dati.netto,
      tinta: 'bg-verde',
      forte: true,
    },
    ...dati.uscite.map((v, i) => ({
      chiave: v.id,
      etichetta: v.etichetta,
      importo: v.importo,
      // Il gradino segue la posizione nella catena, non la natura: il colore
      // separa le voci, il nome accanto le dice.
      tinta: tintaUscita(i),
      forte: false,
    })),
  ]

  const quota = (v: number) => (dati.totale > 0 ? (v / dati.totale) * 100 : 0)

  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline gap-x-2 text-sm select-none">
        <span className="font-medium text-inchiostro-nota">{t('dettaglio.graficoTitolo')}</span>
        <span className="cifre font-semibold text-inchiostro">{inEuro(dati.totale)}</span>
      </figcaption>

      {/*
        ⚠️ La barra è `aria-hidden` e la legenda sotto è il suo equivalente:
        ogni segmento ha lì la propria voce, con nome, importo e quota. Marcare
        la barra come immagine con un `aria-label` che li ripete tutti farebbe
        ascoltare due volte lo stesso elenco.

        `min-w-0.5` su ogni segmento: a certi redditi una voce vale pochi
        decimi di punto, e un segmento largo zero pixel sparirebbe invece di
        risultare piccolo.
      */}
      <div
        aria-hidden
        className="mt-2 flex h-8 w-full overflow-hidden rounded-voce border border-bordo-decorativo"
      >
        {segmenti.map((s, i) => (
          <div
            key={s.chiave}
            className={`min-w-0.5 ${s.tinta} ${i > 0 ? 'border-l border-carta' : ''}`}
            style={{ width: `${quota(s.importo)}%` }}
          />
        ))}
      </div>

      {/*
        ⚠️ **`min-w-0` sulla riga, e senza traboccava.** Un elemento di griglia
        ha `min-width: auto`, cioè non si restringe sotto la propria dimensione
        minima: la riga restava larga quanto le serviva e usciva dalla colonna
        invece di far troncare l'etichetta. Misurato a 375px prima della
        correzione: la percentuale finiva a 395px, cioè venti pixel fuori dalla
        finestra. `truncate` sull'etichetta non poteva farci niente da solo,
        perché il permesso di stringersi manca un livello più su.
      */}
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {segmenti.map((s) => (
          <li key={s.chiave} className="flex min-w-0 items-baseline gap-2 text-sm">
            <span
              aria-hidden
              className={`h-2.5 w-2.5 shrink-0 translate-y-px rounded-full ${s.tinta}`}
            />
            {/*
              ⚠️ **Su schermo stretto il tipo si abbrevia, così il nome
              dell'ente resta leggibile.** *Addizionale comunale · Salorno
              sulla Strada del Vino* troncato a una riga di telefono diventa
              *Addizionale comunale · Salorno sul…*: si perde esattamente la
              parte che dice a chi legge che quella voce è la sua, e si tiene
              quella che è già scritta due righe più su. Con *Add. com.* davanti
              il nome del comune ci sta quasi sempre per intero.
            */}
            <span className="min-w-0 flex-1 truncate text-inchiostro-tenue sm:hidden">
              {etichettaBreve(s.chiave, s.etichetta, t)}
            </span>
            <span className="hidden min-w-0 flex-1 truncate text-inchiostro-tenue sm:block">
              {s.etichetta}
            </span>
            <span
              className={`cifre font-semibold ${s.forte ? 'text-verde-testo' : 'text-inchiostro'}`}
            >
              {inEuro(s.importo)}
            </span>
            {/*
              ⚠️ **La percentuale sparisce su schermo stretto, e l'importo no.**
              Sono sessantaquattro pixel per riga spesi su un numero
              **derivato** — importo diviso totale — mentre l'euro accanto è il
              dato. Su un telefono quei pixel li prende l'etichetta, che
              altrimenti si tronca a due parole: fra sapere *quanto* e sapere
              *di che voce*, la seconda viene prima.

              Resta però a chi ascolta, in una copia `sr-only`: questa lista è
              l'equivalente testuale della barra, che è `aria-hidden`, e una
              barra senza proporzioni non ha molto da dire. Due elementi e non
              uno con le varianti perché `sr-only` e `w-14` scrivono entrambi
              `width`, e quale dei due vinca dipenderebbe dall'ordine con cui
              il generatore emette le utility.
            */}
            <span className="sr-only sm:hidden">{inPercentuale(quota(s.importo))}</span>
            <span className="cifre hidden w-14 text-right text-xs text-inchiostro-tenue sm:inline-block">
              {inPercentuale(quota(s.importo))}
            </span>
          </li>
        ))}
      </ul>

      {/*
        La nota compare solo quando serve, cioè quando la barra è più lunga del
        lordo. Tacerla lascerebbe chi somma i numeri davanti a un totale che
        non è la RAL che ha scritto.
      */}
      {dati.aggiunte.length > 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-inchiostro-tenue">
          {t('dettaglio.graficoNotaAggiunte', {
            lordo: inEuro(dati.lordo),
            totale: inEuro(dati.totale),
          })}
        </p>
      ) : null}
    </figure>
  )
}
