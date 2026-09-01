/**
 * La prosa di `/come-e-fatta`.
 *
 * Sta qui e non in `risorse.ts` per la ragione misurata in
 * `testi-spiegazione.ts` e ripetuta in `testi-progetto.ts` (D-069): la tabella
 * delle stringhe viaggia nel pacchetto JavaScript di ogni pagina, e questa
 * pagina è un server component senza stato le cui frasi il client non legge
 * mai. Restano di là `piede.linkTecnica` — il piede lo rende il layout — e i
 * due campi `meta`.
 *
 * ⚠️ Le versioni dei pacchetti non sono qui, e non è una svista. Si leggono
 * da `package.json` al momento di rendere la pagina: è la regola di D-005 e
 * D-070 applicata alla pagina che più di ogni altra si romperebbe in silenzio.
 * Una versione riscritta a mano diventa falsa al primo aggiornamento e nessuno
 * se ne accorge — proprio sulla pagina che promette di dire com'è fatta l'app.
 *
 * ⚠️ Nessun conteggio di test in prosa, ed è una scelta presa contro un
 * errore già successo. La pagina di stato ha sbagliato il numero dei test due
 * volte — 118 quando erano 137, 137 quando erano 303 — ogni volta perché il
 * conto era stato dedotto invece che misurato. Qui si dice che cosa le
 * verifiche coprono e che cosa non coprono: è l'informazione che conta, ed è
 * l'unica che non invecchia da sola.
 *
 * ⚠️ Il registro è quello di `testi-progetto.ts`, non quello di D-039. Le
 * pagine del calcolo parlano a chi vuole il proprio netto, e lì *server
 * component* o *nonce* sarebbero parole fuori posto. Questa pagina risponde a
 * *com'è costruita questa cosa*: chi la apre ha chiesto il dettaglio tecnico,
 * e dargliene una versione annacquata sarebbe non rispondere.
 */

import type { Multilingua } from '../../core/types'

