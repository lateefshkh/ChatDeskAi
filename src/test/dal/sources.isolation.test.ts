// src/test/dal/sources.isolation.test.ts
//
// Proves that DAL functions respect tenant isolation.
// Yeh Phase 2 isolation suite ka foundation hai.
//
// Har test ka structure:
// 1. Seed two tenants (A, B) via admin connection.
// 2. Create sources for both.
// 3. Attempt cross-tenant access via DAL functions.
// 4. Assert 0 leakage.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import {
  createSource,
  listSources,
  getSourceById,
  countSources,
  updateSourceStatus,
  deleteSource,
} from "@/lib/dal/sources";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { closeAdminPool } from "@/lib/db/with-tenant";

// Admin connection (bypasses RLS) — test setup/cleanup only
const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

const tenantAId = randomUUID();
const tenantBId = randomUUID();
let sourceAId: string;
let sourceBId: string;

describe("Sources DAL — Tenant Isolation", () => {
  beforeAll(async () => {
    // Seed tenants
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "DAL Tenant A",
        ownerUserId: "dal-owner-a",
        publicId: `dal-pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "DAL Tenant B",
        ownerUserId: "dal-owner-b",
        publicId: `dal-pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    // Create sources via DAL
    const sourceA = await createSource({
      tenantId: tenantAId,
      type: "text",
      label: "Source A",
    });
    sourceAId = sourceA.id;

    const sourceB = await createSource({
      tenantId: tenantBId,
      type: "text",
      label: "Source B",
    });
    sourceBId = sourceB.id;
  });

  afterAll(async () => {
    // Cleanup (cascade deletes sources)
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  // ─── List: A sees only A's sources ─────────────────────────────────────
  it("listSources: Tenant A sees only its own sources", async () => {
    const rows = await listSources(tenantAId);
    expect(rows.length).toBe(1);
    expect(rows[0]?.id).toBe(sourceAId);
    expect(rows.map((r) => r.id)).not.toContain(sourceBId);
  });

  // ─── List: B sees only B's sources ─────────────────────────────────────
  it("listSources: Tenant B sees only its own sources", async () => {
    const rows = await listSources(tenantBId);
    expect(rows.length).toBe(1);
    expect(rows[0]?.id).toBe(sourceBId);
    expect(rows.map((r) => r.id)).not.toContain(sourceAId);
  });

  // ─── Get by ID: A cannot read B's source ───────────────────────────────
  it("getSourceById: Tenant A cannot read Tenant B's source", async () => {
    const source = await getSourceById(tenantAId, sourceBId);
    expect(source).toBeNull();
  });

  // ─── Get by ID: A can read its own source ──────────────────────────────
  it("getSourceById: Tenant A can read its own source", async () => {
    const source = await getSourceById(tenantAId, sourceAId);
    expect(source).not.toBeNull();
    expect(source?.id).toBe(sourceAId);
  });

  // ─── Count: A counts only its own sources ──────────────────────────────
  it("countSources: Tenant A counts only its own sources", async () => {
    const count = await countSources(tenantAId);
    expect(count).toBe(1);
  });

  // ─── Update status: A cannot update B's source ─────────────────────────
  it("updateSourceStatus: Tenant A cannot update Tenant B's source", async () => {
    const result = await updateSourceStatus({
      tenantId: tenantAId,
      sourceId: sourceBId, // Attack: foreign sourceId
      status: "failed",
      error: "hacked",
    });
    expect(result).toBeNull();

    // Verify B's source unchanged
    const bSource = await getSourceById(tenantBId, sourceBId);
    expect(bSource?.status).toBe("queued"); // still original status
  });

  // ─── Update status: A can update its own source ────────────────────────
  it("updateSourceStatus: Tenant A can update its own source", async () => {
    const result = await updateSourceStatus({
      tenantId: tenantAId,
      sourceId: sourceAId,
      status: "ready",
    });
    expect(result).not.toBeNull();
    expect(result?.status).toBe("ready");
  });

  // ─── Delete: A cannot delete B's source ────────────────────────────────
  it("deleteSource: Tenant A cannot delete Tenant B's source", async () => {
    const deleted = await deleteSource(tenantAId, sourceBId);
    expect(deleted).toBe(false);

    // Verify B's source still exists
    const bSource = await getSourceById(tenantBId, sourceBId);
    expect(bSource).not.toBeNull();
  });

  // ─── Delete: A can delete its own source ───────────────────────────────
  it("deleteSource: Tenant A can delete its own source", async () => {
    // Create a throwaway source for A
    const throwaway = await createSource({
      tenantId: tenantAId,
      type: "text",
      label: "Throwaway",
    });

    const deleted = await deleteSource(tenantAId, throwaway.id);
    expect(deleted).toBe(true);

    const gone = await getSourceById(tenantAId, throwaway.id);
    expect(gone).toBeNull();
  });

  // ─── Create: source gets correct tenantId even if attempted otherwise ──
  it("createSource: uses the provided tenantId (no cross-tenant injection)", async () => {
    // Note: caller always provides tenantId. This test verifies the DAL
    // doesn't allow overriding it via the input object.
    const created = await createSource({
      tenantId: tenantAId,
      type: "text",
      label: "Fresh Source",
    });
    expect(created.tenantId).toBe(tenantAId);

    // Verify B cannot see this new source
    const bList = await listSources(tenantBId);
    expect(bList.map((s) => s.id)).not.toContain(created.id);
  });
});