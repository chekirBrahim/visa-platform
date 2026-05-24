import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel-storage.com" },
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Headers de sécurité supplémentaires
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization" },
        ],
      },
    ];
  },

  // Webpack: ignorer les modules natifs non-nécessaires dans le bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "ws"];
    }
    return config;
  },

  // Logging en développement
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Compression
  compress: true,

  // PoweredByHeader
  poweredByHeader: false,
};

export default nextConfig;
