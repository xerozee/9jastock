import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.repl.co",
  ],
  devIndicators: false,
};

export default nextConfig;
