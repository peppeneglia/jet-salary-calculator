/**
 * La rete di ancoraggio: 120 netti calcolati, fissati a quattro decimali.
 *
 * ⚠️ Non dimostra che i numeri siano giusti: i valori attesi li ha prodotti
 * il motore stesso. Serve a rendere visibile qualunque parametro che si muove —
 * al 30/08 un mutation test mostrava 13 parametri su 19 corrompibili senza che
 * un solo test se ne accorgesse. Un fallimento qui significa «un numero si è
 * mosso, dimmi perché», non «c'è un difetto».
 *
 * Le discontinuità stanno sul reddito complessivo, non sulla RAL: RC = RAL ×
 * (1 − 0,0919), quindi le RAL di confine non sono tonde. Dove serve compaiono
 * in coppia, il confine e un centesimo sopra.
 *
 * I comuni sono veri e coprono le forme del dataset: Milano (unica più soglia),
 * Agordo (scaglioni), Acquaviva Platani (nessuna comunale), Ayas (soglia
 * regionale), Trento (Provincia autonoma).
 */

import { describe, expect, it } from 'vitest'

import { eseguiCalcolo } from '../app/_lib/calcolo'
import type { Mensilita, TipoContratto } from '../core/types'

/** Quattro decimali: è la precisione con cui il progetto dichiara il caso base. */
const DECIMALI = 4

const netto = (
  ral: number,
  codiceCatastale: string,
  tipoContratto: TipoContratto = 'indeterminato',
  mensilita: Mensilita = 13,
): number => {
  const esito = eseguiCalcolo({ ral, codiceCatastale, tipoContratto, mensilita })
  if (esito.stato !== 'ok') throw new Error(`${codiceCatastale} a ${ral}: ${esito.errore.codice}`)
  return esito.risultato.nettoAnnuo
}

/** La ragione accanto a ogni RAL dice cosa si perde togliendo la riga. */
const RAL: readonly (readonly [number, string])[] = [
  [5_000, 'incapiente: IRPEF netta zero, gate delle addizionali chiuso'],
  [9_360.2026, 'RC 8.500 esatti — confine fra le fasce 7,1% e 5,3% della somma'],
  [9_360.21, 'un centesimo sopra: il gradino deve esserci'],
  [12_000, 'fascia bassa, sotto la soglia di esenzione comunale di Milano'],
  [16_518.0046, 'RC 15.000 — confine 5,3%/4,8% e soglia del trattamento integrativo'],
  [16_518.01, 'un centesimo sopra: qui cadono due cose insieme'],
  [20_000, 'fra le due soglie del cuneo'],
  [22_024.0062, 'RC 20.000 — soglia di accesso alla somma, «non superiore a»'],
  [22_024.02, 'un centesimo sopra: subentra la detrazione, «superiore a»'],
  [25_327.6071, 'RC 23.000 — soglia di esenzione comunale di Milano'],
  [25_327.62, 'un centesimo sopra: il cliff da −184 € sull’intera base'],
  [27_530.0077, 'RC 25.000 — inizio dell’incremento di 65 €'],
  [30_000, 'il caso base del progetto'],
  [30_833.6086, 'RC 28.000 — primo confine di scaglione IRPEF'],
  [35_238.4099, 'RC 32.000 — inizio della decrescenza della detrazione da cuneo'],
  [38_542.0108, 'RC 35.000 — fine dell’incremento di 65 €'],
  [44_048.0123, 'RC 40.000 — fine della detrazione da cuneo'],
  [55_060.0154, 'RC 50.000 — secondo confine di scaglione IRPEF'],
  [56_224, 'soglia della quota aggiuntiva 1%, che si misura sulla RAL'],
  [56_224.01, 'un centesimo sopra: la quota aggiuntiva morde'],
  [70_000, 'fascia alta, con quota aggiuntiva'],
  [120_000, 'oltre ogni soglia dichiarata'],
]

