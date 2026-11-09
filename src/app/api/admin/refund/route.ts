// src/app/api/admin/refund/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db/client";
import { payments } from "@/lib/db/schema";
import { razorpay } from "@/lib/payments/razorpay";
import { handleApiError } from "@/lib/errors";

const bodySchema = z.object({
  paymentId: z.string().min(1),
  amountPaise: z.number().int().positive().optional(),
}).strict();

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { paymentId, amountPaise } = parsed.data;

    // Razorpay Refund API call
    const refundOptions: any = {};
    if (amountPaise) refundOptions.amount = amountPaise;

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    // Database mein status update karein
    await db.update(payments)
      .set({ status: "refunded" })
      .where(eq(payments.razorpayPaymentId, paymentId));

    return Response.json({ success: true, refundId: refund.id });
  } catch (error: any) {
    console.error("[admin/refund]", error);
    return handleApiError(error);
  }
}