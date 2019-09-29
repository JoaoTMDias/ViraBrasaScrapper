module.exports = {
    parser: "babel-eslint",
    env: {
        node: true,
        es6: true,
    },
    extends: ["@feedzai/eslint-config-feedzai-react"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    rules: {},
};
