/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'engro-xms-dev.engro.in',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': 'crypto',
      'node:process': 'process',
      'node:path': 'path',
      'node:url': 'url',
      'node:fs': 'fs',
      'node:os': 'os',
    }

    if (isServer) {
      config.externals.push({
        'pg-native': 'pg-native',
      })
    }

    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

export default nextConfig;
