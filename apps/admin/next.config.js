/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@big-bus/api-client', '@big-bus/types'],
}

module.exports = nextConfig
