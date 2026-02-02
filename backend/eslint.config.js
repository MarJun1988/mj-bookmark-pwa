import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'

export default [
    // Dateien ignorieren
    {
        ignores: ['dist/**', 'node_modules/**', 'prisma/seed/**', 'src/generated/**'],
    },

    // ESLint empfohlene Rules
    js.configs.recommended,

    // Standard-Config für alle TS/JS Files
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node, // ✅ process, console, __dirname, etc.
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },

    // Spezielle Rules für Prisma Seed-Dateien
    {
        files: ['prisma/**/*.js'],
        rules: {
            'no-fallthrough': 'off'
        }
    }
]
