import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding'),
  ],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  framework: getAbsolutePath('@storybook/react-vite'),
  viteFinal(config) {
    // Path alias 설정 (vite.config.ts와 동일하게)
    const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const alias = {
      '@': resolve(rootDir, 'src'),
      '@public': resolve(rootDir, 'public'),
      '@locus/shared': resolve(rootDir, '../../packages/shared/src'),
      '@features/home': resolve(rootDir, 'src/features/home'),
      '@features/settings': resolve(rootDir, 'src/features/settings'),
    };
    // React Fast Refresh 비활성화: Storybook HTML에는 refresh 런타임이 주입되지 않아
    // $RefreshSig$ is not defined 오류가 나므로, HMR을 끄면 플러그인이 refresh 코드를 넣지 않음.
    return mergeConfig(config, {
      resolve: {
        ...config.resolve,
        alias: { ...config.resolve?.alias, ...alias },
      },
      server: { ...config.server, hmr: false },
    });
  },
};
export default config;
