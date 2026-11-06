// src/app/api/payments/checkout/route.ts
//
// Purpose: Create a Razorpay order server-side.
//
// Ye kyun zaroori hai:
// - Order amount server-side plan se aata hai, client se NAHI.
// - Razorpay order ID client ko diya jata hai (checkout ke liye).
// - Payment record DB mein 'created' status ke saath save hota hai.

import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { razorpay } from "@/lib/payments/razorpay";
import { getPlan } from "@/lib/plans";
import { handleApiError, ValidationError } from "@/lib/errors";
import { db } from "@/lib/db/client";
import { payments } from "@/lib/db/schema";
import { env } from "@/lib/env";

const bodySchema = z.object({
  planId: z.string().min(1),
}).strict();

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requireAuth();
    const body = await request.json().catch(() => null);
    
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const plan = getPlan(parsed.data.planId);
    if (!plan) throw new ValidationError("Plan not found");

    // Create Razorpay Order (server-side amount)
    const order = await razorpay.orders.create({
      amount: plan.pricePaise,
      currency: "INR",
      receipt: `rcpt_${ctx.tenant.id.slice(0, 10)}_${Date.now()}`,
      notes: {
        tenantId: ctx.tenant.id,
        planId: plan.id,
      },
    });

    // Save payment record (status: created)
    await db.insert(payments).values({
      tenantId: ctx.tenant.id,
      razorpayOrderId: order.id,
      status: "created",
      amountPaise: plan.pricePaise,
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID, // Public key for checkout UI
    });
  } catch (error) {
    return handleApiError(error);
  }
}