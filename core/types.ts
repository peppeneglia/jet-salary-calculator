/**
 * Tipi del motore di calcolo.
 *
 * Nessuna logica: qui si descrive solo la forma del dominio.
 * Le decisioni incorporate stanno in Notion — Architettura, Dominio normativo, Fonti.
 * Se un tipo qui dice una cosa che Notion non dice, il tipo è sbagliato.
 */

// Tipi branded
//
// Architettura: «in un dominio dove euro, percentuali e anni d'imposta circolano
// tutti come number, tipi branded per gli importi impediscono di sommare
// un'aliquota a un imponibile».

declare const marchio: unique symbol
type Branded<T, B extends string> = T & { readonly [marchio]: B }

/** Importo in euro. */
export type Euro = Branded<number, 'Euro'>

/** Aliquota in punti percentuali, non in frazione: 9,19% si scrive 9.19. */
export type Aliquota = Branded<number, 'Aliquota'>

/** Periodo d'imposta. */
export type AnnoImposta = Branded<number, 'AnnoImposta'>

/**
 * Le grandezze di reddito sono tre e non vanno fuse, anche quando nel caso
 * standard hanno lo stesso valore.
 *
 * - reddito complessivo — art. 8 TUIR, al netto dell'abitazione principale
 *   (art. 10 c. 3-bis). Su questa si misurano le fasce dell'art. 13, la soglia
 *   di accesso alla somma del cuneo e l'intera detrazione da cuneo.
 * - reddito di lavoro dipendente — artt. 49 e 51 TUIR. Su questa si determinano
 *   fascia e base della somma del cuneo.
 * - retribuzione imponibile previdenziale — art. 12 L. 153/1969, al lordo di
 *   qualsiasi contributo e trattenuta. Sta a monte della catena fiscale.
 *
 * Fonti §1.a, §4.e: la coincidenza è una proprietà del caso standard, non del
 * dominio — la L. 207/2024 c. 386 e la L. 199/2025 c. 11 dimostrano che il
 * legislatore separa le basi quando gli serve.
 */
export type RedditoComplessivo = Branded<number, 'RedditoComplessivo'>
export type RedditoLavoroDipendente = Branded<number, 'RedditoLavoroDipendente'>
export type RetribuzionePrevidenziale = Branded<number, 'RetribuzionePrevidenziale'>

/**
 * Costruttori. Sono cast, non calcolo: servono a far entrare un letterale nel
 * tipo branded senza spargere `as` per i file di dati e di fixture.
 */
export const euro = (n: number): Euro => n as Euro
export const aliquota = (n: number): Aliquota => n as Aliquota
export const annoImposta = (n: number): AnnoImposta => n as AnnoImposta
export const redditoComplessivo = (n: number): RedditoComplessivo => n as RedditoComplessivo
export const redditoLavoroDipendente = (n: number): RedditoLavoroDipendente =>
  n as RedditoLavoroDipendente
export const retribuzionePrevidenziale = (n: number): RetribuzionePrevidenziale =>
  n as RetribuzionePrevidenziale

// La lingua
//
// D-041: la lingua è un parametro del motore, non una chiave nella UI.

/**
 * Le lingue in cui il calcolatore sa parlare.
 *
 * Sta in `core/` per la stessa ragione per cui ci sta `IdRegola`: descrive il
 * dominio del motore, cioè quali forme può avere la sua uscita. Quali testi
 * ci siano dentro ciascuna lingua è invece dato, e vive in `data/`.
 */
export type CodiceLingua = 'it' | 'en'

/**
 * Un testo in tutte le lingue.
 *
 * Non è una mappa parziale: `Record` pieno, così una voce aggiunta senza la sua
 * traduzione non compila. È la stessa proprietà di `FontiRegola` — il vincolo
 * sta nel tipo, non in una convenzione che si dimentica.
 */
export type Multilingua = Readonly<Record<CodiceLingua, string>>

/**
 * Gli identificatori dei testi che il motore emette.
 *
 * Unione chiusa e `Record` pieno, per la ragione di sempre: un passo che
 * acquista una frase senza che la frase esista in entrambe le lingue non
 * compila.
 *
 * ⚠️ Qui non c'è prosa, ci sono solo chiavi. La prosa sta in `data/`,
 * perché il motore la riceve come riceve il regime: `core/` non importa
 * `data/`, ed è il meccanismo che D-002 ha istituito.
 */
