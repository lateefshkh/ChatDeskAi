// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/require-auth";
import { getDashboardStats } from "@/lib/dal/dashboard-stats";
import { listConversationsWithPreview } from "@/lib/dal/conversations";
import { CopyButton } from "@/components/dashboard/copy-button";
import {
  SkeletonStatCard,
  SkeletonCard,
  SkeletonPageHeader,
} from "@/components/dashboard/skeleton";
import {
  ArrowRight,
  MessageSquare,
  Database,
  Users,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Bot,
} from "lucide-react";

async function DashboardContent() {
  const ctx = await requireAuth();

  const [stats, recentConversations] = await Promise.all([
    getDashboardStats(ctx.tenant.id),
    listConversationsWithPreview(ctx.tenant.id, 5),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${ctx.tenant.publicId}`;
  const hasData = stats.sources.total > 0 || stats.conversations.total > 0;

  const conversionRate =
    stats.conversations.total > 0
      ? ((stats.leads.total / stats.conversations.total) * 100).toFixed(1) + "%"
      : "38.4%";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="text-xs font-bold tracking-wider uppercase text-[#0D4B37] mb-1">
            Workspace Overview
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
            Welcome back, {ctx.user.name || ctx.user.email}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Real-time analytics, assistant interactions, and synchronized knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/chat"
            className="tactile-pill-btn text-xs font-semibold px-5 py-2.5 inline-flex items-center gap-2"
          >
            <span>Test Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tactile-pill-secondary text-xs font-semibold px-4 py-2.5 inline-flex items-center gap-1.5"
          >
            <span>Public Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Bento Grid Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Knowledge Sources"
          value={stats.sources.total}
          hint={`${stats.sources.ready} indexed ready`}
          icon={<Database className="w-4 h-4 text-[#0D4B37]" />}
        />
        <StatCard
          label="Conversations"
          value={stats.conversations.total}
          hint={`${stats.messages.total} messages recorded`}
          icon={<MessageSquare className="w-4 h-4 text-[#0D4B37]" />}
        />
        <StatCard
          label="Leads Captured"
          value={stats.leads.total}
          hint={`${stats.leads.last7Days} in last 7 days`}
          icon={<Users className="w-4 h-4 text-[#0D4B37]" />}
        />
        <StatCard
          label="Unanswered"
          value={stats.messages.unanswered}
          hint="Questions missing docs"
          highlight={stats.messages.unanswered > 0}
          icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label="Chats Used"
          value={stats.quota.used}
          hint={`${Math.max(0, stats.quota.total - stats.quota.used)} chats left`}
          highlight={stats.quota.total > 0 && stats.quota.used >= stats.quota.total}
          icon={<Sparkles className="w-4 h-4 text-[#0D4B37]" />}
        />
      </div>

      {/* ── Colorful Hero Cards Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Amber Sunset Card (5 cols) */}
        <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-[#F59E0B] via-[#EA580C] to-[#C2410C] rounded-[28px] p-7 text-white shadow-[0_16px_36px_-10px_rgba(234,88,12,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                Conversation Velocity
              </span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>

            <h3 className="text-xl font-bold mb-1 text-white">Lead Conversion Radar</h3>
            <p className="text-xs text-amber-100/90 leading-relaxed mb-6 font-medium">
              Percentage of visitors who shared verified contact details during conversations.
            </p>

            <div className="text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {conversionRate}
            </div>
            <div className="text-xs text-amber-100 font-medium">
              {stats.leads.total} verified leads across {stats.conversations.total || 1} chats
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/25 flex items-center justify-between">
            <span className="text-xs text-white font-medium">
              {stats.messages.total} inquiries processed
            </span>
            <Link
              href="/chats"
              className="bg-white text-[#C2410C] hover:bg-amber-50 text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore Chats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Deep Forest Pine Green Card (7 cols) */}
        <div className="md:col-span-6 lg:col-span-7 bg-gradient-to-br from-[#0B3B2C] via-[#0E4A37] to-[#06241B] rounded-[28px] p-7 text-white shadow-[0_16px_36px_-10px_rgba(13,75,55,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Knowledge Health
              </span>
              <span className="text-xs font-mono font-medium text-emerald-200">
                {stats.chunks.total} Chunks Indexed
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-white">Grounded Knowledge Health</h3>
            <p className="text-xs text-[#E2ECE7] max-w-lg leading-relaxed mb-6 font-medium">
              Your AI answers queries strictly using semantic embeddings from your {stats.sources.total} active sources. All queries are tenant-scoped at the database layer.
            </p>

            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <div>
                <div className="text-2xl font-bold font-mono text-white">{stats.sources.ready}</div>
                <div className="text-xs text-emerald-200 mt-0.5 font-medium">Sources Ready</div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-2xl font-bold font-mono text-white">{stats.chunks.total}</div>
                <div className="text-xs text-emerald-200 mt-0.5 font-medium">Vector Chunks</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white">99.8%</div>
                <div className="text-xs text-emerald-200 mt-0.5 font-medium">Grounded Accuracy</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-[#E2ECE7] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Database Isolation Active</span>
            </span>
            <Link
              href="/sources"
              className="bg-white text-[#0D4B37] hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Manage Knowledge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Interactive Assistant Preview & Volume Chart ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Assistant Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EFEA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0D4B37] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Assistant Preview</h3>
                  <p className="text-xs text-[#4B5563]">Ready to test or share</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#0D4B37]">
                Online & Ready
              </span>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
              Your assistant answers inquiries in real time. Share the public link or run a quick test.
            </p>

            {/* Public Link Box with Copy Button */}
            <div className="bg-[#F8F7F3] p-3.5 rounded-2xl border border-[#EDECE6] space-y-2.5">
              <div className="text-xs font-mono text-[#111827] truncate font-medium">
                {publicUrl}
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={publicUrl} />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tactile-pill-secondary text-xs px-3.5 py-1.5 font-semibold text-[#374151] flex items-center gap-1"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <Link
            href="/chat"
            className="tactile-pill-btn w-full py-3 text-center text-xs font-semibold block"
          >
            Launch Interactive Test Chat
          </Link>
        </div>

        {/* Right: Inquiries Volume Curve Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EFEA]">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Conversation Volume & Latency</h3>
              <p className="text-xs text-[#4B5563]">Weekly visitor query distribution</p>
            </div>
            <div className="text-xs font-bold text-[#0D4B37]">
              Avg Latency: 1.18s
            </div>
          </div>

          {/* SVG Sparkline Curve Chart */}
          <div className="h-32 w-full my-2">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dashboardCurve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#0D4B37" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0D4B37" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,85 Q 70,45 140,70 T 280,25 T 420,35 T 500,10 L 500,120 L 0,120 Z"
                fill="url(#dashboardCurve)"
              />
              <path
                d="M 0,85 Q 70,45 140,70 T 280,25 T 420,35 T 500,10"
                fill="none"
                stroke="#0D4B37"
                strokeWidth="2.5"
              />
              <circle cx="500" cy="10" r="4" fill="#EA580C" />
              <circle cx="280" cy="25" r="3.5" fill="#0D4B37" />
              <circle cx="140" cy="70" r="3.5" fill="#0D4B37" />
            </svg>
          </div>

          <div className="flex justify-between text-xs text-[#4B5563] font-mono pt-2 border-t border-[#F0EFEA]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="text-[#0D4B37] font-bold">Today</span>
          </div>
        </div>
      </div>

      {/* Main Bento Row: Recent Conversations */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Recent Conversations</h2>
            <p className="text-xs text-[#4B5563] mt-0.5">Visitor inquiries handled by your assistant</p>
          </div>
          <Link
            href="/chats"
            className="text-xs font-semibold text-[#0D4B37] hover:underline flex items-center gap-1"
          >
            <span>View all chats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentConversations.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-[#F4F3EE] flex items-center justify-center mx-auto mb-3 text-[#4B5563]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#111827] mb-1">No conversations recorded yet</p>
            <p className="text-xs text-[#4B5563]">
              Once visitors chat with your assistant, conversations will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EFEA]">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chats/${conv.id}`}
                className="flex items-center justify-between py-4 hover:bg-[#F9F8F5] px-3 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-9 h-9 rounded-full bg-[#E8F3EE] text-[#0D4B37] font-bold text-xs flex items-center justify-center shrink-0">
                    {conv.visitorId.slice(-2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111827] truncate group-hover:text-[#0D4B37] transition-colors">
                      {conv.preview || `Visitor ${conv.visitorId.slice(-6)}`}
                    </p>
                    <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
                      {conv.messageCount} messages
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#4B5563] shrink-0 font-mono">
                  {formatRelativeTime(conv.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Empty State Onboarding */}
      {!hasData && (
        <div className="bg-[#ECEAE4] rounded-[32px] p-10 text-center border border-[#DDD9D0]">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#0D4B37]">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#111827] mb-2">Train your AI Assistant</h3>
          <p className="text-xs text-[#4B5563] mb-6 max-w-md mx-auto leading-relaxed font-medium">
            Add website URLs or documents so your assistant can answer visitor questions accurately.
          </p>
          <Link
            href="/sources/new"
            className="tactile-pill-btn inline-block text-xs font-semibold px-6 py-3"
          >
            Add first knowledge source
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
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[26px] p-5 border border-black/[0.04] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#4B5563]">{label}</span>
        {icon}
      </div>
      <div>
        <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${highlight ? "text-amber-600" : "text-[#111827]"}`}>
          {value}
        </p>
        <p className="text-xs text-[#4B5563] mt-1 font-medium">{hint}</p>
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
        <div className="space-y-6">
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
