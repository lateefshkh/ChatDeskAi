// src/app/api/payments/webhook/route.ts
//
// Purpose: Razorpay webhook handler for payment events.
//
// Ye kyun zaroori hai:
// - Tenant ko activate karna sirf verified webhook se hota hai (redirect se nahi).
// - Webhook signature timing-safe compare se verify hota hai.
// - Idempotency: same event do baar process nahi hota.

import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { payments, tenants, webhookEvents } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getPlan } from "@/lib/plans";

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. RAW body read karein (Next.js request.text())
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "No signature" }, { status: 400 });
    }

    // 2. Signature verify karein (HMAC-SHA256, timing-safe)
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

    // 3. Idempotency: same event_id pehle process hua?
    const existing = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ status: "already_processed" });
    }

    // 4. Record event
    await db.insert(webhookEvents).values({
      eventId,
      type: event.event,
      processed: 0,
    });

    // 5. Handle payment.captured
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const tenantId = paymentEntity.notes?.tenantId;
      const planId = paymentEntity.notes?.planId;

      if (tenantId && planId) {
        // Update tenant to active and set quota
        const plan = getPlan(planId);
        await db.update(tenants)
          .set({
            status: "active",
            planId: planId,
            quotaMonthlyChats: plan?.chatLimit || 0,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenantId));

        // Update payment status
        await db.update(payments)
          .set({ status: "captured", razorpayPaymentId: paymentEntity.id })
          .where(eq(payments.razorpayOrderId, orderId));
      }
    }

    // 6. Mark processed
    await db.update(webhookEvents)
      .set({ processed: 1, processedAt: new Date() })
      .where(eq(webhookEvents.eventId, eventId));

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("[webhook] Error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}