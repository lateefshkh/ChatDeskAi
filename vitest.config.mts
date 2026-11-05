// vitest.config.mts
//
// Vitest configuration.
//
// - `@` alias resolve karta hai (@/lib/... → src/lib/...)
// - .env.local load karta hai (Next.js autoload karta hai, Vitest nahi)
// - Sirf src/test/ ke andar .test.ts files scan karta hai
//
// `.mts` extension = TypeScript ESM module. Vite ise ESM mode mein load
// karta hai, `CommonJS` warning avoid hoti hai.
//
// Ye kyun zaroori hai:
// - Bina dotenv ke env vars undefined hote hain.
// - Bina alias ke `@/` imports resolve nahi hote.
// - Bina include ke Vitest random folders scan karta hai.

import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/test/**/*.test.ts"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
