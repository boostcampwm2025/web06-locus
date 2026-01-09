import base from '../../eslint.config.mjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig(
  ...base,
  // 설정 파일들에 대한 타입 체크 (tsconfig.node.json 사용)
  {
    files: [
      '*.config.ts',
      'tailwind.config.ts',
      'vitest.shims.d.ts',
      '.storybook/**/*.ts',
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // 소스 파일들에 대한 타입 체크 (tsconfig.app.json 사용)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['.storybook/**'],
    extends: [
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
);
