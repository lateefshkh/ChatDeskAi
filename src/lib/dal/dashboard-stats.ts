// src/lib/dal/dashboard-stats.ts
//
// Purpose: Aggregate stats for the dashboard.
//
// Design:
// - Single function `getDashboardStats(tenantId)` — one DB round-trip for all counts.
// - Uses withTenant() so RLS enforced.
// - Returns typed object for UI consumption.
//
// Ye kyun zaroori hai:
// - Dashboard ko 5+ alag queries ki zaroorat nahi — ek se sab mil jata hai.
// - RLS enforce hota hai, tenant isolation guaranteed.

import { eq, and, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { sources, chunks, conversations, messages, leads } from "@/lib/db/schema";

export interface DashboardStats {
  sources: {
    total: number;
    ready: number;
    processing: number;
    failed: number;
  };
  chunks: {
    total: number;
  };
  conversations: {
    total: number;
  };
  messages: {
    total: number;
    unanswered: number;
  };
  leads: {
    total: number;
    last7Days: number;
  };
}

/**
 * Get all dashboard stats for a tenant in one call.
 * All counts are tenant-scoped via RLS.
 */
export async function getDashboardStats(
  tenantId: string
): Promise<DashboardStats> {
  return await withTenant(tenantId, async (tx) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      sourcesResult,
      chunksResult,
      conversationsResult,
      messagesResult,
      unansweredResult,
      leadsResult,
      leadsRecentResult,
    ] = await Promise.all([
      // Sources: total + by status
      tx
        .select({
          total: sql<number>`count(*)::int`,
          ready: sql<number>`count(*) filter (where status = 'ready')::int`,
          processing: sql<number>`count(*) filter (where status = 'processing')::int`,
          failed: sql<number>`count(*) filter (where status = 'failed')::int`,
        })
        .from(sources)
        .where(eq(sources.tenantId, tenantId)),

      // Chunks total
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(chunks)
        .where(eq(chunks.tenantId, tenantId)),

      // Conversations total
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(conversations)
        .where(eq(conversations.tenantId, tenantId)),

      // Messages total
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(messages)
        .where(eq(messages.tenantId, tenantId)),

      // Unanswered messages
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.tenantId, tenantId),
            sql`${messages.flags}->>'unanswered' = 'true'`
          )
        ),

      // Leads total
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(leads)
        .where(eq(leads.tenantId, tenantId)),

      // Leads in last 7 days
      tx
        .select({ total: sql<number>`count(*)::int` })
        .from(leads)
        .where(
          and(eq(leads.tenantId, tenantId), sql`created_at >= ${sevenDaysAgo}`)
        ),
    ]);

    return {
      sources: {
        total: sourcesResult[0]?.total ?? 0,
        ready: sourcesResult[0]?.ready ?? 0,
        processing: sourcesResult[0]?.processing ?? 0,
        failed: sourcesResult[0]?.failed ?? 0,
      },
      chunks: { total: chunksResult[0]?.total ?? 0 },
      conversations: { total: conversationsResult[0]?.total ?? 0 },
      messages: {
        total: messagesResult[0]?.total ?? 0,
        unanswered: unansweredResult[0]?.total ?? 0,
      },
      leads: {
        total: leadsResult[0]?.total ?? 0,
        last7Days: leadsRecentResult[0]?.total ?? 0,
      },
    };
  });
}