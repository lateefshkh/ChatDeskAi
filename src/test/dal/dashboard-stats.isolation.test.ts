// src/test/dal/dashboard-stats.isolation.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { getDashboardStats } from "@/lib/dal/dashboard-stats";
import { createSource } from "@/lib/dal/sources";
import { createConversation } from "@/lib/dal/conversations";
import { createMessage } from "@/lib/dal/messages";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { closeAdminPool } from "@/lib/db/with-tenant";

const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

const tenantAId = randomUUID();
const tenantBId = randomUUID();

describe("Dashboard Stats - Tenant Isolation", () => {
  beforeAll(async () => {
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "Stats Tenant A",
        ownerUserId: "stats-owner-a",
        publicId: `stats-pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "Stats Tenant B",
        ownerUserId: "stats-owner-b",
        publicId: `stats-pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    // Tenant A: 2 sources, 1 conversation, 2 messages
    await createSource({ tenantId: tenantAId, type: "text", label: "A1" });
    await createSource({ tenantId: tenantAId, type: "text", label: "A2" });
    const convA = await createConversation({
      tenantId: tenantAId,
      visitorId: "visitor-a",
    });
    await createMessage({
      tenantId: tenantAId,
      conversationId: convA.id,
      role: "user",
      content: "Hello",
    });
    await createMessage({
      tenantId: tenantAId,
      conversationId: convA.id,
      role: "assistant",
      content: "Hi",
      flags: { unanswered: false },
    });

    // Tenant B: 1 source, 1 conversation
    await createSource({ tenantId: tenantBId, type: "text", label: "B1" });
    await createConversation({ tenantId: tenantBId, visitorId: "visitor-b" });
  });

  afterAll(async () => {
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  it("stats are isolated per tenant", async () => {
    const statsA = await getDashboardStats(tenantAId);
    const statsB = await getDashboardStats(tenantBId);

    // Tenant A
    expect(statsA.sources.total).toBe(2);
    expect(statsA.conversations.total).toBe(1);
    expect(statsA.messages.total).toBe(2);
    expect(statsA.messages.unanswered).toBe(0);

    // Tenant B
    expect(statsB.sources.total).toBe(1);
    expect(statsB.conversations.total).toBe(1);
    expect(statsB.messages.total).toBe(0);

    // Cross-check: A's totals don't include B's data
    expect(statsA.sources.total).not.toBe(statsB.sources.total + 2);
  });
});