/** @type {import('next').NextConfig} */
const nextConfig = {
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
