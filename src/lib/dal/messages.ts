// src/lib/dal/messages.ts
//
// Purpose: DAL for messages (user + assistant in a conversation).
//
// Ye kyun zaroori hai:
// - Chat history per conversation.
// - Flags for unanswered/injection_suspected (Phase 5).
// - Tenant isolation enforced.

import { eq, and, asc } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { messages, type Message } from "@/lib/db/schema";

export type MessageRole = "user" | "assistant";

export interface MessageFlags {
  unanswered?: boolean;
  injection_suspected?: boolean;
}

export interface CreateMessageInput {
  tenantId: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  flags?: MessageFlags;
}

// ─── Create ───────────────────────────────────────────────────────────────

/**
 * Create a new message in a conversation.
 */
export async function createMessage(
  input: CreateMessageInput
): Promise<Message> {
  const { tenantId, conversationId, role, content, flags } = input;

  return await withTenant(tenantId, async (tx) => {
    const inserted = await tx
      .insert(messages)
      .values({
        tenantId,
        conversationId,
        role,
        content,
        flags: flags ?? {},
      })
      .returning();
    const message = inserted[0];
    if (!message) {
      throw new Error("MESSAGE_CREATE_FAILED");
    }
    return message;
  });
}

// ─── Read ─────────────────────────────────────────────────────────────────

/**
 * List all messages in a conversation, oldest first (chronological).
 */
export async function listMessagesByConversation(
  tenantId: string,
  conversationId: string
): Promise<Message[]> {
  return await withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.tenantId, tenantId),
          eq(messages.conversationId, conversationId)
        )
      )
      .orderBy(asc(messages.createdAt));
  });
}

/**
 * Count unanswered messages for a tenant (dashboard stat).
 * "Unanswered" = assistant messages with flags.unanswered = true
 * OR user messages that have no assistant reply (future logic).
 */
export async function countUnansweredMessages(
  tenantId: string
): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const rows = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(
        and(
          eq(messages.tenantId, tenantId),
          sql`${messages.flags}->>'unanswered' = 'true'`
        )
      );
    return rows[0]?.count ?? 0;
  });
}

// Import for countUnansweredMessages
import { sql } from "drizzle-orm";