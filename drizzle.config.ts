// drizzle.config.ts
//
// Drizzle Kit configuration for migrations.
// `npx drizzle-kit generate` chalane pe migration files banati hain.
//
// Ye kyun zaroori hai:
// - Schema changes ke liye migration files zaroori hain (production pe direct ALTER nahi).
// - dbCredentials = DATABASE_ADMIN_URL (owner role, kyunki schema changes ke liye elevated permission chahiye).

import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_ADMIN_URL!,
  },
  verbose: true,
  strict: true,
});