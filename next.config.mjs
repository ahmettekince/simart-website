/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.simart.me',
      },
      {
        protocol: 'https',
        hostname: '**.simart.cloud',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '**.simart.cloud',
      },
      {
        protocol: 'http',
        hostname: '**.simart.me',
      },
    ],
    // Next.js 16 için gerekli: kullanılan kalite değerlerini tanımla
    qualities: [75, 90, 100],
  },
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, immutable",
          },
        ],
      },
      {
        source: "/css/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, immutable",
          },
        ],
      },
      {
        source: "/logo.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
