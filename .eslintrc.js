module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  globals: {
    module: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "no-multiple-empty-lines": [
      "error",
      {
        max: 1,
      },
    ],
    "comma-dangle": ["error", "only-multiline"],
    "function-paren-newline": ["error", "multiline-arguments"],
    "no-whitespace-before-property": ["error"],
    "space-infix-ops": ["error"],
    "space-unary-ops": ["error"],
    "rest-spread-spacing": ["error", "never"],
    "object-property-newline": [
      "error",
      {
        allowAllPropertiesOnSameLine: true,
      },
    ],
    "no-multi-spaces": ["error"],
    "keyword-spacing": ["error"],
    "object-curly-spacing": [
      "error",
      "always",
      {
        objectsInObjects: false,
      },
    ],
    "space-before-blocks": "error",
    "comma-spacing": ["error"],
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-irregular-whitespace": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/ban-types": 0,
  },
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
};
