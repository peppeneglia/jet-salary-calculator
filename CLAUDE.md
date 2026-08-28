# Jet Salary Calculator

Prototipo di calcolatore che proietta la retribuzione netta annuale a partire dalla RAL,
mostrando ogni voce trattenuta e la fonte normativa che la determina.

È la prima prova di selezione per la posizione di **AI Product Builder in Jet HR**, scaleup
italiana che fa payroll e amministrazione del personale per PMI.

---

## 1. Contesto e criteri di valutazione

**Cosa chiede la prova.** Una pagina web con input, bottone calcola e output in pagina: netto
annuale, netto mensile, dettaglio delle trattenute. Caso semplice e standard — impiegato a tempo
indeterminato, Milano, nessuna agevolazione. Formato libero.

**Cosa valutano, nel loro ordine:**

1. Capacità di **ricercare** le informazioni rilevanti dalle fonti ritenute opportune
2. Capacità di **strutturare** le informazioni in una soluzione
3. Capacità di **costruire** un prototipo funzionante

**La frase che orienta tutto il lavoro.** Scrivono che lo scopo del test non è verificare quanto
si è bravi a usare Lovable o strumenti simili, ma verificare di aver costruito qualcosa di cui si
sono capite le logiche e di cui si è in controllo. Ogni semplificazione verrà discussa in un
colloquio successivo.

Ne discende il criterio di successo: **non basta che il calcolatore funzioni, deve essere
difendibile riga per riga.** Il rischio da evitare è consegnare qualcosa che funziona ma che non
si possiede.

**Conseguenze operative sul codice.** Ogni numero deve poter rispondere alla domanda *"da dove
viene?"*. Ogni scelta non ovvia deve avere le alternative scartate scritte da qualche parte. I
punti su cui arriveranno domande vanno segnalati in anticipo, non nascosti.

**Ambizione dichiarata**, contro il suggerimento della task di restare sul caso minimo: copertura
di tutti i livelli — statale, regionale, comunale — con calcolo su 12, 13 e 14 mensilità e
spiegazione completa di dove finisce la differenza tra lordo e netto. Il collo di bottiglia non è
la quantità di codice ma **quanti parametri normativi si riesce a reperire, capire e difendere
personalmente**: lo scope si misura in parametri posseduti, non in feature.

---

## 2. Notion è l'unica fonte di verità

