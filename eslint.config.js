import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  js.configs.recommended,
  prettier,

  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/generated/**',
      '**/*.d.ts',
    ],
  },

  // 🔑 GLOBAL: Node + Console + Process
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
]
