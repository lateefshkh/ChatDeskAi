import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents: true,  // ← TEMPORARILY DISABLED (Vercel infinite loading bug)
  // partialPrefetching: true, // ← Isko bhi hata dein agar cacheComponents ke saath tha
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;