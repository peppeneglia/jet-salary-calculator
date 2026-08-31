import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Next 16.3.3 appende un blocco di istruzioni per agenti dentro `CLAUDE.md`
   * a ogni `next dev`. Il blocco dice una cosa vera — questa versione di Next
   * differisce da quanto un modello ha appreso in training — ma la dice dentro
   * un file che è documentazione di progetto e non un artefatto generato, e
   * riappare come modifica non committata a ogni avvio.
   *
   * Spento qui, e l'avvertimento resta scritto a mano al §6 di `CLAUDE.md`,
   * dove è parte del documento invece di esserne un'aggiunta automatica.
   */
  agentRules: false,

  /**
   * Il riquadro di Next in basso a sinistra, spento.
   *
   * In sviluppo Next disegna un indicatore che apre i propri strumenti — rotta
   * statica o dinamica, prospetto del bundle Turbopack, log della richiesta.
   * Serve a chi sta esaminando il framework; qui copre un angolo della pagina
   * mentre si guarda l'interfaccia, ed è l'unico elemento a schermo che il
   * progetto non ha disegnato.
   *
   * ⚠️ **Spegnerlo non nasconde gli errori:** la documentazione di Next 16 lo
   * dice esplicitamente — *«Next.js will still surface any compile or runtime
   * errors that were encountered»*. Si perde l'indicatore, non la diagnostica.
   *
   * `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.md`
   */
  devIndicators: false,

  /**
   * ⚠️ **`X-Powered-By: Next.js` esce per impostazione predefinita.** Dice a
   * chiunque quale framework e quindi quale superficie ha davanti, senza dare
   * nulla in cambio a chi legge la pagina. Si spegne qui.
   */
  poweredByHeader: false,

  /**
   * Le intestazioni **uguali per ogni richiesta**.
   *
   * ⚠️ **La Content-Security-Policy non è qui, ed è deliberato:** ha un nonce
   * diverso a ogni richiesta e vive in `proxy.ts`. Queste invece non dipendono
   * dalla richiesta, e stando qui coprono anche gli asset statici, che il proxy
   * non attraversa.
   *
   * **Cosa chiude ciascuna, perché un elenco di intestazioni senza motivazione
   * è cargo cult:**
   *
   * - `X-Content-Type-Options` — impedisce al browser di indovinare il tipo di
   *   una risposta. Riguarda direttamente `GET /api/comuni`, che serve 83 KiB
   *   di JSON dichiarato `application/json`: senza, un browser potrebbe
   *   interpretarlo diversamente da come lo dichiariamo.
   * - `Referrer-Policy` — la RAL non passa mai per l'URL (il calcolo è una
   *   POST), quindi non c'è un reddito da far trapelare. Ma `/norme?sezioni=…`
   *   sì, ed è comunque il valore che non regala il percorso di navigazione a
   *   un dominio esterno.
   * - `X-Frame-Options` — ridondante rispetto a `frame-ancestors 'none'` della
   *   CSP, e si tiene lo stesso: è ciò che protegge i browser che non
   *   applicano la direttiva più recente.
   * - `Permissions-Policy` — il calcolatore non chiede fotocamera, microfono,
   *   posizione né sensori. Dichiararlo rende esplicito che non li userà, e
   *   trasforma un futuro uso accidentale in un errore visibile.
   * - `Strict-Transport-Security` — vale solo su https, dove il sito è
   *   pubblicato. Su http è inerte, non dannosa.
   */
  async headers() {
    return [
      {
        source: '/:percorso*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
