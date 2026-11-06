// src/lib/jobs/retention.ts
//
// Purpose: Delete messages older than 90 days (DPDP compliance).
//
// Ye kyun zaroori hai:
// - India DPDP Act ke mutabiq data ko zaroorat se zyada nahi rakhna chahiye.
// - 90 days default retention period hai.

import { db } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function cleanupOldMessages(retentionDays = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`[retention] Deleting messages older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);

    // Admin connection use kar rahe hain taake saare tenants ka data ek saath delete ho sake
    const deleted = await db
      .delete(messages)
      .where(sql`${messages.createdAt} < ${cutoffDate}`)
      .returning({ id: messages.id });

    console.log(`[retention] Deleted ${deleted.length} old messages.`);
    return { deleted: deleted.length };
  } catch (error: any) {
    console.error("[retention] Failed to clean up messages:", error.message);
    throw error;
  }
}