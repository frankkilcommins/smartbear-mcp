import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

/** @type {import("eslint").Linter.RulesRecord} */
const customRules = {
  "no-unused-vars": "off",
  "no-redeclare": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/no-explicit-any": "off", // (Explicit) any has its valid use cases
  "@typescript-eslint/triple-slash-reference": "off",
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/no-empty-object-type": "off"
}

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**"],
    languageOptions: { globals: globals.node } 
  },
  tseslint.configs.recommended,
  { rules: customRules }
]);
