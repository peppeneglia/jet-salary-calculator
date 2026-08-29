# Rapporto di import — dataset MEF

Generato da `scripts/importa-mef.mjs`. Artefatti estratti il **2026-08-28**, anno d'imposta **2026**.

Questo file è versionato insieme al JSON: è la prova che i casi sporchi sono stati **visti**, non ignorati. Lo script non fallisce in silenzio e non salta le righe storte.

## Verifiche

I valori attesi sono quelli già misurati in *Fonti* §15 e §15.b sugli stessi file. Uno scostamento è un difetto del parser finché non si dimostra il contrario.

| Verifica | Atteso | Ottenuto | |
| --- | --- | --- | --- |
| comuni nel giornaliero 2026 | 7897 | 7897 | OK |
| con delibera 2026 (righe non 0*) | 3075 | 3075 | OK |
| con 0* nel 2026 | 4822 | 4822 | OK |
| comuni nell'annuale 2025 | 7896 | 7896 | OK |
| risolti sull'annuale 2025 — ramo 0* | 3937 | 3937 | OK |
| ancora 0* nel 2025 (senza addizionale applicabile) | 884 | 884 | OK |
| assenti dall'annuale 2025 | 1 | 1 | OK |
| comuni con soglia di esenzione — 2026 | 1270 | 1270 | OK |
| celle Esenzione non vuote — annuale 2025 | 2880 | 2880 | OK |
| di cui soglie leggibili | 2767 | 2767 | OK |
| «aliquota unica» nel 2026 | 2501 | 2501 | OK |
| scaglioni previgenti nel 2026 (delibere accettate) | 173 | 173 | OK |
| righe FLAG_NUOVA = 0 («casi specifici») | 176 | 176 | OK |
| comuni con ALIQUOTA (prima colonna) = 0 | 1280 | 1280 | OK |
| zeri in tutte le colonne aliquota | 1462 | 1462 | OK |
| comuni sopra 0,8 nell'annuale 2025 | 12 | 12 | OK |
| massimo comunale nell'annuale 2025 | 1.2 | 1.2 | OK |
| enti regionali | 21 | 21 | OK |
| enti regionali sopra 1,4 | 15 | 15 | OK |
| righe nel prospetto regionale | 71 | 71 | OK |
| massimo regionale nel file | 3.63 | 3.63 | OK |
| massimo regionale dopo la selezione D-053 | 3.33 | 3.33 | OK |
| MILANO — stato | ereditato | ereditato | OK |
| MILANO — forma aliquota | unica | unica | OK |
| MILANO — aliquota | 0.8 | 0.8 | OK |
| MILANO — soglia di esenzione | 23000 | 23000 | OK |
| LOMBARDIA — forma aliquota | scaglioni-previgenti | scaglioni-previgenti | OK |
| LOMBARDIA — aliquote | 1.23 / 1.58 / 1.72 / 1.73 | 1.23 / 1.58 / 1.72 / 1.73 | OK |

## Nota sulla misura dei comuni a scaglioni previgenti

*Fonti* §15 registrava **157 comuni**. La misura era una ricerca **case-sensitive**, e il file non è uniforme nelle maiuscole: convivono `da euro`, `Da euro`, `OLTRE euro`, `SCAGLIONE` e `SCAGLIONI`. Ricontata:

| Come si conta | Comuni |
| --- | --- |
| ricerca case-sensitive originale | 157 |
| predicato corretto, ancora case-sensitive | 163 |
| tre predicati indipendenti, case-insensitive — quattro fasce a scaglione, confine a 15.000, presenza di `15.000,01` — che **concordano** | 176 |
| di cui con delibera 2026 accettata | 173 |

I 176 coincidono esattamente con le righe `FLAG_NUOVA = 0`, i *casi specifici* che il MEF non acquisisce col format assistito: è una quarta conferma indipendente, e viene da una colonna invece che dal testo.

## Esiti della risoluzione

| Stato | Comuni |
| --- | --- |
| totale2026 | 7897 |
| deliberato | 3072 |
| ereditato | 3940 |
| ereditatoPerZeroStar | 3937 |
| ereditatoPerRigaInutilizzabile | 3 |
| nonIstituito | 884 |
| assenteDal2025 | 1 |
| setInferito | 589 |
| conSogliaEsenzione | 2841 |
| sogliaDallaDescrizione | 136 |
| deliberaNonUtilizzabile | 3 |
| senzaEnteRegionale | 0 |

## La mappatura provincia → ente impositore — cosa è verificato e cosa no

**Nessuno dei tre file MEF lega una sigla di provincia a un ente impositore.** Il file comunale porta la sigla, il prospetto regionale il nome dell'ente, e in mezzo non c'è nulla: la tabella delle 107 province in `scripts/importa-mef.mjs` **non è derivabile da questi dati, quindi non è verificabile con questi dati**. Resta marcata *non verificata* dentro `regioni-2026.json`.