export type IdTesto =
  // RAL
  | 'ral.etichetta'
  | 'ral.regola'
  | 'ral.spiegazione'
  // Contributi
  | 'contributi.etichetta'
  | 'contributi.regola'
  | 'contributi.spiegazione.ordinaria'
  | 'contributi.spiegazione.apprendista'
  | 'base-contributiva.etichetta'
  | 'base-contributiva.regola'
  | 'base-contributiva.spiegazione'
  // Quota aggiuntiva 1%
  | 'quota.etichetta'
  | 'quota.regola.regime'
  | 'quota.regola'
  | 'quota.spiegazione.regime'
  | 'quota.ragione.regime'
  | 'quota.spiegazione.sotto-soglia'
  | 'quota.ragione.sotto-soglia'
  | 'quota.spiegazione.applicata'
  // Dal lordo all'imponibile fiscale
  | 'reddito-complessivo.etichetta'
  | 'reddito-complessivo.regola'
  | 'reddito-complessivo.spiegazione'
  // Ramo erariale
  | 'irpef-lorda.etichetta'
  | 'irpef-lorda.regola'
  | 'irpef-lorda.spiegazione'
  | 'detrazione.etichetta'
  | 'detrazione.regola'
  | 'detrazione.spiegazione'
  | 'detrazione-incremento.etichetta'
  | 'detrazione-incremento.regola'
  | 'detrazione-incremento.spiegazione'
  | 'detrazione-cuneo.etichetta'
  | 'detrazione-cuneo.regola'
  | 'detrazione-cuneo.spiegazione'
  | 'irpef-netta.etichetta'
  | 'irpef-netta.regola'
  | 'irpef-netta.spiegazione.capiente'
  | 'irpef-netta.spiegazione.incapiente'
  | 'irpef.etichetta'
  | 'irpef.regola'
  | 'irpef.spiegazione'
  // Gli scaglioni descrivono se stessi
  | 'scaglione.etichetta'
  | 'scaglione.etichetta.ultimo'
  | 'scaglione.regola'
  | 'scaglione.regola.ultimo'
  | 'scaglione.spiegazione'
  // Il gate delle addizionali
  | 'gate.etichetta.aperto'
  | 'gate.etichetta.chiuso'
  | 'gate.regola'
  | 'gate.spiegazione'
  | 'gate.ragione.aperto'
  | 'gate.ragione.chiuso'
  | 'addizionale.spiegazione.gate'
  | 'addizionale.ragione.gate'
  // Addizionale regionale
  | 'regionale.etichetta'
  | 'regionale.regola.non-istituita'
  | 'regionale.spiegazione.non-istituita'
  | 'regionale.ragione.non-istituita'
  | 'regionale.regola.gate'
  | 'regionale.regola'
  | 'regionale.spiegazione'
  | 'regionale.regola.esente'
  | 'regionale.spiegazione.esente'
  | 'regionale.ragione.esente'
  | 'soglia-esenzione-regionale.regola'
  | 'regionale.spiegazione.dedotta'
  | 'deduzione-regionale.etichetta'
  | 'deduzione-regionale.regola'
  | 'deduzione-regionale.spiegazione'
  | 'deduzione-regionale.spiegazione.non-spetta'
  | 'deduzione-regionale.ragione.non-spetta'
  | 'regionale.fascia-intera.etichetta'
  | 'regionale.fascia-intera.regola'
  | 'regionale.fascia-intera.spiegazione'
  | 'detrazioni-regionali.etichetta'
  | 'detrazioni-regionali.regola'
  | 'detrazioni-regionali.spiegazione'
  | 'detrazioni-regionali.spiegazione.pavimento'
  | 'detrazioni-regionali.una'
  | 'detrazioni-regionali.molte'
  // Addizionale comunale
  | 'comunale.etichetta'
  | 'comunale.regola.non-istituita'
  | 'comunale.spiegazione.non-istituita'
  | 'comunale.ragione.non-istituita'
  | 'comunale.regola.gate'
  | 'comunale.regola.esente'
  | 'comunale.spiegazione.esente'
  | 'comunale.ragione.esente'
  | 'comunale.regola'
  | 'comunale.spiegazione.ereditato'
  | 'comunale.spiegazione.deliberato'
  | 'soglia-esenzione.etichetta'
  | 'soglia-esenzione.regola'
  | 'soglia-esenzione.spiegazione.esente'
  | 'soglia-esenzione.spiegazione.dovuta'
  | 'soglia-esenzione.ragione.esente'
  | 'soglia-esenzione.ragione.dovuta'
  // Ramo che aggiunge
  | 'somma-cuneo.etichetta'
  | 'somma-cuneo.regola.non-dovuta'
  | 'somma-cuneo.spiegazione.non-dovuta'
  | 'somma-cuneo.ragione.non-dovuta'
  | 'somma-cuneo.regola'
  | 'somma-cuneo.spiegazione'
  | 'trattamento-integrativo.etichetta'
  | 'trattamento-integrativo.regola.spetta'
  | 'trattamento-integrativo.spiegazione.spetta'
  | 'trattamento-integrativo.regola.non-spetta'
  | 'trattamento-integrativo.spiegazione.non-spetta'
  | 'trattamento-integrativo.ragione.sopra-soglia'
  | 'trattamento-integrativo.ragione.incapiente'

/**
 * I modelli di frase, uno per identificatore.
 *
 * Sono modelli, non funzioni: i valori prendono il posto di segnaposti
 * `{nome}`, e a sostituirli è il motore. Una funzione qui sarebbe logica in
 * `data/` — la stessa ragione per cui `CondizioneAssunzione` è un dato
 * dichiarativo e non un predicato.
 */
export type TestiTraccia = Readonly<Record<IdTesto, string>>

/**
 * La lingua come la riceve il motore: non un codice, ma il pacchetto intero.
 *
 * ⚠️ Perché non basta il codice. Con un `'it' | 'en'` il motore dovrebbe
 * tenersi dentro le due tabelle di prosa, e `core/` tornerebbe a contenere
 * testo scritto — cioè il difetto che D-041 esiste per togliere. Il motore
 * riceve la lingua come riceve il regime: è il meccanismo di D-002, e vale
 * per i testi esattamente come per i parametri.
 *
 * `tag` è il tag BCP 47 con cui si formattano numeri e date: `1.234,56` in
 * italiano, `1,234.56` in inglese. La convenzione resta una sola per lingua
 * — un'aliquota e un importo nella stessa frase non possono avere separatori
 * diversi, che era il difetto all'origine di D-038.
 */
export interface Lingua {
  readonly codice: CodiceLingua
  readonly tag: string
  readonly testi: TestiTraccia
}

