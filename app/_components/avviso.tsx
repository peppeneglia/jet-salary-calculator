/**
 * Il rettangolo in cui il calcolatore dice qualcosa che non è un numero — D-043.
 *
 * ⚠️ Uno solo, e per tutto. Prima esistevano tre riquadri quasi uguali —
 * l'errore della sezione 2, il comune non calcolabile sotto il campo, la
 * riserva su una fonte — ciascuno con la propria coppia di classi Tailwind
 * scritta a mano, e ciascuno con tre tinte della palette ambra fissate dentro
 * il componente. Su due temi quella forma non regge: una tinta chiara scritta
 * in un componente resta chiara anche sul fondo scuro, e non c'è modo di
 * accorgersene se non guardando.
 *
 * Qui il colore viene da tre token — `avviso`, `avviso-bordo`, `avviso-testo` —
 * che cambiano con il tema in un posto solo.
 *
 * Perché ambra e non rosso (D-043). Il rosso dice *guasto*. Nessuno di
 * questi messaggi lo è: una RAL da correggere è una cosa da fare, un comune non
 * coperto è un limite dichiarato, una riserva su una fonte è una cosa da
 * sapere. Il registro dei messaggi dice cosa fare, e il colore deve dire la
 * stessa cosa — altrimenti la grafica contraddice il testo.
 */

export function Avviso({
  id,
  misura = 'normale',
  vivo = false,
  children,
}: {
  id?: string
  /** `compatta` sotto un campo, `normale` quando sostituisce un risultato. */
  misura?: 'compatta' | 'normale'
  /**
   * `role="alert"` per i messaggi che compaiono in risposta a un gesto: un
   * lettore di schermo li annuncia senza spostare il fuoco. Non si mette sui
   * riquadri presenti fin dal caricamento — un avviso che c'era già non è una
   * notizia, e annunciarlo interromperebbe la lettura per nulla.
   */
  vivo?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      role={vivo ? 'alert' : undefined}
      className={
        misura === 'compatta'
          ? 'mt-2 rounded-voce border border-avviso-bordo bg-avviso px-3 py-2.5 text-xs leading-relaxed text-avviso-testo'
          : 'rounded-blocco border border-avviso-bordo bg-avviso px-5 py-4 text-sm leading-relaxed text-avviso-testo'
      }
    >
      {children}
    </div>
  )
}
