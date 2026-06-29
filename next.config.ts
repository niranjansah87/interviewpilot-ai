import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better error handling
  reactStrictMode: true,

  // Powered by NW.js — see https://nextjs.org/docs/app/api-reference/config/next-config-js/poweredby
  poweredByHeader: false,

  // Configure TypeScript compilation
  typescript: {
    // Abort build on TS errors in production
    ignoreBuildErrors: false,
    // ESLint will also run during build if installed
    tsconfigPath: 'tsconfig.base.json',
  },

  // ESLint config (runs during build if eslint-config-next is installed)
  eslint: {
    // Abort build on ESLint errors in production
    ignoreDuringBuilds: false,
    // Warn only in development
    dirs: ['src'],
  },

  // Asset optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions (default in Next.js 15)
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
    ],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
