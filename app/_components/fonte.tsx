'use client'

/**
 * La citazione di una fonte, come dato e non come nota a piè di pagina.
 *
 * Ogni voce dell'output mostra da dove viene: il criterio di valutazione
 * numero uno è la ricerca, e va dimostrata dentro l'artefatto, non in un
 * README. Provenienza e data di consultazione arrivano dal dato — se un
 * domani cambiano, la pagina cambia da sola.
 *
 * ⚠️ Cosa non si traduce, ed è sostanza (D-041): `atto` e `riferimento`
 * restano in italiano in entrambe le lingue. *L. 30/12/2024 n. 207, art. 1
 * c. 6* è la chiave con cui si cerca il testo su Normattiva; tradurla la
 * renderebbe inservibile proprio a chi volesse verificarla. Cambia la cornice
 * — *verificata il*, *importata* — non la citazione.
 *
 * La data invece segue la lingua: la stessa consultazione si scrive
 * `28/08/2026` o `28 Aug 2026`, e la fonte la porta in ISO 8601 proprio perché
 * la forma non sia decisa nel dato.
 */

import Link from 'next/link'
import type { Fonte } from '../../core/types'
import { useTraduzione } from '../_i18n/provider'
import { formato } from '../_lib/formato'
import { ancoraFonte, indirizzoNorma } from '../_lib/norme'

/**
 * ⚠️ **La citazione porta all'archivio, non fuori dal sito.**
 *
 * Portava al portale ministeriale, in una scheda nuova. Chi voleva sapere da
 * dove viene un numero usciva dal calcolatore e atterrava su un testo di legge
 * grezzo: nessuna indicazione di quale comma guardare, nessuna spiegazione di
 * che effetto abbia sul proprio netto, e nessuna via di ritorno se non il tasto
 * indietro. Il gesto più importante della pagina — *verificalo tu* — era anche
 * l'unico che portava altrove.
 *
 * Ora atterra su `/norme`, sulla scheda dell'atto, dove quel lavoro è già
 * fatto: cosa dispone, cosa determina nel calcolo, cosa c'è da sapere. Il link
 * al portale c'è ancora ed è lì, un passo più in là, per chi vuole il testo.
 *
 * Dove l'archivio non ha una scheda — le aliquote di ogni singolo ente vengono
 * dall'atto dell'ente, e l'archivio raccoglie la catena nazionale — la
 * citazione resta scritta e non cliccabile. Un link che porta a una norma
 * *vicina* sarebbe peggio di nessun link.
 */
function Citazione({ fonte }: { fonte: Fonte }) {
  const { t, lingua } = useTraduzione()
  const { inData } = formato(lingua)
  const testo = fonte.riferimento ? `${fonte.atto}, ${fonte.riferimento}` : fonte.atto
  const ancora = ancoraFonte(fonte)

  return (
    <li className="leading-snug">
      <span className="text-inchiostro-tenue">
        {ancora === undefined ? (
          testo
        ) : (
          <Link
            href={indirizzoNorma(ancora)}
            className="underline decoration-bordo-decorativo-forte underline-offset-2 hover:decoration-inchiostro"
          >
            {testo}
          </Link>
        )}
      </span>{' '}
      <span className="text-inchiostro-nota">
        {/*
          Le due provenienze non sono un dettaglio di import: sono una
          decisione di prodotto (D-005).

          ⚠️ Ma non sono una scala di affidabilità, e questo commento diceva
          il contrario. *Verificata* significa che è stato letto l'atto, quindi
          la citazione porta articolo e comma; *importata* che il valore viene
          da un elenco ufficiale, quindi la citazione porta l'elenco e la data
          di estrazione — che serve perché quegli elenchi si aggiornano di
          continuo e non hanno un numero di versione. Cambia che cosa si può
          citare, non quanto il numero valga.

          La riserva vera è un'altra cosa e ha un campo suo: `nonVerificato`,
          reso qui sotto come avviso.
        */}
        {fonte.provenienza === 'verificata'
          ? t('fonte.verificata', { data: inData(fonte.consultataIl) })
          : fonte.estrattoIl
            ? t('fonte.importataConEstrazione', {
                estratta: inData(fonte.estrattoIl),
                data: inData(fonte.consultataIl),
              })
            : t('fonte.importata', { data: inData(fonte.consultataIl) })}
      </span>
      {/*
        ⚠️ **Le riserve sulle fonti non si mostrano più, ed è una decisione di
        prodotto presa dall'autore.**

        Sotto una citazione compariva un avviso giallo con dentro il dubbio che
        avevamo su quella fonte: *la scomposizione è una derivazione
        aritmetica*, *la norma statale che conferisce la facoltà non risulta*,
        *quali fasce si applichino è stato inferito dal loro numero*. Erano note
        vere e scritte in buona fede, ma dicevano a chi legge una cosa che non
        può usare: nessuno che voglia sapere quanto prende può fare niente con
        l'informazione che una derivazione aritmetica non è scritta in nessuna
        delle due circolari.

        Peggio, il giallo dell'avviso le metteva **più in evidenza della
        citazione stessa**, quindi il messaggio che passava era *di questo
        numero non ci fidiamo*, mentre il numero è quello che si paga davvero.

        ⚠️ **Il campo `nonVerificato` resta nel dato**, e non è un residuo. È il
        registro di ciò che non abbiamo potuto accertare, che CLAUDE.md §4
        chiede di marcare esplicitamente: continua a esistere accanto al
        parametro, dove chi lavora al progetto lo legge. Quello che cambia è il
        destinatario, come per le note di `/norme`.
      */}
    </li>
  )
}

/**
 * ⚠️ **`accanto` mette titolo e citazione sulla stessa riga**, ed è la forma
 * predefinita per le citazioni brevi.
 *
 * *Regola applicata* seguito a capo da *L. 30/12/2024 n. 207, art. 1 c. 6*
 * occupava due righe per dire una cosa sola, e l'etichetta senza due punti si
 * leggeva come un titolo di sezione: una gerarchia annunciata che il contenuto
 * — mezza riga di testo — non giustificava. Con i due punti e l'affiancamento
 * torna a essere quello che è, cioè una didascalia.
 *
 * Resta impilato quando le citazioni sono più d'una — il gate delle
 * addizionali ne ha due, una per tributo — perché lì l'elenco è la sostanza:
 * affiancarle a un'etichetta le farebbe leggere come una citazione sola spezzata
 * in due.
 */
export function Fonti({
  fonti,
  titolo,
  accanto = false,
}: {
  fonti: readonly Fonte[]
  titolo: string
  accanto?: boolean
}) {
  if (fonti.length === 0) return null

  const inLinea = accanto && fonti.length === 1

  return (
    <div className={`text-xs ${inLinea ? 'flex flex-wrap items-baseline gap-x-1.5' : ''}`}>
      <p className="font-medium text-inchiostro-nota select-none">{titolo}</p>
      <ul className={inLinea ? 'min-w-0' : 'mt-1 space-y-1'}>
        {fonti.map((f, i) => (
          <Citazione key={`${f.atto}-${f.riferimento ?? ''}-${i}`} fonte={f} />
        ))}
      </ul>
    </div>
  )
}
