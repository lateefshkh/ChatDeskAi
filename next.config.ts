// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Playwright Chromium binary ko include karein
  outputFileTracingIncludes: {
    "/api/sources": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  
  serverExternalPackages: ["@sparticuz/chromium"],
  
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