// src/lib/dal/leads.ts
import { eq, desc } from "drizzle-orm";
import { withTenant } from "@/lib/db/with-tenant";
import { leads, type Lead } from "@/lib/db/schema";

/**
 * List leads for a tenant, newest first.
 */
export async function listLeads(
  tenantId: string,
  limit = 50
): Promise<Lead[]> {
  return await withTenant(tenantId, async (tx) => {
    return await tx
      .select()
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt))
      .limit(limit);
  });
}

/**
 * Count leads for a tenant.
 */
export async function countLeads(tenantId: string): Promise<number> {
  return await withTenant(tenantId, async (tx) => {
    const result = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(eq(leads.tenantId, tenantId));
    return result[0]?.count ?? 0;
  });
}

// sql import add karein
import { sql } from "drizzle-orm";