Quello che i controlli escludono — eseguiti a ogni import, non asseriti:

| Controllo | Esito |
| --- | --- |
| sigle di provincia nel file comunale | 107 |
| sigle coperte dalla tabella | 107 |
| sigle nella tabella ma non nel file | 0 |
| sigle assegnate a due enti | 0 |
| enti della tabella assenti dal prospetto | 0 |
| enti del prospetto senza comuni | 0 |
| somma dei comuni per ente | 7897 |

> ⚠️ **Il difetto che sopravvive a tutti e quattro i controlli è lo scambio.** Due province attribuite l'una all'ente dell'altra passerebbero copertura, unicità e totali senza muovere un numero, e ogni comune di quelle due province riceverebbe l'aliquota di un ente sbagliato — **con un risultato perfettamente plausibile**. È la ragione per cui la marcatura resta, e per cui chiuderla richiede una fonte esterna: la ripartizione amministrativa su atto, che non è in cartella.

## Comuni per ente impositore regionale

La mappatura è `comune → ente impositore`, non `comune → regione`: il Trentino-Alto Adige non esiste come soggetto che impone il tributo, e le due Province autonome sono enti a sé [Fonti §15.a]. **La riga che conta è la loro**: l'ente impositore delle due Province non è quello dei due capoluoghi, è quello di tutti i comuni della regione. D-037 li tiene fuori perimetro, e sono 282 — non due.

| Ente impositore | Comuni |
| --- | --- |
| REGIONE LOMBARDIA | 1502 |
| REGIONE PIEMONTE | 1180 |
| REGIONE VENETO | 561 |
| REGIONE CAMPANIA | 550 |
| REGIONE CALABRIA | 404 |
| REGIONE SICILIA | 391 |
| REGIONE LAZIO | 378 |
| REGIONE SARDEGNA | 377 |
| REGIONE EMILIA-ROMAGNA | 330 |
| REGIONE ABRUZZO | 305 |
| REGIONE TOSCANA | 273 |
| REGIONE PUGLIA | 257 |
| REGIONE LIGURIA | 234 |
| REGIONE MARCHE | 225 |
| REGIONE FRIULI VENEZIA GIULIA | 215 |
| PROVINCIA AUTONOMA DI TRENTO | 166 |
| REGIONE MOLISE | 136 |
| REGIONE BASILICATA | 131 |
| PROVINCIA AUTONOMA DI BOLZANO | 116 |
| REGIONE UMBRIA | 92 |
| REGIONE VALLE D'AOSTA | 74 |

## Peso della lista leggera (D-049)

Codice, nome, provincia e calcolabilità per 7897 voci — **nessuna aliquota, nessuna citazione**.

- grezzo: **648.1 KiB**
- gzip: **83.2 KiB**

## Anomalie

Totale: **1482** in 12 categorie.

| Categoria | Occorrenze |
| --- | --- |
| `set-scaglioni-inferito` | 1171 |
| `esenzione-letta-dal-testo` | 138 |
| `esenzione-2025-rinviata-a-nota` | 112 |
| `esenzione-condizionata` | 42 |
| `detrazione-regionale-non-modellata` | 8 |
| `ricaduta-sul-fallback` | 3 |
| `secondo-provvedimento-scartato` | 2 |
| `fascia-duplicata` | 2 |
| `esenzione-2025-non-normalizzabile` | 1 |
| `esenzione-regionale-applicata` | 1 |
| `confini-fuori-dai-due-set` | 1 |
| `assente-dall-annuale-2025` | 1 |

### `assente-dall-annuale-2025` — 1

- **M439** — CASTEGNERO NANTO (VI): presente nel 2026 senza delibera, assente dall'elenco annuale 2025

### `confini-fuori-dai-due-set` — 1

- **E965** — MARNATE: confini [15000,28000,55000] — né previgenti né vigenti

### `detrazione-regionale-non-modellata` — 8

- **REGIONE UMBRIA** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **PROVINCIA AUTONOMA DI TRENTO** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **REGIONE LAZIO** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **REGIONE PUGLIA** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **PROVINCIA AUTONOMA DI BOLZANO** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **REGIONE SARDEGNA** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **REGIONE PIEMONTE** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)
- **REGIONE CAMPANIA** — il testo libero del prospetto descrive una detrazione regionale; non viene estratta perché ricavarne importo e banda dal testo sarebbe un parametro senza fonte (D-033)

### `esenzione-2025-non-normalizzabile` — 1

