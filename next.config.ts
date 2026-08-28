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
}

export default nextConfig