export const TECNICA = {
  titolo: {
    it: 'Come è fatta tecnicamente l’app',
    en: 'How the app is built, technically',
  },
  occhiello: {
    it: 'Che cosa gira sotto la pagina: lo stack, come è diviso il codice, da dove entrano i dati, che cosa non arriva mai al browser, come si verifica e dove sta pubblicato.',
    en: 'What runs underneath the page: the stack, how the code is split, where the data comes from, what never reaches the browser, how it is checked and where it is published.',
  },

  premessaTitolo: { it: 'Prima di tutto il resto', en: 'Before anything else' },
  premessaTesto: {
    it: 'Il criterio dichiarato di questa prova non era che il calcolatore funzionasse, ma che chi lo ha costruito ne fosse in controllo. Una pagina che elenca scelte tecniche senza dire perché sono state prese non dimostrerebbe niente: per ogni voce qui sotto c’è la ragione, e dove una scelta ha un limite il limite è scritto accanto.',
    en: 'The stated criterion for this exercise was not that the calculator worked, but that whoever built it was in control of it. A page listing technical choices without saying why they were made would prove nothing: every item below carries its reason, and where a choice has a limit the limit is written next to it.',
  },

  stackTitolo: { it: 'Lo stack', en: 'The stack' },
  /**
   * ⚠️ **L'introduzione allo stack è stata riscritta, e il difetto era di
   * tono.**
   *
   * Diceva *«nessuno è entrato per abitudine»* e chiudeva con *«ogni dipendenza
   * in più è codice che si dovrebbe saper difendere e che non si è scritto»*.
   * Sono due frasi che non descrivono lo stack: giudicano chi sceglie
   * diversamente, e lo fanno in una pagina che elenca cinque pacchetti
   * assolutamente ordinari. Rivendicare rigore su una scelta che nessuno
   * contesta si legge come sicumera, e mette chi legge sulla difensiva proprio
   * mentre gli si chiede di fidarsi.
   *
   * Quello che resta è ciò che serve davvero a chi legge: che cosa sono le due
   * liste, e che cosa non c'è. Il fatto in sé — niente librerie di calcolo, di
   * date o di componenti — è interessante e va detto; è il commento morale che
   * gli stava attaccato a essere fuori posto.
   */
  stackP1: {
    it: 'Le due liste qui sotto sono divise per quando servono. La prima raccoglie i pacchetti che il sito usa mentre qualcuno lo sta guardando: finiscono nel programma pubblicato. La seconda quelli che servono soltanto a chi ci lavora, per compilare, controllare i tipi e far girare le prove, e che sul sito non arrivano mai. Le versioni non sono scritte in questa pagina: le legge dal file delle dipendenze il server che la rende, così non possono restare indietro rispetto a quelle davvero installate.',
    en: 'The two lists below are split by when each package is needed. The first holds what the site uses while someone is looking at it: these end up in the published program. The second holds what only the people working on it need, to compile, to check types and to run the tests, and that never reaches the site. The versions are not written into this page: the server that renders it reads them from the dependency file, so they cannot fall behind what is actually installed.',
  },
  stackP2: {
    it: 'Vale la pena guardare anche quello che non c’è: nessuna libreria di calcolo, nessuna libreria di date, nessuna libreria di componenti. Il motore è aritmetica su numeri, con tipi che ne tengono distinte le grandezze, e importi e date si formattano con quello che il browser ha già dentro.',
    en: 'What is not there is worth a look too: no calculation library, no date library, no component library. The engine is arithmetic on numbers, with types that keep the quantities apart, and amounts and dates are formatted with what the browser already provides.',
  },
  stackRuntime: { it: 'A runtime', en: 'At runtime' },
  stackRuntimeNota: {
    it: 'Servono al sito mentre qualcuno lo sta usando, quindi finiscono nel programma pubblicato.',
    en: 'Needed by the site while someone is using it, so they end up in the published program.',
  },
  stackSviluppo: { it: 'In sviluppo', en: 'In development' },
  stackSviluppoNota: {
    it: 'Servono solo a chi lavora al codice, per compilarlo, controllarlo e provarlo. Sul sito non arrivano mai.',
    en: 'Needed only by whoever works on the code, to compile, check and test it. They never reach the site.',
  },

  cartelleTitolo: {
    it: 'Tre cartelle, e una regola che le tiene separate',
    en: 'Three folders, and one rule that keeps them apart',
  },
  cartelleP1: {
    it: 'Il principio è uno solo, e decide ogni volta che una scelta è ambigua: i valori di legge sono dati, il codice contiene soltanto le regole di calcolo. Se un numero viene da una legge, da una circolare o da una delibera non sta dentro una funzione: sta in un file di parametri, con accanto l’atto che lo stabilisce.',
    en: 'There is a single principle, and it settles every ambiguous choice: statutory values are data, the code holds only the rules of calculation. If a figure comes from a law, a circular or a council resolution it does not sit inside a function: it sits in a parameter file, next to the act that establishes it.',
  },
  cartelleP2: {
    it: 'La ragione è il mestiere di chi legge. Per un’azienda di payroll la normativa che cambia a ogni Legge di Bilancio non è un caso limite: è il lavoro quotidiano. Con questa divisione, il gennaio successivo si aggiunge un file di parametri, non si tocca una riga di calcolo, e le verifiche dell’anno prima continuano a passare.',
    en: 'The reason is the reader’s trade. For a payroll company, legislation that changes with every budget law is not an edge case: it is the daily job. With this split, the following January you add a parameter file rather than touching a line of the calculation, and last year’s checks keep passing.',
  },

  cartelleImportTitolo: {
    it: 'Le dipendenze vanno in una direzione sola',
    en: 'Imports run one way',
  },
  cartelleImportTesto: {
    it: 'I parametri importano dal motore, l’interfaccia importa da entrambi, e nessun livello inferiore conosce quelli sopra di sé. Gli import restano relativi invece di passare da una scorciatoia: un percorso che risale di due cartelle dice a chi legge in che direzione sta andando, mentre una scorciatoia lo nasconderebbe.',
    en: 'The parameters import from the engine, the interface imports from both, and no lower layer knows anything about the layers above it. Imports stay relative instead of going through a shortcut: a path that climbs two folders tells the reader which way it is going, where a shortcut would hide it.',
  },
  cartelleProvaTitolo: {
    it: 'E non è una promessa, è un test',
    en: 'And it is a test, not a promise',
  },
  cartelleProvaTesto: {
    it: 'Una regola di struttura scritta soltanto in una pagina di documentazione dura finché qualcuno ha fretta. Qui un test legge i sorgenti del motore dal disco e ne cerca gli import: se il motore importasse dall’interfaccia o dai dati, la suite fallirebbe.',
    en: 'A structural rule written only in a documentation page lasts until someone is in a hurry. Here a test reads the engine’s sources from disk and looks at their imports: if the engine imported from the interface or from the data, the suite would fail.',
  },

  importTitolo: { it: 'Da dove entrano i dati', en: 'Where the data comes in' },
  importP1: {
    it: 'Gli elenchi delle addizionali comunali e regionali sono pubblicati dal Ministero dell’Economia e delle Finanze come fogli di calcolo, non come servizio da interrogare. Uno script li converte una volta sola, fuori dall’applicazione, e produce i file che il sito legge.',
    en: 'The lists of municipal and regional surcharges are published by the Italian Ministry of Economy and Finance as spreadsheets, not as a service to query. A script converts them once, outside the application, and produces the files the site reads.',
  },
  importP2: {
    it: 'Lo script non ha dipendenze: un foglio di calcolo in formato XLSX è un archivio compresso di XML, e per aprirlo basta quello che Node ha già dentro. Sta nel repo e non è stato cancellato dopo l’uso, perché è la parte verificabile del lavoro sulle fonti: chi vuole controllare come un’aliquota è finita nel calcolo può leggere la regola che ce l’ha messa.',
    en: 'The script has no dependencies: an XLSX spreadsheet is a compressed archive of XML, and what Node already ships is enough to open it. It lives in the repo and was not deleted after use, because it is the checkable part of the work on sources: anyone who wants to see how a rate ended up in the calculation can read the rule that put it there.',
  },
  importP3: {
    it: 'I file prodotti sono versionati e portano dentro di sé la propria origine e la data di estrazione, così la dicitura che compare in pagina viene dal dato e non da una costante scritta a mano che qualcuno dimenticherà di aggiornare. Mentre usi il sito non viene interrogato nessun servizio esterno: tutto quello che serve al calcolo è già nel repo.',
    en: 'The generated files are versioned and carry their own origin and extraction date inside them, so the line shown on the page comes from the data rather than from a hand-written constant somebody will forget to update. No external service is queried while you use the site: everything the calculation needs is already in the repo.',
  },

  confineTitolo: { it: 'Che cosa non arriva al browser', en: 'What never reaches the browser' },
  confineP1: {
    it: 'Il catalogo dei comuni pesa circa tre megabyte e resta sul server: il calcolo avviene lì, e le aliquote non attraversano il confine. Il campo del comune chiede l’elenco dei soli nomi la prima volta che lo tocchi, una volta per sessione, e da lì in poi la ricerca non tocca più la rete. Nel documento entra un comune solo: quello scelto.',
    en: 'The catalogue of municipalities weighs about three megabytes and stays on the server: the calculation happens there, and the rates never cross the boundary. The municipality field asks for a list of names alone the first time you touch it, once per session, and from then on searching never touches the network again. Only one municipality goes into the document: the one you picked.',
  },
  confineP2: {
    it: 'La stessa disciplina vale per il testo. La prosa delle pagine lunghe (l’archivio delle norme, la spiegazione, e questa) non sta nella tabella delle stringhe dell’interfaccia, che viaggia in ogni pagina e in tutte e due le lingue, ma in file che soltanto il server legge. Se stesse di là, ogni visitatore di ogni pagina scaricherebbe testo che non vedrà mai, nella lingua che non ha scelto.',
    en: 'The same discipline applies to text. The prose of the long pages (the archive of rules, the explanation, and this one) does not live in the interface string table, which travels with every page and in both languages, but in files only the server reads. Were it over there, every visitor to every page would download text they will never see, in the language they did not choose.',
  },
  confineP3: {
    it: 'Le pagine sono dinamiche per costruzione, e non è una rinuncia: lingua e tema si leggono da due cookie della richiesta, quindi la pagina arriva già nella lingua e del colore giusti, senza lo sfarfallio di uno script che corregge dopo.',
    en: 'The pages are dynamic by construction, and that is not a concession: language and theme are read from two request cookies, so the page arrives already in the right language and the right colour, with no flash from a script correcting it afterwards.',
  },

  verificheTitolo: {
    it: 'Come si costruisce e come si verifica',
    en: 'How it is built and how it is checked',
  },
  verificheP1: {
    it: 'I comandi del progetto sono questi, e la pagina li legge dal file delle dipendenze invece di riscriverli.',
    en: 'These are the project’s commands, and the page reads them from the dependency file instead of restating them.',
  },
  /**
   * ⚠️ Il solo comando scritto a mano, perché è il solo che non sta fra gli
   * script: si lancia direttamente sul compilatore. Vale la pena saperlo,
   * invece di dedurre dal resto della pagina che tutto venga da un file.
   */
  verificheTipi: {
    it: 'il controllo dei tipi su tutto il repo, senza produrre alcun file. È il solo che non sta fra gli script qui sopra, ed è quello che gli altri danno per già passato.',
    en: 'type checking across the whole repo, emitting no files. It is the only one that is not among the scripts above, and it is the one the others assume has already passed.',
  },
  verificheCi: {
    it: 'E non c’è integrazione continua: i comandi si lanciano a mano, e niente impedisce un commit che li rompe.',
    en: 'And there is no continuous integration: the commands are run by hand, and nothing prevents a commit that breaks them.',
  },

  sicurezzaTitolo: { it: 'Come è protetto il sito', en: 'How the site is protected' },
  sicurezzaP1: {
    it: 'Il sito non ha login, non ha banca dati e non conserva niente di quello che scrivi: il lordo entra in una richiesta, torna un risultato, e non resta da nessuna parte. Restano comunque le difese che riguardano il documento servito.',
    en: 'The site has no login, no database and keeps nothing you type: the gross figure goes into a request, a result comes back, and nothing is stored anywhere. The defences that concern the served document still apply.',
  },
  sicurezzaCspTitolo: {
    it: 'Una policy con un valore usa e getta a ogni richiesta',
    en: 'A policy with a single-use value per request',
  },
  sicurezzaCsp: {
    it: 'Next inietta nel documento gli script che servono a far ripartire la pagina dentro il browser. Una policy scritta una volta per tutte potrebbe ammetterli solo aprendo agli script inline in generale, che è esattamente ciò contro cui la policy esiste. Qui ogni richiesta genera un valore nuovo, e passano soltanto gli script che lo portano.',
    en: 'Next injects into the document the scripts that restart the page inside the browser. A policy written once and for all could admit them only by allowing inline scripts in general, which is exactly what the policy exists to prevent. Here every request generates a fresh value, and only the scripts carrying it get through.',
  },
  sicurezzaConcessioneTitolo: {
    it: 'Una concessione sola, e dichiarata',
    en: 'One concession, and it is declared',
  },
  sicurezzaConcessione: {
    it: 'Il grafico degli scaglioni nella pagina di spiegazione disegna ogni barra su una larghezza calcolata dai valori di legge: è un numero che non esiste prima di aver letto i dati, quindi non può stare in un foglio di stile scritto prima. L’allentamento riguarda quel solo attributo, e non apre agli stili iniettati.',
    en: 'The bracket chart on the explanation page draws each bar at a width computed from the statutory values: it is a number that does not exist before the data has been read, so it cannot sit in a stylesheet written beforehand. The loosening covers that one attribute, and does not open the door to injected styles.',
  },
  sicurezzaTettoTitolo: {
    it: 'Un tetto sul corpo della richiesta',
    en: 'A cap on the request body',
  },
  sicurezzaTetto: {
    it: 'La richiesta di calcolo accetta al massimo quattro kilobyte, contati mentre i byte arrivano e non sulla lunghezza dichiarata, che può mancare e che comunque la dichiara la parte di cui non ci si fida.',
    en: 'The calculation request accepts four kilobytes at most, counted as the bytes arrive rather than from the declared length, which can be missing and which is in any case declared by the party you do not trust.',
  },
  sicurezzaLimiteTitolo: {
    it: 'Nessun limite di frequenza, ed è dichiarato',
    en: 'No rate limit, and it is declared',
  },
  sicurezzaLimite: {
    it: 'Un limite di frequenza difende da un’asimmetria di costo: una richiesta che costa poco a chi la manda e molto a chi la serve. Qui non c’è: il calcolo è aritmetica senza accessi al disco, e l’elenco dei comuni è un valore costante preparato una volta sola. Metterlo lo stesso sarebbe imitazione, non difesa.',
    en: 'A rate limit defends against a cost asymmetry: a request that is cheap to send and expensive to serve. There is none here: the calculation is arithmetic with no disk access, and the list of municipalities is a constant value prepared once. Adding one anyway would be imitation, not defence.',
  },

  deployTitolo: {
    it: 'Dove sta il codice e dove gira',
    en: 'Where the code lives and where it runs',
  },
  deployGithubTitolo: {
    it: 'Il codice sta su GitHub, cronologia compresa',
    en: 'The code is on GitHub, history included',
  },
  deployGithub: {
    it: 'Il repo è pubblico ed è parte della consegna quanto il sito. La cronologia non è un commit unico finale ma una serie distribuita sui giorni di lavoro, ognuno con la propria ragione scritta nel messaggio: chi vuole sapere quando una decisione è stata presa, e contro quale alternativa, la trova lì invece di doverla chiedere.',
    en: 'The repository is public and is as much part of the deliverable as the site. The history is not one final commit but a series spread across the working days, each with its reason written in the message: anyone who wants to know when a decision was made, and against which alternative, finds it there instead of having to ask.',
  },
  deployVercelTitolo: { it: 'Il sito gira su Vercel', en: 'The site runs on Vercel' },
  deployVercel: {
    it: 'La piattaforma esegue lo script di build del progetto, quindi eredita il controllo del linter invece di scavalcarlo. È la ragione per cui quello script è stato cablato così, e andava verificata prima di pubblicare e non dopo. Ogni push sul ramo principale produce una versione nuova.',
    en: 'The platform runs the project’s own build script, so it inherits the linter check instead of stepping around it. That is why the script was wired this way, and it had to be verified before publishing rather than after. Every push to the main branch produces a new version.',
  },
  deployRuntimeTitolo: {
    it: 'Serve un server, e serve per una ragione',
    en: 'It needs a server, and for a reason',
  },
  deployRuntime: {
    it: 'Non è un sito statico e non potrebbe esserlo: il catalogo dei comuni deve restare sul server, la policy di sicurezza porta un valore diverso a ogni richiesta, e lingua e tema si leggono dai cookie. Nessuna delle tre cose sopravvive a una pagina generata una volta e messa in cache.',
    en: 'It is not a static site and could not be one: the catalogue of municipalities has to stay on the server, the security policy carries a different value on every request, and language and theme are read from cookies. None of those three survives a page generated once and cached.',
  },
  deployRepoLink: { it: 'Apri il repo su GitHub', en: 'Open the repository on GitHub' },
  /*
    ⚠️ Non è più *apri il sito*, e la ragione sta in `CopiaLink`: chi legge
    questa pagina il sito ce l'ha già aperto davanti. Quello che non ha è
    l'indirizzo da mandare a qualcun altro.
  */
  deploySitoCopia: { it: 'Copia link del sito', en: 'Copy the site link' },
  deploySitoCopiato: { it: 'Copiato', en: 'Copied' },

  chiusuraTitolo: { it: 'Dove continuare', en: 'Where to go next' },
  chiusuraTesto: {
    it: 'Da dove nasce il progetto e che cosa c’entra Jet HR stanno nella pagina che gli sta accanto; il meccanismo del calcolo nella spiegazione; le norme una per una nell’archivio.',
    en: 'Where the project comes from and what Jet HR has to do with it are on the page beside this one; the mechanism of the calculation is in the explanation; the rules one by one are in the archive.',
  },
  linkProgetto: { it: 'Che progetto è →', en: 'What this project is →' },
  linkSpiegazione: { it: 'Come si calcola il netto →', en: 'How net pay is worked out →' },
  linkNorme: { it: 'Leggi le norme →', en: 'Read the law →' },
} as const satisfies Readonly<Record<string, Multilingua>>

