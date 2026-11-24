/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@akari/tokens', '@akari/ui', '@akari/domain', '@akari/data'],
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
};

export default nextConfig;
