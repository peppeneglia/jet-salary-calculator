/**
 * Il catalogo dei comuni che l'handler sa risolvere.
 *
 * **Non è un file di dati normativi.** Non contiene aliquote, soglie né
 * citazioni: gli enti impositori arrivano interi da `data/caso-base.ts`, e qui
 * si aggiunge soltanto la chiave con cui l'interfaccia li seleziona. È il
 * pezzo che `core/types.ts` descrive come «lettura di dati, non calcolo
 * fiscale»: trovare il comune sta a monte del motore.
 *
 * **È anche il punto di innesto del dataset MEF.** Quando i 7.897 comuni
 * entreranno nel repo, a cambiare sarà questa funzione — l'handler, la pagina
 * e il motore restano come sono.
 *
 * ⚠️ **Parametri non verificati.** I codici catastali qui sotto non sono stati
 * reperiti alla fonte (Agenzia delle Entrate / ISTAT): sono di uso corrente ma
 * non confermati su un atto. Vanno riverificati con l'import del dataset, che
 * ha il codice catastale come chiave e quindi li sostituirà con quelli
 * ministeriali. Segnalati qui e non taciuti, per la stessa ragione per cui il
 * motore non fa sparire in silenzio ciò che non modella (D-033).
 */

import type { EntiRisolti, Multilingua } from '../../core/types'
import { lombardia, milano } from '../../data/caso-base'

/**
 * Un comune del catalogo è una di due cose, e la differenza va detta.
 *
 * `calcolabile` — entrambi gli enti impositori sono risolti e il motore può
 * percorrere la catena intera.
 *
 * `nonCalcolabile` — il comune è nel catalogo, ma un ente impositore manca.
 * Non è un comune sconosciuto e non è un calcolo che dà zero: è un caso
 * riconosciuto che il perimetro attuale non copre, e il calcolatore lo dice
 * con la sua ragione invece di restituire un numero plausibile e sbagliato
 * (D-037).
 */
export type ComuneDelCatalogo =
  | {
      readonly stato: 'calcolabile'
      readonly codiceCatastale: string
      readonly nome: string
      readonly provincia: string
      readonly enti: EntiRisolti
    }
  | {
      readonly stato: 'nonCalcolabile'
      readonly codiceCatastale: string
      readonly nome: string
      readonly provincia: string
      readonly ragione: Multilingua
    }

/**
 * ⚠️ **Trento e Bolzano non sono calcolabili, ed è una scoperta della ricerca,
 * non una svista.**
 *
 * È una delle poche conclusioni che ha **falsificato una riga del perimetro** —
 * quella secondo cui la copertura Italia intera è dati e non struttura, e
 * quindi non può rompere il motore. Rompe la struttura: la mappatura non è
 * `comune → regione` ma `comune → ente impositore`, e per due province quel
 * soggetto non è una regione.
 *
 * Il testo è condiviso dai due comuni perché la ragione è la stessa: non
 * riguarda Trento o Bolzano, riguarda l'assetto del Trentino-Alto Adige.
 */
const trentinoAltoAdige: Multilingua = {
  it: 'In Trentino-Alto Adige l’addizionale «regionale» non la fissa la regione: la stabiliscono le due Province autonome, separatamente, ciascuna con le proprie aliquote. La regione, come soggetto che impone il tributo, non esiste. Il calcolatore conosce l’addizionale comunale di questi due comuni ma non quella provinciale, e applicare al suo posto l’aliquota lombarda produrrebbe un numero credibile e sbagliato. Preferiamo dirtelo.',
  en: 'In Trentino-Alto Adige the “regional” surcharge is not set by the region: it is set by the two autonomous Provinces, separately, each with its own rates. The region, as the authority levying the tax, does not exist. The calculator knows the addizionale comunale of these two municipalities but not the provincial one, and putting the Lombardy rate in its place would produce a credible, wrong number. We would rather tell you.',
}

const catalogo: readonly ComuneDelCatalogo[] = [
  {
    stato: 'calcolabile',
    codiceCatastale: 'F205',
    nome: 'Milano',
    provincia: 'MI',
    enti: { regionale: lombardia, comunale: milano },
  },
  {
    stato: 'nonCalcolabile',
    codiceCatastale: 'L378',
    nome: 'Trento',
    provincia: 'TN',
    ragione: trentinoAltoAdige,
  },
  {
    stato: 'nonCalcolabile',
    codiceCatastale: 'A952',
    nome: 'Bolzano',
    provincia: 'BZ',
    ragione: trentinoAltoAdige,
  },
] as const

/** Il codice catastale è la chiave: è quella del dataset MEF, non il nome. */
export const risolviComune = (codiceCatastale: string): ComuneDelCatalogo | undefined =>
  catalogo.find((c) => c.codiceCatastale === codiceCatastale.trim().toUpperCase())

/**
 * La forma che arriva al client: nome, provincia, codice e — se il calcolo non
 * è disponibile — **la ragione, già qui**.
 *
 * La ragione viaggia con la lista e non solo con la risposta d'errore, perché
 * D-037 chiede che questi comuni siano marcati **prima** della selezione: chi
 * apre l'elenco deve vedere il limite, non scoprirlo dopo aver premuto un
 * bottone.
 *
 * Gli enti impositori — aliquote, scaglioni, citazioni — non attraversano il
 * confine: restano server-side, che è la ragione per cui il progetto ha scelto
 * Next (D-004).
 */
export interface ComuneSelezionabile {
  readonly codiceCatastale: string
  readonly nome: string
  readonly provincia: string
  readonly calcolabile: boolean
  readonly ragione?: Multilingua
}

export const comuniSelezionabili = (): readonly ComuneSelezionabile[] =>
  catalogo.map((c) =>
    c.stato === 'calcolabile'
      ? {
          codiceCatastale: c.codiceCatastale,
          nome: c.nome,
          provincia: c.provincia,
          calcolabile: true,
        }
      : {
          codiceCatastale: c.codiceCatastale,
          nome: c.nome,
          provincia: c.provincia,
          calcolabile: false,
          ragione: c.ragione,
        },
  )
