/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Support for Tailwind CSS v4
  experimental: {
    turbo: {
      resolveAlias: {
        '@': './src',
      },
    },
  },
};

module.exports = nextConfig;
