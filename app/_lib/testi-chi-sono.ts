/**
 * La prosa di `/chi-sono`.
 *
 * Sta qui e non in `risorse.ts` per la ragione di `testi-progetto.ts` e
 * `testi-tecnica.ts` (D-069): la tabella delle stringhe viaggia nel pacchetto
 * JavaScript di ogni pagina, e questa è un server component senza stato le cui
 * frasi il client non legge mai. Restano di là i due campi `meta`.
 *
 * ⚠️ È la sola pagina del sito che parla di una persona invece che di un
 * calcolo, e per questo è anche la sola tentata di essere lunga. Il taglio è
 * dichiarato: **la firma nel piede la apre, quindi chi arriva qui ha fatto un
 * gesto piccolo e si aspetta una risposta breve.** Un curriculum intero
 * tradirebbe quella promessa. Resta ciò che spiega perché questo calcolatore
 * esiste ed è fatto così, e nient'altro.
 *
 * ⚠️ Il registro è la prima persona, ed è l'unico posto del sito in cui
 * compare. Altrove parla il prodotto — *il calcolatore applica*, *la pagina
 * mostra* — perché il soggetto è il calcolo. Qui il soggetto è chi l'ha
 * scritto, e la terza persona suonerebbe come una nota biografica scritta da
 * qualcun altro.
 *
 * ⚠️ Le date restano come le scriverebbe chi legge nella propria lingua, ed è
 * la convenzione di `formato(lingua)` applicata a mano perché qui non sono
 * date ma **periodi**: `giu 2025 – oggi` non è una data che `Intl` sappia
 * formattare, è una didascalia.
 */

import type { Multilingua } from '../../core/types'

