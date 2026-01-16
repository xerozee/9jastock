import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.repl.co",
  ],
  devIndicators: false,

  // Enable static export for Capacitor builds
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
