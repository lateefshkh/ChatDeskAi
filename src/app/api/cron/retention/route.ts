// src/app/api/cron/retention/route.ts
import { cleanupOldMessages } from "@/lib/jobs/retention";
import { handleApiError } from "@/lib/errors";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  try {
    // Security Check: Ensure the request is coming from a trusted cron job
    // Aapko .env mein CRON_SECRET add karna hoga
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cleanupOldMessages(90);

    return Response.json({
      success: true,
      deleted: result.deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}