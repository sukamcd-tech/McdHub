import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.100.6'],
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

