import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: true,
  images: {
    domains: [
      'api.placeholder.com',
      'cdn.pandascore.co'
    ],
  }
};

export default nextConfig;
