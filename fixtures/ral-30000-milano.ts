/**
 * Fixture: un `Risultato` scritto a mano per RAL 30.000 a Milano.
 *
 * È il contratto fra motore e interfaccia. Il frontend si costruisce sopra
 * questo oggetto; quando il motore esisterà, a cambiare sarà un import, non il
 * markup.
 *
 * Vive fuori da `core/` perché un `Risultato` scritto a mano non è né motore né
 * parametro normativo: è il contratto fra i due livelli, e i contratti non
 * vivono dentro una delle due parti (D-030). Da qui può importare entrambi,
 * quindi nessun valore normativo è riscritto: aliquote, soglie e citazioni
 * arrivano da `data/`, e restano hand-written solo i risultati del calcolo, che
 * per definizione in `data/` non ci sono.
 *
 * ⚠️ I numeri calcolati sono derivati a mano e sono plausibili, non
 * certificati. Non sostituiscono i casi di test, che vanno costruiti sulle
 * discontinuità con valori derivati dalla norma (D-007).
 *
 * Caso: RAL 30.000, Milano, tempo indeterminato, 13 mensilità, anno d'imposta 2026.
 * - addizionale regionale Lombardia, scaglioni previgenti, progressiva
 * - addizionale comunale Milano, aliquota unica 0,8% con esenzione a 23.000,
 *   ereditata dal 2025 per il fallback del c. 752
 */

import {
  annoImposta,
  euro,
  redditoComplessivo,
  redditoLavoroDipendente,
  retribuzionePrevidenziale,
  type Passo,
  type Risultato,
} from '../core/types'
import {
  aliquoteLombardia,
  aliquotaComunaleMilano,
  elencoComunaleAnnuale2025,
  lombardia,
  milano,
  prospettoRegionaleMef,
  sogliaEsenzioneMilano,
} from '../data/caso-base'
import { assunzioni as catalogoAssunzioni } from '../data/assunzioni'
import {
  detrazioneArt13Fascia15000a28000,
  detrazioneCuneoPiena,
  regime2026,
} from '../data/regime-2026'

const regole = regime2026.fontiRegola

// La traccia

