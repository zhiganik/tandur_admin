/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  ...(isProd && { output: 'export' }),
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    if (isProd) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://178.104.44.54/api/:path*',
      },
    ];
  },
};

export default nextConfig;
