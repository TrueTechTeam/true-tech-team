//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Transpile the ui-components library from source
  transpilePackages: ['@true-tech-team/ui-components'],

  // SCSS configuration
  sassOptions: {
    includePaths: [
      path.join(__dirname, '../../libs/ui-components/src/lib/styles'),
    ],
  },

};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
