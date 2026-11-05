// drizzle.config.ts
//
// Drizzle Kit configuration for migrations.
//
// Includes both schemas:
// - schema.ts (tenant tables, RLS enforced)
// - auth-schema.ts (Better Auth tables, RLS bypass)
//
// Ye kyun zaroori hai:
// - Drizzle Kit ko sari tables ka pata hona chahiye, warna migration incomplete.
// - dbCredentials = DATABASE_ADMIN_URL (owner role, migrations ke liye).
// - strict: true = destructive changes pe confirmation.

import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_ADMIN_URL!,
  },
  verbose: true,
  strict: true,
});