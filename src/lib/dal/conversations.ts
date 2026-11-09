// src/lib/dal/conversations.ts
//
// Purpose: DAL for conversations (visitor chat sessions).
//
// Ye kyun zaroori hai:
// - Visitor chat sessions track karne ke liye.
// - Har conversation ek tenant se linked hoti hai.
// - Cross-tenant access RLS + withTenant se blocked.

import { eq, and, desc, asc, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { conversations, messages, type Conversation } from "@/lib/db/schema";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ConversationWithPreview {
  id: string;
  visitorId: string;
  messageCount: number;
  createdAt: Date;
  preview: string;
}

export interface CreateConversationInput {
  tenantId: string;
  visitorId: string;
}

// ─── Create ───────────────────────────────────────────────────────────────

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
 * List conversations with a preview of the first user message.
 * This makes the chat list readable (headline instead of random IDs).
 */
export async function listConversationsWithPreview(
  tenantId: string,
  limit = 50
): Promise<ConversationWithPreview[]> {
  return await withTenant(tenantId, async (tx) => {
    const convs = await tx
      .select()
      .from(conversations)
      .where(eq(conversations.tenantId, tenantId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);

    if (convs.length === 0) return [];

    const withPreviews = await Promise.all(
      convs.map(async (conv) => {
        const firstMsg = await tx
          .select({ content: messages.content })
          .from(messages)
          .where(
            and(
              eq(messages.tenantId, tenantId),
              eq(messages.conversationId, conv.id),
              eq(messages.role, "user")
            )
          )
          .orderBy(asc(messages.createdAt))
          .limit(1);

        const rawPreview = firstMsg[0]?.content || "New conversation";
        const preview =
          rawPreview.length > 60 ? rawPreview.slice(0, 60) + "..." : rawPreview;

        return {
          id: conv.id,
          visitorId: conv.visitorId,
          messageCount: conv.messageCount,
          createdAt: conv.createdAt,
          preview,
        };
      })
    );

    return withPreviews;
  });
}

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