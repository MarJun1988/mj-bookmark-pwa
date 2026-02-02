import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
    {
        ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
    },

    js.configs.recommended,
    ...vue.configs['flat/recommended'],

    // 🔥 OVERRIDE BLOCK (MUSS DANACH KOMMEN)
    {
        files: ['**/*.vue'],
        rules: {
            'vue/attribute-hyphenation': 'off'
        },
    },

    {
        files: ['**/*.ts', '**/*.vue'],
        rules: {
            // 🔥 DAS FEHLT BEI DIR
            'no-unused-vars': 'off',
            'vue/multi-word-component-names': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',

                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
        },
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
    },
]
