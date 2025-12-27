// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import base from '../../eslint.config.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig(
    ...base,
    {
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
    },
    // Storybook 파일에 대한 ESLint 설정
    globalIgnores(['!.storybook'], 'Include Storybook Directory'),
    ...storybook.configs['flat/recommended'],
);
