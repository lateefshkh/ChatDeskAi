// src/lib/security/rate-limit.ts
//
// Purpose: Rate limiting for auth routes + chat (later).
//
// Design:
// - Upstash Redis (REST) — serverless-safe, no TCP connections.
// - Sliding window algorithm — smoother than fixed window.
// - Per-IP and per-account limits.
// - Fail-open on Redis outage (availability > perfect security for rate limits;
//   but log warning so ops can investigate).
//
// Ye kyun zaroori hai:
// - Bina rate limit ke attacker brute-force kar sakta hai (passwords, tokens).
// - Per-account limit account-specific attacks rokta hai.
// - Per-IP limit distributed attacks (botnet) partially rokta hai.
// - Fail-open deliberate: agar Redis down hai to signup/login block nahi hona chahiye.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

// Redis client singleton
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// ─── Limiter definitions ──────────────────────────────────────────────────
// Different limits for different actions. Tune based on abuse patterns.

// Signup: 5 per hour per IP. Prevents mass account creation.
const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:signup",
  analytics: false,
});

// Login: 10 per 15 min per IP + 5 per 15 min per account.
// Per-IP catches bots, per-account catches targeted attacks.
const loginIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "rl:login:ip",
  analytics: false,
});

const loginAccountLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:login:account",
  analytics: false,
});

// Password reset: 3 per hour per IP, 2 per hour per account.
const resetIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:reset:ip",
  analytics: false,
});

const resetAccountLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "1 h"),
  prefix: "rl:reset:account",
  analytics: false,
});

// Chat (Phase 5): per-IP + per-visitor + per-tenant later.
const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:chat",
  analytics: false,
});

// ─── Public API ───────────────────────────────────────────────────────────

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check signup rate limit for an IP.
 */
export async function checkSignupLimit(ip: string): Promise<RateLimitResult> {
  try {
    return await signupLimiter.limit(`ip:${ip}`);
  } catch (error) {
    console.error("[rate-limit] signup check failed:", error);
    // Fail-open: allow the request, log for investigation
    return { success: true, limit: 5, remaining: 5, reset: Date.now() + 3600_000 };
  }
}

/**
 * Check login rate limits (IP + account).
 * Both must pass. Returns the more restrictive result.
 */
export async function checkLoginLimits(
  ip: string,
  email: string
): Promise<RateLimitResult> {
  try {
    const [ipResult, accountResult] = await Promise.all([
      loginIpLimiter.limit(`ip:${ip}`),
      loginAccountLimiter.limit(`acct:${email.toLowerCase()}`),
    ]);

    // Return the result with fewer remaining (more restrictive)
    if (ipResult.remaining < accountResult.remaining) {
      return ipResult;
    }
    return accountResult;
  } catch (error) {
    console.error("[rate-limit] login check failed:", error);
    return { success: true, limit: 10, remaining: 10, reset: Date.now() + 900_000 };
  }
}

/**
 * Check password reset rate limits.
 */
export async function checkResetLimits(
  ip: string,
  email: string
): Promise<RateLimitResult> {
  try {
    const [ipResult, accountResult] = await Promise.all([
      resetIpLimiter.limit(`ip:${ip}`),
      resetAccountLimiter.limit(`acct:${email.toLowerCase()}`),
    ]);

    if (ipResult.remaining < accountResult.remaining) {
      return ipResult;
    }
    return accountResult;
  } catch (error) {
    console.error("[rate-limit] reset check failed:", error);
    return { success: true, limit: 3, remaining: 3, reset: Date.now() + 3600_000 };
  }
}

/**
 * Check chat rate limit (Phase 5).
 */
export async function checkChatLimit(identifier: string): Promise<RateLimitResult> {
  try {
    return await chatLimiter.limit(identifier);
  } catch (error) {
    console.error("[rate-limit] chat check failed:", error);
    return { success: true, limit: 30, remaining: 30, reset: Date.now() + 60_000 };
  }
}