/**
 * L'indirizzo del repo.
 *
 * Sta qui e non nella prosa perché è la stessa stringa in tutte e due le
 * lingue, e perché è l'unico dato di questa pagina che non si legge da un file
 * del progetto: nessun file del repo conosce il proprio indirizzo di origine.
 */
export const URL_REPO = 'https://github.com/peppeneglia/jet-salary-calculator'

/** Il sito pubblicato, che è l'altra metà della coppia «dove sta» e «dove gira». */
export const URL_SITO = 'https://jet-salary-calculator.vercel.app/'

/**
 * Perché ciascun pacchetto è entrato.
 *
 * ⚠️ Indicizzato per nome del pacchetto, che è la stessa chiave con cui
 * compare nel file delle dipendenze: la pagina percorre le dipendenze vere e
 * cerca qui la ragione, invece di percorrere questo elenco e fidarsi che
 * corrisponda. Se domani ne entra una senza ragione scritta, la pagina la
 * mostra lo stesso e si vede che manca — il contrario di un elenco a mano, che
 * la nasconderebbe.
 */
export const PERCHE_PACCHETTO: Readonly<Record<string, Multilingua>> = {
  next: {
    it: 'Il calcolo deve stare sul server: il catalogo dei comuni non va nel pacchetto che scarica il browser, e le aliquote non attraversano il confine.',
    en: 'The calculation has to sit on the server: the catalogue of municipalities must not go into the bundle the browser downloads, and the rates never cross the boundary.',
  },
  react: {
    it: 'Conseguenza di Next, non una scelta a sé.',
    en: 'A consequence of Next, not a separate choice.',
  },
  'react-dom': {
    it: 'Conseguenza di Next, non una scelta a sé.',
    en: 'A consequence of Next, not a separate choice.',
  },
  i18next: {
    it: 'Due lingue. Interpolazione, ripiego e scelta della lingua sono problemi già risolti: farne una versione propria sarebbe stato più codice da difendere per ottenere meno.',
    en: 'Two languages. Interpolation, fallback and language selection are solved problems: rolling our own would have been more code to defend in exchange for less.',
  },
  'react-i18next': {
    it: 'Le sole parti che cambiano lingua dentro il browser sono la barra di navigazione e i controlli. Il resto lo traduce il server, con la stessa istanza e le stesse opzioni, così i due lati non possono divergere.',
    en: 'The only parts that switch language inside the browser are the navigation bar and the controls. The server translates the rest, with the same instance and the same options, so the two sides cannot drift apart.',
  },
  typescript: {
    it: 'Il tipo è la prima verifica del progetto. Che il numero di mensilità non possa mancare lo garantisce il compilatore e non una suite: il motore si rifiuta di compilare, non di eseguire.',
    en: 'The type system is the project’s first check. That the number of instalments cannot be missing is guaranteed by the compiler and not by a suite: the engine refuses to compile, not to run.',
  },
  vitest: {
    it: 'Le verifiche stanno sul motore, dove un difetto produce un numero sbagliato. Sui componenti non ce ne sono, ed è una scelta dichiarata: sarebbero verifiche su come una cosa è disegnata, e cambierebbero a ogni cambio di disegno.',
    en: 'The checks sit on the engine, where a defect produces a wrong number. There are none on the components, and that is a declared choice: they would test how something is drawn, and would change with every change of drawing.',
  },
  tailwindcss: {
    it: 'I colori vivono in un blocco solo dentro il foglio di stile globale: un colore si scrive lì e in nessun altro posto, ed è la condizione perché due temi restino misurabili.',
    en: 'The colours live in a single block inside the global stylesheet: a colour is written there and nowhere else, which is what makes two themes measurable.',
  },
  '@tailwindcss/postcss': {
    it: 'Il modo in cui Tailwind entra nella build.',
    en: 'How Tailwind plugs into the build.',
  },
  eslint: {
    it: 'Non è più solo igiene: ospita la regola di progetto che vieta i colori di testo ottenuti sbiadendone un altro, e che fa fallire la build.',
    en: 'No longer just hygiene: it hosts the project rule that forbids text colours obtained by fading another one, and that fails the build.',
  },
  'eslint-config-next': {
    it: 'Le regole che Next raccomanda per le proprie convenzioni, tenute alla stessa versione del framework.',
    en: 'The rules Next recommends for its own conventions, kept at the same version as the framework.',
  },
  '@types/node': {
    it: 'I tipi della piattaforma, per lo script di import e per il codice che gira sul server.',
    en: 'The platform types, for the import script and for the code running on the server.',
  },
  '@types/react': {
    it: 'I tipi dell’interfaccia.',
    en: 'The types for the interface.',
  },
  '@types/react-dom': {
    it: 'I tipi dell’interfaccia.',
    en: 'The types for the interface.',
  },
}

