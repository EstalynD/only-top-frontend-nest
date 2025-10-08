import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Advertencia: Esto permite que los builds de producción se completen exitosamente
    // incluso si tu proyecto tiene errores de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