const passi: readonly Passo[] = [
  {
    id: 'ral',
    etichetta: 'Retribuzione annua lorda',
    // Nessuna `fonti`: la RAL è un input, non l'applicazione di una norma.
    regola: 'Punto di partenza dichiarato dall\'utente.',
    spiegazione:
      'La RAL comprende già le mensilità aggiuntive: il netto annuo non cambia con 12, 13 o 14 mensilità, cambia solo il divisore.',
    esito: {
      stato: 'applicato',
      entra: euro(30_000),
      esce: euro(30_000),
      effettoSulNetto: euro(0),
      segno: 'neutro',
    },
  },

  {
    id: 'contributi-ivs',
    etichetta: 'Contributi previdenziali IVS',
    natura: 'previdenza',
    regola:
      'Aliquota a carico del lavoratore sulla retribuzione imponibile, assunta al lordo di qualsiasi contributo e trattenuta.',
    spiegazione:
      'Non è una tassa: è contribuzione che genera un diritto pensionistico. Esce dalla busta e torna come prestazione futura.',
    fonti: regole['aliquota-ivs'],
    parametro: {
      tipo: 'aliquota',
      valore: regime2026.contributi.aliquotaOrdinaria.valore,
      fonte: regime2026.contributi.aliquotaOrdinaria.fonte,
    },
    esito: {
      stato: 'applicato',
      entra: euro(30_000),
      esce: euro(2_757),
      effettoSulNetto: euro(-2_757),
      segno: 'sottrae',
    },
    dettaglio: [
      {
        id: 'base-contributiva',
        etichetta: 'Base contributiva',
        regola:
          'Le somme si assumono al lordo di qualsiasi contributo e trattenuta: la base è la retribuzione lorda.',
        spiegazione:
          'Nel caso standard coincide con la RAL, e non per approssimazione: tutte le voci escluse dalla legge sono già fuori dal perimetro del calcolatore.',
        fonti: regole['base-contributiva'],
        esito: {
          stato: 'applicato',
          entra: euro(30_000),
          esce: euro(30_000),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
    ],
  },

  {
    id: 'quota-aggiuntiva-1',
    etichetta: 'Quota aggiuntiva 1%',
    natura: 'previdenza',
    regola:
      'Aliquota aggiuntiva di un punto percentuale sulle quote di retribuzione eccedenti il limite della prima fascia di retribuzione pensionabile, per i regimi con aliquote a carico del lavoratore inferiori al 10 per cento.',
    spiegazione:
      'È l\'unica soglia del ramo contributivo. Sotto la prima fascia non si applica: qui la retribuzione non la raggiunge.',
    // La legge stabilisce il diritto, la circolare dà il parametro.
    fonti: regole['quota-aggiuntiva'],
    parametro: {
      tipo: 'soglia',
      valore: regime2026.contributi.quotaAggiuntiva.sogliaPrimaFascia.valore,
      fonte: regime2026.contributi.quotaAggiuntiva.sogliaPrimaFascia.fonte,
    },
    esito: {
      stato: 'nonDovuto',
      ragione:
        'La retribuzione imponibile (30.000,00) non supera la prima fascia di retribuzione pensionabile 2026, pari a 56.224,00.',
    },
  },

  {
    id: 'reddito-complessivo',
    etichetta: 'Reddito complessivo',
    regola:
      'I contributi previdenziali obbligatori non concorrono a formare il reddito: è un\'esclusione, non una deduzione.',
    spiegazione:
      'Il reddito su cui si calcolano le imposte nasce già al netto dei contributi. Per questo il loro impatto sul netto è maggiore del loro valore nominale: abbassano anche l\'imposta.',
    fonti: regole['esclusione-contributi-dal-reddito'],
    esito: {
      stato: 'applicato',
      entra: euro(30_000),
      esce: euro(27_243),
      effettoSulNetto: euro(0),
      segno: 'neutro',
    },
  },

  {
    id: 'irpef',
    etichetta: 'IRPEF',
    natura: 'erariale',
    regola:
      'Imposta progressiva per scaglioni sul reddito complessivo al netto degli oneri deducibili, ridotta dalle detrazioni fino alla concorrenza dell\'imposta lorda.',
    spiegazione:
      'L\'imposta erariale, quella che va allo Stato. Le detrazioni non sono una trattenuta: riducono l\'imposta già calcolata, e non possono portarla sotto zero.',
    esito: {
      stato: 'applicato',
      entra: euro(27_243),
      esce: euro(3_221.63),
      effettoSulNetto: euro(-3_221.63),
      segno: 'sottrae',
    },
    dettaglio: [
      {
        id: 'irpef-lorda',
        etichetta: 'IRPEF lorda',
        regola: 'Aliquote per scaglioni di reddito.',
        spiegazione:
          'Il reddito resta interamente nel primo scaglione, che arriva a 28.000: si applica il 23%.',
        fonti: regole['scaglioni-irpef'],
        parametro: {
          tipo: 'scaglioni',
          valore: { forma: 'scaglioni-vigenti', scaglioni: regime2026.irpef.scaglioni.valore },
          fonte: regime2026.irpef.scaglioni.fonte,
        },
        esito: {
          stato: 'applicato',
          entra: euro(27_243),
          esce: euro(6_265.89),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
      {
        id: 'detrazione-art-13',
        etichetta: 'Detrazione per lavoro dipendente',
        regola:
          'Detrazione decrescente sulla fascia di reddito complessivo da 15.000 a 28.000; il risultato del rapporto si assume nelle prime quattro cifre decimali.',
        spiegazione:
          'Non è una trattenuta: è uno sconto sull\'imposta. Decresce al crescere del reddito, quindi ogni euro in più di RAL viene tassato e riduce anche la detrazione.',
        // Due regole in un passo solo: la detrazione e il troncamento del suo rapporto.
        fonti: [...regole['detrazione-lavoro-dipendente'], ...regole['troncamento-rapporti']],
        parametro: {
          tipo: 'formula',
          espressione: detrazioneArt13Fascia15000a28000.espressione,
          applicata: '1.910 + 1.190 × 0,0582 = 1.979,26',
          fonte: regime2026.detrazioneLavoroDipendente.fasce.fonte,
        },
        esito: {
          stato: 'applicato',
          entra: euro(27_243),
          esce: euro(2_044.26),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
        dettaglio: [
          {
            id: 'detrazione-art-13-incremento',
            etichetta: 'Incremento fascia 25.000–35.000',
            regola: 'La detrazione spettante ai sensi del comma 1 è aumentata di 65 euro.',
            spiegazione:
              'Un importo fisso che compare a 25.000 e sparisce a 35.000: è un gradino, non una curva.',
            parametro: {
              tipo: 'importo',
              valore: regime2026.detrazioneLavoroDipendente.incrementoFasciaIntermedia.valore.importo,
              fonte: regime2026.detrazioneLavoroDipendente.incrementoFasciaIntermedia.fonte,
            },
            esito: {
              stato: 'applicato',
              entra: euro(1_979.26),
              esce: euro(2_044.26),
              effettoSulNetto: euro(0),
              segno: 'neutro',
            },
          },
        ],
      },
      {
        id: 'detrazione-cuneo',
        etichetta: 'Ulteriore detrazione (cuneo)',
        regola:
          'Ulteriore detrazione dall\'imposta lorda per reddito complessivo superiore a 20.000 e non superiore a 32.000.',
        spiegazione:
          'La seconda gamba del taglio del cuneo fiscale: sotto i 20.000 è una somma erogata, sopra diventa una detrazione.',
        fonti: regole['detrazione-cuneo'],
        parametro: {
          tipo: 'importo',
          valore: detrazioneCuneoPiena,
          fonte: regime2026.cuneo.detrazione.fasce.fonte,
        },
        esito: {
          stato: 'applicato',
          entra: euro(2_044.26),
          esce: euro(3_044.26),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
      {
        id: 'irpef-netta',
        etichetta: 'IRPEF netta',
        regola:
          'Le detrazioni si operano sull\'imposta lorda fino alla concorrenza del suo ammontare.',
        spiegazione:
          'Le detrazioni non generano credito: l\'imposta ha un pavimento a zero. Qui la capienza c\'è, con margine.',
        fonti: regole['pavimento-imposta-netta'],
        esito: {
          stato: 'applicato',
          entra: euro(6_265.89),
          esce: euro(3_221.63),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
    ],
  },

  {
    id: 'gate-addizionali',
    etichetta: 'Le addizionali sono dovute',
    regola:
      'Le addizionali sono dovute se, per lo stesso anno, l\'IRPEF al netto delle detrazioni e dei crediti risulta dovuta.',
    spiegazione:
      'Il presupposto è binario: se l\'imposta è dovuta, le addizionali si applicano sull\'intera base; se non lo è, non si applicano affatto. Non esiste una riduzione parziale.',
    // Il gate è due norme, una per tributo.
    fonti: regole['gate-addizionali'],
    esito: {
      stato: 'verifica',
      superata: true,
      grandezzaLetta: euro(3_221.63),
      ragione:
        'L\'IRPEF netta è 3.221,63 e risulta dovuta: il presupposto delle addizionali è soddisfatto, quindi si applicano sull\'intera base imponibile.',
    },
  },

  {
    id: 'addizionale-regionale',
    etichetta: 'Addizionale regionale — Lombardia',
    natura: 'locale',
    regola:
      'Aliquote articolate sugli scaglioni IRPEF previgenti, applicate per scaglione sul reddito complessivo al netto degli oneri deducibili.',
    spiegazione:
      'Si calcola sulla stessa base dell\'IRPEF, non su quello che resta dopo averla pagata. E le detrazioni non la toccano.',
    parametro: { tipo: 'scaglioni', valore: aliquoteLombardia, fonte: prospettoRegionaleMef },
    esito: {
      stato: 'applicato',
      entra: euro(27_243),
      esce: euro(377.94),
      effettoSulNetto: euro(-377.94),
      segno: 'sottrae',
    },
    dettaglio: [
      {
        id: 'addizionale-regionale-scaglione-1',
        etichetta: 'Fino a 15.000 — 1,23%',
        regola: 'Applicabile a scaglione di reddito da euro 0 fino a euro 15.000,00.',
        spiegazione: 'L\'aliquota si applica alla quota di reddito compresa nella fascia.',
        parametro: {
          tipo: 'aliquota',
          valore: aliquoteLombardia.scaglioni[0].aliquota,
          fonte: prospettoRegionaleMef,
        },
        esito: {
          stato: 'applicato',
          entra: euro(15_000),
          esce: euro(184.5),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
      {
        id: 'addizionale-regionale-scaglione-2',
        etichetta: 'Da 15.000 a 28.000 — 1,58%',
        regola: 'Applicabile a scaglione di reddito da euro 15.000,01 fino a euro 28.000,00.',
        spiegazione: 'Solo i 12.243 euro che cadono in questa fascia scontano l\'1,58%.',
        parametro: {
          tipo: 'aliquota',
          valore: aliquoteLombardia.scaglioni[1].aliquota,
          fonte: prospettoRegionaleMef,
        },
        esito: {
          stato: 'applicato',
          entra: euro(12_243),
          esce: euro(193.44),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
    ],
  },

  {
    id: 'addizionale-comunale',
    etichetta: 'Addizionale comunale — Milano',
    natura: 'locale',
    regola:
      'Aliquota unica deliberata dal comune, applicata al reddito complessivo al netto degli oneri deducibili, salva la soglia di esenzione.',
    spiegazione:
      'Milano non ha deliberato per il 2026: per legge si applicano aliquota ed esenzione già vigenti nel 2025.',
    parametro: {
      tipo: 'aliquota',
      valore: aliquotaComunaleMilano,
      fonte: elencoComunaleAnnuale2025,
    },
    esito: {
      stato: 'applicato',
      entra: euro(27_243),
      esce: euro(217.94),
      effettoSulNetto: euro(-217.94),
      segno: 'sottrae',
    },
    dettaglio: [
      {
        id: 'soglia-esenzione-comunale',
        etichetta: 'Soglia di esenzione: 23.000,00',
        regola:
          'Soglia di esenzione in ragione del possesso di specifici requisiti reddituali, stabilita con regolamento comunale.',
        spiegazione:
          'È una soglia secca, non una franchigia: fino a 23.000 non si paga nulla, a 23.000,01 si paga sull\'intero reddito. Un euro di reddito in più vale 184 euro di netto in meno.',
        fonti: regole['soglia-esenzione-comunale'],
        parametro: {
          tipo: 'soglia',
          valore: sogliaEsenzioneMilano,
          fonte: elencoComunaleAnnuale2025,
        },
        esito: {
          stato: 'applicato',
          entra: euro(27_243),
          esce: euro(27_243),
          effettoSulNetto: euro(0),
          segno: 'neutro',
        },
      },
    ],
  },

  {
    id: 'trattamento-integrativo',
    etichetta: 'Trattamento integrativo',
    natura: 'aggiunge',
    regola:
      'Somma che non concorre alla formazione del reddito per reddito complessivo non superiore alla soglia, e a condizione che l\'imposta lorda superi la detrazione dell\'art. 13 c. 1 diminuita di 75 euro.',
    spiegazione:
      'Quando spetta, è denaro che si somma al netto senza passare dalle imposte. Qui il reddito è sopra il limite.',
    fonti: regole['trattamento-integrativo'],
    parametro: {
      tipo: 'soglia',
      valore: regime2026.trattamentoIntegrativo.sogliaRedditoComplessivo.valore,
      fonte: regime2026.trattamentoIntegrativo.sogliaRedditoComplessivo.fonte,
    },
    esito: {
      stato: 'nonDovuto',
      ragione:
        'Il reddito complessivo (27.243,00) supera il limite di 15.000,00 previsto per il trattamento integrativo.',
    },
  },

  {
    id: 'somma-cuneo',
    etichetta: 'Somma per il taglio del cuneo',
    natura: 'aggiunge',
    regola:
      'Somma che non concorre alla formazione del reddito, in percentuale sul reddito di lavoro dipendente, per reddito complessivo non superiore alla soglia di accesso.',
    spiegazione:
      'Sopra i 20.000 il beneficio non sparisce: cambia forma e diventa la detrazione già applicata sull\'IRPEF.',
    fonti: regole['somma-cuneo'],
    parametro: {
      tipo: 'soglia',
      valore: regime2026.cuneo.somma.sogliaAccesso.valore,
      fonte: regime2026.cuneo.somma.sogliaAccesso.fonte,
    },
    esito: {
      stato: 'nonDovuto',
      ragione:
        'Il reddito complessivo (27.243,00) supera la soglia di accesso di 20.000,00. Sopra questa soglia opera l\'ulteriore detrazione del c. 6, non la somma.',
    },
  },
]

// Assunzioni

/**
 * Le assunzioni applicabili a questo calcolo, prese dal catalogo di `data/`.
 *
 * Elencate per id invece che riscritte: i testi hanno una sola sede. S-002 non
 * compare perché la RAL non supera il massimale; S-014 sì, perché il contratto
 * dichiarato non è un apprendistato.
 *
 * Il catalogo contiene solo voci `S-xxx` (D-039): D-015 è stata rimossa perché
 * diceva la stessa cosa di S-004, che ora la assorbe.
 */
const ID_APPLICABILI: readonly string[] = [
  'S-001',
  'S-003',
  'S-004',
  'S-005',
  'S-005-bis',
  'S-006',
  'S-007',
  'S-008',
  'S-009',
  'S-010',
  'S-011',
  'S-013',
  'S-014',
]

const assunzioni = catalogoAssunzioni
  .filter((a) => ID_APPLICABILI.includes(a.assunzione.id))
  .map((a) => a.assunzione)

// Il risultato

export const fixtureRal30000Milano: Risultato = {
  annoImposta: annoImposta(2026),
  input: {
    ral: euro(30_000),
    codiceCatastale: 'F205',
    tipoContratto: 'indeterminato',
    mensilita: 13,
  },
  mensilita: 13,
  grandezze: {
    redditoComplessivo: redditoComplessivo(27_243),
    redditoLavoroDipendente: redditoLavoroDipendente(27_243),
    retribuzionePrevidenziale: retribuzionePrevidenziale(30_000),
  },
  enti: {
    regionale: lombardia,
    comunale: milano,
  },
  passi,
  nettoAnnuo: euro(23_425.49),
  nettoMensile: {
    12: euro(1_952.12),
    13: euro(1_801.96),
    14: euro(1_673.25),
  },
  assunzioni,
}
