import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  // Next.js core rules (includes react, react-hooks, jsx-a11y, import, etc.)
  ...nextVitals,
  ...nextTs,

  // Turn off rules that conflict with Prettier formatting.
  prettier,

  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  // Skrip CLI, seeder, dan logger boleh menulis ke console (output terarah).
  {
    files: ["scripts/**/*.{ts,mts}", "src/db/seed/**/*.{ts,mts}", "src/lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/components/ui/**"]),
]);

export default eslintConfig;