export const CHI_SONO = {
  titolo: { it: 'Chi sono', en: 'About me' },
  occhiello: {
    it: 'Sviluppatore, con una laurea in informatica e una in corso in gestione d’impresa. Questo calcolatore l’ho scritto io: ecco da dove arrivo.',
    en: 'A developer, with a degree in computer science and one in progress in business management. I wrote this calculator: here is where I come from.',
  },

  introP1: {
    it: 'Lavoro come sviluppatore in Deloitte, a Bari, su progetti enterprise. Ho una laurea in Informatica e Tecnologie per la Produzione del Software all’Università di Bari e sto finendo Gestione d’Impresa alla Mercatorum. Le ho scelte perché ognuna risponde a metà della domanda: la prima insegna come si costruisce una cosa, la seconda se valga la pena costruirla.',
    en: 'I work as a developer at Deloitte, in Bari, on enterprise projects. I hold a degree in Computer Science and Software Production Technologies from the University of Bari, and I am finishing one in Business Management at Mercatorum. I chose them because each answers half the question: the first teaches how a thing is built, the second whether it is worth building.',
  },
  introP2: {
    it: 'Qualunque cosa faccia, dentro o fuori dal lavoro, finisce per assomigliare a tutte le altre: capire un problema fino in fondo, quasi sempre in un dominio che all’inizio non conosco, e costruire qualcosa che lo risolva davvero e non solo in superficie.',
    en: 'Whatever I work on, inside the job or outside it, ends up resembling everything else I have done: understanding a problem all the way down, almost always in a domain I did not know to begin with, and building something that actually solves it rather than papering over it.',
  },

  filoTitolo: { it: 'Come lavoro', en: 'How I work' },
  filoP1: {
    it: 'Sui progetti enterprise la dinamica è sempre la stessa: si parte dai requisiti del cliente e si arriva al software. La parte difficile non è scrivere il codice, è capire che cosa il cliente stia davvero chiedendo — che quasi mai coincide con quello che ha scritto nel documento. Lì il problema arriva già definito, spesso male, e il lavoro vero è ridefinirlo.',
    en: 'On enterprise projects the pattern never changes: you start from the client’s requirements and end up at software. The hard part is not writing the code, it is working out what the client is actually asking for — which almost never matches what they wrote in the document. There the problem arrives already defined, often badly, and the real work is redefining it.',
  },
  filoP2: {
    it: 'Uso gli strumenti di intelligenza artificiale in modo intensivo, ma con una divisione netta: le decisioni di architettura e di prodotto sono mie e le scrivo prima che venga scritta una riga di codice; l’esecuzione di dettaglio la delego. La parte più utile del mio lavoro è dire di no a quello che l’AI propone, e la conoscenza teorica serve esattamente a questo — riconoscere quando una soluzione che funziona è comunque quella sbagliata.',
    en: 'I use AI tools heavily, but with a sharp division of labour: the architecture and product decisions are mine and I write them down before a line of code exists; the detailed execution I delegate. The most useful part of my job is saying no to what the AI proposes, and theory is what makes that possible — recognising when a solution that works is still the wrong one.',
  },
  filoP3: {
    it: 'Un esempio, e la soluzione sbagliata era la mia. Su Prevyber — una piattaforma che intercetta phishing e ingegneria sociale mentre l’attacco è in corso — avevo costruito un motore di rilevamento a regole e soglie. Provato su un vero SMS che imitava Poste, ha fallito in tutti e due i modi: non ha visto la truffa e si è insospettito di messaggi legittimi. Non era una questione di taratura, era l’impianto: un punteggio su parole non può giudicare un’intenzione. L’ho demolito e riprogettato attorno a un modello linguistico.',
    en: 'One example, and the wrong solution was mine. On Prevyber — a platform that intercepts phishing and social engineering while the attack is happening — I had built a detection engine based on rules and thresholds. Tested against a real scam text impersonating the postal service, it failed in both directions: it missed the fraud and grew suspicious of legitimate messages. It was not a matter of tuning, it was the design: a score over words cannot judge an intention. I tore it down and rebuilt it around a language model.',
  },

  esperienzaTitolo: { it: 'Esperienza', en: 'Experience' },
  formazioneTitolo: { it: 'Formazione', en: 'Education' },

  perchePTitolo: {
    it: 'Perché proprio questo progetto',
    en: 'Why this project in particular',
  },
  percheP1: {
    it: 'Il diritto non lo studio soltanto, lo applico. Con la mia famiglia gestisco una casa vacanza e curo la burocrazia degli affitti brevi: adempimenti, imposte, una normativa che cambia in continuazione e che cambia da comune a comune. Trovare la regola giusta, capire quale versione si applica al mio caso e tradurla in un calcolo corretto è una cosa che faccio da anni, sulla mia pelle.',
    en: 'I do not only study law, I apply it. With my family I run a holiday let and I handle the paperwork of short-term rentals: filings, taxes, rules that keep changing and that change from one municipality to the next. Finding the right rule, working out which version applies to my case and turning it into a correct calculation is something I have done for years, first-hand.',
  },
  percheP2: {
    it: 'Interpretare una legge per estrarne la logica di calcolo non è la parte che sopporto, è quella che mi diverte. È anche il motivo per cui questo calcolatore copre tutti i comuni invece del solo caso minimo che la consegna suggeriva.',
    en: 'Reading a piece of legislation to pull the calculation logic out of it is not the part I put up with, it is the part I enjoy. It is also why this calculator covers every municipality instead of the single minimal case the brief suggested.',
  },

  chiusuraTitolo: { it: 'Dove continuare', en: 'Where to go next' },
  chiusuraTesto: {
    it: 'Da dove nasce questo calcolatore e che cosa c’entra Jet HR stanno in una pagina apposta; com’è costruito, in un’altra.',
    en: 'Where this calculator comes from and what Jet HR has to do with it are on a page of their own; how it is built, on another.',
  },
  linkProgetto: { it: 'Che progetto è →', en: 'What this project is →' },
  linkTecnica: { it: 'Come è fatta tecnicamente →', en: 'How it is built, technically →' },
} as const satisfies Readonly<Record<string, Multilingua>>

