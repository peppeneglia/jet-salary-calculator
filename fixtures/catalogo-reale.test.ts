/**
 * Il motore percorso su tutti e 7.897 i comuni veri.
 *
 * Gli scenari di `core/calcola.test.ts` usano parametri sintetici e non toccano
 * mai una struttura reale. Qui non si verifica un valore — per 7.897 comuni non
 * esiste un atteso — ma invarianti che nessun risultato corretto può violare.
 *
 * Prende la classe di difetto dell'import: la cella slittata di colonna, la
 * virgola scambiata col punto. Errori che passano i cinque controlli di
 * consistenza, perché quelli contano righe e non calcolano. ⚠️ Non prende
 * un'aliquota sbagliata ma plausibile.
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import { comuniSelezionabili, coperturaComuni, risolviComune } from '../app/_lib/comuni'
import { regime2026 } from '../data/regime-2026'

/** Tre RAL per accendere rami diversi in ogni comune: ~23.700 calcoli. */
const RAL_DI_PROVA = [9_000, 30_000, 90_000] as const

/** L'aliquota comunale più alta che il dataset contiene, dissesti compresi. */
const ALIQUOTA_COMUNALE_MASSIMA = 1.5
/** Idem per la regionale: il massimo misurato è 3,63%, e resta margine. */
const ALIQUOTA_REGIONALE_MASSIMA = 4

/** Il limite predefinito di cinque secondi non basta per ~7.900 calcoli. */
const LIMITE = 60_000

