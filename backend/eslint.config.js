// import js from '@eslint/js'
// import tsParser from '@typescript-eslint/parser'
// import tsPlugin from '@typescript-eslint/eslint-plugin'
// import globals from 'globals'

// export default [
//     // Dateien ignorieren
//     {
//         ignores: ['dist/**', 'node_modules/**', 'prisma/seed/**', 'src/generated/**'],
//     },

//     // ESLint empfohlene Rules
//     js.configs.recommended,

//     // Standard-Config für alle TS/JS Files
//     {
//         files: ['**/*.ts', '**/*.js'],
//         languageOptions: {
//             parser: tsParser,
//             globals: {
//                 ...globals.node, // ✅ process, console, __dirname, etc.
//             },
//         },
//         plugins: {
//             '@typescript-eslint': tsPlugin,
//         },
//         rules: {
//             '@typescript-eslint/no-unused-vars': 'warn',
//             '@typescript-eslint/no-explicit-any': 'off',
//             'no-console': 'off',
//         },
//     },

//     // Spezielle Rules für Prisma Seed-Dateien
//     {
//         files: ['prisma/**/*.js'],
//         rules: {
//             'no-fallthrough': 'off'
//         }
//     }
// ]
// export default [
//   ...base,
//   // Dateien ignorieren
//   {
//     ignores: ['prisma/seed/**', 'src/generated/**', 'scripts/**'],
//   },
//   {
//     languageOptions: {
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//     },
//     rules: {
//       'no-process-exit': 'error',
//     },
//   },
//   // Spezielle Rules für Prisma Seed-Dateien
//   {
//     files: ['prisma/**/*.js'],
//     rules: {
//       'no-fallthrough': 'off',
//     },
//   },
//   // Standard-Config für alle TS/JS Files
//   {
//     files: ['**/*.ts', '**/*.js'],
//     languageOptions: {
//       parser: tsParser,
//       globals: {
//         ...globals.node,
//       },
//     },
//     plugins: {
//       '@typescript-eslint': tsPlugin,
//     },
//     rules: {
//       '@typescript-eslint/no-unused-vars': 'warn',
//       '@typescript-eslint/no-explicit-any': 'off',
//     },
//   },
// ]
import base from '../eslint.config.js'

import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  ...base,
  // ✅ TypeScript (Backend)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ✅ CommonJS-Dateien (Prisma, Seeds, Scripts)
  {
    files: ['prisma.config.js', 'prisma/seed/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      'no-undef': 'off', // require / exports / process
      'no-fallthrough': 'off', // bewusstes Fallthrough
    },
  },
]

// export default [
//   // ✅ CommonJS-Dateien (Prisma, Scripts)
//   {
//     files: ['prisma.config.js', 'scripts/**/*.js'],
//     languageOptions: {
//       sourceType: 'commonjs',
//     },
//     rules: {
//       'no-undef': 'off', // require / exports
//       'no-fallthrough': 'off', // Prisma Seed
//     },
//   },

//   // ✅ TypeScript (Backend)
//   {
//     files: ['**/*.ts'],
//     languageOptions: {
//       parser: tsParser,
//     },
//     plugins: {
//       '@typescript-eslint': tsPlugin,
//     },
//     rules: {
//       '@typescript-eslint/no-unused-vars': 'warn',
//       '@typescript-eslint/no-explicit-any': 'off',
//     },
//   },

//   // 🔥 Prisma Seed – bewusstes Fallthrough
//   {
//     files: ['prisma/seed/seed.js'],
//     rules: {
//       'no-fallthrough': 'off',
//     },
//   },
// ]
