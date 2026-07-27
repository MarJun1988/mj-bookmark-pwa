import base from '../eslint.config.js'

export default [
  ...base,
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
