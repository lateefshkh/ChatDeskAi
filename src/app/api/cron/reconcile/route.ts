// src/app/api/cron/reconcile/route.ts
import { reconcilePayments } from "@/lib/payments/reconcile";
import { handleApiError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    // Security: only allow with CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await reconcilePayments();
    return Response.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}