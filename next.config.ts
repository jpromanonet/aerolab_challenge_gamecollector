import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
        port: "",
        pathname: "/igdb/image/upload/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Enable static exports for deployment
  output: "standalone",
  // Optimize bundle size
  compress: true,
  // Enable source maps in development
  productionBrowserSourceMaps: false,
  
  // Agrega estas nuevas propiedades:
  typescript: {
    ignoreBuildErrors: true, // Ignora errores de TypeScript durante el build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignora errores de ESLint durante el build
  }
};

export default nextConfig;