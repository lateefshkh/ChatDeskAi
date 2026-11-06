// src/test/rls-isolation.test.ts
//
// Proves that RLS prevents cross-tenant access at the DB level.
// Yeh test Phase 2 isolation suite ka foundation hai.
//
// Design:
// - Seed two tenants (A, B) via admin connection (RLS bypass).
// - Query via withTenant(A) → only A's rows visible.
// - Query via withTenant(B) → only B's rows visible.
// - Attempt to read B's row with A's tenantId → DB returns 0 rows (RLS blocks).
// - Cleanup in afterAll.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { withTenant, closeAdminPool } from "../lib/db/with-tenant";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { tenants, sources } from "@/lib/db/schema";
import { env } from "@/lib/env";

// Admin connection (bypasses RLS) - used ONLY for test setup/cleanup
const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

// Test data
const tenantAId = randomUUID();
const tenantBId = randomUUID();
const sourceAId = randomUUID();
const sourceBId = randomUUID();

describe("RLS Tenant Isolation", () => {
  beforeAll(async () => {
    // Seed two tenants + one source each (admin connection bypasses RLS)
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "Tenant A",
        ownerUserId: "test-owner-a",
        publicId: `pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "Tenant B",
        ownerUserId: "test-owner-b",
        publicId: `pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    await adminDb.insert(sources).values([
      {
        id: sourceAId,
        tenantId: tenantAId,
        type: "text",
        label: "Source A",
        status: "ready",
      },
      {
        id: sourceBId,
        tenantId: tenantBId,
        type: "text",
        label: "Source B",
        status: "ready",
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup (cascade deletes sources)
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  // ─── Test 1: Tenant A sees only A's tenants row ─────────────────────────
  it("Tenant A can only see its own tenant row", async () => {
    const rows = await withTenant(tenantAId, async (tx) => {
      return await tx.select().from(tenants);
    });

    const ids = rows.map((r) => r.id);
    expect(ids).toContain(tenantAId);
    expect(ids).not.toContain(tenantBId);
    expect(rows.length).toBe(1);
  });

  // ─── Test 2: Tenant B sees only B's tenants row ─────────────────────────
  it("Tenant B can only see its own tenant row", async () => {
    const rows = await withTenant(tenantBId, async (tx) => {
      return await tx.select().from(tenants);
    });

    const ids = rows.map((r) => r.id);
    expect(ids).toContain(tenantBId);
    expect(ids).not.toContain(tenantAId);
    expect(rows.length).toBe(1);
  });

  // ─── Test 3: Tenant A cannot read B's sources (RLS blocks) ──────────────
  it("Tenant A cannot read Tenant B's sources via withTenant", async () => {
    const rows = await withTenant(tenantAId, async (tx) => {
      return await tx.select().from(sources);
    });

    const ids = rows.map((r) => r.id);
    expect(ids).toContain(sourceAId);
    expect(ids).not.toContain(sourceBId);
    expect(rows.length).toBe(1);
  });

  // ─── Test 4: Tenant A cannot INSERT with B's tenantId (WITH CHECK) ──────
  it("Tenant A cannot insert a source with Tenant B's tenantId", async () => {
    await expect(
      withTenant(tenantAId, async (tx) => {
        return await tx.insert(sources).values({
          tenantId: tenantBId, // Attack: foreign tenantId
          type: "text",
          label: "Injected",
          status: "ready",
        });
      })
    ).rejects.toThrow();

    // Verify B's source count unchanged (only B's original source)
    const bSources = await withTenant(tenantBId, async (tx) => {
      return await tx.select().from(sources);
    });
    expect(bSources.length).toBe(1);
    expect(bSources[0]?.id).toBe(sourceBId);
  });

  // ─── Test 5: Tenant A cannot UPDATE B's source ─────────────────────────
  it("Tenant A cannot update Tenant B's source", async () => {
    // Attempt update - RLS makes B's row invisible, so UPDATE affects 0 rows
    const result = await withTenant(tenantAId, async (tx) => {
      return await tx
        .update(sources)
        .set({ label: "HACKED" })
        .where(eq(sources.id, sourceBId))
        .returning();
    });

    expect(result.length).toBe(0); // RLS hid the row, so 0 rows updated

    // Verify B's source unchanged
    const bSource = await withTenant(tenantBId, async (tx) => {
      const rows = await tx.select().from(sources).where(eq(sources.id, sourceBId));
      return rows[0];
    });
    expect(bSource?.label).toBe("Source B");
  });

  // ─── Test 6: Tenant A cannot DELETE B's source ─────────────────────────
  it("Tenant A cannot delete Tenant B's source", async () => {
    const result = await withTenant(tenantAId, async (tx) => {
      return await tx
        .delete(sources)
        .where(eq(sources.id, sourceBId))
        .returning();
    });

    expect(result.length).toBe(0); // RLS hid the row

    // Verify B's source still exists
    const bSources = await withTenant(tenantBId, async (tx) => {
      return await tx.select().from(sources).where(eq(sources.id, sourceBId));
    });
    expect(bSources.length).toBe(1);
  });
});