// Input
//
// Pagina madre: «Input obbligatori: RAL, comune di residenza, tipo di contratto.
// Facoltativo: numero di mensilità, default 13».

/**
 * Il tipo di contratto è obbligatorio per ragione didattica, non di calcolo
 * (D-011): determinato e indeterminato producono lo stesso netto, solo
 * l'apprendistato muove l'aliquota a carico del lavoratore.
 */
export type TipoContratto = 'indeterminato' | 'determinato' | 'apprendistato'

/** 12, 13 e 14 sono viste della stessa grandezza, non scenari alternativi (D-022). */
export type Mensilita = 12 | 13 | 14

export interface Input {
  readonly ral: Euro
  /**
   * Il campo non è «comune di residenza» ma comune di domicilio fiscale al
   * 1° gennaio (D.Lgs. 360/1998 art. 1 c. 4). Identificato per codice
   * catastale, che è la chiave del dataset MEF.
   */
  readonly codiceCatastale: string
  readonly tipoContratto: TipoContratto
  /**
   * In quante parti si divide lo stipendio.
   *
   * ⚠️ Obbligatorio, e lo è diventato (D-052). Era facoltativo, e il
   * motore assumeva 13 quando mancava. Un motore che assume un valore che il
   * chiamante non ha dichiarato restituisce un numero che nessuno ha
   * chiesto: è la colpa di D-036 in scala ridotta, e senza l'etichetta in
   * pagina che lì la dichiara.
   *
   * Il valore iniziale del prodotto — oggi 12 — non sta qui e non sta in
   * `data/`: nessuna legge fissa il numero di mensilità, lo fissano il CCNL
   * o chi consulta. Vive in `app/_lib/calcolo.ts`, il livello che già valida
   * l'input. Il valore risolto sta in `Risultato`.
   */
  readonly mensilita: Mensilita
}

// Fonti

/**
 * La distinzione tra parametro verificato e parametro importato è essa stessa
 * una decisione di prodotto (Architettura, S-011): Milano e Lombardia sono
 * verificate sulle delibere, il resto è importato dal MEF a una data dichiarata.
 */
export type Provenienza = 'verificata' | 'importata'

export interface Fonte {
  /** Atto per esteso, come va citato: «L. 30/12/2024 n. 207». */
  readonly atto: string
  /** Articolo, comma, lettera: «art. 1 c. 6». */
  readonly riferimento?: string
  readonly url?: string
  /** Data di consultazione, ISO 8601. */
  readonly consultataIl: string
  readonly provenienza: Provenienza
  /**
   * Per i dati importati: data di estrazione del dataset, che vive dentro il
   * dato e non in una costante scritta a mano (D-005).
   */
  readonly estrattoIl?: string
  /**
   * Segnalazione esplicita per i parametri usati senza fonte confermata.
   *
   * `Multilingua` e non `string`: la riserva compare in pagina, accanto al
   * valore che qualifica. Una riserva che resta in italiano quando il resto
   * della pagina è in inglese è una riserva che non viene letta, e una riserva
   * non letta vale zero.
   */
  readonly nonVerificato?: Multilingua
}

// Parametri

export interface Scaglione {
  /** Estremo inferiore escluso; il primo scaglione parte da 0. */
  readonly da: Euro
  /** Estremo superiore incluso; `null` per l'ultimo scaglione. */
  readonly a: Euro | null
  readonly aliquota: Aliquota
}

/**
 * Le tre forme che il motore deve gestire, e sono chiuse (Fonti §7).
 * L'ente non può inventarsi soglie proprie: usa un set di scaglioni o l'altro,
 * oppure resta ad aliquota unica.
 *
 * Riusare le costanti degli scaglioni IRPEF per le addizionali produce numeri
 * plausibili e sbagliati: sono due set diversi ed è l'ente a scegliere.
 */
export type FormaAliquota =
  | { readonly forma: 'unica'; readonly aliquota: Aliquota }
  | { readonly forma: 'scaglioni-vigenti'; readonly scaglioni: readonly Scaglione[] }
  | { readonly forma: 'scaglioni-previgenti'; readonly scaglioni: readonly Scaglione[] }

/**
 * Unione chiusa: un parametro è una di queste cinque cose e nient'altro.
 * Ogni variante porta la propria fonte, perché è il parametro a essere citato,
 * non il passo che lo usa.
 */
export type Parametro =
  | { readonly tipo: 'aliquota'; readonly valore: Aliquota; readonly fonte: Fonte }
  | { readonly tipo: 'importo'; readonly valore: Euro; readonly fonte: Fonte }
  | { readonly tipo: 'soglia'; readonly valore: Euro; readonly fonte: Fonte }
  | { readonly tipo: 'scaglioni'; readonly valore: FormaAliquotaRegionale; readonly fonte: Fonte }
  | {
      readonly tipo: 'formula'
      /** La formula come sta nella norma: «1.910 + 1.190 × (28.000 − RC) / 13.000». */
      readonly espressione: string
      /** La stessa formula con i valori sostituiti, per renderla in pagina. */
      readonly applicata: string
      readonly fonte: Fonte
    }

// Regime
//
// I parametri normativi di un anno d'imposta. Nessuna logica: `data/` descrive
// cosa dice la norma, `core/` cosa se ne fa. All'uscita della Legge di Bilancio
// successiva si aggiunge un file di questa forma e non si tocca il motore.

