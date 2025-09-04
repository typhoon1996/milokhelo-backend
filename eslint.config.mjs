import path from "path";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nPlugin from "eslint-plugin-n";
import promisePlugin from "eslint-plugin-promise";
import prettierPlugin from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

const nodeGlobals = {
  module: "readonly",
  require: "readonly",
  process: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  console: "readonly",
};

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
      "test-*.js", // ignore JS test files if you want
    ],
  },

  // ✅ TypeScript files
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: nodeGlobals,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: path.resolve("./tsconfig.json"),
          alwaysTryTypes: true,
        },
        alias: {
          map: [["@", "./src"]],
          extensions: [".ts", ".js", ".json"],
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      n: nPlugin,
      promise: promisePlugin,
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...nPlugin.configs["flat/recommended-module"].rules,
      ...promisePlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,

      "import/no-unresolved": "error",
      "n/no-missing-import": "off",

      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      "no-console": "off",
      "promise/always-return": "off",
      "promise/catch-or-return": "warn",
      "prettier/prettier": "error",
    },
  },

  // ✅ Plain JS files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
    },
  },
];
