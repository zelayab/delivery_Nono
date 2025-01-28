import type { NextConfig } from "next";
import { middleware } from './src/middleware/middleware';

const nextConfig: NextConfig = {
  experimental: {
    forceSwcTransforms: true, // Forzar SWC para next/font
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'static.vecteezy.com',
      'firebasestorage.googleapis.com',
    ], // Ajusta según tu dominio
    unoptimized: process.env.NODE_ENV === 'development'
  },
  /* config options here */
  /* el miidleware se agrega a la configuración de Next.js */
    middleware: () => middleware,
    /* este async rewrites() se agrega a la configuración de Next.js  para que las rutas sean reescritas */
  async rewrites() {
    return [];
  },
};

export default nextConfig;
