/**
 * Formattazione, e nient'altro.
 *
 * L'arrotondamento a due decimali è **presentazione** (D-025): la catena di
 * calcolo lavora a precisione piena e tronca alla quarta cifra solo dove lo
 * impone la norma, che è logica di `core/`. Qui si decide come si scrive un
 * numero, mai quanto vale.
 */

const importo = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Il segno è dato dal motore, non ricostruito qui: `effettoSulNetto` è già
 * negativo per le voci che sottraggono. `signDisplay` lo rende visibile anche
 * quando è positivo, che è il punto delle voci del ramo che aggiunge.
 */
const importoConSegno = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

/**
 * Le aliquote sono in punti percentuali, non in frazione: 9,19% è il numero
 * 9.19. Va scritto con la virgola, come ogni altro numero della pagina.
 */
const percentuale = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const dataIta = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export const inEuro = (n: number): string => importo.format(n)

export const inEuroConSegno = (n: number): string => importoConSegno.format(n)

export const inPercentuale = (n: number): string => `${percentuale.format(n)}%`

/** Le date delle fonti arrivano in ISO 8601 e si mostrano nel formato italiano. */
export const inData = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? iso : dataIta.format(d)
}
