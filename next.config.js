//@ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@true-tech-team/ui-components/index.css':
        './node_modules/@true-tech-team/ui-components/index.css',
    },
  },
};

module.exports = nextConfig;
