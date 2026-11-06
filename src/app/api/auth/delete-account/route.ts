// src/app/api/auth/delete-account/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, sessions, accounts, verifications } from "@/lib/db/auth-schema";
import { tenants } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/require-auth";
import { handleApiError, ValidationError, AppError } from "@/lib/errors";
import { auth } from "@/lib/auth/better-auth";

const bodySchema = z.object({
  password: z.string().min(1, "Password is required"),
}).strict();

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Auth check
    const ctx = await requireSession();

    // 2. Parse + validate body
    const body = await request.json().catch(() => null);
    if (!body) {
      throw new ValidationError("Invalid JSON body");
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Password is required");
    }

    const { password } = parsed.data;
    const actualEmail = ctx.user.email.toLowerCase();

    // 3. VERIFY PASSWORD via Better Auth
    // Yahan hum Better Auth ke sign-in API ko call karke password verify karte hain.
    // Agar password galat hoga, to yeh error throw karega.
    try {
      await auth.api.signInEmail({
        body: {
          email: actualEmail,
          password: password,
        },
      });
    } catch {
      // Password mismatch ya koi aur auth error
      throw new AppError(
        "INVALID_PASSWORD",
        401,
        "Incorrect password. Account not deleted."
      );
    }

    // 4. Delete everything — order matters (FK constraints)
    const userId = ctx.user.id;
    const tenantId = ctx.tenant?.id;

    // 4a. Tenant data (cascade will handle sources/chunks/etc.)
    if (tenantId) {
      await db.delete(tenants).where(eq(tenants.id, tenantId));
    }

    // 4b. Auth data
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(verifications).where(eq(verifications.identifier, actualEmail));
    await db.delete(users).where(eq(users.id, userId));

    // 5. Clear session cookie
    const response = Response.json(
      { message: "Account deleted successfully." },
      { status: 200 }
    );
    response.headers.set(
      "Set-Cookie",
      "chatdesk.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
    );
    return response;

  } catch (error) {
    return handleApiError(error);
  }
}