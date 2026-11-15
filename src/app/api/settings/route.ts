// src/app/api/settings/route.ts
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/require-auth";
import { withTenant } from "@/lib/db/with-tenant";
import {
  tenants,
  sources,
  messages,
  chunks,
  payments,
} from "@/lib/db/schema";
import { handleApiError } from "@/lib/errors";
import { PLANS } from "@/lib/plans";

export async function GET() {
  try {
    const ctx = await requireAuth();

    const data = await withTenant(ctx.tenant.id, async (tx) => {
      // Tenant
      const tenantRows = await tx
        .select()
        .from(tenants)
        .where(eq(tenants.id, ctx.tenant.id))
        .limit(1);
      const tenant = tenantRows[0];
      if (!tenant) throw new Error("Tenant not found");

      // Counts (parallel)
      const [sourcesCount, messagesCount, storageRow] = await Promise.all([
        tx
          .select({ count: sql<number>`count(*)::int` })
          .from(sources)
          .where(eq(sources.tenantId, ctx.tenant.id))
          .then((r) => r[0]?.count ?? 0),
        tx
          .select({ count: sql<number>`count(*)::int` })
          .from(messages)
          .where(eq(messages.tenantId, ctx.tenant.id))
          .then((r) => r[0]?.count ?? 0),
        tx
          .select({ bytes: sql<number>`coalesce(sum(length(text)), 0)::bigint` })
          .from(chunks)
          .where(eq(chunks.tenantId, ctx.tenant.id))
          .then((r) => Number(r[0]?.bytes ?? 0)),
      ]);

      // Payments
      const paymentsRows = await tx
        .select()
        .from(payments)
        .where(eq(payments.tenantId, ctx.tenant.id))
        .orderBy(desc(payments.createdAt))
        .limit(20);

      return {
        tenant,
        sourcesCount,
        messagesCount,
        storageBytes: storageRow,
        payments: paymentsRows,
      };
    });

    const plan = data.tenant.planId ? PLANS[data.tenant.planId] : null;

    return Response.json({
      userName: ctx.user.name ?? "",
      userEmail: ctx.user.email,
      tenantName: data.tenant.name,
      usage: {
        planId: data.tenant.planId,
        planName: plan?.name ?? "Free",
        quotaMonthlyChats: data.tenant.quotaMonthlyChats,
        quotaUsedChats: data.tenant.quotaUsedChats,
        quotaPeriodStart: data.tenant.quotaPeriodStart?.toISOString() ?? null,
        sourcesCount: data.sourcesCount,
        messagesCount: data.messagesCount,
        storageBytes: data.storageBytes,
      },
      payments: data.payments.map((p) => ({
        id: p.id,
        amountPaise: p.amountPaise,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        razorpayPaymentId: p.razorpayPaymentId,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}