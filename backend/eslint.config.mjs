import eslint from "@eslint/js"
import typescriptEslint from "typescript-eslint"

export default typescriptEslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    rules: {
      // `ignoreRestSiblings` libera o padrao de omitir campo por destructuring:
      // `const { clientId: _clientId, ...rest } = payload`.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "prefer-const": "error",
      "no-console": ["error", { allow: ["error", "warn", "info"] }],
    },
  },
)
