// src/lib/env.ts
//
// Purpose: Validate all environment variables at boot time.
// Agar koi required var missing ya invalid hai, app START hi nahi hoga.
//
// Design:
// - serverSchema: server-only vars (secrets, DB URLs) - client ko kabhi nahi jaate
// - clientSchema: sirf NEXT_PUBLIC_* vars - browser ko jaate hain
//
// Ye kyun zaroori hai:
// Bina fail-fast validation ke, agar DATABASE_URL ya FIELD_ENCRYPTION_KEY missing ho,
// app boot ho jayega lekin runtime pe crash karega ya insecure fallback use karega.
// Boot pe hi pakadna = production mein silent failure nahi.

import { z } from "zod";

// ─── Helper: empty string → undefined ─────────────────────────────────────
const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

// ─── Server-only environment ──────────────────────────────────────────────
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database - do connections (RLS ke liye zaroori)
  DATABASE_URL: z.string().url(),
  DATABASE_ADMIN_URL: z.string().url(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be 32+ chars"),
  BETTER_AUTH_URL: z.string().url(),

  // Upstash Redis (rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // LLM providers
  GROQ_API_KEY: z.string().min(1),
  // EMBEDDING_API_KEY: REMOVED — ab local Transformers.js use ho raha hai

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // Cloudflare Turnstile (server-side verify)
  TURNSTILE_SECRET_KEY: z.string().min(1),

  // Notifications (WhatsApp - Meta Cloud API)
  RESEND_API_KEY: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  WHATSAPP_ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),

  // Security - field-level encryption + IP hashing
  FIELD_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "FIELD_ENCRYPTION_KEY must be 64 hex chars (32 bytes)"),
  IP_HASH_SALT: z.string().min(32, "IP_HASH_SALT must be 32+ chars"),

  // Inngest (background jobs)
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),

  // Sentry (optional)
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

// ─── Client-safe environment (NEXT_PUBLIC_*) ──────────────────────────────
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
});

// ─── Validate server env ──────────────────────────────────────────────────
const parsedServer = serverSchema.safeParse(process.env);

if (!parsedServer.success) {
  console.error("❌ Invalid server environment variables:");
  for (const [key, errors] of Object.entries(parsedServer.error.flatten().fieldErrors)) {
    console.error(`   - ${key}: ${errors?.join(", ")}`);
  }
  throw new Error("Server environment validation failed. Check .env.local against .env.example.");
}

export const env = parsedServer.data;

// ─── Validate client env ──────────────────────────────────────────────────
const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsedClient.success) {
  console.error("❌ Invalid public environment variables:");
  for (const [key, errors] of Object.entries(parsedClient.error.flatten().fieldErrors)) {
    console.error(`   - ${key}: ${errors?.join(", ")}`);
  }
  throw new Error("Public environment validation failed. Check .env.local against .env.example.");
}

export const publicEnv = parsedClient.data;

// ─── Convenience type exports ─────────────────────────────────────────────
export type Env = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof clientSchema>;