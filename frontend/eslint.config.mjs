import eslint from "@eslint/js"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import typescriptEslint from "typescript-eslint"

export default typescriptEslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "prefer-const": "error",
    },
  },
)
