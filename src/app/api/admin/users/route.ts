// src/app/api/admin/users/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";

const bodySchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["owner", "platform_admin"]),
}).strict();

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    await db.update(users)
      .set({ role: parsed.data.role })
      .where(eq(users.id, parsed.data.userId));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
}