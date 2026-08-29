import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * I nomi della scala tipografica di Tailwind.
 *
 * ⚠️ **Servono a non prendere lucciole per lanterne.** In Tailwind `text-sm/6`
 * **non è** un colore con opacità: è la scorciatoia *dimensione del carattere
 * su interlinea*. Una regola che vietasse ogni `text-…/NN` vieterebbe anche
 * quella, che è legittima e non c'entra nulla con il colore.
 */
const DIMENSIONI_TESTO = new Set([
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
]);

const ALPHA_SUL_TESTO = /\btext-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)\/(\d{1,3})\b/g;

/**
 * `niente-alpha-sul-testo` — attuazione di D-046.
 *
 * ⚠️ **Esiste perché un principio che non è un vincolo è una convenzione, e le
 * convenzioni si dimenticano al primo componente scritto in fretta.**
 *
 * La regola *«un colore si scrive in `globals.css` e in nessun altro posto»*
 * era in cima a quel file fin dall'inizio, ed è stata violata **diciassette
 * volte**. Dodici di quelle violazioni erano tinte derivate sul testo, mai
 * misurate, fra 2,0:1 e 3,66:1 contro una soglia di 4,5. Niente le aveva
 * fermate perché niente poteva fermarle: il commento non è eseguibile.
 *
 * Questa regola lo è. Se una tinta derivata serve davvero, **si promuove a
 * token con un nome di ruolo e un contrasto misurato nei due temi** — che è
 * quello che D-046 chiede e che `inchiostro-nota` e `su-verde-tenue` sono.
 *
 * **Cosa non copre, e va detto.** Vede le stringhe e i pezzi di template
 * letterale, cioè il modo in cui in questo progetto si scrivono le classi. Non
 * vede una classe costruita concatenando frammenti (`'text-' + tinta + '/70'`),
 * né i commenti — ed è giusto che non veda i commenti, perché una nota che
 * cita il difetto chiuso non è il difetto. È un cancello alto, non un muro.
 */
const nienteAlphaSulTesto = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Vieta i modificatori alpha /NN sulle utility di colore del testo (D-046)",
    },
    schema: [],
    messages: {
      vietato:
        "`{{classe}}` è una tinta derivata al volo e non un token (D-046). " +
        "Le tinte così non sono mai state misurate, e le dodici che esistevano " +
        "stavano fra 2,0:1 e 3,66:1 contro una soglia di 4,5. " +
        "Se serve davvero, promuovila a token in app/globals.css con un nome di " +
        "ruolo e il contrasto misurato nei due temi.",
    },
  },
  create(context) {
    const controlla = (node, testo) => {
      for (const trovato of testo.matchAll(ALPHA_SUL_TESTO)) {
        if (DIMENSIONI_TESTO.has(trovato[1])) continue;
        context.report({
          node,
          messageId: "vietato",
          data: { classe: trovato[0] },
        });
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === "string") controlla(node, node.value);
      },
      TemplateElement(node) {
        controlla(node, node.value.raw);
      },
      JSXText(node) {
        controlla(node, node.value);
      },
    };
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    plugins: { jsc: { rules: { "niente-alpha-sul-testo": nienteAlphaSulTesto } } },
    rules: { "jsc/niente-alpha-sul-testo": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
