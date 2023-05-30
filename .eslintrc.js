module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: "airbnb-base",
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "linebreak-style": 0,
  },
  dependencies: {
    "@hapi/hapi": "^21.2.1",
  },
};
