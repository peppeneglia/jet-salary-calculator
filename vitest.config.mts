import { defineConfig } from 'vitest/config'

/**
 * Il limite predefinito di cinque secondi non regge più la suite.
 *
 * Nove file girano in worker paralleli e ognuno importa `data/mef/comuni-2026.json`,
 * 3,3 MB che Vite ritrasforma per ciascuno: in isolamento l'import costa ~570 ms,
 * sotto contesa arriva a 15 s e il costo cade addosso al primo test del file.
 *
 * `hookTimeout` sale con lui perché il suo predefinito è 10 s: un `beforeAll` che
 * scaldasse il catalogo salterebbe per la stessa ragione.
 */
export default defineConfig({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
