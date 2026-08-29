'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Le voci di navigazione, in testa e in fondo.
 *
 * Ogni voce porta a una pagina che esiste: una voce che non arriva da nessuna
 * parte è peggio di una voce assente, ed è lo stesso argomento di D-011 sul
 * selettore che non cambia un numero.
 *
 * È un client component per una ragione sola: `usePathname` serve a marcare la
 * voce corrente. Nessun altro stato.
 */
const VOCI = [
  { href: '/', etichetta: 'Calcolatore' },
  { href: '/norme', etichetta: 'Norme' },
] as const

export function Nav({ etichetta }: { etichetta: string }) {
  const percorso = usePathname()

  return (
    <nav aria-label={etichetta} className="flex items-center gap-1">
      {VOCI.map((v) => {
        const corrente = percorso === v.href
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-current={corrente ? 'page' : undefined}
            className={`rounded-voce px-3 py-1.5 text-sm font-medium transition-colors ${
              corrente
                ? 'bg-inchiostro text-carta'
                : 'text-inchiostro/75 hover:bg-inchiostro/10 hover:text-inchiostro'
            }`}
          >
            {v.etichetta}
          </Link>
        )
      })}
    </nav>
  )
}
