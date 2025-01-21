import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Ignorar ESLint en compilación
  },
    /* this async rewrites() is added to the Next.js configuration to rewrite the routes */
  async rewrites() {
    return [
      {
        source: '/dashboard/:slug*',
        destination: '/dashboard',
      },
    ];
  },
};

export default nextConfig;
