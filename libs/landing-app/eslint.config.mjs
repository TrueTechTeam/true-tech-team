import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  // Global ignores must come first and only contain ignores property
  {
    ignores: ['.next/**', 'out/**', '.claude/**', 'node_modules/**'],
  },
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    settings: { react: { version: 'detect' } },
    rules: {
      // Disable overly strict rules from nx flat/react preset
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