Tutta la documentazione di progetto vive in Notion, sotto la pagina
[Jet Salary Calculator](https://app.notion.com/p/3c89c023ea5380d89cf5f1fe92d06da8):

| Pagina | Cosa contiene |
| --- | --- |
| [Architettura](https://app.notion.com/p/3c89c023ea53819897fada20ccb8f5d1) | Motore, dati, tracciabilità, tipi, pipeline |
| [Dominio normativo](https://app.notion.com/p/3c89c023ea538146b9ccff29063898e0) | La catena di calcolo, le quattro nature, le discontinuità |
| [Fonti](https://app.notion.com/p/3c89c023ea53815f9afbe2e4a4c12244) | Ogni norma letta, con URL, data di consultazione e parametri estratti |
| [Decision log](https://app.notion.com/p/3c89c023ea53816b82dccfd4f6f0efe7) | Ogni scelta (D-001…), alternative scartate, motivazione |
| [Semplificazioni](https://app.notion.com/p/3c89c023ea5381148776f5f9bc5e48dd) | Cosa resta fuori (S-001…), perché, con quale effetto sul numero |
| [Casi di test](https://app.notion.com/p/3c89c023ea5381799d42e8d69184b210) | Le RAL di verifica con i valori calcolati a mano |
| [Stato attuale dell'app](https://app.notion.com/p/3c89c023ea5381388beaca8d4ab9bbd3) | Fotografia di cosa esiste davvero nel codice |
| [Consegna](https://app.notion.com/p/3c89c023ea5381ef8485e48841ea40ff) | Checklist finale e testo dell'email |

### La regola

**Le decisioni di architettura e di prodotto non si prendono in autonomia: si leggono da Notion.**

- Prima di scrivere codice su un'area, si legge la pagina che la governa.
- Se una decisione serve e non è in Notion, **non la si inventa**: si chiede.
- Se qualcosa in Notion sembra sbagliato, incoerente o superato dai fatti, **lo si segnala e ci si
  ferma su quel punto** — non si implementa una versione propria, nemmeno se più sensata.
- Se una scelta implementativa non ovvia viene presa mentre si scrive codice, va aggiunta al
  **Decision log**, non lasciata implicita nel diff.
- Se un parametro normativo viene usato senza fonte confermata, va marcato esplicitamente come
  **non verificato**.

### Aggiornamento della documentazione

*Stato attuale dell'app* e le sue sottopagine (Repo e struttura, Motore di calcolo, Dati e
parametri, Interfaccia, Test, Deploy) vanno aggiornate **nello stesso momento** in cui si modifica
il codice, non a fine giornata. Ogni sottopagina porta in cima **data e commit di riferimento**.

Convenzione che regge la divisione del lavoro: **il codice è la verità sul dettaglio, Notion è la
verità sul perché.** Non si duplicano firme di funzioni o contenuti di file nelle pagine. Si
registra cosa è *fatto*, cosa è *in corso*, cosa è *da fare*, senza ottimismo: una cosa che
compila ma non è testata non è fatta.

---

## 3. Architettura a tre livelli

### Il principio che regge tutto

**I parametri normativi sono dati. Il codice contiene solo le regole di calcolo.**

Ogni volta che una scelta è ambigua, questo principio decide. Se un numero viene da una legge, da
una circolare o da una delibera, non sta in una funzione: sta in un file di dati.

**Perché.** Jet HR fa payroll: la normativa che cambia ogni gennaio non è un caso limite, è il
loro lavoro quotidiano. Con questa separazione, all'uscita della Legge di Bilancio successiva si
aggiunge un file di parametri, non si tocca una riga di logica, e i test dell'anno precedente
continuano a passare. È la risposta a una domanda quasi certa al colloquio.

### I tre livelli

| Livello | Cosa contiene | Vincolo |
| --- | --- | --- |
| `core/` | Motore di calcolo | **TypeScript puro: zero React, zero Next, zero import di dati.** Riceve input e regime, restituisce una traccia |
| `data/` | Parametri normativi | Nessuna logica. Regime dell'anno, regioni, comuni. Ogni parametro porta accanto la propria citazione |
| `app/` | Next, React, interfaccia | Consuma la traccia e la rende leggibile |

`scripts/` sta accanto ai tre livelli: import e conversione dei dataset MEF, eseguito **una volta,
offline**. Versionato nel repo, perché la sua esistenza è prova visibile del lavoro sulle fonti.

**Il test della separazione — due verifiche binarie:**

- se `core/` importa qualcosa da `app/`, la separazione è rotta;
- se il motore compila e i test passano **senza React installato**, la separazione è giusta.

### La traccia

Il motore **non restituisce un numero**: restituisce una sequenza di passi, e ogni passo porta con
sé cosa entra, quale regola si applica, quale parametro è stato usato e da quale fonte, cosa esce,
e **il segno** — la voce sottrae o aggiunge.

**Perché questa forma.** La pagina deve mostrare quattro cose: il numero, il breakdown voce per
voce, la spiegazione all'utente e la citazione della fonte. Se tutte e quattro derivano dallo
stesso oggetto, non possono contraddirsi. Se invece si calcola prima e si scrivono i testi a mano
dopo, si creano due verità che divergono al primo cambio di parametro. Effetto collaterale: la UI
della spiegazione smette di essere lavoro aggiuntivo e diventa rendering della traccia.

Il segno positivo non è un'eccezione: esistono somme che per legge **non concorrono a formare il
reddito** e si aggiungono al netto. Da qui due conseguenze già decise: le nature nell'output sono
**quattro** (previdenza, imposte erariali, imposte locali, voci che aggiungono), e la sezione di
dettaglio **non può chiamarsi "trattenute"**.

### La regola di calcolo che nasce dal dominio

Le voci **non sono indipendenti**: la detrazione dipende dall'imponibile, che dipende dai
contributi. Alla domanda *"quanto vale questa voce?"* la risposta corretta è sempre **la
differenza tra due calcoli completi**, mai la somma dei suoi effetti diretti.

### Comuni e regioni

Circa ottomila comuni, ciascuno con struttura propria. **Il motore non deve conoscerne nessuno:
gestisce tre forme strutturali** — aliquota unica, a scaglioni, con soglia di esenzione. La
copertura diventa una questione di quante righe ci sono nel dataset, non di quanto codice si è
scritto. Il dataset non va nel bundle client.

### Test

Vitest su `core/`, non sui componenti. I casi sono le RAL che attraversano le discontinuità, con
valori attesi **derivati a mano dalla norma**, non copiati da un altro calcolatore. È la
differenza tra poter dire *"so che è giusto"* e *"sembra giusto"*.

Il calcolatore pubblico di Jet HR è un **comparatore, non un oracolo**: ogni scostamento va
spiegato individuando quale assunzione diversa lo produce, mai corretto per farlo sparire.

---

## 4. Fonti primarie: fuori dal repo, citate dentro

**Le fonti primarie non stanno nel repo.** Nessun PDF, nessun testo di legge, nessun dataset
grezzo versionato. Il riferimento normativo vive in due posti, ed entrambi sono parte del
prodotto:

1. **Accanto a ogni parametro in `data/`** — ogni valore porta la propria citazione (atto,
   articolo o comma, data di consultazione) come dato, non come commento.
2. **Come link in pagina** — ogni voce dell'output mostra fonte e data di verifica, perché il
   criterio 1 è la ricerca e va dimostrata dentro l'artefatto.

Corollari:

- **Il dataset comuni è statico**, importato una volta dal MEF e convertito in JSON da uno script
  in `scripts/`. Nessuna chiamata API a runtime. Il JSON porta dentro di sé origine e **data di
  estrazione**, così la dicitura in pagina viene dal dato e non da una costante scritta a mano che
  si dimenticherà di aggiornare.
- **Distinzione tra parametro verificato e parametro importato**: Milano e Lombardia sono
  verificate una per una sulle delibere; il resto è importato dal MEF a una data dichiarata in
  pagina. La distinzione è essa stessa una decisione di prodotto.
- **Le semplificazioni sono un blocco visibile in pagina**, con la motivazione di ciascuna. È un
  vincolo del progetto: non possono restare in un README.

La reperibilità delle fonti primarie è lavoro umano, non delegato: dove *Fonti* dice *"da
reperire"*, l'azione è dell'autore, non dell'assistente. Unica eccezione alla regola: la
documentazione tecnica di librerie e strumenti.

---

## 5. Fase corrente — sviluppo

**Al 28/08/2026 la ricerca normativa è chiusa. Si sviluppa.**

Cosa questo significa in pratica:

- **Ramo fiscale chiuso.** Imponibile, scaglioni, entrambe le detrazioni, i tre istituti del ramo
  parallelo e tutte le soglie hanno parametro **e** norma.
- **Ramo contributivo chiuso.** Aliquota ordinaria e aliquota apprendista su fonte INPS primaria,
  quota aggiuntiva 1% con la propria condizione di legge.
- **Addizionali: dati acquisiti**, meccanismi chiusi, **il caso base Milano/Lombardia è calcolabile
  end-to-end**. Restano i punti aperti registrati nella pagina madre: nessuno blocca il calcolo del
  caso base, due bloccano una citazione, uno blocca due regioni, **uno blocca un campo del tipo
  `Regione`** (le detrazioni regionali legate al solo reddito). Prima di scrivere quel tipo,
  leggere lo stato aggiornato in *Fonti* §15.a e nella pagina madre.

**Lo scaffolding esiste e non va toccato**: Next App Router, TypeScript, Tailwind, Vitest, cartelle
`core/`, `data/`, `scripts/` al primo livello.

Il lavoro da qui in avanti è: tipi e motore in `core/`, parametri con citazione in `data/`, script
di import in `scripts/`, interfaccia in `app/`. Ordine e priorità si leggono da *Stato attuale
dell'app*.

**Commit reali distribuiti sui giorni di lavoro**, non un commit unico finale: la cronologia del
repo è essa stessa prova di controllo sul lavoro, ed è una delle cose che valutano.

---

## 6. Nota di stack

Next è alla versione 16: **API, convenzioni e struttura dei file possono differire da quanto
appreso in training.** Prima di scrivere codice Next, leggere la guida pertinente in
`node_modules/next/dist/docs/`.

**La generazione automatica è spenta, e la riga in `.gitignore` non serve più.** Fino alla 16.2
`next dev` rigenerava un `AGENTS.md` con questo stesso avviso, ed era la ragione per cui
`AGENTS.md` sta in `.gitignore`. **Dalla 16.3.3 il file non viene più creato: il blocco viene
appeso in coda a questo stesso `CLAUDE.md`**, che è documentazione di progetto e non un artefatto
generato — quindi ricompariva come modifica non committata a ogni avvio del server.

`agentRules: false` in `next.config.ts` disattiva il comportamento. Se un blocco delimitato da
`<!-- BEGIN:nextjs-agent-rules -->` ricompare in fondo a questo file, è perché quella riga di
configurazione è stata rimossa: va tolto il blocco, non il commento che lo spiega.

La riga `AGENTS.md` in `.gitignore` è ora inerte. Resta perché toglierla non guadagna nulla e
perché una versione futura di Next potrebbe tornare a generarlo.
