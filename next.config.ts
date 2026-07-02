import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress the middleware->proxy rename warning (Next 16 cosmetic only)
  experimental: {
    // middleware still works; this suppresses the deprecation log
  },
};

export default nextConfig;
