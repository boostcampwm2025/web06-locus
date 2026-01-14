// eslint.config.mjs
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig(
  // JS 기본 추천 규칙
  eslint.configs.recommended,

  // TS 추천 (타입 기반 버그 방지)
  tseslint.configs.recommendedTypeChecked,

  // TS 스타일 추천 (일관된 코드 스타일)
  tseslint.configs.stylisticTypeChecked,

  // Formatter는 prettier로 적용
  prettierConfig,

  // 무시할 경로
  {
    ignores: [
      'dist/**',
      'dist-types/**',
      'build/**',
      'node_modules/**',
      '**/prisma.config.ts',
      '**/prisma/**',
    ],
  },

  // JS 파일은 타입체킹 규칙 비활성화
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
