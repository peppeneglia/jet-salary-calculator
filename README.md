# Jet Salary Calculator

Calcolatore della retribuzione netta annua per l'anno d'imposta 2026. Dalla retribuzione annua lorda al netto, con il dettaglio di ogni voce e la fonte normativa che la determina.

**→ [jet-salary-calculator.vercel.app](https://jet-salary-calculator.vercel.app/)**

Progetto indipendente. Non è un prodotto Jet HR e non è affiliato all'azienda.

---

## Copertura

Tre livelli d'imposta: statale, regionale, comunale.

- 7.897 comuni, di cui 7.896 calcolabili
- 21 enti impositori regionali
- contributi previdenziali, IRPEF e detrazioni, addizionali regionale e comunale, cuneo fiscale e trattamento integrativo
- contratto a tempo indeterminato, determinato e apprendistato; 12, 13 o 14 mensilità

I limiti del calcolo sono dichiarati in pagina.

---

## Pagine

| Rotta | Contenuto |
|---|---|
| `/` | il calcolatore e la catena voce per voce |
| `/spiegazione` | il meccanismo generale dal lordo al netto |
| `/norme` | archivio degli atti applicati, filtrabile per sezione |
| `/cosa-non-copre` | i limiti del calcolo e la loro condizione |
| `/che-progetto-e` | origine e perimetro del progetto |
| `/come-e-fatta` | stack, struttura, verifiche, sicurezza |
| `/chi-sono` | l'autore |

---

## Struttura

```
core/       motore di calcolo. TypeScript puro, senza React, Next o dati
data/       parametri normativi con le loro citazioni, e i dataset generati
fixtures/   contratto fra motore e interfaccia, e le suite di test
scripts/    import e conversione dei dataset
app/        Next, React, interfaccia
```

Le dipendenze vanno in una sola direzione: `data/ → core/`, `fixtures/ → core/ + data/`, `app/ → core/ + data/`.

Il motore riceve input, regime, enti, assunzioni e lingua, e restituisce una traccia: la sequenza dei passi con input, regola applicata, parametro usato, fonte e output. Numero, dettaglio e spiegazione derivano dalla stessa struttura.

Ogni parametro normativo è avvolto in `Citato<T> = { valore, fonte }`. Il regime porta inoltre la mappa dalle regole del dominio alle norme che le stabiliscono.

---

## Dati

Le aliquote delle addizionali provengono dagli elenchi del MEF, Dipartimento delle Finanze; le geometrie degli enti regionali dai confini amministrativi ISTAT. Gli script di import girano offline e producono JSON versionati, con origine e data di estrazione dentro il file. I documenti di partenza non sono nel repository.

---

## Comandi

```bash
npm install
npm run dev        # sviluppo, su localhost:3000
npm run build      # eslint, poi next build
npm start          # server di produzione
npm run test:run   # suite completa
npm run lint
```

Stack: Next 16 (App Router), TypeScript, Tailwind v4, Vitest. Deploy su Vercel.
