import nx from '@nx/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/coverage',
      '**/node_modules',
      '**/.nx',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/storybook-static',
      '**/test-setup.ts',
      '**/jest.config.ts',
      '**/jest.preset.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],

      // React rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'warn',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'warn',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'warn',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/jsx-fragments': ['warn', 'syntax'],
      'react/jsx-no-useless-fragment': 'warn',
      'react/button-has-type': 'off',
      'react/no-array-index-key': 'warn',
      'react/void-dom-elements-no-children': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',


      // General JavaScript/TypeScript rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['warn', 'all'],
      'no-throw-literal': 'error',
      'no-return-await': 'warn',
      'require-await': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript-specific rules (non-type-aware)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'warn',
        {
          allow: ['arrowFunctions'],
        },
      ],
      '@typescript-eslint/no-empty-interface': [
        'warn',
        {
          allowSingleExtends: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
      ],
      // Note: Type-aware rules like prefer-optional-chain, prefer-nullish-coalescing,
      // no-unnecessary-condition, and no-unnecessary-type-assertion are disabled
      // because they require parserOptions.project configuration.
      // Enable them by configuring typescript-eslint parser with project references.
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.stories.ts',
      '**/*.stories.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'no-alert': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-array-index-key': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'require-await': 'off',
    },
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