const ATTESI: Readonly<Record<string, readonly number[]>> = {
  // F205 Milano — unica 0,8%, esenzione 23.000
  F205: [
    4_862.8755, 10_303.49997971526, 10_045.9554325007, 11_989.360040000001,
    15_315.499981564682, 15_185.3849155382, 17_432.529400000003, 18_778.70702279192,
    18_778.7164742604, 20_582.774005603962, 20_582.7827469564, 21_892.032994306493,
    23_425.4846, 23_921.09997736029, 26_152.87101569276, 27_386.938003888103,
    29_551.794984213673, 35_131.69999016035, 35_707.45574368, 35_707.460635630705,
    42_446.607028, 66_906.36052799999,
  ],
  // A083 Agordo — scaglioni previgenti, esenzione 10.000
  A083: [
    4_862.8755, 10_303.49997971526, 10_045.9554325007, 11_920.707680000001,
    15_220.999981707944, 15_090.884895526098, 17_325.0652, 18_663.70702266802,
    18_663.7164227562, 20_639.474005633252, 20_639.482792672203, 21_956.532994276735,
    23_498.7323, 23_997.299977241964, 26_249.07101584371, 27_498.138003925505,
    29_687.994984061825, 35_317.89999008405, 35_898.940815680005, 35_898.94575253571,
    42_699.953228, 67_384.23172799998,
  ],
  // A049 Acquaviva Platani — nessuna addizionale comunale applicabile
  A049: [
    4_862.8755, 10_303.49997971526, 10_045.9554325007, 11_989.360040000001,
    15_315.499981564682, 15_185.384932621699, 17_443.596400000002, 18_796.20702289769,
    18_796.2165182274, 20_794.774005690328, 20_794.7828817594, 22_127.032994218745,
    23_686.2791, 24_190.59997701138, 26_473.97101608221, 27_746.738003984596,
    29_976.094983821902, 35_684.99998996349, 36_274.49693088001, 36_274.50193958371,
    43_174.487148, 68_218.00564799999,
  ],
  // A094 Ayas — Valle d'Aosta, unico ente con soglia di esenzione regionale
  A094: [
    4_862.8755, 10_303.49997971526, 10_150.505514923, 12_123.395600000002,
    15_499.99998128498, 15_185.384932621699, 17_443.596400000002, 18_796.20702289769,
    18_796.2165182274, 20_794.774005690328, 20_794.7828817594, 22_127.032994218745,
    23_686.2791, 24_190.59997701138, 26_473.97101608221, 27_746.738003984596,
    29_976.094983821902, 35_684.99998996349, 36_274.49693088001, 36_274.50193958371,
    43_174.487148, 68_218.00564799999,
  ],
  // L378 Trento — Provincia autonoma, comunale mai istituita
  L378: [
    4_862.8755, 10_303.49997971526, 10_150.505514923, 12_123.395600000002,
    15_499.99998128498, 15_369.884992657999, 17_666.989, 19_042.2070232694,
    19_042.21667274, 21_077.6740057827, 21_077.68302594, 22_434.532994124897,
    24_021.368, 24_534.9999766382, 26_473.97101608221, 27_746.738003984596,
    29_976.094983821902, 35_684.99998996349, 36_269.21185888001, 36_269.21682267871,
    43_107.340948, 67_926.334448,
  ],
}

describe('la rete di ancoraggio: nessun parametro si muove in silenzio', () => {
  for (const [codice, attesi] of Object.entries(ATTESI)) {
    describe(codice, () => {
      it.each(RAL.map((r, i) => ({ ral: r[0], perche: r[1], atteso: attesi[i] })))(
        'RAL $ral — $perche',
        ({ ral, atteso }) => {
          expect(netto(ral, codice)).toBeCloseTo(atteso, DECIMALI)
        },
      )
    })
  }
})

