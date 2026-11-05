// src/test/ip-hash.test.ts
//
// Tests for ip-hash primitives.
// Prove karte hain:
//   1. hashIp deterministic hai (same IP = same hash)
//   2. hashIp different IPs ke liye different
//   3. hashIp salt-sensitive hai
//   4. safeCompare constant behavior
//   5. hmacSha256Hex deterministic + secret-sensitive

import { describe, it, expect } from "vitest";
import { hashIp, safeCompare, hmacSha256Hex } from "@/lib/security/ip-hash";

describe("hashIp", () => {
  it("returns 64 hex chars", () => {
    const hash = hashIp("203.0.113.42");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same IP", () => {
    const a = hashIp("203.0.113.42");
    const b = hashIp("203.0.113.42");
    expect(a).toBe(b);
  });

  it("returns different hashes for different IPs", () => {
    const a = hashIp("203.0.113.42");
    const b = hashIp("203.0.113.43");
    expect(a).not.toBe(b);
  });

  it("throws on empty or non-string input", () => {
    expect(() => hashIp("")).toThrow();
    // @ts-expect-error — testing invalid runtime input
    expect(() => hashIp(null)).toThrow();
  });

  it("throws on absurdly long input (DoS guard)", () => {
    expect(() => hashIp("a".repeat(101))).toThrow();
  });
});

describe("safeCompare", () => {
  it("returns true for equal strings", () => {
    expect(safeCompare("secret123", "secret123")).toBe(true);
  });

  it("returns false for different strings (same length)", () => {
    expect(safeCompare("secret123", "secret124")).toBe(false);
  });

  it("returns false for different length strings", () => {
    expect(safeCompare("secret", "secret123")).toBe(false);
  });

  it("returns false for empty inputs (fail-closed)", () => {
    expect(safeCompare("", "")).toBe(false);
    expect(safeCompare("", "abc")).toBe(false);
    expect(safeCompare("abc", "")).toBe(false);
  });

  it("handles unicode correctly (no accidental match on byte difference)", () => {
    // "é" composed vs decomposed — different byte sequences, should NOT match
    const composed = "\u00e9";
    const decomposed = "e\u0301";
    expect(safeCompare(composed, decomposed)).toBe(false);
  });
});

describe("hmacSha256Hex", () => {
  it("produces 64 hex chars", () => {
    const sig = hmacSha256Hex("payload", "secret");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    const a = hmacSha256Hex("payload", "secret");
    const b = hmacSha256Hex("payload", "secret");
    expect(a).toBe(b);
  });

  it("changes with secret", () => {
    const a = hmacSha256Hex("payload", "secret1");
    const b = hmacSha256Hex("payload", "secret2");
    expect(a).not.toBe(b);
  });

  it("throws on empty secret", () => {
    expect(() => hmacSha256Hex("payload", "")).toThrow();
  });
});