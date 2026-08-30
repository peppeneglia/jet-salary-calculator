/**
 * Da errore a frase — D-043.
 *
 * ⚠️ Il registro: dicono cosa fare, non cosa è andato storto. *Inserisci lo
 * stipendio lordo annuo, per esempio 30.000* e non *campo obbligatorio*. Nessun
 * codice visibile: `ral-implausibile` è vocabolario nostro, e chi legge il
 * proprio stipendio non deve incontrarlo mai. Vale la nota di D-039 sul
 * registro — chi legge è un dipendente, non chi valuta la prova.
 *
 * Una funzione sola per due provenienze. Lo stesso errore può nascere nel
 * client, prima che l'handler sia chiamato, o tornare dall'handler: se le frasi
 * fossero due, la stessa RAL rifiutata direbbe due cose diverse a seconda di
 * dove è stata rifiutata.
 */

import type { TFunction } from 'i18next'
import type { CodiceLingua } from '../../core/types'
import type { SPAZIO } from '../_i18n/istanza'
import type { Errore } from './api'
import { formato } from './formato'

export function messaggioErrore(
  errore: Errore,
  t: TFunction<typeof SPAZIO>,
  lingua: CodiceLingua,
): string {
  const { inEuro } = formato(lingua)

  switch (errore.codice) {
    case 'ral-mancante':
      return t('errori.ralMancante')
    case 'ral-non-numerica':
      return t('errori.ralNonNumerica')
    case 'ral-non-positiva':
      return t('errori.ralNonPositiva')
    case 'ral-implausibile':
      return t('errori.ralImplausibile', {
        importo: inEuro(errore.ral),
        soglia: inEuro(errore.soglia),
      })
    case 'comune-mancante':
      return t('errori.comuneMancante')
    case 'comune-sconosciuto':
      return t('errori.comuneSconosciuto')
    case 'comune-non-calcolabile':
      // ⚠️ La ragione non si riformula qui. È la stessa frase che l'elenco
      // mostra prima della selezione (D-037), e riscriverla per l'occasione
      // creerebbe due versioni della stessa spiegazione, libere di divergere.
      return `${t('input.comuneNonCalcolabile', { comune: errore.nome })} ${errore.ragione[lingua]}`
    case 'contratto-non-valido':
      return t('errori.contrattoNonValido')
    case 'mensilita-non-valida':
      return t('errori.mensilitaNonValida')
    case 'rete':
      return t('errori.rete')
  }
}
