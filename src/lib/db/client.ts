// src/lib/db/client.ts
//
// Purpose: Drizzle client for admin (owner role) operations.
//
// Used for:
// - Better Auth (users, sessions, accounts, verifications)
// - Test setup/cleanup (seed tenants via admin)
// - Migration scripts
//
// NOT used for:
// - Tenant data reads/writes (use withTenant() instead — RLS enforced)
//
// Ye kyun zaroori hai:
// - Auth tables RLS ke under nahi hain, kyunki auth lookups tenant-independent hote hain.
// - Tenant data ke liye withTenant() use karein (RLS enforce hota hai).

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

// Admin pool — owner role, RLS bypass.
// Production mein pool size tune karein.
export const adminPool = new Pool({
  connectionString: env.DATABASE_ADMIN_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Drizzle client with BOTH schemas (tenant + auth).
// Auth tables queried directly via `db.select().from(users)`.
// Tenant tables MUST use withTenant() helper.
export const db = drizzle({
  client: adminPool,
  schema: { ...schema, ...authSchema },
});