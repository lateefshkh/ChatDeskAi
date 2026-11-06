// src/lib/payments/reconcile.ts
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { payments, tenants } from "@/lib/db/schema";
import { razorpay } from "@/lib/payments/razorpay";
import { getPlan } from "@/lib/plans";

export async function reconcilePayments() {
  console.log("[reconcile] Starting payment reconciliation...");

  // Find all payments with status 'created' (possibly pending)
  const pendingPayments = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.status, "created"),
        sql`${payments.razorpayOrderId} IS NOT NULL`
      )
    )
    .limit(50);

  let activatedCount = 0;

  for (const payment of pendingPayments) {
    try {
      // Check Razorpay for actual status
      const order = await razorpay.orders.fetchPayments(payment.razorpayOrderId!);
      
      const capturedPayment = order.items.find(
        (p: any) => p.status === "captured"
      );

      if (capturedPayment) {
        console.log(`[reconcile] Found captured payment for order ${payment.razorpayOrderId}`);
        
        // Update payment
        await db.update(payments)
          .set({ 
            status: "captured", 
            razorpayPaymentId: capturedPayment.id 
          })
          .where(eq(payments.id, payment.id));

        // Get tenant and activate
        const tenantRows = await db
          .select()
          .from(tenants)
          .where(eq(tenants.id, payment.tenantId))
          .limit(1);

        const tenant = tenantRows[0];
        if (tenant && tenant.status !== "active") {
          // Find the plan from payment notes (or by amount)
          // For simplicity, we activate with the amount-based plan
          const plan = Object.values((await import("@/lib/plans")).PLANS).find(
            (p) => p.pricePaise === payment.amountPaise
          );

          if (plan) {
            await db.update(tenants)
              .set({
                status: "active",
                planId: plan.id,
                quotaMonthlyChats: plan.chatLimit,
                updatedAt: new Date(),
              })
              .where(eq(tenants.id, tenant.id));

            console.log(`[reconcile] Activated tenant ${tenant.id} with plan ${plan.id}`);
            activatedCount++;
          }
        }
      }
    } catch (err: any) {
      console.error(`[reconcile] Failed for payment ${payment.id}:`, err.message);
    }
  }

  console.log(`[reconcile] Complete. Activated ${activatedCount} tenants.`);
  return { activated: activatedCount };
}