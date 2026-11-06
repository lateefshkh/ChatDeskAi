// src/app/(dashboard)/leads/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { listLeads } from "@/lib/dal/leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decryptField } from "@/lib/security/crypto";

async function LeadsContent() {
  const ctx = await requireAuth();
  const leads = await listLeads(ctx.tenant.id, 50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Leads</h1>
        <p className="text-sm text-neutral-500">
          Visitors who shared their contact details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8 text-sm text-neutral-400">
              No leads yet. Once visitors share their details in chat, they&apos;ll appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-200">
                    <th className="py-2 pr-4 font-medium text-neutral-500">Name</th>
                    <th className="py-2 pr-4 font-medium text-neutral-500">Contact</th>
                    <th className="py-2 pr-4 font-medium text-neutral-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    // DECRYPT phone
                    let phoneDisplay = "—";
                    if (lead.phoneEncrypted) {
                      try {
                        const encrypted = JSON.parse(lead.phoneEncrypted) as {
                          ciphertext: string;
                          iv: string;
                          tag: string;
                        };
                        phoneDisplay = decryptField(
                          encrypted.ciphertext,
                          encrypted.iv,
                          encrypted.tag
                        );
                      } catch (err) {
                        console.error("[leads] Decrypt failed:", err);
                        phoneDisplay = "[encrypted]";
                      }
                    }

                    return (
                      <tr key={lead.id} className="border-b border-neutral-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-neutral-900">
                          {lead.name || "—"}
                        </td>
                        <td className="py-3 pr-4 text-neutral-700">{phoneDisplay}</td>
                        <td className="py-3 pr-4 text-neutral-500">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-neutral-400">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}