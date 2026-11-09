// src/app/api/payments/webhook/route.ts
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq, sql } from "drizzle-orm"; // <-- sql import kiya
import { db } from "@/lib/db/client";
import { payments, tenants, webhookEvents } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getPlan } from "@/lib/plans";

export async function POST(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "No signature" }, { status: 400 });
    }

    // Signature verify
    const expectedSignature = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error("[webhook] Invalid signature");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.event_id || `evt_${Date.now()}`;

    // Idempotency check
    const existing = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ status: "already_processed" });
    }

    // Record event
    await db.insert(webhookEvents).values({
      eventId,
      type: event.event,
      processed: 0,
    });

    // Handle payment.captured
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const tenantId = paymentEntity.notes?.tenantId;
      const planId = paymentEntity.notes?.planId;

      if (tenantId && planId) {
        const plan = getPlan(planId);
        
        if (!plan) {
          console.error("[webhook] Plan not found:", planId);
        } else {
          // ✅ ADDITIVE QUOTA: Purane chats ke upar naye chats add karein
          await db.update(tenants)
            .set({
              status: "active",
              planId: planId,
              quotaMonthlyChats: sql`${tenants.quotaMonthlyChats} + ${plan.chatLimit}`,
              updatedAt: new Date(),
            })
            .where(eq(tenants.id, tenantId));

          // Update payment status
          await db.update(payments)
            .set({ status: "captured", razorpayPaymentId: paymentEntity.id })
            .where(eq(payments.razorpayOrderId, orderId));

          console.log(`[webhook] Tenant ${tenantId} activated. Added ${plan.chatLimit} chats.`);
        }
      }
    }

    // Mark processed
    await db.update(webhookEvents)
      .set({ processed: 1, processedAt: new Date() })
      .where(eq(webhookEvents.eventId, eventId));

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("[webhook] Error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}