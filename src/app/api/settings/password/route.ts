// src/app/api/settings/password/route.ts
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { auth } from "@/lib/auth/better-auth";
import { handleApiError, ValidationError } from "@/lib/errors";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).max(128),
}).strict();

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { currentPassword, newPassword } = parsed.data;

    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: request.headers,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    if (error?.body?.message) {
      return Response.json({ error: error.body.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}