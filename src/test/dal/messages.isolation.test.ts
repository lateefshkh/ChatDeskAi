// src/test/dal/messages.isolation.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { createConversation } from "@/lib/dal/conversations";
import {
  createMessage,
  listMessagesByConversation,
  countUnansweredMessages,
} from "@/lib/dal/messages";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { closeAdminPool } from "@/lib/db/with-tenant";

const adminPool = new Pool({ connectionString: env.DATABASE_ADMIN_URL });
const adminDb = drizzle({ client: adminPool });

const tenantAId = randomUUID();
const tenantBId = randomUUID();
let convAId: string;
let convBId: string;

describe("Messages DAL - Tenant Isolation", () => {
  beforeAll(async () => {
    await adminDb.insert(tenants).values([
      {
        id: tenantAId,
        name: "Msg Tenant A",
        ownerUserId: "msg-owner-a",
        publicId: `msg-pub-a-${randomUUID()}`,
        status: "active",
      },
      {
        id: tenantBId,
        name: "Msg Tenant B",
        ownerUserId: "msg-owner-b",
        publicId: `msg-pub-b-${randomUUID()}`,
        status: "active",
      },
    ]);

    const convA = await createConversation({
      tenantId: tenantAId,
      visitorId: "msg-visitor-a",
    });
    convAId = convA.id;

    const convB = await createConversation({
      tenantId: tenantBId,
      visitorId: "msg-visitor-b",
    });
    convBId = convB.id;

    // Create messages for both tenants
    await createMessage({
      tenantId: tenantAId,
      conversationId: convAId,
      role: "user",
      content: "Hello A",
    });
    await createMessage({
      tenantId: tenantBId,
      conversationId: convBId,
      role: "user",
      content: "Hello B",
    });
  });

  afterAll(async () => {
    await adminDb.delete(tenants).where(eq(tenants.id, tenantAId));
    await adminDb.delete(tenants).where(eq(tenants.id, tenantBId));
    await adminPool.end();
    await closeAdminPool();
  });

  it("listMessagesByConversation: A sees only its own conversation messages", async () => {
    const msgs = await listMessagesByConversation(tenantAId, convAId);
    expect(msgs.length).toBe(1);
    expect(msgs[0]?.content).toBe("Hello A");
  });

  it("listMessagesByConversation: A cannot see B's conversation messages", async () => {
    const msgs = await listMessagesByConversation(tenantAId, convBId);
    expect(msgs.length).toBe(0);
  });

  it("createMessage: A cannot inject into B's conversation", async () => {
    // Attempt: A tries to insert into B's conversation
    // RLS policy (with EXISTS check) should block this
    await expect(
      createMessage({
        tenantId: tenantAId,
        conversationId: convBId,
        role: "user",
        content: "HACKED",
      })
    ).rejects.toThrow();
  });

  it("countUnansweredMessages: A counts only its own", async () => {
    // Create an "unanswered" flagged message for A
    await createMessage({
      tenantId: tenantAId,
      conversationId: convAId,
      role: "assistant",
      content: "I don't know",
      flags: { unanswered: true },
    });

    const count = await countUnansweredMessages(tenantAId);
    expect(count).toBe(1);
  });
});