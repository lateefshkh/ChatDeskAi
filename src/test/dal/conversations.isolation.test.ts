// src/test/dal/conversations.isolation.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import {
  createConversation,
  listConversations,
  getConversationById,
  countConversations,
  incrementMessageCount,
} from "@/lib/dal/conversations";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { closeAdminPool } from "@/lib/db/with-tenant";

const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

const tenantAId = randomUUID();
const tenantBId = randomUUID();
let convAId: string;
let convBId: string;

describe("Conversations DAL — Tenant Isolation", () => {
  beforeAll(async () => {
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "Conv Tenant A",
        ownerUserId: "conv-owner-a",
        publicId: `conv-pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "Conv Tenant B",
        ownerUserId: "conv-owner-b",
        publicId: `conv-pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    const convA = await createConversation({
      tenantId: tenantAId,
      visitorId: "visitor-a",
    });
    convAId = convA.id;

    const convB = await createConversation({
      tenantId: tenantBId,
      visitorId: "visitor-b",
    });
    convBId = convB.id;
  });

  afterAll(async () => {
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  it("listConversations: Tenant A sees only its own", async () => {
    const rows = await listConversations(tenantAId);
    expect(rows.length).toBe(1);
    expect(rows[0]?.id).toBe(convAId);
    expect(rows.map((r) => r.id)).not.toContain(convBId);
  });

  it("getConversationById: A cannot read B's conversation", async () => {
    const conv = await getConversationById(tenantAId, convBId);
    expect(conv).toBeNull();
  });

  it("getConversationById: A can read its own conversation", async () => {
    const conv = await getConversationById(tenantAId, convAId);
    expect(conv).not.toBeNull();
    expect(conv?.id).toBe(convAId);
  });

  it("countConversations: A counts only its own", async () => {
    const count = await countConversations(tenantAId);
    expect(count).toBe(1);
  });

  it("incrementMessageCount: A cannot increment B's conversation", async () => {
    const result = await incrementMessageCount(tenantAId, convBId);
    expect(result).toBeNull();
  });

  it("incrementMessageCount: A can increment its own conversation", async () => {
    const result = await incrementMessageCount(tenantAId, convAId);
    expect(result).not.toBeNull();
    expect(result?.messageCount).toBe(1);
  });
});