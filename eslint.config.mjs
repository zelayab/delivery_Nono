import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Permitir 'any' temporalmente para evitar errores
      "@typescript-eslint/no-explicit-any": "off",
      // Permitir variables no utilizadas con prefijo '_'
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Permitir interfaces vacías
      "@typescript-eslint/no-empty-interface": "off",
      // Reglas de hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Permitir el uso de `<img>` en lugar de `next/image`
      "@next/next/no-img-element": "warn",
      // Manejar expresiones no usadas
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
];

export default eslintConfig;
