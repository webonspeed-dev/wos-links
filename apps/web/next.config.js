/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@wos/database", "@wos/types"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/:shortCode",
        destination: "/api/redirect/:shortCode",
      },
    ];
  },
};

module.exports = nextConfig;
