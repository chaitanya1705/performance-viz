const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@/components', '@/lib', '@/hooks'],
  },
}

module.exports = nextConfig

