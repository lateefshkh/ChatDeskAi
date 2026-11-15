// src/app/api/settings/account/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/require-auth";
import { withTenant } from "@/lib/db/with-tenant";
import { tenants } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { handleApiError, ValidationError } from "@/lib/errors";

const bodySchema = z.object({
  userName: z.string().min(1).max(100),
  tenantName: z.string().min(1).max(100),
}).strict();

export async function PATCH(request: Request) {
  try {
    const ctx = await requireAuth();
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { userName, tenantName } = parsed.data;

    // Update user name (auth table — admin connection)
    await db
      .update(users)
      .set({ name: userName, updatedAt: new Date() })
      .where(eq(users.id, ctx.user.id));

    // Update tenant name (RLS enforced)
    await withTenant(ctx.tenant.id, async (tx) => {
      await tx
        .update(tenants)
        .set({ name: tenantName, updatedAt: new Date() })
        .where(eq(tenants.id, ctx.tenant.id));
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}