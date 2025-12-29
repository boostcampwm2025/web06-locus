// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import base from '../../eslint.config.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig(
  ...base,
  globalIgnores(['dist/**', 'build/**']),
  // 설정 파일들에 대한 타입 체크 (tsconfig.node.json 사용)
  {
    files: ['*.config.ts', 'tailwind.config.ts', 'vitest.shims.d.ts'],
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
    extends: [
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  // Storybook 파일에 대한 ESLint 설정
  globalIgnores(['!.storybook'], 'Include Storybook Directory'),
  ...storybook.configs['flat/recommended'],
);
