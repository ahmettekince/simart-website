/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
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
  async rewrites() {
    return [
      {
        source: "/en/shop",
        destination: "/en/magaza",
      },
      {
        source: "/en/shop/:path*",
        destination: "/en/magaza/:path*",
      },
      {
        source: "/en/contact",
        destination: "/en/iletisim",
      },
      {
        source: "/en/support",
        destination: "/en/destek",
      },
      {
        source: "/en/faq",
        destination: "/en/sss",
      },
      {
        source: "/en/corporate",
        destination: "/en/kurumsal",
      },
      {
        source: "/en/cart",
        destination: "/en/sepetim",
      },
    ];
  },
};

export default nextConfig;
