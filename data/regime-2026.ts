/**
 * Parametri normativi dell'anno d'imposta 2026.
 *
 * Nessuna logica. Ogni valore porta la propria fonte come dato, perché la
 * citazione deve poter finire in pagina accanto alla voce che la usa.
 *
 * All'uscita della Legge di Bilancio successiva si aggiunge `regime-2027.ts` e
 * non si tocca una riga di `core/`: i test dell'anno precedente continuano a
 * passare.
 *
 * I riferimenti fra parentesi quadre rimandano alle sezioni della pagina
 * *Fonti* in Notion, dove ogni parametro ha l'estrazione completa.
 */

import {
  aliquota,
  annoImposta,
  euro,
  type Fonte,
  type FormulaDetrazione,
  type Regime,
} from '../core/types'

// Fonti

/**
 * [Fonti §4.e] La base contributiva è la retribuzione lorda: le somme si
 * assumono «al lordo di qualsiasi contributo e trattenuta». È la lettura che
 * rende `contributi = aliquota × RAL` una citazione e non un'assunzione.
 *
 * ⚠️ **La copia in `./fonti/` non contiene questo articolo, e il link serve a
 * quello.** Il PDF depositato — scaricato da def.finanze — porta della L.
 * 153/1969 il **solo art. 66**, sull'ordine dei privilegi, per giunta
 * *soppresso dal 14/09/1975*. Fino al 31/08/2026 questa `Fonte` non aveva
 * `url`: citava in pagina un comma che il progetto non possedeva e non
 * raggiungeva. Il testo vigente è stato letto su **Normattiva**, e il c. 3
 * riporta la frase alla lettera.
 *
 * ✅ **E il rinvio interno chiude il cerchio con una fonte che abbiamo.** L'art.
 * 12 rimanda all'art. 48 del TUIR — oggi **art. 51**, quello che il motore già
 * cita per l'esclusione dei contributi dal reddito. È l'armonizzazione fra base
 * fiscale e base contributiva: le due grandezze partono dallo stesso testo.
 */
