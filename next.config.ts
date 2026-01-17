import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.replit.app",
    "*.repl.co",
    "*.janeway.replit.dev",
    "*.kirk.replit.dev",
    "*.picard.replit.dev",
  ],
  devIndicators: false,
};

export default nextConfig;
