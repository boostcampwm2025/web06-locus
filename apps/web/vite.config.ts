import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { VitePWA } from 'vite-plugin-pwa';
import type { VitePWAOptions } from 'vite-plugin-pwa';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import type { TestProjectConfiguration } from 'vitest/config';

/**
 * 현재 파일의 디렉토리 경로를 ESM과 CJS 환경 모두에서 안전하게 가져옵니다.
 */
const rootDir =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/**
 * 루트 디렉토리 기준으로 경로를 해석합니다.
 * @param segments 경로 세그먼트
 * @returns 절대 경로
 */
const resolveFromRoot = (...segments: string[]) =>
  path.resolve(rootDir, ...segments);

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  devOptions: {
    enabled: false,
  },
  manifest: {
    name: 'Locus',
    short_name: 'Locus',
    description:
      '생각이 태어난 장소를 기억하고, 그 생각으로 다시 돌아갈 수 있도록 돕는 공간 기반 기록 서비스',
    theme_color: '#A8C3A0',
    icons: [
      {
        src: 'icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
};

const storybookTestConfig: TestProjectConfiguration = {
  extends: true,
  plugins: [
    storybookTest({
      configDir: resolveFromRoot('.storybook'),
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
};

const config = {
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],

  resolve: {
    alias: {
      '@': resolveFromRoot('src'),
      '@public': resolveFromRoot('public'),
      '@locus/shared': resolveFromRoot('../../packages/shared/src'),
    },
  },

  test: {
    projects: [storybookTestConfig],
  },
};

export default defineConfig(config);
