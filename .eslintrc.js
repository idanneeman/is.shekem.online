module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: [
        '@nuxtjs',
        'plugin:nuxt/recommended',
        'plugin:prettier/recommended',
        'prettier',
        'prettier/vue'
    ],
    plugins: ['prettier'],
    // add your custom rules here
    rules: {
        'nuxt/no-cjs-in-config': 'off',
        'prefer-const': 0,
        'import/no-mutable-exports': 0,
        'no-console': 0
    }
};