/**
 * Le regole del dominio che il motore applica e che vanno citate.
 *
 * Unione chiusa, e sta in `core/` perché descrive il dominio: quali regole
 * esistono non dipende dall'anno d'imposta. Chi le stabilisce sì, e infatti la
 * mappa verso le norme vive in `data/` (D-029).
 *
 * Segue la catena di *Dominio normativo*, nell'ordine in cui il motore la
 * percorre. Non tutti i passi hanno una regola: quello che espone la RAL non ne
 * ha, perché la RAL è un input e non l'applicazione di una norma.
 */
export type IdRegola =
  // Ramo contributivo
  | 'base-contributiva'
  | 'aliquota-ivs'
  | 'quota-aggiuntiva'
  // Dal lordo all'imponibile fiscale
  | 'esclusione-contributi-dal-reddito'
  // Ramo erariale
  | 'scaglioni-irpef'
  | 'detrazione-lavoro-dipendente'
  | 'troncamento-rapporti'
  | 'detrazione-cuneo'
  | 'pavimento-imposta-netta'
  // Ramo locale
  | 'gate-addizionali'
  | 'soglia-esenzione-comunale'
  // Ramo che aggiunge
  | 'somma-cuneo'
  | 'trattamento-integrativo'

/**
 * Da regola alle norme che la stabiliscono.
 *
 * `Record` pieno e non `Partial`: una regola aggiunta senza citazione non
 * compila. È la stessa proprietà di `Citato<T>` — il vincolo è nel tipo, non in
 * una convenzione che si dimentica.
 *
 * `readonly Fonte[]` e non `Fonte`: il gate delle addizionali è due norme, una
 * per tributo, e con un solo campo la regionale sparirebbe dalla pagina.
 */
export type FontiRegola = Readonly<Record<IdRegola, readonly Fonte[]>>

/**
 * Un valore che porta con sé la propria fonte.
 *
 * In `data/` la citazione è un dato, non un commento: se fosse un commento non
 * potrebbe finire in pagina accanto alla voce, e la pagina deve mostrare
 * l'origine di ogni numero.
 */
export interface Citato<T> {
  readonly valore: T
  readonly fonte: Fonte
}

/**
 * Fascia in cui la percentuale si applica all'intero reddito, non alla
 * parte eccedente.
 *
 * ⚠️ Non è uno `Scaglione`, e i due tipi non devono essere intercambiabili.
 * Le fasce della somma del cuneo (L. 207/2024 art. 1 c. 4) non sono scaglioni:
 * ogni confine è un salto secco verso il basso, non un cambio di pendenza.
 * Trattarle come scaglioni produce numeri plausibili e sbagliati, e cancella le
 * discontinuità più violente del sistema.
 */
export interface FasciaSuIntero {
  readonly redditoDa: Euro
  readonly redditoA: Euro | null
  readonly percentuale: Aliquota
}

/**
 * `base + quota × (riferimento − reddito) / ampiezza`.
 *
 * Con `base` a zero copre anche la forma `quota × (riferimento − reddito) /
 * ampiezza`. L'espressione testuale serve a mostrare in pagina la formula come
 * sta nella norma.
 */
export type FormulaDetrazione =
  | { readonly forma: 'costante'; readonly importo: Euro }
  | {
      readonly forma: 'lineare-decrescente'
      readonly base: Euro
      readonly quota: Euro
      readonly riferimento: Euro
      readonly ampiezza: Euro
      readonly espressione: string
    }

/** La detrazione è una funzione a tratti, non una curva liscia. */
export interface FasciaDetrazione {
  readonly redditoDa: Euro
  readonly redditoA: Euro | null
  readonly formula: FormulaDetrazione
}

/** Importo fisso che compare e sparisce a due soglie: è un gradino, non una curva. */
export interface IncrementoFisso {
  readonly importo: Euro
  readonly redditoDa: Euro
  readonly redditoA: Euro
}

export interface MinimiDetrazione {
  readonly generale: Euro
  /** Più alto per i rapporti a tempo determinato: è l'unico punto del ramo
   * fiscale in cui il tipo di contratto muoverebbe il netto. Sotto l'assunzione
   * di anno intero non si attiva. */
  readonly tempoDeterminato: Euro
}

export interface Regime {
  readonly anno: AnnoImposta

  /**
   * Le norme che stabiliscono ogni regola della catena.
   *
   * Sta qui e non in `core/` perché la citazione della regola cambia con
   * l'anno d'imposta: il gate del trattamento integrativo, per il 2026, si
   * cita *DL 3/2020 art. 1, come mod. dalla L. 207/2024 art. 1 c. 3*; per il
   * 2024 la stessa regola si citava senza quel pezzo. La regola è identica,
   * l'atto che la stabilisce no. Una `Fonte` scritta nel motore invecchierebbe
   * come una costante (D-002, D-029).
   */
  readonly fontiRegola: FontiRegola

  readonly contributi: {
    readonly aliquotaOrdinaria: Citato<Aliquota>
    /**
     * ⚠️ Non è una costante indipendente: l'art. 21 della L. 41/1986 concede
     * una riduzione di tre punti sull'aliquota ordinaria del regime, quindi
     * è un rinvio dinamico. Il valore è scritto perché è quello che le fonti
     * INPS dichiarano; la nota sta nella fonte.
     */
    readonly aliquotaApprendista: Citato<Aliquota>
    readonly quotaAggiuntiva: {
      readonly aliquota: Citato<Aliquota>
      readonly sogliaPrimaFascia: Citato<Euro>
      /**
       * ⚠️ Condizione di applicabilità della norma, riferita al regime
       * pensionistico e non al singolo lavoratore: l'art. 3-ter si applica ai
       * regimi «che prevedano aliquote contributive a carico del lavoratore
       * inferiori al 10 per cento». Non va confrontata con l'aliquota
       * dell'apprendista — l'apprendista è iscritto allo stesso regime di tutti
       * gli altri, e la verifica si fa sull'aliquota ordinaria.
       */
      readonly aliquotaMassimaRegime: Citato<Aliquota>
    }
  }

