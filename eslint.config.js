import js from '@eslint/js';
import queryPlugin from '@tanstack/eslint-plugin-query';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX, { createNodeResolver } from 'eslint-plugin-import-x';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const restrictedLayerImport = (name) => ({
  name,
  message: `Import a specific file from '${name}/...' instead of the layer root (no barrel files in src/).`,
});

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'storybook-static', '.claude/worktrees'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      sonarjs.configs.recommended,
      reactPlugin.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      ...queryPlugin.configs['flat/recommended'],
      prettierConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    plugins: {
      'import-x': importX,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver-next': [
        createTypeScriptImportResolver(),
        createNodeResolver(),
      ],
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^react', '^@?\\w'],
            ['^~/app'],
            ['^~/pages'],
            ['^~/components'],
            ['^~/api'],
            ['^~/store'],
            ['^~/hooks'],
            ['^~/i18n'],
            ['^~/schemas'],
            ['^~/utils'],
            ['^~/types'],
            ['^~/config'],
            ['^~/constants'],
            ['^~/assets'],
            ['^\\.'],
            ['^.+\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/components/ui',
              from: ['./src/api', './src/store', './src/pages', './src/app'],
              message:
                'components/ui/ must not know about stores or API — pass data in via props.',
            },
            {
              target: './src/components/ui',
              from: './src/components',
              except: ['./ui'],
              message:
                'components/ui/ must not import connected components — it is the presentational tier.',
            },
            {
              target: './src/components',
              from: ['./src/pages', './src/app'],
              message: 'components/ must not import pages/ or app/.',
            },
            {
              target: './src/api',
              from: './src/components',
              except: ['./ui'],
              message:
                'api/ may import components/ui/ (e.g. showToast) but not connected components.',
            },
            {
              target: './src/api',
              from: ['./src/store', './src/pages', './src/app'],
              message:
                'api/ must not import store/, pages/ or app/ — the client is auth-agnostic; see the recipes in docs/api-layer.md.',
            },
            {
              target: './src/store',
              from: [
                './src/api',
                './src/components',
                './src/pages',
                './src/app',
              ],
              message:
                'store/ is client state only — it must not import api/, components/, pages/ or app/.',
            },
            {
              target: './src/hooks',
              from: [
                './src/api',
                './src/components',
                './src/pages',
                './src/app',
              ],
              message:
                'hooks/ may wrap store/i18n but must not import api/ (query hooks live in api/queries), components/, pages/ or app/.',
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            restrictedLayerImport('~/app'),
            restrictedLayerImport('~/pages'),
            restrictedLayerImport('~/components'),
            restrictedLayerImport('~/api'),
            restrictedLayerImport('~/store'),
            restrictedLayerImport('~/hooks'),
            restrictedLayerImport('~/i18n'),
            restrictedLayerImport('~/schemas'),
            restrictedLayerImport('~/utils'),
            restrictedLayerImport('~/types'),
            restrictedLayerImport('~/config'),
            restrictedLayerImport('~/constants'),
            restrictedLayerImport('~/assets'),
            restrictedLayerImport('~/styles'),
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message:
            'Use env from ~/config/env instead of import.meta.env directly.',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'sonarjs/cognitive-complexity': 'off',
    },
  },
  {
    files: ['src/config/env.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Test helpers aren't part of the Vite dev server's HMR boundary.
    files: ['__tests__/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
