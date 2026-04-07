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
        source: "/en/corporate/:path*",
        destination: "/en/kurumsal/:path*",
      },
      {
        source: "/en/cart",
        destination: "/en/sepetim",
      },
      {
        source: "/en/register",
        destination: "/en/kayit-ol",
      },
      {
        source: "/en/login",
        destination: "/en/giris-yap",
      },
      {
        source: "/en/checkout",
        destination: "/en/odeme",
      },
      {
        source: "/en/track-order",
        destination: "/en/kargo-takip",
      },
      {
        source: "/en/forgot-password",
        destination: "/en/sifremi-unuttum",
      },
      {
        source: "/en/my-account",
        destination: "/en/hesabim",
      },
      {
        source: "/en/my-orders",
        destination: "/en/siparislerim",
      },
      {
        source: "/en/my-addresses",
        destination: "/en/adreslerim",
      },
      {
        source: "/en/my-reviews",
        destination: "/en/degerlendirmelerim",
      },
      {
        source: "/en/my-coupons",
        destination: "/en/kupon-kodlarim",
      },
      {
        source: "/en/share-simart",
        destination: "/en/paylas-simart",
      },
    ];
  },
};

export default nextConfig;