- **F526** — MONTEGRINO VALTRAVAGLIA: annuale 2025, colonna Esenzione = "8.4999,99" — nessuna soglia applicata

### `esenzione-2025-rinviata-a-nota` — 112

- **A024** — ACERRA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A242** — ALVIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A468** — SINALUNGA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A470** — ASOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A471** — ASOLO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A472** — CASPERIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A473** — ASSAGO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A474** — ASSEMINI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A475** — ASSISI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A535** — BACOLI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A568** — BAGNOLI DI SOPRA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A616** — BARANELLO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A650** — BARDOLINO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **A864** — BIENTINA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B073** — BOSCO CHIESANUOVA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B086** — BOTRUGNO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B107** — BOVOLONE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B149** — BRENO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B303** — BUTI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B390** — CALCI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B392** — CALCINAIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B497** — CAMPAGNATICO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B521** — CAMPOBELLO DI MAZARA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B581** — CANCELLO ED ARNONE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B647** — CAPANNOLI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B787** — CARLENTINI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B939** — CASARZA LIGURE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **B950** — CASCINA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **C066** — CASTELBOTTACCIO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **C113** — CASTELFRANCO DI SOTTO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **C426** — CELANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **C635** — CHIGNOLO D'ISOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **C940** — CONCA DEI MARINI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D412** — ENVIE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D462** — FAGGETO LARIO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D510** — FAUGLIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D593** — FILIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D613** — FIRENZUOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D749** — FOSSOMBRONE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **D975** — GERACE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E014** — GIARDINI-NAXOS: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E027** — GIFFONI VALLE PIANA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E116** — GOTTOLENGO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E207** — GROTTAMMARE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E209** — GROTTE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E224** — GRUMO NEVANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E250** — GUARDISTALLO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E333** — ISEO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E432** — LAMPORECCHIO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E451** — LARCIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E506** — LECCE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E562** — LEVATE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E635** — LOCANA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E673** — LONGHENA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E680** — PORTO AZZURRO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E738** — LUMEZZANE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E810** — MAGLIANO IN TOSCANA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **E957** — MARINEO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F051** — MATELICA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F238** — MIRADOLO TERME: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F370** — MONGRASSANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F592** — MONTEPULCIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F686** — MONTOPOLI IN VAL D'ARNO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F844** — NARNI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F861** — NEGRAR DI VALPOLICELLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **F930** — NONANTOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G187** — OSTUNI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G254** — PALAIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G426** — PELLEZZANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G478** — PERUGIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G535** — PIACENZA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G555** — PIANELLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G615** — PIETRAFITTA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G659** — PIGLIO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G702** — PISA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G722** — PIZZO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G822** — PONSACCO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G838** — PONTECORVO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G843** — PONTEDERA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **G991** — PRATA SANNITA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H010** — PRAVISDOMINI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H026** — PREGNANA MILANESE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H143** — QUISTELLO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H608** — ROVERE' VERONESE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H769** — SAN BENEDETTO DEL TRONTO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **H996** — SAN MARTINO DI VENEZZE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I046** — SAN MINIATO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I232** — SANTA MARIA A MONTE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I300** — SANT'ANTONIO ABATE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I382** — SAN VENDEMIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I422** — SAPRI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I445** — SARTEANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I820** — SOMMA VESUVIANA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I902** — SPIGNO SATURNIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **I950** — STERNATIA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L109** — TERLIZZI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L138** — TERRICCIOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L164** — TICENGO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L245** — TORRE ANNUNZIATA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L269** — TORRE D'ISOLA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L339** — TRAVAGLIATO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L384** — TREQUANDA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L469** — TURANO LODIGIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L702** — VECCHIANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L744** — VERANO BRIANZA: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L752** — VERDELLINO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L850** — VICOPISANO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **L876** — VIGGIU': annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **M098** — VIVERONE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **M172** — ZEVIO: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **M211** — ACQUEDOLCI: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata
- **M280** — TRECASE: annuale 2025, colonna Esenzione = "NOTA" — nessuna soglia applicata

### `esenzione-condizionata` — 42

