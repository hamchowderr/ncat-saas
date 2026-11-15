import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".mastra/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "lib/database.types.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-children-prop": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;