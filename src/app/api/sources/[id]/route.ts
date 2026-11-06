// src/app/api/sources/[id]/route.ts
import { requireAuth } from "@/lib/auth/require-auth";
import { deleteSource } from "@/lib/dal/sources";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuth();
    const { id } = await params;

    const deleted = await deleteSource(ctx.tenant.id, id);
    if (!deleted) throw new NotFoundError("Source not found");

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}