/** L'unico ramo in cui `aliquotaApprendista` entra nel conto. */
describe('apprendistato — l’unico ramo che tocca l’aliquota ridotta', () => {
  const ATTESI_APPRENDISTA: readonly (readonly [number, number])[] = [
    [12_000, 12_315.26144],
    [20_000, 17_908.7184],
    [30_000, 24_059.4274],
    [56_224.01, 36_733.4054469052],
    [70_000, 43_723.928528000004],
  ]

  it.each(ATTESI_APPRENDISTA.map(([ral, atteso]) => ({ ral, atteso })))(
    'RAL $ral a Milano, contratto di apprendistato',
    ({ ral, atteso }) => {
      expect(netto(ral, 'F205', 'apprendistato')).toBeCloseTo(atteso, DECIMALI)
    },
  )

  // La pagina lo afferma a chi legge: il contributo in più sul contratto a
  // termine lo paga l'azienda. Se smettesse di essere vero, quella nota
  // diventerebbe falsa senza che nulla se ne accorga.
  it('determinato e indeterminato danno lo stesso netto', () => {
    for (const ral of [12_000, 30_000, 70_000]) {
      expect(netto(ral, 'F205', 'determinato')).toBeCloseTo(netto(ral, 'F205', 'indeterminato'), 10)
    }
  })
})

/**
 * Il gate del trattamento integrativo.
 *
 * Lo scarto di 75 € sulla condizione di capienza morde in una banda larga meno
 * di cinque euro di RAL, e il mutation test lo trovava cieco. Nella prima fascia
 * la capienza si ribalta a `(1.955 − scarto) / 23%` di reddito complessivo:
 * RAL 9.001,12 con lo scarto a 75, RAL 8.996,33 con lo scarto a 76. Le due RAL
 * qui sotto stanno una per lato di quel confine.
 */
describe('il gate del trattamento integrativo: 75 € di scarto, quattro euro di banda', () => {
  it('a RAL 8.999 l’imposta lorda non arriva alla soglia: il TI non spetta', () => {
    expect(netto(8_999, 'F205')).toBeCloseTo(8_752.2033, DECIMALI)
  })

  it('a RAL 9.002 la supera, e il TI vale 1.200 € interi', () => {
    expect(netto(9_002, 'F205')).toBeCloseTo(9_955.1211, DECIMALI)
  })

  // La condizione è binaria (D-039): il trattamento non si riduce
  // avvicinandosi alla soglia, c'è o non c'è.
  it('fra i due lati del confine il salto vale l’intero importo, non una frazione', () => {
    const salto = netto(9_002, 'F205') - netto(8_999, 'F205')
    expect(salto).toBeGreaterThan(1_200)
    expect(salto).toBeLessThan(1_210)
  })
})

/**
 * `detrazioneLavoroDipendente.minimi` è l'unico parametro del regime che
 * `core/calcola.ts` non legge: l'art. 13 c. 1 lett. a) lo prevede per il
 * rapporto inferiore all'anno, fuori dal perimetro. Il test fissa il fatto, così
 * se un giorno il motore cominciasse a usarlo si saprebbe che è una scelta.
 */
describe('i minimi di detrazione restano fuori dal perimetro', () => {
  it('nessun passo della traccia li applica, a nessuna RAL', () => {
    for (const ral of [5_000, 12_000, 30_000]) {
      const esito = eseguiCalcolo({
        ral,
        codiceCatastale: 'F205',
        tipoContratto: 'determinato',
        mensilita: 13,
      })
      expect(esito.stato).toBe('ok')
      if (esito.stato !== 'ok') return
      const importi = esito.risultato.passi.flatMap((p) => [p, ...(p.dettaglio ?? [])])
        .map((p) => (p.parametro?.tipo === 'importo' ? Number(p.parametro.valore) : null))
      expect(importi).not.toContain(690)
      expect(importi).not.toContain(1_380)
    }
  })
})
