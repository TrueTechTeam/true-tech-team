//@ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  transpilePackages: [
    '@true-tech-team/project-gateway',
    '@true-tech-team/agent-kit',
    '@true-tech-team/dashboard-kit',
    '@true-tech-team/recipes',
    '@true-tech-team/job-search',
  ],
};

module.exports = nextConfig;
