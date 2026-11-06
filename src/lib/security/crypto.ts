// src/lib/security/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";

// FIELD_ENCRYPTION_KEY 64 hex chars (32 bytes) hai
const key = Buffer.from(env.FIELD_ENCRYPTION_KEY, "hex");

/**
 * Encrypt a plaintext field using AES-256-GCM.
 * Returns { ciphertext, iv, tag } — all hex-encoded.
 */
export function encryptField(plaintext: string): {
  ciphertext: string;
  iv: string;
  tag: string;
} {
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  
  const tag = cipher.getAuthTag().toString("hex");
  
  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Decrypt an AES-256-GCM encrypted field.
 */
export function decryptField(ciphertext: string, ivHex: string, tagHex: string): string {
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let plaintext = decipher.update(ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");
  
  return plaintext;
}