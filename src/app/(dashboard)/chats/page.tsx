// src/app/(dashboard)/chats/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { listConversationsWithPreview } from "@/lib/dal/conversations";
import { CopyButton } from "@/components/dashboard/copy-button";

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
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Chats</h1>
        <p className="text-[17px] text-text">
          {conversations.length === 0
            ? "No visitor conversations yet"
            : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Main Layout Grid: 12 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT SIDE (Width badhayi: 7 columns out of 12) */}
        <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 bg-card rounded-[26px] p-8">
          <h2 className="text-xl font-bold text-ink mb-2">Public Chat Link</h2>
          <p className="text-[17px] text-text mb-6">
            Share this link with your visitors. They can chat with your AI assistant — no login required.
          </p>
          <div className="flex flex-col gap-3 bg-background p-3 rounded-xl">
            <code className="text-sm font-mono text-ink break-all">
              {publicUrl}
            </code>
            <CopyButton text={publicUrl} />
          </div>
          <p className="text-xs text-text/70 mt-4">
            Note: Embed script (iframe) will be available in a future phase.
          </p>
        </div>

        {/* LEFT SIDE (Width kam ki: 5 columns out of 12) */}
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 space-y-4">
          {conversations.length === 0 ? (
            <div className="bg-card rounded-[26px] p-8 text-center">
              <p className="text-[15px] font-medium text-ink mb-1">No conversations yet</p>
              <p className="text-xs text-text">Once visitors chat, they'll appear here.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chats/${conv.id}`}
                className="block bg-card rounded-[26px] p-5 hover:bg-background transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {conv.visitorId.slice(-2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {conv.preview}
                      </p>
                      <p className="text-xs text-text mt-0.5">
                        {conv.messageCount} messages
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-text whitespace-nowrap shrink-0">
                    {formatDate(conv.createdAt)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-text">Loading chats...</div>}>
      <ChatsContent />
    </Suspense>
  );
}