const l153_1969_art12: Fonte = {
  atto: 'L. 30/04/1969 n. 153',
  riferimento: 'art. 12 c. 3 — «al lordo di qualsiasi contributo e trattenuta»',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1969-04-30;153~art12',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/**
 * [Fonti §2-ter] I contributi obbligatori non concorrono a formare il reddito:
 * è un'esclusione, non una deduzione ex art. 10. Da qui discende che la
 * catena resta lineare e che le basi dell'art. 11 e dell'art. 13 coincidono.
 */
const tuir_art51_c2a: Fonte = {
  atto: 'TUIR (DPR 917/1986)',
  riferimento: 'art. 51 c. 2 lett. a)',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art51!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §2] Le detrazioni si operano sull'imposta lorda «fino alla concorrenza del suo ammontare». */
const tuir_art11_c3: Fonte = {
  atto: 'TUIR (DPR 917/1986)',
  riferimento: 'art. 11 c. 3',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art11!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §6.a] Il gate della comunale. La condizione esatta è *netta meno credito art. 165 > 0*. */
const dlgs360_1998_c4: Fonte = {
  atto: 'D.Lgs. 28/09/1998 n. 360',
  riferimento: 'art. 1 c. 4',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §5.a] Il gate della regionale. Stessa struttura, formulazione diversa,
 * e un rinvio morto agli artt. 14 e 15 nella numerazione previgente del TUIR:
 * relitto di drafting, irrilevante nel caso standard.
 */
export const fonteGateRegionale: Fonte = {
  atto: 'D.Lgs. 15/12/1997 n. 446',
  riferimento: 'art. 50 c. 2',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446~art50!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §6.a] La soglia di esenzione comunale è facoltativa e per comune. */
const dlgs360_1998_c3bis: Fonte = {
  atto: 'D.Lgs. 28/09/1998 n. 360',
  riferimento: 'art. 1 c. 3-bis',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §4.d] L'atto istituisce l'aliquota aggiuntiva e ne fissa la condizione. */
const dl384_1992_art3ter: Fonte = {
  atto: 'DL 19/09/1992 n. 384, conv. con mod. dalla L. 14/11/1992 n. 438',
  riferimento: 'art. 3-ter',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:1992-09-19;384~art3ter!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §4.f] Circolare rivolta ai *datori di lavoro in genere*, non a una
 * categoria specifica. Il par. 1.1.1 dà l'IVS totale al 33,00% e la quota a
 * carico del lavoratore al 9,19%; il par. 1.1.5 ne dà l'aritmetica
 * (8,89% + 0,30 = 9,19%).
 *
 * ✅ **La riserva sull'anno è caduta il 31/08/2026, e la risposta era dentro la
 * circolare stessa.** Diceva: *«è del 2011 … l'equivalente 2026 non è stato
 * reperito»*, come se fosse una fonte da rimpiazzare ogni anno. Non lo è. Il
 * par. 1.1.5 spiega perché: *«risulta esaurito l'adeguamento dell'aliquota
 * contributiva a carico del lavoratore in quanto — per effetto dell'incremento
 * di 0,50 punti percentuali operato, da ultimo, alla data del 1.1.2002 — la
 * stessa aliquota ha già raggiunto la "misura piena"»*.
 *
 * **La quota del lavoratore ha smesso di muoversi nel 2002**; gli adeguamenti
 * annuali che le circolari successive pubblicano cadono sulla quota del
 * **datore**. Una circolare del 2011 non è quindi una fonte vecchia: è quella
 * che documenta il punto d'arrivo. Cambierà solo se una legge cambia la misura.
 *
 * ⚠️ **Resta un limite, ed è di forma non di sostanza.** Il 9,19% è la somma di
 * 8,89 + 0,30, e i due addendi hanno ciascuno la propria legge — l'art. 3 c. 23
 * della L. 335/1995 per l'aliquota complessiva, l'art. 1 c. 769 della L.
 * 296/2006 per l'incremento di 0,30 punti. **Nessuna delle due è in `./fonti/`**,
 * e il numero si legge sulla circolare che le applica, non sugli atti che lo
 * fondano.
 */
const inps40_2011: Fonte = {
  atto: 'INPS, circolare n. 40 del 22/02/2011',
  riferimento: 'par. 1.1.1 — 9,19% a carico del lavoratore; par. 1.1.5 per l’aritmetica 8,89 + 0,30',
  url: 'https://servizi2.inps.it/servizi/Bussola/visualizzadoc.aspx?svirtualurl=%2Fcircolari%2Fcircolare+numero+40+del+22-02-2011.htm',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/**
 * [Fonti §4.g] Il messaggio dà il numero, lo qualifica come *a carico
 * dell'apprendista*, ne indica la base e cita entrambe le norme.
 *
 * ⚠️ Due cose da non appiattire.
 *
 * È un rinvio dinamico, non una costante. L'art. 21 della L. 41/1986 estende
 * agli apprendisti la disciplina degli obblighi contributivi della generalità
 * dei lavoratori dipendenti «con una riduzione di tre punti della relativa
 * aliquota contributiva». Se l'aliquota ordinaria cambiasse, quella
 * dell'apprendista si muoverebbe da sola.
 *
 * I tre punti cadono sulla base al netto del GESCAL. 8,84 − 3,00 = 5,84,
 * dove 8,84% è la quota lavoratore senza la componente ex GESCAL dello 0,35%.
 * La differenza rispetto al dipendente ordinario è quindi di 3,35 punti, non di
 * tre. Il valore 5,84% è letto su due documenti INPS; la sua scomposizione
 * è ricostruita e nessuna delle due fonti la scrive.
 */
const inps3618_2023: Fonte = {
  atto: 'INPS, messaggio n. 3618 del 17/10/2023',
  consultataIl: '2026-08-28',
  provenienza: 'verificata',
}

/** [Fonti §4.b] La circolare annuale su minimali e massimali dà il valore in euro della soglia. */
const inps6_2026: Fonte = {
  atto: 'INPS, circolare n. 6 del 30/01/2026',
  riferimento: 'par. 5',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §3, §3-bis] La formula «si assume nelle prime quattro cifre decimali»
 * compare due volte nel TUIR, e i due commi vanno citati insieme.
 */
const tuir_troncamento: Fonte = {
  atto: 'TUIR (DPR 917/1986)',
  riferimento: 'art. 13 c. 6 e art. 12 c. 4',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art13!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §2] L'aliquota centrale è passata dal 35% al 33% per il 2026. */
const tuir_art11: Fonte = {
  atto: 'TUIR (DPR 917/1986), come mod. dall\'art. 1 c. 3 della L. 30/12/2025 n. 199',
  riferimento: 'art. 11 c. 1',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art11!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §3] Detrazione soggettiva del TUIR, legata alla tipologia di
 * reddito e non a un esborso del contribuente. Da tenere distinta dalla
 * detrazione da cuneo, che vive fuori dal testo unico: che le due si comportino
 * allo stesso modo rispetto alla capienza non è scontato, ed è la ragione per
 * cui la provenienza normativa resta visibile nel dato.
 */
const tuir_art13: Fonte = {
  atto: 'TUIR (DPR 917/1986), come mod. dall\'art. 1 c. 2 della L. 30/12/2024 n. 207',
  riferimento: 'art. 13 c. 1',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917~art13!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

const tuir_art13_c11: Fonte = {
  atto: 'TUIR (DPR 917/1986)',
  riferimento: 'art. 13 c. 1.1',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

const tuir_art13_c1_a: Fonte = {
  atto: 'TUIR (DPR 917/1986)',
  riferimento: 'art. 13 c. 1 lett. a)',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §1.a] Somma che non concorre alla formazione del reddito. */
const l207_2024_c4: Fonte = {
  atto: 'L. 30/12/2024 n. 207',
  riferimento: 'art. 1 c. 4',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §1.b] Detrazione dall'imposta lorda di legge speciale, fuori dal
 * TUIR. Il testo dice «un'ulteriore detrazione dall'imposta lorda» senza
 * deroghe, quindi ricade nella regola generale dell'art. 11 c. 3.
 */
const l207_2024_c6: Fonte = {
  atto: 'L. 30/12/2024 n. 207',
  riferimento: 'art. 1 c. 6',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2024-12-30;207~art1!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §1.c] Coesiste col cuneo: la L. 207/2024 l'ha coordinato, non assorbito.
 *
 * ⚠️ **L'atto non è in `./fonti/`, e i suoi due numeri arrivano da tre atti
 * diversi.** Il testo originale, letto su Normattiva, porta i **1.200 euro**
 * ma con soglia a 28.000; la soglia è scesa a **15.000** con l'art. 1 c. 3
 * della L. 234/2021, che **non è stata letta**; lo **scarto di 75 euro** sul
 * gate è invece verificato alla lettera sulla L. 207/2024 in cartella, che
 * inserisce *«diminuita dell'importo di 75 euro»* nel primo periodo.
 *
 * Quindi: 1.200 letto alla fonte, 75 letto alla fonte, **15.000 no**.
 */
const dl3_2020_art1: Fonte = {
  atto: 'DL 05/02/2020 n. 3, come mod. dall\'art. 1 c. 3 della L. 234/2021 e dall\'art. 1 c. 3 della L. 30/12/2024 n. 207',
  riferimento: 'art. 1 c. 1',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legge:2020-02-05;3',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/**
 * [Fonti §1.c] I 75 euro sono stati inseriti dalla L. 207/2024, che con il
 * comma immediatamente precedente ha portato la detrazione dell'art. 13 da
 * 1.880 a 1.955: 1.955 − 75 = 1.880, cioè l'importo previgente. Neutralizzano
 * l'aumento e lasciano ferma la soglia di accesso al trattamento integrativo.
 */
const l207_2024_c3: Fonte = {
  atto: 'L. 30/12/2024 n. 207',
  riferimento: 'art. 1 c. 3',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/** [Fonti §6.a] Il tetto comunale: la variazione «non può eccedere complessivamente 0,8 punti percentuali». */
const dlgs360_1998_c3: Fonte = {
  atto: 'D.Lgs. 28/09/1998 n. 360',
  riferimento: 'art. 1 c. 3',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1998-09-28;360~art1!vig=',
  consultataIl: '2026-08-27',
  provenienza: 'verificata',
}

/**
 * [Fonti §15.f] Il tetto regionale: aliquota di base più la maggiorazione massima.
 *
 * ⚠️ **Fino al 31/08/2026 questa costante valeva 1,4 e citava l'art. 50 c. 3
 * del D.Lgs. 446/1997. Era il tetto sbagliato, e la pagina lo mostrava.**
 * L'art. 50 c. 3 pone 0,9% maggiorabile all'1,4%, ma per l'addizionale
 * regionale quel regime è stato sostituito: l'art. 6 c. 1 del D.Lgs. 68/2011
 * fissa la base — 0,9% nel testo, portata a **1,23%** dall'art. 28 c. 1 del
 * D.L. 201/2011 senza riscrivere il comma — e consente una maggiorazione fino
 * a **2,1 punti** dal 2015. Il tetto ordinario è quindi **3,33%**.
 *
 * Con il tetto giusto cambia la lettura del dato: non erano quindici enti a
 * derogare, era il metro a essere sbagliato. Sopra il 3,33% resta il solo
 * Molise, e non per una deroga ma per l'automatismo sanitario che l'art. 6
 * c. 10 mette espressamente fuori dai tetti.
 */
const dlgs68_2011_art6_c1: Fonte = {
  atto: 'D.Lgs. 06/05/2011 n. 68, come mod. dall’art. 28 c. 1 del D.L. 06/12/2011 n. 201',
  riferimento: 'art. 6 c. 1 — base 1,23% più maggiorazione fino a 2,1 punti',
  url: 'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2011-05-06;68~art6!vig=',
  consultataIl: '2026-08-31',
  provenienza: 'verificata',
}

/**
 * I due tetti alle addizionali — **e il motore non li applica**.
 *
 * ⚠️ Non è una dimenticanza, è la regola 4 di `scripts/importa-mef.mjs`:
 * *nessun clamp, mai*. Dodici comuni superano gli 0,8 punti fino all'1,2%, e
 * un ente regionale su ventuno supera il 3,33% — il Molise, a 3,63%. Troncare
 * a questi valori sembrerebbe un controllo prudente e produrrebbe **numeri
 * sbagliati**, per il Molise e per dodici comuni.
 *
 * ⚠️ Allora perché stanno in `data/`, se nessuna funzione li legge?
 *
 * Perché sono **il metro contro cui il caso limite si vede**. Senza il tetto
 * in pagina, «Molise 3,63%» è un numero come un altro; con il tetto accanto è
 * l'unico ente d'Italia che lo supera, e la ragione ha un nome: l'automatismo
 * dell'art. 2 c. 86 della L. 191/2009, che l'art. 6 c. 10 salva dai tetti. Un parametro che serve a mostrare
 * qualcosa è comunque un parametro normativo, e vale la regola generale: sta
 * in `data/` con la propria citazione, non scritto a mano dentro una pagina.
 *
 * ⚠️ Fuori da `Regime` e non dentro. `Regime` è ciò che il motore riceve, e
 * un campo che `core/` non legge, messo lì, direbbe il falso sulla catena di
 * calcolo. Sono un export a parte perché sono un dato a parte.
 *
 * ⚠️ E sono tetti sul **totale**, non su un delta (T-001). Il 3,33% è già la
 * somma di base e maggiorazione massima — 1,23 + 2,1 — quindi il valore che
 * l'ente delibera e che il MEF pubblica è confrontabile con esso direttamente.
 * Sommargli ancora la base lo conterebbe due volte. Sommargli lo 0,9% di compartecipazione lo
 * conterebbe due volte, per ogni regione d'Italia e nello stesso verso.
 */
export const tettiAddizionali = {
  comunale: { valore: aliquota(0.8), fonte: dlgs360_1998_c3 },
  regionale: { valore: aliquota(3.33), fonte: dlgs68_2011_art6_c1 },
} as const

// Valori nominati
//
// Esportati perché servono anche a `fixtures/`, che deve poterli leggere invece
// di riscriverli: due copie dello stesso numero divergono in silenzio.

/** La fascia decrescente dell'art. 13, quella in cui cade il caso base. */
export const detrazioneArt13Fascia15000a28000 = {
  forma: 'lineare-decrescente',
  base: euro(1_910),
  quota: euro(1_190),
  riferimento: euro(28_000),
  ampiezza: euro(13_000),
  espressione: '1.910 + 1.190 × (28.000 − RC) / 13.000',
} as const satisfies FormulaDetrazione

/** L'importo pieno della detrazione da cuneo, fra 20.000 e 32.000 di RC. */
export const detrazioneCuneoPiena = euro(1_000)

// Regime

export const regime2026: Regime = {
  anno: annoImposta(2026),

  fontiRegola: {
    'base-contributiva': [l153_1969_art12],
    'aliquota-ivs': [inps40_2011],
    'quota-aggiuntiva': [dl384_1992_art3ter],
    'esclusione-contributi-dal-reddito': [tuir_art51_c2a],
    'scaglioni-irpef': [tuir_art11],
    'detrazione-lavoro-dipendente': [tuir_art13],
    'troncamento-rapporti': [tuir_troncamento],
    'detrazione-cuneo': [l207_2024_c6],
    'pavimento-imposta-netta': [tuir_art11_c3],
    // Due norme, una per tributo: è il caso per cui il tipo è un array.
    'gate-addizionali': [dlgs360_1998_c4, fonteGateRegionale],
    'soglia-esenzione-comunale': [dlgs360_1998_c3bis],
    'somma-cuneo': [l207_2024_c4],
    'trattamento-integrativo': [dl3_2020_art1],
  },

  contributi: {
    aliquotaOrdinaria: { valore: aliquota(9.19), fonte: inps40_2011 },
    aliquotaApprendista: { valore: aliquota(5.84), fonte: inps3618_2023 },
    quotaAggiuntiva: {
      aliquota: { valore: aliquota(1), fonte: dl384_1992_art3ter },
      sogliaPrimaFascia: { valore: euro(56_224), fonte: inps6_2026 },
      aliquotaMassimaRegime: { valore: aliquota(10), fonte: dl384_1992_art3ter },
    },
  },

  irpef: {
    scaglioni: {
      fonte: tuir_art11,
      valore: [
        { da: euro(0), a: euro(28_000), aliquota: aliquota(23) },
        { da: euro(28_000), a: euro(50_000), aliquota: aliquota(33) },
        { da: euro(50_000), a: null, aliquota: aliquota(43) },
      ],
    },
  },

  /**
   * Convenzione del testo unico per le detrazioni a formula, non peculiarità
   * della detrazione da lavoro dipendente: la stessa formula sta nell'art. 12
   * c. 4, sui carichi di famiglia, che è l'articolo precedente. Per questo il
   * campo è di primo livello e non annidato nella detrazione (D-027).
   */
  troncamentoRapportiDetrazione: { valore: 4, fonte: tuir_troncamento },

  detrazioneLavoroDipendente: {
    fasce: {
      fonte: tuir_art13,
      valore: [
        {
          redditoDa: euro(0),
          redditoA: euro(15_000),
          formula: { forma: 'costante', importo: euro(1_955) },
        },
        {
          redditoDa: euro(15_000),
          redditoA: euro(28_000),
          formula: detrazioneArt13Fascia15000a28000,
        },
        {
          redditoDa: euro(28_000),
          redditoA: euro(50_000),
          formula: {
            forma: 'lineare-decrescente',
            base: euro(0),
            quota: euro(1_910),
            riferimento: euro(50_000),
            ampiezza: euro(22_000),
            espressione: '1.910 × (50.000 − RC) / 22.000',
          },
        },
        {
          redditoDa: euro(50_000),
          redditoA: null,
          formula: { forma: 'costante', importo: euro(0) },
        },
      ],
    },
    incrementoFasciaIntermedia: {
      fonte: tuir_art13_c11,
      valore: { importo: euro(65), redditoDa: euro(25_000), redditoA: euro(35_000) },
    },
    minimi: {
      fonte: tuir_art13_c1_a,
      valore: { generale: euro(690), tempoDeterminato: euro(1_380) },
    },
  },

  cuneo: {
    somma: {
      sogliaAccesso: { valore: euro(20_000), fonte: l207_2024_c4 },
      fasce: {
        fonte: l207_2024_c4,
        valore: [
          { redditoDa: euro(0), redditoA: euro(8_500), percentuale: aliquota(7.1) },
          { redditoDa: euro(8_500), redditoA: euro(15_000), percentuale: aliquota(5.3) },
          { redditoDa: euro(15_000), redditoA: null, percentuale: aliquota(4.8) },
        ],
      },
    },
    detrazione: {
      fasce: {
        fonte: l207_2024_c6,
        valore: [
          {
            redditoDa: euro(20_000),
            redditoA: euro(32_000),
            formula: { forma: 'costante', importo: detrazioneCuneoPiena },
          },
          {
            redditoDa: euro(32_000),
            redditoA: euro(40_000),
            formula: {
              forma: 'lineare-decrescente',
              base: euro(0),
              quota: euro(1_000),
              riferimento: euro(40_000),
              ampiezza: euro(8_000),
              espressione: '1.000 × (40.000 − RC) / 8.000',
            },
          },
          {
            redditoDa: euro(40_000),
            redditoA: null,
            formula: { forma: 'costante', importo: euro(0) },
          },
        ],
      },
    },
  },

  trattamentoIntegrativo: {
    importo: { valore: euro(1_200), fonte: dl3_2020_art1 },
    sogliaRedditoComplessivo: { valore: euro(15_000), fonte: dl3_2020_art1 },
    scartoSulGate: { valore: euro(75), fonte: l207_2024_c3 },
  },
}
