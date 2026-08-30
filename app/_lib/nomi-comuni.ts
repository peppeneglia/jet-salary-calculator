/**
 * Rende leggibile il nome di un comune dalla stringa del prospetto MEF, che è
 * tutta in maiuscolo (`MILANO`) e segna l'accento finale con un apostrofo
 * (`AGLIE'`, `PRE'-SAINT-DIDIER`).
 *
 * Non restituisce i diacritici che il prospetto non segna: `CHATILLON` resta
 * `Chatillon`. Il perché sta in *Dati e parametri* su Notion.
 */

/**
 * Restano minuscole quando non aprono il nome.
 *
 * Include le forme elise — senza `dell`, `REGGIO NELL'EMILIA` diventerebbe
 * *Reggio Nell'Emilia* — ma non `sant` e `castell`, che stanno anch'essi
 * davanti a un apostrofo e sono parte del nome.
 */
const PARTICELLE = new Set([
  'a', 'ad', 'agli', 'ai', 'al', 'all', 'alla', 'alle', 'allo', 'coll', 'con', 'd', 'da',
  'dal', 'dall', 'dalla', 'dalle', 'de', 'dei', 'degli', 'del', 'dell', 'della', 'delle',
  'dello', 'di', 'e', 'ed', 'en', 'fra', 'gli', 'i', 'il', 'in', 'l', 'la', 'le', 'lo',
  'nel', 'nell', 'nella', 'per', 'presso', 'su', 'sui', 'sul', 'sull', 'sulla', 'tra',
])

/** La vocale che l'apostrofo del prospetto sta accentando. */
const ACCENTATE: Readonly<Record<string, string>> = {
  A: 'à',
  E: 'è',
  I: 'ì',
  O: 'ò',
  U: 'ù',
}

/**
 * I nomi francofoni, dove il marcatore `E'` vale `é` e non `è`.
 *
 * Nessuna voce aggiunge un accento che il prospetto non segni: decidono quale
 * lettera un segno già presente rappresenti, o quale sia il maiuscolo giusto.
 */
const ECCEZIONI: Readonly<Record<string, string>> = {
  "ANTEY-SAINT-ANDRE'": 'Antey-Saint-André',
  "GRESSONEY-LA-TRINITE'": 'Gressoney-La-Trinité',
  "PRE'-SAINT-DIDIER": 'Pré-Saint-Didier',
  'SAINT-RHEMY-EN-BOSSES': 'Saint-Rhemy-en-Bosses',
}

/** `AGLIE'` → `AGLIÈ`, anche a metà nome: `PRE'-SAINT-DIDIER`. */
const accenta = (pezzo: string): string => {
  if (!pezzo.endsWith("'") || pezzo.length < 2) return pezzo
  const vocale = ACCENTATE[pezzo[pezzo.length - 2]]
  return vocale === undefined ? pezzo : pezzo.slice(0, -2) + vocale
}

const parola = (p: string, iniziale: boolean): string => {
  if (p === '') return p
  const basso = p.toLowerCase()
  if (!iniziale && PARTICELLE.has(basso)) return basso
  return basso[0].toUpperCase() + basso.slice(1)
}

export function nomeComune(nomeMef: string): string {
  const eccezione = ECCEZIONI[nomeMef]
  if (eccezione !== undefined) return eccezione

  return nomeMef
    .split(' ')
    .map((token, iToken) =>
      token
        .split('-')
        .map((pezzo, iPezzo) => {
          const conAccento = accenta(pezzo)
          const iniziale = iToken === 0 && iPezzo === 0
          const taglio = conAccento.indexOf("'")
          if (taglio === -1) return parola(conAccento, iniziale)
          // `SANT'ANTONIO` vuole la maiuscola dopo l'apostrofo, `D'ISERNIA` no:
          // la distinzione la fa PARTICELLE, non la posizione.
          const prima = conAccento.slice(0, taglio)
          const dopo = conAccento.slice(taglio + 1)
          return `${parola(prima, iniziale)}'${parola(dopo, true)}`
        })
        .join('-'),
    )
    .join(' ')
}
