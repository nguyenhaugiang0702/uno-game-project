/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/uno' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/uno' : '',
}

module.exports = nextConfig

