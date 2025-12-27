import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  reactCompiler: true,
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', 'react-icons'],
  },
  images: {
    remotePatterns: [
      // MinIO (nuevo storage)
      {
        protocol: 'https',
        hostname: 'bucket-production-892b.up.railway.app',
        pathname: '/**',
      },
      // Supabase (legacy - puedes eliminar después de migrar)
      {
        protocol: 'https',
        hostname: 'ngnhndkqglbuggomkjnt.supabase.co',
        pathname: '/storage/v1/object/public/images/**',
      },
      {
        protocol: 'https',
        hostname: 'hppzpqbqqpaemamrewzj.supabase.co',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],
  },
};

export default nextConfig;