/**
 * A che cosa serve ciascun comando.
 *
 * ⚠️ Indicizzato per nome dello script, come `PERCHE_PACCHETTO` lo è per nome
 * del pacchetto e per la stessa ragione: la riga di comando la porta il file
 * delle dipendenze, questa tabella dice soltanto a che cosa serve. Se domani
 * `build` smettesse di far girare il linter, la pagina mostrerebbe la riga
 * nuova invece di continuare a promettere la vecchia.
 */
export const COMANDI: Readonly<Record<string, Multilingua>> = {
  dev: {
    it: 'Il server di sviluppo, che ricompila a ogni salvataggio.',
    en: 'The development server, recompiling on every save.',
  },
  build: {
    it: 'Il linter e poi la compilazione vera, con il prospetto delle rotte e dei pesi.',
    en: 'The linter and then the real compilation, with the breakdown of routes and weights.',
  },
  start: {
    it: 'Serve quello che la build ha prodotto, come lo servirebbe la piattaforma.',
    en: 'Serves what the build produced, the way the platform would serve it.',
  },
  lint: {
    it: 'Le regole di stile e la regola di progetto sui colori del testo, a severità di errore.',
    en: 'The style rules and the project rule on text colours, at error severity.',
  },
  test: {
    it: 'La suite sul motore, che resta in ascolto e rilancia a ogni modifica.',
    en: 'The engine suite, staying open and re-running on every change.',
  },
  'test:run': {
    it: 'La stessa suite, una volta sola e senza restare in ascolto.',
    en: 'The same suite, once through and without staying open.',
  },
}
