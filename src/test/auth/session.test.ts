// src/test/auth/session.test.ts
//
// Tests for session helpers.
// Note: Full session flow tests (signup → login → session) come in Step 2D.
// Here we test the helpers with mocked DB.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSessionContext } from "@/lib/auth/session";

// Mock Better Auth
vi.mock("@/lib/auth/better-auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock headers (Next.js)
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

// Mock DB
vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/db/client";

const mockedGetSession = vi.mocked(auth.api.getSession);
const mockedDb = vi.mocked(db);

describe("getSessionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if no session", async () => {
    mockedGetSession.mockResolvedValueOnce(null);
    const result = await getSessionContext();
    expect(result).toBeNull();
  });

  it("returns null if session user missing", async () => {
    mockedGetSession.mockResolvedValueOnce({
      user: undefined,
      session: undefined,
    } as never);
    const result = await getSessionContext();
    expect(result).toBeNull();
  });

  // Note: Deeper tests (user+tenant lookup) require DB mock chain setup.
  // We keep this test file minimal - full integration tests in Step 2D.
});