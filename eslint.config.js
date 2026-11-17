import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/", "server/node_modules/"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: globals.browser },
  },
  {
    files: ["vite.config.js", "eslint.config.js", "tests/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: globals.node },
  },
  {
    files: ["server/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "commonjs", globals: globals.node },
  },
];