  readonly irpef: {
    readonly scaglioni: Citato<readonly Scaglione[]>
  }

  /**
   * Numero di cifre decimali a cui si assumono i rapporti nelle detrazioni a
   * formula.
   *
   * Sta al primo livello, e non dentro `detrazioneLavoroDipendente`, perché
   * non è una peculiarità di quell'istituto: la formula «si assume nelle
   * prime quattro cifre decimali» compare due volte nel TUIR — art. 13 c. 6 e
   * art. 12 c. 4 — ed è una convenzione del testo unico per le detrazioni a
   * formula. Annidarla la farebbe sembrare una proprietà della detrazione da
   * lavoro dipendente, e la duplicherebbe se i carichi di famiglia rientrassero
   * nel perimetro.
   *
   * Qui sta il quanto, che viene dalla norma. Il *troncare anziché
   * arrotondare* è regola di calcolo e resta in `core/` (D-025, D-027).
   */
  readonly troncamentoRapportiDetrazione: Citato<number>

  /** Detrazione soggettiva del TUIR. */
  readonly detrazioneLavoroDipendente: {
    readonly fasce: Citato<readonly FasciaDetrazione[]>
    readonly incrementoFasciaIntermedia: Citato<IncrementoFisso>
    readonly minimi: Citato<MinimiDetrazione>
  }

  readonly cuneo: {
    /** Somma erogata che non concorre a formare il reddito: ramo che aggiunge. */
    readonly somma: {
      readonly sogliaAccesso: Citato<Euro>
      readonly fasce: Citato<readonly FasciaSuIntero[]>
    }
    /** Detrazione dall'imposta lorda, di legge speciale e non del TUIR. */
    readonly detrazione: {
      readonly fasce: Citato<readonly FasciaDetrazione[]>
    }
  }

  readonly trattamentoIntegrativo: {
    readonly importo: Citato<Euro>
    readonly sogliaRedditoComplessivo: Citato<Euro>
    /**
     * I 75 euro di cui si diminuisce la detrazione dell'art. 13 c. 1 nel
     * confronto con l'imposta lorda. Non è una tolleranza voluta: neutralizza
     * l'aumento della detrazione da 1.880 a 1.955 e lascia ferma la soglia.
     */
    readonly scartoSulGate: Citato<Euro>
  }
}

// Enti impositori

/**
 * La mappatura non è `comune → regione` ma `comune → ente impositore
 * regionale`: per il Trentino-Alto Adige l'addizionale «regionale» la fissano
 * le due province autonome, separatamente (Fonti §11, §15.a).
 */
/**
 * La forma dell'aliquota regionale ha una variante in più di quella comunale
 * (D-062): oltre a `unica` e agli scaglioni progressivi, esiste l'aliquota per
 * fascia intera, che si applica all'intero imponibile e cambia per soglia.
 *
 * ⚠️ La conclusione «progressiva e non per fascia intera» era stata accertata
 * sul file comunale ed estesa a entrambi i livelli senza verifica. Sul
 * regionale è falsa per tre enti, e la differenza è di 80–165 euro a imponibile
 * 20.000. È la terza volta che morde la stessa regola: *il parsing segue il
 * testo, mai la posizione della colonna*. Non è una trappola del file, è una
 * proprietà del modello dati del ministero, che espone in colonne numeriche una
 * struttura che le colonne non sanno rappresentare e la spiega in prosa accanto.
 *
 * ⚠️ Non si aggiunge una meccanica: se ne riusa una che il dominio aveva già
 * su un altro ramo. `FasciaSuIntero` è il tipo delle fasce percentuali della
 * somma del cuneo — percentuale sull'intero reddito, salto secco al confine — e
 * `core/` le calcola già.
 *
 * `progressioneOltre` esiste perché due enti su tre sono ibridi: la fascia
 * intera vale sotto una soglia, e sopra si torna agli scaglioni pubblicati.
 * `null` per chi resta a fascia intera su tutto l'arco.
 */
export type FormaAliquotaRegionale =
  | FormaAliquota
  | {
      readonly forma: 'fasce-intere'
      readonly fasce: readonly FasciaSuIntero[]
      readonly progressioneOltre: readonly Scaglione[] | null
    }

export interface ParametriRegionali {
  readonly aliquota: FormaAliquotaRegionale
  /**
   * Le detrazioni regionali legate al solo reddito, applicate dal motore con
   * pavimento a zero — se superano l'addizionale il risultato è zero, mai un
   * credito d'imposta (D-061). Quelle per carichi di famiglia restano fuori
   * perimetro, coerentemente con D-019: non sono derivabili dagli input.
   *
   * ⚠️ È il quarto pavimento a zero del sistema, e la Provincia di Trento lo
   * scrive per esteso — *«se l'imposta dovuta risulta minore della detrazione non
   * sorge alcun credito d'imposta»* — con Bolzano che lo replica. Si aggiunge
   * all'IRPEF netta (art. 11 c. 3) e alla detrazione dell'art. 13 (c. 6): il
   * pavimento a zero è una proprietà del sistema, non di un istituto.
   *
   * ⚠️ Il campo era il punto aperto più vecchio del progetto, bloccato dalla
   * domanda *quale norma statale autorizza le regioni a concedere detrazioni*.
   * A sbloccarlo non è stata una risposta ma D-059: sono regole la cui unica base
   * è l'atto dell'ente, e il modo di tenerle oneste è dichiararlo. Il valore
   * una fonte ce l'ha — la legge regionale, esposta per ente nella colonna
   * `NORME`; è il livello statale che non risulta, e la `fonte` lo dice.
   */
  readonly detrazioni: readonly DetrazioneLocale[]
  /**
   * Soglia di esenzione, facoltativa e per ente (D-057). Stessa meccanica a
   * cliff della comunale: sotto la soglia zero, un euro sopra si paga
   * sull'intera base. `null` = l'ente non l'ha deliberata.
   *
   * ⚠️ Non è un meccanismo nuovo: è quello comunale reso simmetrico. La
   * soglia era già modellata come asse ortogonale alla forma dell'aliquota sul
   * livello comunale; qui non si aggiunge nulla, si toglie un'asimmetria che
   * era un'assunzione mai verificata — e che i dati hanno falsificato.
   *
   * ⚠️ E chiude per la terza volta lo stesso errore di metodo. L'argomento
   * dal silenzio dell'art. 50 — *l'articolo non la prevede, quindi non esiste*
   * — aveva già fallito sugli scaglioni regionali e sulle detrazioni
   * regionali. In questo dominio l'assenza di una previsione nella norma
   * statale non dice nulla su cosa gli enti deliberano.
   *
   * Al 29/08/2026 la porta un ente su ventuno, la Valle d'Aosta, e il
   * numero è misurato sul prospetto: il testo dichiara l'esenzione fino a
   * 15.000 e aggiunge che oltre *«si applica l'aliquota ordinaria sull'intero
   * imponibile»*, che è la definizione del cliff.
   *
   * ⚠️ `Citato<Euro>` e non `Euro`, ed è D-059 che lo impone.
   *
   * La comunale cita l'art. 1 c. 3-bis del D.Lgs. 360/1998 tramite
   * `fontiRegola`. Questa non ha una norma statale: l'art. 50 non la
   * prevede. Citarlo per simmetria sarebbe inventare una citazione, ma
   * lasciare il passo con un array di fonti vuoto aggirerebbe D-029 — quel
   * tipo è `Record` pieno e non `Partial` proprio perché il compilatore
   * rifiutasse una regola senza citazione, e un array vuoto soddisfa il tipo
   * svuotandone lo scopo.
   *
   * La soglia porta quindi la propria fonte, che è l'atto dell'ente, con
   * dentro la riserva dichiarata su ciò che manca: non *quale* atto fissa
   * il valore — quella è la riserva già usata per la Lombardia — ma se
   * esista un atto statale che attribuisce all'ente quella facoltà.
   *
   * Non è un caso isolato, è una categoria, e la stessa forma serve alle
   * `DetrazioneLocale` quando entreranno: anche quelle hanno base in una legge
   * regionale e nessuna norma statale accertata che le autorizzi. Il campo
   * `fonte` che già portano è il posto dove va la stessa riserva.
   */
  readonly sogliaEsenzione: Citato<Euro> | null
  /**
   * Deduzione dalla base imponibile dell'addizionale regionale (D-064).
   * `null` = l'ente non la prevede.
   *
   * ⚠️ È il quarto asse del tipo, e agisce su un piano che gli altri tre non
   * toccano. La forma dell'aliquota dice *con quale scala si tassa*, la
   * soglia di esenzione *se si tassa*, le detrazioni *quanta imposta si
   * abbatte*. Questa dice su quanto si tassa: è una deduzione, e la
   * distinzione fra deduzione e detrazione è la stessa che il progetto
   * difende sul ramo erariale.
   *
   * ⚠️ Perché non è la soglia di esenzione di D-057 con un altro nome.
   *
   * La Provincia autonoma di Trento concede una deduzione di 30.000 a chi ha
   * imponibile non superiore a 30.000. Poiché i due numeri coincidono, il
   * campo `sogliaEsenzione` produrrebbe oggi lo stesso risultato al centesimo:
   * sotto, base azzerata; sopra, base intera.
   *
   * L'equivalenza è una coincidenza di valori, non una proprietà. Regge
   * solo finché `importo` e `redditoMassimo` restano uguali. Se la Provincia
   * ne cambiasse uno solo, il modello a soglia darebbe un numero sbagliato
   * senza che nulla se ne accorga — il campo continuerebbe a esistere e a
   * essere popolato. È la categoria di difetto che questo progetto tratta come
   * la peggiore, e la ragione per cui i due numeri sono due campi.
   *
   * ⚠️ E la traccia mostra la regola che si applica: chiamare *esenzione*
   * una deduzione descrive male la norma a chi legge.
   *
   * ⚠️ La `Fonte` porta la riserva di D-059, come la soglia e le
   * detrazioni: il valore lo fissa la legge provinciale, esposta nella colonna
   * `NORME`; è la norma statale che autorizza l'ente a dedurre dalla base a
   * non risultare. È la quarta volta che l'argomento dal silenzio dell'art. 50
   * fallisce — dopo scaglioni, detrazioni e soglia di esenzione.
   */
  readonly deduzione: DeduzioneLocale | null
}

