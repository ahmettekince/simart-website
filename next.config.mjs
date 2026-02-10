/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web.simart.cloud',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Next.js 16 için gerekli: kullanılan kalite değerlerini tanımla
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
