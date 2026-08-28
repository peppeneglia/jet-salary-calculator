/**
 * Tipi del motore di calcolo.
 *
 * Nessuna logica: qui si descrive solo la forma del dominio.
 * Le decisioni incorporate stanno in Notion — Architettura, Dominio normativo, Fonti.
 * Se un tipo qui dice una cosa che Notion non dice, il tipo è sbagliato.
 */

// ---------------------------------------------------------------------------
// Tipi branded
//
// Architettura: «in un dominio dove euro, percentuali e anni d'imposta circolano
// tutti come number, tipi branded per gli importi impediscono di sommare
// un'aliquota a un imponibile».
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Input
//
// Pagina madre: «Input obbligatori: RAL, comune di residenza, tipo di contratto.
// Facoltativo: numero di mensilità, default 13».
// ---------------------------------------------------------------------------

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
   * Il campo non è «comune di residenza» ma comune di **domicilio fiscale al
   * 1° gennaio** (D.Lgs. 360/1998 art. 1 c. 4). Identificato per codice
   * catastale, che è la chiave del dataset MEF.
   */
  readonly codiceCatastale: string
  readonly tipoContratto: TipoContratto
  /** Facoltativo: in assenza vale 13. Il valore risolto sta in `Risultato`. */
  readonly mensilita?: Mensilita
}

// ---------------------------------------------------------------------------
// Fonti
// ---------------------------------------------------------------------------

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
  /** Segnalazione esplicita per i parametri usati senza fonte confermata. */
  readonly nonVerificato?: string
}

// ---------------------------------------------------------------------------
// Parametri
// ---------------------------------------------------------------------------

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
  | { readonly tipo: 'scaglioni'; readonly valore: FormaAliquota; readonly fonte: Fonte }
  | {
      readonly tipo: 'formula'
      /** La formula come sta nella norma: «1.910 + 1.190 × (28.000 − RC) / 13.000». */
      readonly espressione: string
      /** La stessa formula con i valori sostituiti, per renderla in pagina. */
      readonly applicata: string
      readonly fonte: Fonte
    }

// ---------------------------------------------------------------------------
// Regime
//
// I parametri normativi di un anno d'imposta. Nessuna logica: `data/` descrive
// cosa dice la norma, `core/` cosa se ne fa. All'uscita della Legge di Bilancio
// successiva si aggiunge un file di questa forma e non si tocca il motore.
// ---------------------------------------------------------------------------

/**
 * Le regole del dominio che il motore applica e che vanno citate.
 *
 * Unione chiusa, e sta in `core/` perché descrive il **dominio**: quali regole
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
 * Fascia in cui la percentuale si applica **all'intero** reddito, non alla
 * parte eccedente.
 *
 * ⚠️ Non è uno `Scaglione`, e i due tipi non devono essere intercambiabili.
 * Le fasce della somma del cuneo (L. 207/2024 art. 1 c. 4) non sono scaglioni:
 * ogni confine è un **salto secco verso il basso**, non un cambio di pendenza.
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
   * Sta qui e non in `core/` perché **la citazione della regola cambia con
   * l'anno d'imposta**: il gate del trattamento integrativo, per il 2026, si
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
     * una **riduzione di tre punti** sull'aliquota ordinaria del regime, quindi
     * è un rinvio dinamico. Il valore è scritto perché è quello che le fonti
     * INPS dichiarano; la nota sta nella fonte.
     */
    readonly aliquotaApprendista: Citato<Aliquota>
    readonly quotaAggiuntiva: {
      readonly aliquota: Citato<Aliquota>
      readonly sogliaPrimaFascia: Citato<Euro>
      /**
       * ⚠️ Condizione di applicabilità della norma, riferita al **regime
       * pensionistico** e non al singolo lavoratore: l'art. 3-ter si applica ai
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
   * **non è una peculiarità di quell'istituto**: la formula «si assume nelle
   * prime quattro cifre decimali» compare due volte nel TUIR — art. 13 c. 6 e
   * art. 12 c. 4 — ed è una convenzione del testo unico per le detrazioni a
   * formula. Annidarla la farebbe sembrare una proprietà della detrazione da
   * lavoro dipendente, e la duplicherebbe se i carichi di famiglia rientrassero
   * nel perimetro.
   *
   * Qui sta il **quanto**, che viene dalla norma. Il *troncare anziché
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
    /** Detrazione dall'imposta lorda, di **legge speciale** e non del TUIR. */
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

// ---------------------------------------------------------------------------
// Enti impositori
// ---------------------------------------------------------------------------

/**
 * La mappatura non è `comune → regione` ma `comune → ente impositore
 * regionale`: per il Trentino-Alto Adige l'addizionale «regionale» la fissano
 * le due province autonome, separatamente (Fonti §11, §15.a).
 */
export interface ParametriRegionali {
  readonly aliquota: FormaAliquota
  /**
   * Le detrazioni regionali esistono (Fonti §15.a) e hanno un pavimento a zero
   * dichiarato dall'ente. Solo quelle legate al solo reddito sono in perimetro;
   * quelle per carichi di famiglia restano fuori.
   */
  readonly detrazioni: readonly DetrazioneLocale[]
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
   * 360/1998). È un **cliff**, non una franchigia: sotto la soglia zero, un
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
 *   per i comuni). Al 28/08/2026 è il percorso del 61% dei comuni, **Milano
 *   inclusa**: non è una correzione, è il ramo principale.
 * - `nonIstituito` — il tributo non esiste per quell'ente, e **non ha
 *   parametri**. Diverso da un'aliquota deliberata pari a zero: sono due modi
 *   diversi di non pagare nulla, e il file MEF li distingue (Fonti §15.b).
 */
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

// ---------------------------------------------------------------------------
// La traccia
// ---------------------------------------------------------------------------

/**
 * Le quattro nature dell'output (D-009, D-017).
 *
 * I contributi non sono un'imposta: sono contribuzione che genera un diritto
 * pensionistico. E la quarta natura esiste perché alcune somme, per legge, non
 * concorrono a formare il reddito e si **aggiungono** al netto — è la ragione
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
 * Un gate che non si apre **non è una voce a zero**: è una voce non dovuta, con
 * una ragione. La traccia deve mostrarlo come passo con la sua ragione — è la
 * differenza tra spiegare e nascondere (Dominio normativo).
 *
 * E un gate **non è un calcolo, è un confronto**: legge una grandezza prodotta
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
   * Le norme che stabiliscono **la regola applicata** (D-026).
   *
   * Distinta da `Parametro.fonte`, che cita **da dove viene il valore**: la
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

// ---------------------------------------------------------------------------
// Assunzioni
// ---------------------------------------------------------------------------

/**
 * Un'assunzione dichiarata è una decisione di prodotto; taciuta è un bug.
 * Il segno conta quanto l'assunzione stessa: dire da che parte sbaglia la
 * trasforma da lacuna in limite conosciuto.
 */
export interface Assunzione {
  /** Riferimento alla voce in Notion: «S-002», «S-005-bis», «D-023». */
  readonly id: string
  readonly testo: string
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

// ---------------------------------------------------------------------------
// Risultato
// ---------------------------------------------------------------------------

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

  readonly enti: {
    readonly regionale: EnteRisolto<ParametriRegionali>
    readonly comunale: EnteRisolto<ParametriComunali>
  }

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
