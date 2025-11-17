/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@big-bus/api-client', '@big-bus/types', '@big-bus/ui'],
}

module.exports = nextConfig