describe('il motore regge tutti e 7.897 i comuni', () => {
  const catalogo = comuniSelezionabili()

  it('il catalogo è quello atteso, e uno solo non è calcolabile', () => {
    expect(catalogo).toHaveLength(7_897)
    expect(catalogo.filter((c) => !c.calcolabile)).toHaveLength(1)
    expect(coperturaComuni.totale).toBe(7_897)
    expect(coperturaComuni.calcolabili).toBe(7_896)
    expect(coperturaComuni.nonCalcolabili).toBe(1)
  })

  it.each(RAL_DI_PROVA)('a RAL %i ogni comune calcolabile produce un numero sensato', (ral) => {
    const rotti: string[] = []

    for (const comune of catalogo) {
      if (!comune.calcolabile) continue
      const esito = eseguiCalcolo({
        ral,
        codiceCatastale: comune.codiceCatastale,
        tipoContratto: 'indeterminato',
        mensilita: 13,
      })

      if (esito.stato !== 'ok') {
        rotti.push(`${comune.codiceCatastale} ${comune.nome}: errore ${esito.errore.codice}`)
        continue
      }

      const { nettoAnnuo, grandezze } = esito.risultato
      const dice = (m: string) => rotti.push(`${comune.codiceCatastale} ${comune.nome}: ${m}`)

      // Un numero, non un NaN: è la forma in cui si manifesta una colonna
      // slittata o una virgola letta come separatore di migliaia.
      if (!Number.isFinite(nettoAnnuo)) dice(`netto non finito (${nettoAnnuo})`)

      // Il netto non può superare il lordo: i contributi si pagano sempre.
      // ⚠️ Ma può superarlo in fascia bassa, perché il ramo che aggiunge
      // eroga somme che non concorrono al reddito — a RAL 9.000 il netto è
      // legittimamente più alto della RAL. L'invariante vale solo dove quelle
      // due voci non spettano.
      if (ral > regime2026.cuneo.somma.sogliaAccesso.valore * 1.5 && nettoAnnuo > ral) {
        dice(`netto ${nettoAnnuo.toFixed(2)} sopra la RAL ${ral} fuori dal ramo che aggiunge`)
      }

      // Nessuno paga più di quanto guadagna.
      if (nettoAnnuo < 0) dice(`netto negativo (${nettoAnnuo.toFixed(2)})`)

      // Il reddito complessivo è il lordo meno i contributi: sta fra i due.
      const rc = grandezze.redditoComplessivo
      if (rc <= 0 || rc > ral) dice(`reddito complessivo fuori scala (${rc})`)
    }

    expect(rotti.slice(0, 20), `${rotti.length} comuni rotti (primi 20)`).toEqual([])
  }, LIMITE)

  // Il controllo che vede la virgola scambiata col punto: un'aliquota letta
  // come `123` invece di `1,23` lascerebbe il netto un numero plausibile, ma
  // sfonderebbe questo tetto.
  it.each(RAL_DI_PROVA)('a RAL %i nessuna addizionale supera il proprio tetto', (ral) => {
    const fuori: string[] = []

    for (const comune of comuniSelezionabili()) {
      if (!comune.calcolabile) continue
      const esito = eseguiCalcolo({
        ral,
        codiceCatastale: comune.codiceCatastale,
        tipoContratto: 'indeterminato',
        mensilita: 13,
      })
      if (esito.stato !== 'ok') continue

      const rc = esito.risultato.grandezze.redditoComplessivo
      for (const passo of esito.risultato.passi) {
        if (passo.esito.stato !== 'applicato') continue
        const tetto =
          passo.id === 'addizionale-comunale'
            ? (rc * ALIQUOTA_COMUNALE_MASSIMA) / 100
            : passo.id === 'addizionale-regionale'
              ? (rc * ALIQUOTA_REGIONALE_MASSIMA) / 100
              : null
        if (tetto === null) continue

        const dovuta = -passo.esito.effettoSulNetto
        if (dovuta > tetto) {
          fuori.push(
            `${comune.codiceCatastale} ${comune.nome}: ${passo.id} = ${dovuta.toFixed(2)} su base ${rc.toFixed(2)}, tetto ${tetto.toFixed(2)}`,
          )
        }
      }
    }

    expect(fuori.slice(0, 20), `${fuori.length} addizionali oltre il tetto (prime 20)`).toEqual([])
  }, LIMITE)

  // Passo grosso su tutti i comuni, non passo fine su cinque: prende l'ente il
  // cui parametro è così storto da invertire la monotonia.
  it('fra 30.000 e 90.000 il netto cresce, in ogni comune', () => {
    const invertiti: string[] = []

    for (const comune of comuniSelezionabili()) {
      if (!comune.calcolabile) continue
      const netti = RAL_DI_PROVA.map((ral) => {
        const e = eseguiCalcolo({
          ral,
          codiceCatastale: comune.codiceCatastale,
          tipoContratto: 'indeterminato',
          mensilita: 13,
        })
        return e.stato === 'ok' ? e.risultato.nettoAnnuo : Number.NaN
      })

      // Si confrontano solo le due RAL alte: fra 9.000 e 30.000 stanno le
      // discontinuità dichiarate del ramo che aggiunge, e lì la caduta è
      // legittima — la copre `discontinuita.test.ts`.
      if (netti[2] <= netti[1]) {
        invertiti.push(`${comune.codiceCatastale} ${comune.nome}: ${netti[1]} → ${netti[2]}`)
      }
    }

    expect(invertiti.slice(0, 20), `${invertiti.length} comuni con netto non crescente`).toEqual([])
  }, LIMITE)

  // Castegnero Nanto deve restare un errore: il c. 752 rinvia a un anno in cui
  // il suo territorio aveva due aliquote, e sceglierne una è una decisione.
  it('il comune non calcolabile resta un errore, non un calcolo a zero', () => {
    const nonCalcolabile = comuniSelezionabili().find((c) => !c.calcolabile)
    expect(nonCalcolabile).toBeDefined()

    const risolto = risolviComune(nonCalcolabile!.codiceCatastale)
    expect(risolto?.stato).toBe('nonCalcolabile')

    const esito = eseguiCalcolo({
      ral: 30_000,
      codiceCatastale: nonCalcolabile!.codiceCatastale,
      tipoContratto: 'indeterminato',
      mensilita: 13,
    })
    expect(esito.stato).toBe('errore')
    if (esito.stato !== 'errore') return
    expect(esito.errore.codice).toBe('comune-non-calcolabile')
    expect(esito.http).toBe(422)
  })
})
