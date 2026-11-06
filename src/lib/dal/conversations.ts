// src/lib/dal/conversations.ts
//
// Purpose: DAL for conversations (visitor chat sessions).
//
// Ye kyun zaroori hai:
// - Visitor chat sessions track karne ke liye (Phase 5).
// - Har conversation ek tenant se linked hoti hai.
// - Cross-tenant access RLS + withTenant se blocked.

import { eq, and, desc, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { conversations, type Conversation } from "@/lib/db/schema";

// ─── Create ───────────────────────────────────────────────────────────────

export interface CreateConversationInput {
  tenantId: string;
  visitorId: string;
}

/**
 * Create a new conversation for a visitor.
 * Message count starts at 0.
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<Conversation> {
  const { tenantId, visitorId } = input;

  return await withTenant(tenantId, async (tx) => {
    const inserted = await tx
      .insert(conversations)
      .values({ tenantId, visitorId, messageCount: 0 })
      .returning();
    const conversation = inserted[0];
    if (!conversation) {
      throw new Error("CONVERSATION_CREATE_FAILED");
    }
    return conversation;
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────

/**
 * List recent conversations for a tenant.
 * Limited to `limit` (default 20), newest first.
 */
export async function listConversations(
  tenantId: string,
  limit = 20
): Promise<Conversation[]> {
  return await withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(conversations)
      .where(eq(conversations.tenantId, tenantId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);
  });
}

/**
 * Get a single conversation by id — tenant-scoped.
 */
export async function getConversationById(
  tenantId: string,
  conversationId: string
): Promise<Conversation | null> {
  return await withTenant(tenantId, async (tx) => {
    const rows = await tx
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.tenantId, tenantId)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  });
}

/**
 * Count conversations for a tenant (dashboard stats).
 */
export async function countConversations(tenantId: string): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const result = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.tenantId, tenantId));
    return result[0]?.count ?? 0;
  });
}

// ─── Update ───────────────────────────────────────────────────────────────

/**
 * Increment message count for a conversation.
 * Called when a new message (user or assistant) is added.
 */
export async function incrementMessageCount(
  tenantId: string,
  conversationId: string
): Promise<Conversation | null> {
  return await withTenant(tenantId, async (tx) => {
    const updated = await tx
      .update(conversations)
      .set({
        messageCount: sql`${conversations.messageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.tenantId, tenantId)
        )
      )
      .returning();
    return updated[0] ?? null;
  });
}