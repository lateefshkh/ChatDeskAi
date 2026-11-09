// src/app/(dashboard)/leads/page.tsx
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/require-auth";
import { listLeads } from "@/lib/dal/leads";
import { decryptField } from "@/lib/security/crypto";
import { SkeletonTable, SkeletonPageHeader } from "@/components/dashboard/skeleton";
import { Users, Phone, Calendar, ShieldCheck } from "lucide-react";

async function LeadsContent() {
  const ctx = await requireAuth();
  const leads = await listLeads(ctx.tenant.id, 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E3EDE7] border border-[#C5DCD0] text-[#134235] text-xs font-semibold mb-2">
            <span>Customer Contacts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Leads</h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Visitors who shared their contact information in chat conversations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDD7CD] text-xs font-semibold text-[#134235] shadow-sm self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#134235]" />
          <span>AES-256 Encrypted</span>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EFEA]">
          <h2 className="text-base font-bold text-[#18181B]">
            Captured Leads ({leads.length})
          </h2>
          <span className="text-xs text-[#71717A]">Latest 50 contacts</span>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-[#F4F3EE] flex items-center justify-center mx-auto mb-3 text-[#71717A]">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#18181B] mb-1">No leads captured yet</p>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto">
              When visitors share their name and phone number during chats, they will be encrypted and listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#F0EFEA] text-[#71717A]">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Phone / Contact</th>
                  <th className="py-3 px-4 font-semibold">Date Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {leads.map((lead) => {
                  let phoneDisplay = "-";
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
                    <tr key={lead.id} className="hover:bg-[#F9F8F5] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#18181B]">
                        {lead.name || "Anonymous Visitor"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#0D4B37] font-medium">
                        {phoneDisplay}
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A] font-mono">
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
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <SkeletonPageHeader />
          <SkeletonTable rows={5} />
        </div>
      }
    >
      <LeadsContent />
    </Suspense>
  );
}
