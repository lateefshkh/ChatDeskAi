// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { getDashboardStats } from "@/lib/dal/dashboard-stats";
import { listConversationsWithPreview } from "@/lib/dal/conversations";
import {
  SkeletonStatCard,
  SkeletonCard,
  SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

async function DashboardContent() {
  const ctx = await requireAuth();
  
  const [stats, recentConversations] = await Promise.all([
    getDashboardStats(ctx.tenant.id),
    listConversationsWithPreview(ctx.tenant.id, 5),
  ]);

  const hasData = stats.sources.total > 0 || stats.conversations.total > 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">
          Welcome, {ctx.user.name || ctx.user.email}
        </h1>
        <p className="text-[17px] text-text">
          Here's what's happening with your workspace.
        </p>
      </div>

      {/* Bento Grid KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Sources" value={stats.sources.total} hint={`${stats.sources.ready} ready`} />
        <StatCard label="Conversations" value={stats.conversations.total} hint={`${stats.messages.total} messages`} />
        <StatCard label="Leads captured" value={stats.leads.total} hint={`${stats.leads.last7Days} new`} />
        <StatCard
          label="Unanswered"
          value={stats.messages.unanswered}
          hint="Needs attention"
          highlight={stats.messages.unanswered > 0}
        />
        <StatCard
          label="Chats used"
          value={stats.quota.used}
          hint={`${stats.quota.total - stats.quota.used} left`}
          highlight={stats.quota.total > 0 && stats.quota.used >= stats.quota.total}
        />
      </div>

      {/* Main Bento Row: Recent Conversations (Full Width) */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-card rounded-[26px] p-8">
          <h2 className="text-xl font-bold text-ink mb-6">Recent conversations</h2>
          
          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[17px] text-ink font-medium mb-1">No conversations yet</p>
              <p className="text-sm text-text">Once visitors chat, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between py-4 border-b border-divider last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[17px] font-medium text-ink truncate">
                      {conv.preview}
                    </p>
                    <p className="text-sm text-text mt-0.5">
                      {conv.messageCount} messages
                    </p>
                  </div>
                  <span className="text-sm text-text whitespace-nowrap">
                    {formatRelativeTime(conv.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="bg-card rounded-[26px] p-12 text-center mt-8">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-ink mb-3">Get started with ChatDesk</h3>
          <p className="text-[17px] text-text mb-8 max-w-md mx-auto">
            Add your first knowledge source to train your AI assistant. Once added, your bot can answer visitor questions.
          </p>
          <Link
            href="/sources/new"
            className="inline-block bg-primary text-white text-[17px] font-medium px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            Add knowledge source
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-card rounded-[26px] p-6 flex flex-col justify-between">
      <p className="text-sm font-medium text-text mb-4">{label}</p>
      <div>
        <p className={`text-3xl font-bold ${highlight ? "text-warning" : "text-ink"}`}>
          {value}
        </p>
        <p className="text-xs text-[#86868b] mt-1">{hint}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
          <SkeletonPageHeader wide />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6">
            <SkeletonCard rows={4} />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}