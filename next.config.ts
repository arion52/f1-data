import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.formula1.com",
      },
      {
        protocol: "https",
        hostname: "media.formula1.com",
      },
      {
        protocol: "https",
        hostname: "fastf1-openf1-proxy.fly.dev",
      },
    ],
  },
};

export default nextConfig;
