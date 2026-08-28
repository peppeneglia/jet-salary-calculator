/**
 * Come la traccia si dispone in pagina.
 *
 * **Non calcola nulla.** Non somma, non filtra via, non deriva: percorre
 * `Risultato.passi` una volta sola, nell'ordine in cui il motore li ha emessi,
 * e li dispone in blocchi. Ogni passo che entra esce, e nessuno cambia valore.
 *
 * Due tipi di blocco, perché i passi sono di due specie:
 *
 * - i passi **con natura** sono le voci del dettaglio, e vanno raggruppati
 *   nelle quattro nature;
 * - i passi **senza natura** — la RAL, il reddito complessivo, il gate delle
 *   addizionali — non sono voci: sono passaggi. Espongono una grandezza
 *   intermedia o l'esito di una verifica, e vanno mostrati **al proprio posto
 *   nella sequenza**, non raccolti in fondo. Un gate che si apre resta un
 *   passaggio da mostrare: nasconderlo quando l'esito è positivo lo
 *   trasformerebbe in un messaggio d'errore, che non è.
 *
 * Il gruppo nasce dove la sua prima voce compare, così l'ordine dei blocchi è
 * quello della catena di calcolo e non un ordine deciso qui.
 */

import type { Natura, Passo } from '../../core/types'

export type Blocco =
  | { readonly tipo: 'passaggio'; readonly passo: Passo }
  | { readonly tipo: 'gruppo'; readonly natura: Natura; readonly passi: readonly Passo[] }

export function disponiInBlocchi(passi: readonly Passo[]): readonly Blocco[] {
  const blocchi: Blocco[] = []
  const gruppi = new Map<Natura, Passo[]>()

  for (const passo of passi) {
    if (passo.natura === undefined) {
      blocchi.push({ tipo: 'passaggio', passo })
      continue
    }

    const esistente = gruppi.get(passo.natura)
    if (esistente !== undefined) {
      esistente.push(passo)
      continue
    }

    // Prima voce di questa natura: il gruppo nasce qui, e il suo array resta
    // condiviso con la mappa, così le voci successive lo riempiono sul posto.
    const nuovo: Passo[] = [passo]
    gruppi.set(passo.natura, nuovo)
    blocchi.push({ tipo: 'gruppo', natura: passo.natura, passi: nuovo })
  }

  return blocchi
}
