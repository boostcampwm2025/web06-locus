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
 * 현재 파일의 디렉토리 경로를 ESM과 CJS에서 사용할 수 있도록 설정.
 */
const rootDir =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

/**
 * 루트 디렉토리에서 파일을 찾을 수 있도록 설정.
 * @param segments 경로 세그먼트
 * @returns 경로
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
    display: 'standalone',
    description:
      '생각이 태어난 장소를 기억하고 다시 돌아갈 수 있도록 돕는 서비스',
    theme_color: '#A8C3A0',
    icons: [
      { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    // 캐싱할 파일 확장자 정의 (LCP 관련 이미지 포함 가능)
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    // 외부 도메인(네이버 지도 등) 캐싱은 보안/정책상 서비스워커에서 직접 다루기 까다로우므로 기본 설정 유지
    navigateFallbackDenylist: [/^\/api\//],
  },
};

const storybookTestConfig: TestProjectConfiguration = {
  extends: true,
  plugins: [storybookTest({ configDir: resolveFromRoot('.storybook') })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],

  resolve: {
    alias: {
      '@': resolveFromRoot('src'),
      '@public': resolveFromRoot('public'),
      '@locus/shared': resolveFromRoot('../../packages/shared/src'),
      '@features/home': resolveFromRoot('src/features/home'),
    },
  },

  build: {
    // 타겟을 모던 브라우저로 설정하여 불필요한 폴리필(Legacy JS) 제거
    target: 'esnext',

    // 배포 환경에서 소스맵 비활성화 (보안 및 빌드 크기 최적화)
    sourcemap: false,

    // 압축 엔진 설정 (terser는 esbuild보다 압축률이 미세하게 더 좋음)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true /* 배포 환경에서 console 제거 */,
        drop_debugger: true,
      },
    },

    // 청크(파일 쪼개기) 전략 수정
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 너무 잘게 쪼개면 HTTP 요청 수가 많아져 오히려 느려짐에 주의, 묶어서 관리
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-framework';
            }
            if (id.includes('@sentry')) {
              return 'vendor-sentry';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            return 'vendor-libs';
          }
        },
        // 빌드 결과물 파일명 깔끔하게 정리
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 대용량 아이콘/이미지 컴포넌트 대응 (용량 경고 기준 상향)
    chunkSizeWarningLimit: 800,
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    projects: [storybookTestConfig],
  },
});