- **A468** — SINALUNGA: Esenzione per contribuenti che hanno un reddito IRPEF annuo non superiore a euro 13.000,00 derivante da redditi da lavoro dipendente (art. 49, comma 1 del D.P.R. 22/12/1986 n. 917) e assimilato (art. 50 comma 1 lett. a), c), d) e l) del D.P.R. 22/12/1986 n. 917) o pensione (art. 49 comma 2 del D.P.R. 22.12.1986, n. 917) e da abitazione principale e relative pertinenze. Nella determinazione del reddito complessivo è escluso il reddito derivante da abitazione principale e relative pertinenze
- **A568** — BAGNOLI DI SOPRA: Esenzione per i soggetti ultrasessantacinquenni il cui unico reddito derivi esclusivamente da redditi di pensione inferiori a euro 10000.00
- **A616** — BARANELLO: Esenzione per i contribuenti che abbiano un reddito complessivo annuo imponibile derivante da lavoro dipendente -art. 49, comma 1,TUIR- e assimilato -art. 50, TUIR lett. a, b, c, c-bis, d, h-bis e l-, o pensione ---art.49 comma 2-, inferiore ad euro 10.000,00
- **A616** — BARANELLO: Esenzione per i contribuenti che abbiano un reddito complessivo annuo imponibile derivante da redditi assimilati a lavoro dipendente - art. 50, comma 1, TUIR, lett.e, f, g, h,i -, da redditi di lavoro autonomo - art.53 TUIR -, redditi di imprese minori -art.66 TUIR - e redditi diversi -art.67 TUIR, lett.i ed l -, inferiore a euro 4.000,00
- **A650** — BARDOLINO: Esenzione per famiglie con reddito complessivo imponibile non superiore a 35.000,00 euro - ed aventi fiscalmente a carico tre o più figli, con innalzamento di euro 10.000,00 - per ogni figlio a carico oltre il terzo
- **A864** — BIENTINA: Esenzione per redditi complessivi annui imponibili inferiori o uguali a euro 12.000,00, se derivanti da lavoro dipendente e assimilato (art. 49 e 50 T.U.I.R.)
- **B073** — BOSCO CHIESANUOVA: Esenzione per per famiglie con reddito complessivo imponibile non superiore ad euro 50.000 ed aventi fiscalmente a carico quattro figli, con l'innalzamento di euro 10.000 per ogni figlio a carico oltre il quarto (art. 3 c. 1 reg.)
- **B073** — BOSCO CHIESANUOVA: Esenzione per portatori di handicap con invalidità non inf.all'80 per cento titolari di un reddito isee non sup.ad euro 50.000 e per i soggetti con reddito isee non sup.ad euro 50.000 ed aventi fiscalmente a carico un portatore di handicap con invalidità non inf. all'80 percento (art. 3 c. 3 reg.)
- **B086** — BOTRUGNO: Esenzione per redditi da lavoro dipendente e da pensione fino ad euro 8.000,00
- **B149** — BRENO: Esenzione per reddito complessivo cui concorrono reddito di pensione di ogni genere ed eventualmente redditi da unità' immobiliare adibita ad abitazione principale e sue pertinenze, che, ridotto degli oneri deducibili, non è superiore a euro 10.329,14
- **B939** — CASARZA LIGURE: Esenzione per reddito imponibile ai fini IRPEF sino alla soglia di € 12.000,00 (dodicimila/00) qualora vi concorrano, in qualsiasi misura percentuale, redditi da pensione
- **B939** — CASARZA LIGURE: Esenzione per redditi, annui dichiarati imponibili ai fini IRPEF, sino ad € 12.000,00 (dodicimila/00) costituiti per almeno l’80% da lavoro dipendente
- **D412** — ENVIE: Esenzione per i contribuenti con reddito imponibile, ai fini dell’addizionale comunale all’IRPEF, derivante da lavoro dipendente, assimilato o da pensione, anche in presenza di reddito immobiliare, e complessivamente non superiore a 10.000,00 (diecimila) euro annui, esenzione che non rappresenta una franchigia e di conseguenza non riguarda chi percepisce redditi superiori alla soglia.
- **D462** — FAGGETO LARIO: Esenzione per i contribuenti che hanno un reddito annuo complessivo derivante da lavoro dipendente, autonomo o da pensioni, imponibile inferiore a euro 7.999,99
- **D749** — FOSSOMBRONE: Esenzione per redditi derivanti da lavoro dipendente e assimilato, o pensioni, fino a complessivi euro 10.000,00
- **D975** — GERACE: Esenzione per Esenzione per redditi da pensione ai fini Irpef non superiori ad euro 8000.00
- **E224** — GRUMO NEVANO: Esenzione per redditi di pensione/lavoro dipendente non superiore a euro 8.500,00 annui
- **E451** — LARCIANO: Esenzione per tutti i contribuenti titolari di un reddito complessivo annuo imponibile non superiore ad € 12.000,00. Tale reddito dovra' essere esclusivamente derivante da reddito di lavoro dipendente o reddito di pensione e reddito per abitazione principale
- **E562** — LEVATE: Esenzione per reddito complessivo da lavoro dipendente e/o assimilato a quello di lavoro dipendente, ai sensi rispettivamente degli articoli 49 e 50 del testo unico delle imposte sui redditi (DPR 22/12/86 n. 917) e successive modifiche ed integrazioni non superiore a 8.500 euro
- **E680** — PORTO AZZURRO: Esenzione per redditi derivanti da pensione fino a euro 7.000,00
- **F051** — MATELICA: Esenzione per reddito da lavoro o pensione fino ad euro 7.500,00
- **F370** — MONGRASSANO: Esenzione per i contribuenti con reddito imponibile derivante da lavoro dipendente, assimilato o da pensione non superiore ad euro 7.500 annui
- **F592** — MONTEPULCIANO: Esenzione per reddito annuo imponibile inferiore ad euro 11.000,00 derivante da: lavoro dipendente (art. 49 comma 1 del D.P.R. 22/12/1986, n. 917) e assimilato (art. 50 comma 1 lett. a), b), c), c-bis), d), h-bis), l) del D.P.R. 22/12/1986, n. 917) o da pensione ( art. 49 comma 2 del D.P.R. 22/12/1986, n. 917) ), e terreni e fabbricati
- **F592** — MONTEPULCIANO: Esenzione per reddito annuo imponibile inferiore ad euro 8.000,00 derivante da: redditi assimilati a lavoro dipendente (art. 50 comma 1 lett. e), f), g), h), i) del D.P.R. 22/12/1986, n. 917), di lavoro autonomo (art. 53 del D.P.R. 22/12/1986, n. 917), di impresa minore (art. 66 del D.P.R. 22/12/1986, n. 917), redditi diversi (art. 67 lett. i) ed l) del D.P.R. 22/12/1986, n. 917), e terreni e fabbricati
- **F930** — NONANTOLA: Esenzione per PENSIONATI CON REDDITO COMPLESSIVO IRPEF NON SUPERIORE A 12.000,00 EURO
- **G838** — PONTECORVO: Esenzione per Euro 10.000,00 per i soli redditi derivanti da pensione
- **H996** — SAN MARTINO DI VENEZZE: Esenzione per reddito complessivo IRPEF, derivante per almeno il 90 % da pensione, inferiore a Euro 12.000,00
- **H996** — SAN MARTINO DI VENEZZE: Esenzione per reddito complessivo IRPEF, derivante per almeno il 90% da lavoro dipendente, inferiore a Euro 8.000,00
- **H996** — SAN MARTINO DI VENEZZE: Esenzione per reddito complessivo IRPEF, derivante per almeno il 90% da pensione e da lavoro dipendente, inferiore a Euro 12.000,00
- **I046** — SAN MINIATO: Esenzione per redditi da lavoro dipendente e da pensione soglia di esenzione €. 15.000,00
- **I232** — SANTA MARIA A MONTE: Esenzione per redditi da lavoro dipendente e da pensione sino a euro 11.000,00
- **I422** — SAPRI: Esenzione per redditi derivanti da lavoro dipendente, assimilato o da pensione fino a 15.000.00 euro
- **I422** — SAPRI: Esenzione per pensionati con reddito fino a 15.000,00 euro titolari anche di redditi della sola casa di abitazione con pertinenza
- **I445** — SARTEANO: Esenzione per reddito annuo imponibile inferiore ad euro 12.000,00 derivante da: lavoro dipendente (art. 49 comma 1 del D.P.R. 22/12/1986, n. 917) e assimilato (art. 50 comma 1 lett. A), b), c), c-bis), d), h-bis), l) del D.P.R. 22/12/1986, n. 917) o da pensione (art. 49 comma 2 del D.P.R. 22/12/1986, n. 917), e terreni e fabbricati
- **I445** — SARTEANO: Esenzione per reddito annuo imponibile inferiore ad euro 10.000,00 derivante da: redditi assimilati a lavoro dipendente (art. 50 comma 1 lett. e), f), g), h), i) del D.P.R. 22/12/1986, n. 917), di lavoro autonomo (art. 53 del D.P.R. 22/12/1986, n. 917), di impresa minore (art. 66 del D.P.R. 22/12/1986, n. 917), redditi diversi (art. 67 lett. i) ed l) del D.P.R. 22/12/1986, n. 917), e terreni e fabbricati
- **I962** — STORNARA: Esenzione per soggetti titolari di i titolari di redditi da lavoro dipendente fino alla soglia di 8.500 euro soggetti titolari di redditi da pensione fino alla soglia di 8.500 euro soggetti titolari di redditi da lavoro autonomo fino alla soglia di 5.500 euro.
- **L164** — TICENGO: Esenzione per redditi da pensione fino a 15.000,00 euro
- **L245** — TORRE ANNUNZIATA: Esenzione per redditi da pensione non superiori a euro 7.500,00
- **L702** — VECCHIANO: Esenzione per contribuenti in possesso di soli redditi imponibili da pensione fino a 11.500,00 euro
- **L752** — VERDELLINO: Esenzione per redditi derivanti da indennità corrisposte ai lavoratori dipendente da parte dell'INPS o da altri enti a titolo di cassa-integrazione e mobilità - anche erogate tramite il datore di lavoro - a condizione che al reddito complessivo del contribuente concorrano esclusivamente, oltre ai predetti redditi, altri redditi di lavoro dipendente di pensione ed eventualmente redditi derivanti dell'abitazione principale e delle sue pertinenze, per un reddito complessivo pari o inferiore a euro 15.000,00
- **L850** — VICOPISANO: Esenzione per contribuenti con reddito annuo imponibile ai fini Irpef, derivante da lavoro dipendente e/o da pensione e/o da redditi assimilati a quelli di lavoro dipendente, di cui agli artt. 49 e 50 Tuir D.P.R. n.917/1986, non superiore a euro 13.000,00
- **M280** — TRECASE: Esenzione per coloro che risultano titolari di un reddito di pensione il cui imponibile IRPEF è inferiore o uguale a € 8.000,00

