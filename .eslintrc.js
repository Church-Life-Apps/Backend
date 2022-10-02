/* eslint-disable prettier/prettier */
module.exports = {
  env: {
    node: 1,
    es2021: true,
  },

  extends: ['airbnb-base', 'eslint-config-prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-prettier'],
  rules: {
    'prettier/prettier': ['error', {singleQuote: true}],
  },
};
