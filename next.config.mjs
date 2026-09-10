/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      // Root-level PDFs (e.g. /1.pdf) are served from Shopify Files by the
      // handler in src/app/api/files/[name]. Runs after the filesystem check,
      // so anything in /public still wins.
      {
        source: '/:name([^/]+\\.pdf)',
        destination: '/api/files/:name',
      },
    ];
  },
};

export default nextConfig;
