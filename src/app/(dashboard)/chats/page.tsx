// src/app/(dashboard)/chats/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { listConversations } from "@/lib/dal/conversations";

/** Convert a visitorId hash into a human-readable session label */
function sessionLabel(visitorId: string, index: number): string {
  // Use last 6 chars of visitorId as a short fingerprint
  const short = visitorId.slice(-6).toUpperCase();
  return `Session #${index + 1} · ${short}`;
}

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
  const conversations = await listConversations(ctx.tenant.id, 50);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Chats</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {conversations.length === 0
              ? "No visitor conversations yet"
              : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href={`/c/${ctx.tenant.publicId}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm bg-neutral-900 text-white px-3.5 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Preview chat
        </Link>
      </div>

      {conversations.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-900 mb-1">No conversations yet</p>
          <p className="text-sm text-neutral-400 max-w-xs">
            Share your chat link with visitors — conversations will appear here.
          </p>
        </div>
      ) : (
        /* Conversation list — sidebar-style rows */
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
          {conversations.map((conv, i) => (
            <div
              key={conv.id}
              className="flex items-start gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors"
            >
              {/* Avatar circle */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-indigo-500">
                  {conv.visitorId.slice(-2).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {sessionLabel(conv.visitorId, i)}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {conv.messageCount} message{conv.messageCount === 1 ? "" : "s"}
                </p>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-neutral-400 shrink-0 mt-0.5">
                {formatDate(conv.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-neutral-200 rounded-xl animate-pulse" />
          ))}
        </div>
      }
    >
      <ChatsContent />
    </Suspense>
  );
}
