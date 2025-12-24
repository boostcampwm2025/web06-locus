import base from '../../eslint.config.mjs';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig(...base, {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
        reactHooks.configs['recommended-latest'],
        reactRefresh.configs.vite,
    ],
    languageOptions: {
        globals: { ...globals.browser },
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
});
