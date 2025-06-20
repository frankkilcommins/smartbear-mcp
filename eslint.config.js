import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

/** @type {import("eslint").Linter.RulesRecord} */
const customRules = {
  "no-unused-vars": "off",
  "no-redeclare": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/triple-slash-reference": "off",
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/no-empty-object-type": "off"
}

export default defineConfig([
  tseslint.configs.recommended,
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], rules: customRules },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.node }, rules: customRules },
]);