/**
 * Una deduzione dalla base imponibile dell'addizionale, a cliff sul diritto:
 * o spetta per intero, o non spetta affatto.
 *
 * ⚠️ I due importi sono campi distinti e non vanno fusi, nemmeno quando
 * coincidono: `importo` è quanto si toglie dalla base, `redditoMassimo` è il
 * reddito oltre il quale il diritto non sorge. Sono due grandezze che la norma
 * fissa separatamente, e oggi lo stesso numero le soddisfa entrambe per caso.
 */
export interface DeduzioneLocale {
  /** Quanto si toglie dalla base imponibile dell'addizionale. */
  readonly importo: Euro
  /** Il reddito imponibile oltre il quale la deduzione non spetta. */
  readonly redditoMassimo: Euro
  readonly fonte: Fonte
}

export interface DetrazioneLocale {
  readonly importo: Euro
  readonly redditoDa: Euro
  readonly redditoA: Euro | null
  readonly fonte: Fonte
}

export interface ParametriComunali {
  readonly aliquota: FormaAliquota
  /**
   * Soglia di esenzione, facoltativa e per comune (art. 1 c. 3-bis D.Lgs.
   * 360/1998). È un cliff, non una franchigia: sotto la soglia zero, un
   * euro sopra si paga sull'intera base. `null` = il comune non l'ha deliberata.
   */
  readonly sogliaEsenzione: Euro | null
}

/**
 * Stato di risoluzione di un ente impositore.
 *
 * Le tre varianti non sono un dettaglio di import: sono tre cose diverse che la
 * pagina deve saper dire.
 *
 * - `deliberato` — l'ente ha deliberato per l'anno d'imposta.
 * - `ereditato` — l'ente non ha deliberato e si applicano scaglioni e aliquote
 *   già vigenti nell'anno precedente (L. 207/2024 c. 728 per le regioni, c. 752
 *   per i comuni). Al 28/08/2026 è il percorso del 61% dei comuni, Milano
 *   inclusa: non è una correzione, è il ramo principale.
 * - `nonIstituito` — il tributo non esiste per quell'ente, e non ha
 *   parametri. Diverso da un'aliquota deliberata pari a zero: sono due modi
 *   diversi di non pagare nulla, e il file MEF li distingue (Fonti §15.b).
 */
/**
 * I due enti impositori, già risolti.
 *
 * Il motore li riceve: trovare il comune nel dataset, applicare il fallback
 * all'anno precedente e distinguere `0*` da un'aliquota deliberata a zero è
 * lettura di dati, non calcolo fiscale, e sta a monte. Così `core/` resta puro
 * e i test costruiscono un ente a mano senza passare dal CSV.
 */
export interface EntiRisolti {
  readonly regionale: EnteRisolto<ParametriRegionali>
  readonly comunale: EnteRisolto<ParametriComunali>
}

export type EnteRisolto<P> =
  | {
      readonly stato: 'deliberato'
      readonly nome: string
      readonly parametri: P
      readonly annoDelibera: number
      readonly fonte: Fonte
    }
  | {
      readonly stato: 'ereditato'
      readonly nome: string
      readonly parametri: P
      /** Anno d'imposta da cui i parametri sono ereditati. */
      readonly annoDiProvenienza: number
      /** La norma che impone il fallback, non il dato ereditato. */
      readonly normaDiFallback: Fonte
      readonly fonte: Fonte
    }
  | { readonly stato: 'nonIstituito'; readonly nome: string }

// La traccia

/**
 * Le quattro nature dell'output (D-009, D-017).
 *
 * I contributi non sono un'imposta: sono contribuzione che genera un diritto
 * pensionistico. E la quarta natura esiste perché alcune somme, per legge, non
 * concorrono a formare il reddito e si aggiungono al netto — è la ragione
 * per cui la sezione di dettaglio non può chiamarsi «trattenute».
 */
export type Natura = 'previdenza' | 'erariale' | 'locale' | 'aggiunge'

/**
 * `neutro` è il passo che espone una grandezza intermedia — reddito
 * complessivo, IRPEF lorda, l'apertura di un gate — senza avere un effetto
 * proprio sul netto.
 */
export type Segno = 'sottrae' | 'aggiunge' | 'neutro'

/**
 * Tre varianti, e le ultime due sono il motivo per cui il tipo è un'unione.
 *
 * Un gate che non si apre non è una voce a zero: è una voce non dovuta, con
 * una ragione. La traccia deve mostrarlo come passo con la sua ragione — è la
 * differenza tra spiegare e nascondere (Dominio normativo).
 *
 * E un gate non è un calcolo, è un confronto: legge una grandezza prodotta
 * altrove e decide se un intero ramo si applica. Non ha `entra`/`esce`, perché
 * la grandezza letta come condizione e la base su cui il ramo poi opera sono
 * due grandezze senza rapporto fra loro.
 */
export type Esito =
  | {
      readonly stato: 'applicato'
      /** La grandezza su cui il passo opera. */
      readonly entra: Euro
      /** Il risultato del passo. */
      readonly esce: Euro
      /** Quanto questo passo muove il netto annuo. Zero per i passi neutri. */
      readonly effettoSulNetto: Euro
      readonly segno: Segno
    }
  | { readonly stato: 'nonDovuto'; readonly ragione: string }
  | {
      readonly stato: 'verifica'
      readonly superata: boolean
      /** La grandezza letta come condizione. */
      readonly grandezzaLetta: Euro
      /** Perché la condizione è o non è soddisfatta, in linguaggio da mostrare. */
      readonly ragione: string
    }

