import base from '../../eslint.config.mjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig(...base, {
  files: ['**/*.{ts,js}'],
  languageOptions: {
    globals: { ...globals.node, ...globals.jest },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-extraneous-class': [
      'error',
      {
        allowWithDecorator: true, // NestJS 데코레이터가 적용된 class
      },
    ],
  },
});
