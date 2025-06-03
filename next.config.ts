import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pandascore.co',
      },
    ],
  }
};

export default nextConfig;
