import type { NextConfig } from "next";
import { middleware } from './src/middleware/middleware';

const nextConfig: NextConfig = {
  /* config options here */
  /* el miidleware se agrega a la configuración de Next.js */
    middleware: () => middleware,
    /* este async rewrites() se agrega a la configuración de Next.js  para que las rutas sean reescritas */
  async rewrites() {
    return [];
  },
};

export default nextConfig;
