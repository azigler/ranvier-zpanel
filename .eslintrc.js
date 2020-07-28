module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    globals: {
        'm': true
    },
    extends: [
        'standard',
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    plugins: [
        'standard'
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 9,
        ecmaFeatures: {
            jsx: true
        }
    },
    settings: {
        react: {
          version: "detect"
        },
    },
    rules: {
        'comma-dangle': ['error', 'always-multiline'],
        'indent': ['warn', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'no-unused-vars': ['warn'],
        'no-console': 0,
        'rest-spread-spacing': ["error", "never"],
        'react/react-in-jsx-scope': 0,
        'react/no-unknown-property': 0,
        'comma-dangle': 0
    },
};