/**
 * Una voce di esperienza o di formazione.
 *
 * Quattro campi e non un paragrafo libero: ruolo, luogo, periodo e **una sola**
 * riga di che cosa. Il vincolo è la ragione per cui questa pagina resta corta —
 * un campo che accetta un paragrafo si riempie di un paragrafo.
 */
export interface Voce {
  readonly ruolo: Multilingua
  readonly luogo: Multilingua
  readonly periodo: Multilingua
  readonly nota: Multilingua
}

export const ESPERIENZA: readonly Voce[] = [
  {
    ruolo: { it: 'Developer', en: 'Developer' },
    luogo: { it: 'Deloitte — Bari', en: 'Deloitte — Bari' },
    periodo: { it: 'giu 2025 – oggi', en: 'Jun 2025 – present' },
    nota: {
      it: 'Progetti enterprise: dai requisiti del cliente al software, come analyst e come sviluppatore.',
      en: 'Enterprise projects: from the client’s requirements to the software, as analyst and as developer.',
    },
  },
  {
    ruolo: { it: 'Sviluppatore web, in proprio', en: 'Web developer, self-employed' },
    luogo: { it: 'Puglia', en: 'Puglia, Italy' },
    periodo: { it: '2021 – oggi', en: '2021 – present' },
    nota: {
      it: 'Web app, siti e app mobile su commissione: React e TypeScript davanti, Node e Supabase dietro, Vercel o Railway per la pubblicazione.',
      en: 'Commissioned web apps, websites and mobile apps: React and TypeScript on the front, Node and Supabase behind, Vercel or Railway to publish.',
    },
  },
  {
    ruolo: {
      it: 'Tirocinio — tracciabilità e certificazione dei capi d’abbigliamento',
      en: 'Internship — traceability and certification for clothing',
    },
    luogo: { it: 'I.co.man 2000 (BerWich) — Martina Franca', en: 'I.co.man 2000 (BerWich) — Martina Franca' },
    periodo: { it: 'gen – mar 2025', en: 'Jan – Mar 2025' },
    nota: {
      it: 'Tesi e tirocinio: smart contract per i dati immutabili, IPFS per i documenti, un modello di riconoscimento dei tessuti e una pagina prodotto raggiungibile da QR code.',
      en: 'Thesis and internship: smart contracts for immutable records, IPFS for the documents, a fabric-recognition model, and a product page reachable by QR code.',
    },
  },
]

export const FORMAZIONE: readonly Voce[] = [
  {
    ruolo: { it: 'Gestione d’Impresa', en: 'Business Management' },
    luogo: { it: 'Università Mercatorum', en: 'Università Mercatorum' },
    periodo: { it: 'lug 2025 – oggi', en: 'Jul 2025 – present' },
    nota: {
      it: 'In corso. La metà della domanda a cui l’informatica non risponde: se una cosa valga la pena di essere costruita.',
      en: 'In progress. The half of the question computer science does not answer: whether a thing is worth building.',
    },
  },
  {
    ruolo: {
      it: 'Informatica e Tecnologie per la Produzione del Software',
      en: 'Computer Science and Software Production Technologies',
    },
    luogo: { it: 'Università degli Studi di Bari', en: 'University of Bari' },
    periodo: { it: 'set 2021 – giu 2025', en: 'Sep 2021 – Jun 2025' },
    nota: {
      it: 'Laurea triennale, con la tesi sul sistema di tracciabilità qui sopra.',
      en: 'Bachelor’s degree, with the thesis on the traceability system above.',
    },
  },
  {
    ruolo: { it: 'Informatica e Telecomunicazioni', en: 'Computing and Telecommunications' },
    luogo: { it: 'IISS «E. Majorana» — Martina Franca', en: 'IISS «E. Majorana» — Martina Franca' },
    periodo: { it: 'set 2016 – lug 2021', en: 'Sep 2016 – Jul 2021' },
    nota: {
      it: 'Diploma di istituto tecnico.',
      en: 'Technical secondary school diploma.',
    },
  },
]
