'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTraduzione } from '../_i18n/provider'

/**
 * Le voci di navigazione, in testa e in fondo.
 *
 * Ogni voce porta a una pagina che esiste: una voce che non arriva da nessuna
 * parte è peggio di una voce assente, ed è lo stesso argomento di D-011 sul
 * selettore che non cambia un numero.
 *
 * È un client component per due ragioni: `usePathname`, che marca la voce
 * corrente, e la lingua delle etichette. Nessun altro stato.
 *
 * ⚠️ **I colori qui sono quelli della cornice, non quelli del contenuto.** La
 * fascia verde non cambia con il tema, quindi il testo che ci sta sopra non può
 * usare `inchiostro`: su fondo scuro `inchiostro` diventa quasi bianco, e
 * bianco su #66C239 sta a 2,25 contro il 4,5 richiesto (D-042).
 */
const VOCI = [
  { href: '/', chiave: 'nav.calcolatore' },
  { href: '/norme', chiave: 'nav.norme' },
] as const

export function Nav({ posizione }: { posizione: 'testa' | 'piede' }) {
  const percorso = usePathname()
  const { t } = useTraduzione()

  return (
    <nav
      aria-label={posizione === 'testa' ? t('nav.etichettaTesta') : t('nav.etichettaPiede')}
      className="flex items-center gap-1"
    >
      {VOCI.map((v) => {
        const corrente = percorso === v.href
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-current={corrente ? 'page' : undefined}
            className={`rounded-voce px-3 py-1.5 text-sm font-medium transition-colors ${
              corrente
                ? 'bg-su-verde text-su-verde-contro'
                : 'text-su-verde/75 hover:bg-su-verde/10 hover:text-su-verde'
            }`}
          >
            {t(v.chiave)}
          </Link>
        )
      })}
    </nav>
  )
}
