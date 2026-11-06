// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { getDashboardStats } from "@/lib/dal/dashboard-stats";
import { listConversations } from "@/lib/dal/conversations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "../../../components/dashboard/copy-button";

async function DashboardContent() {
  const ctx = await requireAuth();
  const stats = await getDashboardStats(ctx.tenant.id);
  const recentConversations = await listConversations(ctx.tenant.id, 5);

  const hasData = stats.sources.total > 0 || stats.conversations.total > 0;
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${ctx.tenant.publicId}`;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
            Welcome, {ctx.user.name || ctx.user.email}
          </h1>
          <p className="text-sm text-neutral-500">
            Here&apos;s what&apos;s happening with your workspace.
          </p>
        </div>
        <Link
          href="/settings"
          className="text-sm text-neutral-700 hover:text-neutral-900 underline"
        >
          Settings
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Sources"
          value={stats.sources.total}
          hint={`${stats.sources.ready} ready · ${stats.sources.processing} processing`}
        />
        <StatCard
          label="Conversations"
          value={stats.conversations.total}
          hint={`${stats.messages.total} messages total`}
        />
        <StatCard
          label="Leads captured"
          value={stats.leads.total}
          hint={`${stats.leads.last7Days} in last 7 days`}
        />
        <StatCard
          label="Unanswered"
          value={stats.messages.unanswered}
          hint="Questions bot couldn't answer"
          highlight={stats.messages.unanswered > 0}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentConversations.length === 0 ? (
              <EmptyState
                title="No conversations yet"
                message="Once visitors chat with your bot, conversations will appear here."
              />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {recentConversations.map((conv) => (
                  <li key={conv.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Visitor {conv.visitorId.slice(0, 8)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {conv.messageCount} messages
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {formatRelativeTime(conv.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Workspace Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">Public chat link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-neutral-100 px-2 py-1.5 rounded font-mono truncate">
                    {publicUrl}
                  </code>
                  <CopyButton text={publicUrl} />
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Status</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded">
                  {ctx.tenant.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Knowledge base</p>
                <p className="text-sm text-neutral-900">
                  {stats.chunks.total} chunks indexed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State — First Time */}
      {!hasData && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Get started with ChatDesk
              </h3>
              <p className="text-sm text-neutral-500 mb-4 max-w-md mx-auto">
                Add your first knowledge source to train your AI assistant. Once added, your bot can answer visitor questions.
              </p>
              <Link
                href="/sources/new"
                className="inline-block bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-800"
              >
                Add knowledge source
              </Link>
            </div>
          </CardContent>
        </Card>
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
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-neutral-500 mb-1">{label}</p>
        <p
          className={`text-3xl font-semibold mb-1 ${
            highlight ? "text-amber-600" : "text-neutral-900"
          }`}
        >
          {value}
        </p>
        <p className="text-xs text-neutral-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center py-6">
      <p className="text-sm font-medium text-neutral-900 mb-1">{title}</p>
      <p className="text-xs text-neutral-500">{message}</p>
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
        <div className="space-y-4">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}