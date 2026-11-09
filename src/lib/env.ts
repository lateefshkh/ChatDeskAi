// src/lib/env.ts
import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_ADMIN_URL: z.string().url(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be 32+ chars"),
  BETTER_AUTH_URL: z.string().url(),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // LLM providers (naye add kiye)
  GROQ_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CEREBRAS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDFLARE_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDFLARE_API_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  JINA_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // Turnstile
  TURNSTILE_SECRET_KEY: z.string().min(1),

  // Notifications
  RESEND_API_KEY: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  WHATSAPP_ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),

  // Security
  FIELD_ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/),
  IP_HASH_SALT: z.string().min(32),

  // Inngest
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),

  // Sentry
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
});

const parsedServer = serverSchema.safeParse(process.env);

if (!parsedServer.success) {
  console.error("❌ Invalid server environment variables:");
  for (const [key, errors] of Object.entries(parsedServer.error.flatten().fieldErrors)) {
    console.error(`   - ${key}: ${errors?.join(", ")}`);
  }
  throw new Error("Server environment validation failed. Check .env.local against .env.example.");
}

export const env = parsedServer.data;

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

export type Env = z.infer<typeof serverSchema>;
export type PublicEnv = z.infer<typeof clientSchema>;