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
  { ignores: ['dist', 'coverage', 'storybook-static'] },
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
            ['^~/blocks'],
            ['^~/ui'],
            ['^~/api'],
            ['^~/store'],
            ['^~/hooks'],
            ['^~/i18n'],
            ['^~/schemas'],
            ['^~/utils'],
            ['^~/types'],
            ['^~/config'],
            ['^~/constants'],
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
              target: './src/ui/**/*',
              from: [
                './src/api/**/*',
                './src/store/**/*',
                './src/blocks/**/*',
                './src/pages/**/*',
                './src/app/**/*',
              ],
              message:
                'ui/ must not know about stores or API — pass data in via props.',
            },
            {
              target: './src/blocks/**/*',
              from: ['./src/pages/**/*', './src/app/**/*'],
              message: 'blocks/ must not import pages/ or app/.',
            },
            {
              target: './src/api/**/*',
              from: [
                './src/ui/**/*',
                './src/blocks/**/*',
                './src/pages/**/*',
                './src/app/**/*',
              ],
              message:
                'api/ must not import ui/, blocks/, pages/ or app/ (store/ is allowed for the auth token).',
            },
            {
              target: './src/store/**/*',
              from: [
                './src/api/**/*',
                './src/ui/**/*',
                './src/blocks/**/*',
                './src/pages/**/*',
                './src/app/**/*',
              ],
              message:
                'store/ is client state only — it must not import api/, ui/, blocks/, pages/ or app/.',
            },
            {
              target: './src/hooks/**/*',
              from: [
                './src/api/**/*',
                './src/blocks/**/*',
                './src/pages/**/*',
                './src/app/**/*',
              ],
              message:
                'hooks/ may wrap store/i18n but must not import api/ (query hooks live in api/queries), blocks/, pages/ or app/.',
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
            restrictedLayerImport('~/blocks'),
            restrictedLayerImport('~/ui'),
            restrictedLayerImport('~/api'),
            restrictedLayerImport('~/store'),
            restrictedLayerImport('~/hooks'),
            restrictedLayerImport('~/i18n'),
            restrictedLayerImport('~/schemas'),
            restrictedLayerImport('~/utils'),
            restrictedLayerImport('~/types'),
            restrictedLayerImport('~/config'),
            restrictedLayerImport('~/constants'),
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
);
