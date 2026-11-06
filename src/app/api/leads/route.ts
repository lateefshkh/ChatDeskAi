// src/app/api/leads/route.ts
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tenants, leads } from "@/lib/db/schema";
import { users } from "@/lib/db/auth-schema";
import { handleApiError, ValidationError } from "@/lib/errors";
import { notifyOwnerOfLead } from "@/lib/notifications/provider";
import { encryptField } from "@/lib/security/crypto";

const bodySchema = z.object({
  publicId: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(20),
  consent: z.boolean(),
}).strict();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid input");

    const { publicId, conversationId, name, phone, consent } = parsed.data;

    // 1. Find tenant
    const tenantRows = await db
      .select()
      .from(tenants)
      .where(eq(tenants.publicId, publicId))
      .limit(1);
    
    const tenant = tenantRows[0];
    if (!tenant) throw new ValidationError("Workspace not found");

    // 2. ENCRYPT PHONE
    const encrypted = encryptField(phone);

    // 3. Save lead with encrypted phone
    const inserted = await db.insert(leads).values({
      tenantId: tenant.id,
      conversationId: conversationId || null,
      name,
      // Store as JSON string: {"ciphertext": "...", "iv": "...", "tag": "..."}
      phoneEncrypted: JSON.stringify(encrypted),
      consentGiven: consent ? 1 : 0,
    }).returning();

    const lead = inserted[0];

    // 4. Notify owner (with plaintext phone for the notification)
    const ownerRows = await db
      .select()
      .from(users)
      .where(eq(users.id, tenant.ownerUserId))
      .limit(1);

    const ownerEmail = ownerRows[0]?.email;

    if (ownerEmail) {
      notifyOwnerOfLead({
        tenantName: tenant.name,
        leadName: name,
        leadPhone: phone, // plaintext for notification
        ownerEmail,
      }).catch((err) => console.error("[lead] Notification failed:", err));
    }

    return Response.json({ success: true, leadId: lead.id });
  } catch (error) {
    return handleApiError(error);
  }
}