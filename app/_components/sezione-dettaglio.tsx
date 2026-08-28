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
import { disponiInBlocchi } from '../_lib/blocchi'
import { NATURE } from '../_lib/testi'
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
  return (
    <div className="rounded-blocco border border-bordo bg-carta px-5 py-4">
      <p className="text-xs font-medium text-inchiostro-tenue/80">{tributo}</p>
      <p className="mt-0.5 font-medium text-inchiostro">{ente.nome}</p>

      {ente.stato === 'nonIstituito' ? (
        <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
          Qui questa addizionale non esiste proprio. È diverso da un’aliquota fissata a zero: in un
          caso il tributo non è mai stato introdotto, nell’altro è stato introdotto e poi azzerato.
          Per te il risultato è lo stesso, ma non sono la stessa cosa.
        </p>
      ) : null}

      {ente.stato === 'deliberato' ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
            Aliquote decise dall’ente per il {ente.annoDelibera}.
          </p>
          <div className="mt-3">
            <Fonti fonti={[ente.fonte]} titolo="Da dove vengono le aliquote" />
          </div>
        </>
      ) : null}

      {ente.stato === 'ereditato' ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-inchiostro-tenue">
            Per quest’anno l’ente non ha deliberato nuove aliquote, quindi per legge restano quelle
            del {ente.annoDiProvenienza}. Non vuol dire che non si paga: si continua con le
            aliquote precedenti, ed è quello che succede alla maggior parte dei comuni.
          </p>
          <div className="mt-3 space-y-2">
            <Fonti fonti={[ente.normaDiFallback]} titolo="La norma che lo prevede" />
            <Fonti fonti={[ente.fonte]} titolo="Da dove vengono le aliquote" />
          </div>
        </>
      ) : null}
    </div>
  )
}

export function SezioneDettaglio({ risultato }: { risultato: Risultato }) {
  const blocchi = disponiInBlocchi(risultato.passi)

  return (
    <Sezione
      numero="3"
      titolo="Dove vanno i tuoi soldi"
      occhiello="Ogni voce con la regola che la determina e la norma da cui viene il numero. Ci sono anche i passaggi intermedi: servono a far tornare i conti."
    >
      <div className="space-y-8">
        <ol className="space-y-4">
          {blocchi.map((blocco, i) =>
            blocco.tipo === 'passaggio' ? (
              /*
                Un passo senza natura non è una voce: è un passaggio. Sta al
                proprio posto nella sequenza, non raccolto in fondo — e un gate
                si mostra anche quando si apre, altrimenti apparirebbe solo per
                dare cattive notizie.
              */
              <RigaPasso key={blocco.passo.id} passo={blocco.passo} />
            ) : (
              <li key={`${blocco.natura}-${i}`}>
                <div className="rounded-sezione border border-bordo bg-fondo p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-inchiostro">
                      {NATURE[blocco.natura].titolo}
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        blocco.natura === 'aggiunge' ? 'text-verde-scuro' : 'text-inchiostro-tenue'
                      }`}
                    >
                      {NATURE[blocco.natura].destinazione}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
                    {NATURE[blocco.natura].spiegazione}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {blocco.passi.map((p) => (
                      <RigaPasso key={p.id} passo={p} />
                    ))}
                  </ul>
                </div>
              </li>
            ),
          )}
        </ol>

        <div>
          <h3 className="text-sm font-semibold tracking-tight text-inchiostro">
            Chi incassa le addizionali, e come sono state fissate
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-inchiostro-tenue">
            Le addizionali dipendono da dove vivi, e non tutti gli enti le fissano allo stesso
            modo: alcuni deliberano ogni anno, altri lasciano in vigore quelle dell’anno prima.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SchedaEnte ente={risultato.enti.regionale} tributo="Addizionale regionale" />
            <SchedaEnte ente={risultato.enti.comunale} tributo="Addizionale comunale" />
          </div>
        </div>
      </div>
    </Sezione>
  )
}
