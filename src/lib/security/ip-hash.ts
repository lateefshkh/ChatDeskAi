// src/lib/security/ip-hash.ts
//
// Purpose: Security primitives for hashing IPs and comparing secrets safely.
//
// Two core functions:
//   1. hashIp(ip)       - HMAC-SHA256 with salt. Logs/audit ke liye pseudonymous ID.
//   2. safeCompare(a,b) - Timing-safe string comparison. Webhook signatures, tokens.
//
// Ye kyun zaroori hai:
// - Plain SHA256(ip) brute-forceable hai (IPv4 = only 4 billion possibilities).
//   HMAC + secret salt ke bina attacker reverse kar sakta hai. DPDP violation.
// - Normal string === comparison timing attack ke liye vulnerable hai.
//   Attacker timing differences se byte-by-byte guess kar sakta hai.
//   timingSafeEqual constant time mein compare karta hai.

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Hash an IP address with HMAC-SHA256 using IP_HASH_SALT.
 *
 * Output: 64 hex chars (32 bytes).
 *
 * Use for: audit logs, rate-limit keys, abuse detection.
 * Do NOT use for: anything that needs to recover the original IP.
 *   (Yeh one-way hai by design - privacy requirement.)
 */
export function hashIp(ip: string): string {
  if (typeof ip !== "string" || ip.length === 0) {
    throw new Error("hashIp: ip must be a non-empty string");
  }
  if (ip.length > 100) {
    // IPv6 max ~45 chars. 100 se zyada = invalid input, reject.
    throw new Error("hashIp: ip too long");
  }
  return createHmac("sha256", env.IP_HASH_SALT).update(ip).digest("hex");
}

/**
 * Constant-time string comparison.
 *
 * Returns true only if both strings are exactly equal (same length, same bytes).
 *
 * Use for:
 *   - Razorpay webhook signature verification (Phase 3)
 *   - Any secret/token comparison
 *   - Never use === for secrets - timing attack.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  if (a.length === 0 || b.length === 0) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return timingSafeEqual(bufA, bufB);
}

/**
 * Compute HMAC-SHA256 of a payload with a given secret.
 *
 * Returns hex string. Used for Razorpay webhook signature generation
 * (server-side) and verification (compare with safeCompare).
 */
export function hmacSha256Hex(payload: string, secret: string): string {
  if (typeof payload !== "string" || typeof secret !== "string") {
    throw new Error("hmacSha256Hex: payload and secret must be strings");
  }
  if (secret.length === 0) {
    throw new Error("hmacSha256Hex: secret must be non-empty");
  }
  return createHmac("sha256", secret).update(payload).digest("hex");
}