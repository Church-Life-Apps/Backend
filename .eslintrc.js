module.exports = {
  env: {
    node: true,
    es2022: true,
    commonjs: true,
    jest: true,
  },

  extends: ["airbnb-base", "airbnb-typescript/base", "eslint-config-prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: true,
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        bracketSpacing: true,
        tabWidth: 2,
        singleQuote: false,
      },
    ],
    "no-unused-vars": "warn",
    "no-console": "off",
    "func-names": "off",
    "no-plusplus": "off",
    "no-process-exit": "off",
    "class-methods-use-this": "off",
    "import/prefer-default-export": [
      "off"
    ]
  },
};
