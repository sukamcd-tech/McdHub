import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.6'],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  async rewrites() {
    return [
      {
        source: '/mcdwallet',
        destination: '/projects/mcdwallet',
      },
    ];
  },
};

export default nextConfig;

