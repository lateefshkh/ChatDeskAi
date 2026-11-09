// src/app/(dashboard)/chats/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { listConversationsWithPreview } from "@/lib/dal/conversations";
import { CopyButton } from "@/components/dashboard/copy-button";
import { MessageSquare, Globe, ExternalLink, ArrowRight } from "lucide-react";

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

async function ChatsContent() {
  const ctx = await requireAuth();
  const conversations = await listConversationsWithPreview(ctx.tenant.id, 50);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${ctx.tenant.publicId}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F3EE] border border-[#CDE5DA] text-[#0D4B37] text-xs font-semibold mb-2">
          <span>Inquiries</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#18181B] tracking-tight">Chats</h1>
        <p className="text-xs text-[#71717A] mt-1">
          {conversations.length === 0
            ? "No visitor conversations recorded yet"
            : `${conversations.length} total conversation${conversations.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Conversation List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {conversations.length === 0 ? (
            <div className="bg-white rounded-[28px] p-10 border border-black/[0.04] shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F3EE] flex items-center justify-center mx-auto mb-3 text-[#71717A]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#18181B] mb-1">No conversations yet</p>
              <p className="text-xs text-[#71717A]">
                When visitors ask questions on your public link, they will appear here.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chats/${conv.id}`}
                className="block bg-white rounded-[24px] p-5 border border-black/[0.04] shadow-sm hover:shadow-md hover:border-[#DDD9D0] transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#E8F3EE] text-[#0D4B37] flex items-center justify-center font-bold text-xs shrink-0">
                      {conv.visitorId.slice(-2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#18181B] truncate group-hover:text-[#0D4B37] transition-colors">
                        {conv.preview || `Visitor ${conv.visitorId.slice(-6)}`}
                      </p>
                      <p className="text-[11px] text-[#71717A] mt-0.5">
                        {conv.messageCount} messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-[#71717A]">
                      {formatDate(conv.createdAt)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:translate-x-0.5 group-hover:text-[#0D4B37] transition-all" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* RIGHT: Public Chat Link Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-sm space-y-5">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#E8F3EE] text-[#0D4B37] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#18181B]">Public Chat Link</h2>
            <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
              Share this dedicated link with customers. They can chat directly with your assistant with zero login required.
            </p>
          </div>

          <div className="bg-[#F8F7F3] p-3.5 rounded-2xl border border-[#EDECE6] space-y-2">
            <div className="text-[11px] font-mono text-[#18181B] break-all">
              {publicUrl}
            </div>
            <div className="pt-1 flex items-center gap-2">
              <CopyButton text={publicUrl} />
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-pill-secondary text-xs px-3.5 py-1.5 flex items-center gap-1 font-medium text-[#52525B]"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            Embed script widget integration will be available in the upcoming release.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-[#71717A]">Loading chats...</div>}>
      <ChatsContent />
    </Suspense>
  );
}
