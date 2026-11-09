// src/app/api/admin/stats/route.ts
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { messages, chunks, payments, tenants } from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const [userCount, messageCount, chunkCount, revenue] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(messages),
      db.select({ count: sql<number>`count(*)::int` }).from(chunks),
      db.select({ sum: sql<number>`sum(amount_paise)::int` }).from(payments),
    ]);

    const allUsers = await db.select().from(users).limit(20);

    const usersWithDetails = await Promise.all(
      allUsers.map(async (u) => {
        const tenant = await db.select().from(tenants).where(eq(tenants.ownerUserId, u.id)).limit(1);
        const latestPayment = await db.select()
          .from(payments)
          .where(eq(payments.tenantId, tenant[0]?.id || ""))
          .orderBy(desc(payments.createdAt))
          .limit(1);

        return {
          ...u,
          tenantId: tenant[0]?.id,
          subscriptionId: latestPayment[0]?.razorpaySubscriptionId,
          lastPaymentId: latestPayment[0]?.razorpayPaymentId,
        };
      })
    );

    return Response.json({
      stats: {
        userCount: userCount[0]?.count || 0,
        messageCount: messageCount[0]?.count || 0,
        chunkCount: chunkCount[0]?.count || 0,
        revenue: revenue[0]?.sum || 0,
      },
      users: usersWithDetails,
    });
  } catch (error) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
}