### `esenzione-letta-dal-testo` — 138

- **A083** — AGORDO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **A223** — ALSENO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9999.99 — «Esenzione per redditi imponibili fino a euro 9.999,99»
- **A237** — ALTIVOLE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **A264** — AMENO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **A319** — ANZANO DEL PARCO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **A346** — AQUILEIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **A365** — ARCENE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **A444** — ARSIERO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **A591** — BALDISSERO TORINESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **A594** — BALLABIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8000 — «Esenzione per redditi imponibili fino a euro 8.000,00»
- **A650** — BARDOLINO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 28000 — «Esenzione per redditi fino a 28.000,00 euro»
- **A729** — BEDIZZOLE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **A785** — BENTIVOGLIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7499.99 — «Esenzione per redditi imponibili fino a euro 7.499,99»
- **A905** — BLEVIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **B082** — BOSNASCO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **B243** — BUCINE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9999.99 — «Esenzione per redditi imponibili fino a euro 9.999,99»
- **B270** — BUONVICINO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8145 — «Esenzione per redditi imponibili fino a euro 8.145,00»
- **B304** — BUTTAPIETRA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **B406** — CALENZANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **B430** — CALTAVUTURO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **B639** — CANTU': IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 18000 — «Esenzione per redditi imponibili fino a euro 18.000,00»
- **B651** — CAPESTRANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **B712** — CAPRIVA DEL FRIULI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8000 — «Esenzione per redditi imponibili fino a euro 8.000,00»
- **B754** — CARDANO AL CAMPO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **B796** — CARNAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9999.99 — «Esenzione per redditi imponibili fino a euro 9.999,99»
- **B920** — CASALVOLONE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **B937** — CASARGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 13000 — «Esenzione per redditi imponibili fino a euro 13.000,00»
- **B971** — CASIRATE D'ADDA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 11999.99 — «Esenzione per redditi imponibili fino a euro 11.999,99»
- **C111** — CASTELFRANCO VENETO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 14999.99 — «Esenzione per redditi imponibili fino a euro 14.999,99»
- **C181** — CASTELVECCANA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C218** — CASTELNOVO DI SOTTO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **C410** — CAZZANO SANT'ANDREA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8500 — «Esenzione per redditi imponibili fino a euro 8.500,00»
- **C540** — CERTALDO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 11500 — «Esenzione per redditi imponibili fino a euro 11.500,00»
- **C541** — CERTOSA DI PAVIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C567** — CESARA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **C574** — CESENATICO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **C587** — CETONA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9500 — «Esenzione per redditi imponibili fino a euro 9.500,00»
- **C606** — CHIANCHE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **C732** — CISLAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C752** — CIVATE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C759** — CIVIDATE AL PIANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C813** — CODEVILLA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 20000 — «Esenzione per redditi imponibili fino a euro 20.000,00»
- **C851** — COLLE BRIANZA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **C955** — CONDOVE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **D004** — CORIANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **D052** — CORTAZZONE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 14999.99 — «Esenzione per redditi imponibili fino a euro 14.999,99»
- **D081** — CORVINO SAN QUIRICO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **D109** — COSTA DE' NOBILI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9999 — «Esenzione per redditi imponibili fino a euro 9.999,00»
- **D145** — CREMENO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 14800 — «Esenzione per redditi imponibili fino a euro 14.800,00»
- **D154** — CRESCENTINO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **D198** — CUGGIONO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per 10.000,00»
- **D314** — DOGLIANI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **D327** — DOLZAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **D351** — DOSOLO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **D510** — FAUGLIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **D653** — FOLIGNO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **D660** — FOMBIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per fino a 10.000,00»
- **D680** — FONTE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **D752** — FRABOSA SOTTANA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **D805** — FRONT: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **D921** — GARGALLO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **D933** — GASSINO TORINESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **E021** — GIAVERA DEL MONTELLO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 16000 — «Esenzione per redditi imponibili fino a euro 16.000,00»
- **E038** — GIOIA DEL COLLE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9000 — «Esenzione per redditi imponibili fino a euro 9.000,00»
- **E103** — GORLE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 40000 — «Esenzione per redditi imponibili fino a 40.000,00»
- **E224** — GRUMO NEVANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 185.92 — «Esenzione per reddito di terreni non superiore a euro 185.92»
- **E317** — INZAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **E343** — ISOLA DEL GRAN SASSO D'ITALIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **E423** — LA LOGGIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000.99 — «Esenzione per redditi imponibili fino a euro 15.000,99»
- **E476** — LAUCO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **E514** — LEGNANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per 15.000»
- **E526** — LENO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **E610** — LISCATE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **E795** — MADONNA DEL SASSO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 14999 — «Esenzione per redditi imponibili fino a euro 14.999,00»
- **E844** — MALALBERGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **E899** — MANZANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 20000 — «Esenzione per redditi imponibili fino a euro 20.000,00»
- **E965** — MARNATE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 13000 — «Esenzione per SINO A € 13000,00»
- **F113** — MELIZZANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **F238** — MIRADOLO TERME: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per i contribuenti il cui reddito complessivo derivi da redditi non superiori a euro12.000,00e gli stessi non risultino proprietari o titolari di diritti reali di unità immobiliari diverse da quella adibita ad abitazione principale e una pertinenza.»
- **F244** — MISANO ADRIATICO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **F284** — MOLFETTA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **F394** — MONTAGNANA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **F417** — MONTALTO PAVESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **F424** — MONTANERA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **F642** — MONTESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **F674** — MONTICELLO BRIANZA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **F708** — MORANO CALABRO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8500 — «Esenzione per redditi imponibili fino a euro 8.500,00»
- **F930** — NONANTOLA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per soggetti con REDDITO COMPLESSIVO IRPEF NON SUPERIORE A 10.000,00 EURO»
- **G032** — OLIVA GESSI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8000 — «Esenzione per redditi imponibili fino a euro 8.000,00»
- **G116** — ORNAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per 10.000,00»
- **G166** — OSPEDALETTO LODIGIANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **G198** — OVARO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **G368** — PASTURO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **G520** — PETTENASCO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **G678** — PINO TORINESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 14999.99 — «Esenzione per redditi imponibili fino a euro 14.999,99»
- **G812** — POMIGLIANO D'ARCO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 5000 — «Esenzione per redditi imponibili fino a euro 5.000,00»
- **G846** — PONTE DI PIAVE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **G875** — PONZANO VENETO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **G972** — SASSO MARCONI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **H121** — QUATTORDIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **H350** — RIVERGARO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **H407** — ROCCAFORTE MONDOVI': IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **H536** — RONCO SCRIVIA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **H539** — RONCO CANAVESE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **H544** — RONCOLA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9000 — «Esenzione per redditi imponibili fino a euro 9.000,00»
- **H845** — SAN FLORIANO DEL COLLIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8500 — «Esenzione per redditi imponibili fino a euro 8.500,00»
- **H895** — SAN GIORGIO DI NOGARO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 20000 — «Esenzione per redditi imponibili fino a euro 20.000,00»
- **H924** — SAN GIOVANNI LUPATOTO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **I011** — SAN MARTINO IN RIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 11000 — «Esenzione per redditi imponibili fino a euro 11.000,00»
- **I025** — SAN MAURIZIO D'OPAGLIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **I046** — SAN MINIATO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per altri redditi soglia esenzione €. 12.000,00»
- **I232** — SANTA MARIA A MONTE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per altre tipologie di reddito sino a euro 10.000,00»
- **I304** — SANTARCANGELO DI ROMAGNA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **I307** — SANT'ARSENIO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8174 — «Esenzione per redditi imponibili fino a euro 8.174,00»
- **I352** — SANT'ORESTE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8500 — «Esenzione per redditi imponibili fino a euro 8.500,00»
- **I501** — SCANNO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **I506** — SCANZOROSCIATE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8200 — «Esenzione per redditi imponibili fino a euro 8.200,00»
- **I545** — SCOPELLO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **I588** — SELLERO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi fino ad euro 10.000,00»
- **I614** — SENNORI: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8000 — «Esenzione per redditi imponibili fino a euro 8.000,00»
- **I759** — SIRONE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **I775** — SOAVE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 7500 — «Esenzione per redditi imponibili fino a euro 7.500,00»
- **I841** — SORANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 9000 — «Esenzione per redditi imponibili fino a euro 9.000,00»
- **I866** — SOSPIROLO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 8000 — «Esenzione per redditi imponibili fino a euro 8.000,00»
- **I878** — SOVICO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **L007** — SUNO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **L421** — TRICESIMO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **L511** — USMATE VELATE: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 20000 — «Esenzione per redditi imponibili fino a euro 20.000,00»
- **L573** — VALFABBRICA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **L644** — VALPERGA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **L702** — VECCHIANO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 11000 — «Esenzione per tutti i contribuenti con redditi imponibili inferiori a 11.000,00 euro»
- **L751** — VERCURAGO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 12000 — «Esenzione per redditi imponibili fino a euro 12.000,00»
- **L752** — VERDELLINO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»
- **L815** — VETTO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **M378** — MONTALCINO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **M393** — CASTELGERUNDO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 13000 — «Esenzione per redditi imponibili fino a euro 13.000,00»
- **M412** — SOLBIATE CON CAGNO: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 15000 — «Esenzione per redditi imponibili fino a euro 15.000,00»
- **M421** — BORGO VALBELLUNA: IMPORTO_ESENTE = "0" ma la descrizione dichiara una soglia di 10000 — «Esenzione per redditi imponibili fino a euro 10.000,00»

