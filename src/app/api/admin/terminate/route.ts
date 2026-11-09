// src/app/api/admin/terminate/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db/client";
import { tenants } from "@/lib/db/schema";
import { razorpay } from "@/lib/payments/razorpay";
import { handleApiError } from "@/lib/errors";

// Razorpay ke types kabhi kabhi strict hote hain, isliye hum explicit cast use kar rahe hain
const rzp = razorpay as any;

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionId: z.string().optional(),
}).strict();

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { tenantId, subscriptionId } = parsed.data;

    // 1. Agar Razorpay Subscription ID hai to cancel karein
    if (subscriptionId) {
      try {
        await rzp.subscriptions.cancel(subscriptionId, {
          cancel_at_cycle_end: true, // Agar true hai to current cycle ke end pe cancel hoga. 
          // Agar aap chahte hain ke turant band ho jaye to false kar dein.
        });
        console.log(`[terminate] Razorpay subscription ${subscriptionId} cancelled.`);
      } catch (err: any) {
        // Agar Razorpay fail bhi ho jaye, to bhi hum DB reset karenge
        console.warn("[terminate] Subscription cancel failed:", err.message);
      }
    }

    // 2. Database mein tenant ka plan reset karein (free trial par bhej dein)
    await db.update(tenants)
      .set({
        planId: "free-trial",
        quotaMonthlyChats: 10, // Free trial limit
        quotaUsedChats: 0,
        status: "active",
      })
      .where(eq(tenants.id, tenantId));

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("[admin/terminate]", error);
    return handleApiError(error);
  }
}