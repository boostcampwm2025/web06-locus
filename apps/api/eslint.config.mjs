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
});
