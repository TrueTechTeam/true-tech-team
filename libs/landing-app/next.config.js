//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  // Disable Turbopack to use webpack (required for SVG ?react imports)
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Transpile the ui-components library from source
  transpilePackages: ['@true-tech-team/ui-components'],

  // SCSS configuration
  sassOptions: {
    includePaths: [
      path.join(__dirname, '../../libs/ui-components/src/lib/styles'),
    ],
  },

  // Webpack configuration
  webpack: (config) => {
    // SVG handling with @svgr/webpack - handle ?react imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Convert *.svg?react imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /react/, // *.svg?react
        use: ['@svgr/webpack'],
      },
      // For regular SVG imports, use the default loader
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: { not: /react/ }, // exclude if *.svg?react
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have custom handling
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
