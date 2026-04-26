/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ofpuzdpdsambfkophjau.supabase.co',
        pathname: '/storage/v1/object/public/artworks/**',
      },
      {
        protocol: 'https',
        hostname: 'ofpuzdpdsambfkophjau.supabase.co',
        pathname: '/storage/v1/object/public/profiles/**',
      },
      {
        protocol: 'https',
        hostname: 'ofpuzdpdsambfkophjau.supabase.co',
        pathname: '/storage/v1/object/sign/artworks/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig