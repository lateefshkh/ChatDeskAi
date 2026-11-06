// src/lib/notifications/provider.ts
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);
const FROM_EMAIL = "ChatDesk <onboarding@resend.dev>";

export interface LeadNotification {
  tenantName: string;
  leadName: string;
  leadPhone: string;
  ownerEmail: string;
}

export async function notifyOwnerOfLead(data: LeadNotification): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      subject: `New lead for ${data.tenantName}: ${data.leadName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Lead from ${data.tenantName}</h2>
          <p>A visitor just shared their contact details:</p>
          <ul>
            <li><strong>Name:</strong> ${data.leadName}</li>
            <li><strong>Phone:</strong> ${data.leadPhone}</li>
          </ul>
          <p>You can reach out to them directly via WhatsApp or phone.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">This email was sent by ChatDesk.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error("[notification] Email send failed:", result.error.message);
      return false;
    }

    console.log("[notification] Email sent to:", data.ownerEmail);
    return true;
  } catch (error: any) {
    console.error("[notification] Error:", error.message);
    return false;
  }
}