export interface Passo {
  readonly id: string
  readonly etichetta: string
  /** La regola applicata, in linguaggio normativo. */
  readonly regola: string
  /** Lo stesso, in linguaggio da mostrare all'utente. */
  readonly spiegazione: string
  /**
   * Opzionale: la portano le voci del breakdown, non i passi che espongono una
   * grandezza intermedia o l'esito di un gate.
   */
  readonly natura?: Natura
  /**
   * Le norme che stabiliscono la regola applicata (D-026).
   *
   * Distinta da `Parametro.fonte`, che cita da dove viene il valore: la
   * norma che dice *si fa così* sta sul passo, la fonte che dice *il numero è
   * questo* sta sul parametro. Le due citazioni possono coesistere sullo stesso
   * passo, ed è la forma normale della doppia citazione — la legge stabilisce
   * il diritto, la circolare dà il parametro.
   *
   * È un array perché una regola può stare in più norme: il gate delle
   * addizionali è due articoli, uno per tributo.
   */
  readonly fonti?: readonly Fonte[]
  readonly parametro?: Parametro
  readonly esito: Esito
  /**
   * Passi annidati. È il modo in cui IRPEF lorda → detrazioni → IRPEF netta
   * resta un blocco unico invece di diventare tre voci affiancate (D-018), e in
   * cui il pavimento a zero diventa visibile.
   */
  readonly dettaglio?: readonly Passo[]
}

// Assunzioni

/**
 * Un'assunzione dichiarata è una decisione di prodotto; taciuta è un bug.
 * Il segno conta quanto l'assunzione stessa: dire da che parte sbaglia la
 * trasforma da lacuna in limite conosciuto.
 */
/**
 * La condizione che rende un'assunzione applicabile a un calcolo.
 *
 * È dato dichiarativo, non un predicato: `data/` dice *quando* un'assunzione
 * vale, `core/` sa *come* valutarla. Una funzione nel catalogo sarebbe logica in
 * `data/`, e renderebbe la condizione impossibile da leggere senza eseguirla.
 *
 * La maggior parte delle assunzioni è incondizionata. Le due che non lo sono
 * esistono perché *Semplificazioni* lo impone: S-002 va mostrata solo quando la
 * RAL supera il massimale, e S-014 riguarda solo chi non ha dichiarato un
 * apprendistato.
 */
export type CondizioneAssunzione =
  | { readonly tipo: 'sempre' }
  | { readonly tipo: 'ral-supera'; readonly soglia: Citato<Euro> }
  | { readonly tipo: 'contratto-diverso-da'; readonly contratto: TipoContratto }
  /**
   * Vale solo per chi ha un dato ente impositore regionale.
   *
   * ⚠️ Esiste perché due limiti riguardano un ente e non il sistema: la
   * seconda detrazione di Bolzano, che è una formula continua e non un importo
   * entro una banda, e la deduzione di Trento, che riduce la base invece
   * dell'imposta. Senza questa condizione le due voci comparirebbero a
   * chiunque, e a un residente lombardo direbbero una cosa che non lo riguarda.
   *
   * Non introduce aritmetica: è un confronto di nomi, come le altre tre.
   */
  | { readonly tipo: 'ente-regionale-e'; readonly nome: string }

/** Una voce del catalogo: l'assunzione più la condizione che la rende applicabile. */
export interface AssunzioneDichiarata {
  readonly assunzione: Assunzione
  readonly condizione: CondizioneAssunzione
}

export interface Assunzione {
  /** Riferimento alla voce in Notion: «S-002», «S-005-bis», «D-023». */
  readonly id: string
  /**
   * Il testo rivolto all'utente, in tutte le lingue.
   *
   * Resta non risolto fino al rendering, e non è una dimenticanza: il
   * catalogo lo legge anche `/cosa-non-copre`, che non passa dal motore. Con la
   * risoluzione dentro `calcolaNetto` le strade diventerebbero due, e la stessa
   * voce potrebbe leggersi diversa a seconda di quale pagina la mostra. Il
   * componente che la rende è uno solo, ed è lì che la lingua si applica.
   */
  readonly testo: Multilingua
  /** In che direzione il netto calcolato si discosta da quello reale. */
  readonly direzione: 'nessuna' | 'netto-reale-piu-alto' | 'netto-reale-piu-basso'
  /**
   * Dove va mostrata. Alcune assunzioni non possono stare nel blocco
   * semplificazioni: S-002 va accanto al numero, quando la RAL supera il
   * massimale, perché lì è l'ipotesi meno probabile.
   */
  readonly collocazione: 'accanto-al-numero' | 'blocco-semplificazioni'
  readonly fonte?: Fonte
}

// Risultato

export interface Risultato {
  readonly annoImposta: AnnoImposta
  readonly input: Input
  /** Mensilità effettivamente usata, con il default già risolto. */
  readonly mensilita: Mensilita

  /** Le tre grandezze, tenute distinte anche quando coincidono. */
  readonly grandezze: {
    readonly redditoComplessivo: RedditoComplessivo
    readonly redditoLavoroDipendente: RedditoLavoroDipendente
    readonly retribuzionePrevidenziale: RetribuzionePrevidenziale
  }

  readonly enti: EntiRisolti

  readonly passi: readonly Passo[]

  readonly nettoAnnuo: Euro
  /**
   * Le tre divisioni, tutte e tre sempre presenti: mostrarle insieme rende
   * visibile che sono viste della stessa grandezza e non scenari alternativi
   * (D-022).
   */
  readonly nettoMensile: Readonly<Record<Mensilita, Euro>>

  readonly assunzioni: readonly Assunzione[]
}