### `esenzione-regionale-applicata` — 1

- **REGIONE VALLE D'AOSTA** — soglia di 15000, letta dal testo di DISPOSIZIONE e confermata come cliff dallo stesso testo

### `fascia-duplicata` — 2

- **A112** — AIRUNO: la fascia 15000→28000 compare due volte, con aliquote diverse
- **A785** — BENTIVOGLIO: la fascia 15000→28000 compare due volte, con aliquote diverse

### `ricaduta-sul-fallback` — 3

- **A112** — AIRUNO: la riga 2026 non è utilizzabile, si applica l'anno precedente per il c. 752
- **A785** — BENTIVOGLIO: la riga 2026 non è utilizzabile, si applica l'anno precedente per il c. 752
- **E965** — MARNATE: la riga 2026 non è utilizzabile, si applica l'anno precedente per il c. 752

### `secondo-provvedimento-scartato` — 2

- **REGIONE PUGLIA** — 2207 del 2026-05-29 scartato: pubblicato dopo 2178 del 2026-01-28, e non è più favorevole
- **REGIONE MOLISE** — 2227 del 2026-06-19 scartato: pubblicato dopo 2186 del 2026-01-29, e non è più favorevole

### `set-scaglioni-inferito` — 1171

- **A005** — ABBADIA LARIANA: 3 aliquote → set vigente, inferito dalla cardinalità
- **A034** — ACQUAFREDDA: 4 aliquote → set previgente, inferito dalla cardinalità
- **A038** — ACQUANEGRA SUL CHIESE: 4 aliquote → set previgente, inferito dalla cardinalità
- **A048** — ACQUAVIVA DELLE FONTI: 4 aliquote → set previgente, inferito dalla cardinalità
- **A060** — ADRO: 4 aliquote → set previgente, inferito dalla cardinalità
- **A061** — AFFI: 3 aliquote → set vigente, inferito dalla cardinalità
- **A083** — AGORDO: 4 aliquote → set previgente, inferito dalla cardinalità
- **A088** — AGRATE CONTURBIA: 4 aliquote → set previgente, inferito dalla cardinalità
- **A093** — AGUGLIARO: 3 aliquote → set vigente, inferito dalla cardinalità
- **A103** — AIELLO DEL FRIULI: 4 aliquote → set previgente, inferito dalla cardinalità
- **A105** — AIETA: 4 aliquote → set previgente, inferito dalla cardinalità
- **A112** — AIRUNO: 4 aliquote → set previgente, inferito dalla cardinalità
- **A124** — ALBA: 3 aliquote → set vigente, inferito dalla cardinalità
- **A129** — ALBANO SANT'ALESSANDRO: 3 aliquote → set vigente, inferito dalla cardinalità
- **A139** — ALBARETTO DELLA TORRE: 3 aliquote → set vigente, inferito dalla cardinalità
- **A145** — ALBENGA: 4 aliquote → set previgente, inferito dalla cardinalità
- **A149** — ALBEROBELLO: 3 aliquote → set vigente, inferito dalla cardinalità
- **A157** — ALBIANO D'IVREA: 4 aliquote → set previgente, inferito dalla cardinalità
- **A162** — ALBINEA: 3 aliquote → set vigente, inferito dalla cardinalità
- **A163** — ALBINO: 3 aliquote → set vigente, inferito dalla cardinalità

*… e altri 1151. L'elenco completo è ricavabile dal campo `setScaglioniInferito` in `comuni-2026.json`.*

