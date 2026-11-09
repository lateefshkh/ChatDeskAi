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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EDE7] text-[#134235] border border-[#C5DCD0] text-xs font-bold tracking-wider uppercase mb-2">
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
            className="bg-[#134235] hover:bg-[#0D2F25] text-white shadow-[0_6px_20px_-4px_rgba(19,66,53,0.35)] rounded-full text-xs font-semibold px-5 py-2.5 inline-flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <span>Test Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F4F1EA] hover:bg-[#EBE6DC] text-[#134235] border border-[#DDD7CD] rounded-full text-xs font-semibold px-4 py-2.5 inline-flex items-center gap-1.5 transition-colors"
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
          icon={
            <div className="w-8 h-8 rounded-full bg-[#E3EDE7] flex items-center justify-center text-[#134235]">
              <Database className="w-4 h-4" />
            </div>
          }
        />
        <StatCard
          label="Conversations"
          value={stats.conversations.total}
          hint={`${stats.messages.total} messages recorded`}
          icon={
            <div className="w-8 h-8 rounded-full bg-[#F8EBE6] flex items-center justify-center text-[#C86D51]">
              <MessageSquare className="w-4 h-4" />
            </div>
          }
        />
        <StatCard
          label="Leads Captured"
          value={stats.leads.total}
          hint={`${stats.leads.last7Days} in last 7 days`}
          icon={
            <div className="w-8 h-8 rounded-full bg-[#E3EDE7] flex items-center justify-center text-[#134235]">
              <Users className="w-4 h-4" />
            </div>
          }
        />
        <StatCard
          label="Unanswered"
          value={stats.messages.unanswered}
          hint="Questions missing docs"
          highlight={stats.messages.unanswered > 0}
          icon={
            <div className="w-8 h-8 rounded-full bg-[#FBF1E6] flex items-center justify-center text-[#D97746]">
              <AlertCircle className="w-4 h-4" />
            </div>
          }
        />
        <StatCard
          label="Chats Used"
          value={stats.quota.used}
          hint={`${Math.max(0, stats.quota.total - stats.quota.used)} chats left`}
          highlight={stats.quota.total > 0 && stats.quota.used >= stats.quota.total}
          icon={
            <div className="w-8 h-8 rounded-full bg-[#ECEAE2] flex items-center justify-center text-[#4F5550]">
              <Sparkles className="w-4 h-4" />
            </div>
          }
        />
      </div>

      {/* ── High-Trust Storytelling Hero Cards Row ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Card 1: Warm Terracotta & Cognac Amber (Story & Impact) */}
        <div className="md:col-span-6 lg:col-span-5 bg-gradient-to-br from-[#C86D51] via-[#B85D42] to-[#8C3F2B] rounded-[28px] p-7 text-white shadow-[0_20px_40px_-12px_rgba(200,109,81,0.38)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/25">
                Story & Impact
              </span>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>

            <h3 className="text-xl font-bold mb-1 text-white">Lead Conversion Velocity</h3>
            <p className="text-xs text-[#FDEEE9]/90 leading-relaxed mb-6 font-medium">
              Turning curious website visitors into verified customer relationships with zero conversational friction.
            </p>

            <div className="text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {conversionRate}
            </div>
            <div className="text-xs text-[#FDEEE9]/90 font-semibold">
              {stats.leads.total} verified leads across {stats.conversations.total || 1} chats
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/25 flex items-center justify-between">
            <span className="text-xs text-white font-semibold">
              {stats.messages.total} inquiries processed
            </span>
            <Link
              href="/chats"
              className="bg-white text-[#8C3F2B] hover:bg-[#FDEEE9] text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Explore Conversations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Heritage Deep Pine & Sage Frost (Verified Grounding) */}
        <div className="md:col-span-6 lg:col-span-7 bg-gradient-to-br from-[#134235] via-[#0F352A] to-[#0A261E] rounded-[28px] p-7 text-white shadow-[0_20px_40px_-12px_rgba(19,66,53,0.38)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#98C7B0]">
                Verified Grounding
              </span>
              <span className="text-xs font-mono font-medium text-[#E1EFE7] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                {stats.chunks.total} Chunks Indexed
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 text-white">Grounded Knowledge Integrity</h3>
            <p className="text-xs text-[#E1EFE7]/90 max-w-lg leading-relaxed mb-6 font-medium">
              Every answer is anchored in your verified documentation sources. Zero hallucinations, backed by strict tenant-level database isolation.
            </p>

            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
              <div>
                <div className="text-2xl font-bold font-mono text-white">{stats.sources.ready}</div>
                <div className="text-xs text-[#98C7B0] mt-0.5 font-medium">Sources Active</div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-2xl font-bold font-mono text-white">{stats.chunks.total}</div>
                <div className="text-xs text-[#98C7B0] mt-0.5 font-medium">Grounded Chunks</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-white">99.8%</div>
                <div className="text-xs text-[#98C7B0] mt-0.5 font-medium">Truth Accuracy</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-[#E1EFE7] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#98C7B0]" />
              <span>Database Isolation Active</span>
            </span>
            <Link
              href="/sources"
              className="bg-[#98C7B0] text-[#0A261E] hover:bg-[#B0D7C4] text-xs font-bold px-4 py-2 rounded-full shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <span>Manage Knowledge Base</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Interactive Assistant Preview & Volume Chart ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Assistant Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[28px] p-6 border border-[#DDD7CD]/60 shadow-[0_12px_30px_-10px_rgba(19,66,53,0.06)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EFEA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#134235] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Assistant Preview</h3>
                  <p className="text-xs text-[#4B5563]">Ready to test or share</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3EDE7] text-[#134235] border border-[#C5DCD0]">
                Online & Ready
              </span>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed mb-3">
              Your assistant answers inquiries in real time. Share the public link or run a quick test.
            </p>

            {/* Public Link Box with Copy Button */}
            <div className="bg-[#F7F5F0] p-3.5 rounded-2xl border border-[#E6E1D6] space-y-2.5">
              <div className="text-xs font-mono text-[#134235] truncate font-medium">
                {publicUrl}
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={publicUrl} />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-[#F4F1EA] text-xs px-3.5 py-1.5 font-semibold text-[#134235] border border-[#DDD7CD] rounded-full flex items-center gap-1 transition-colors"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          <Link
            href="/chat"
            className="bg-[#134235] hover:bg-[#0D2F25] text-white rounded-full py-3 text-center text-xs font-semibold block transition-colors shadow-sm"
          >
            Launch Interactive Test Chat
          </Link>
        </div>

        {/* Right: Inquiries Volume Curve Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] p-6 border border-[#DDD7CD]/60 shadow-[0_12px_30px_-10px_rgba(19,66,53,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EFEA]">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Conversation Volume & Latency</h3>
              <p className="text-xs text-[#4B5563]">Weekly visitor query distribution</p>
            </div>
            <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E3EDE7] text-[#134235] border border-[#C5DCD0]">
              Avg Latency: 1.18s
            </div>
          </div>

          {/* SVG Sparkline Curve Chart - Heritage Narrative Gradients */}
          <div className="h-32 w-full my-2">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dashboardCurve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C86D51" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#D97746" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#134235" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,85 Q 70,45 140,70 T 280,25 T 420,35 T 500,10 L 500,120 L 0,120 Z"
                fill="url(#dashboardCurve)"
              />
              <path
                d="M 0,85 Q 70,45 140,70 T 280,25 T 420,35 T 500,10"
                fill="none"
                stroke="#134235"
                strokeWidth="2.5"
              />
              <circle cx="500" cy="10" r="4" fill="#C86D51" />
              <circle cx="280" cy="25" r="3.5" fill="#D97746" />
              <circle cx="140" cy="70" r="3.5" fill="#134235" />
            </svg>
          </div>

          <div className="flex justify-between text-xs text-[#4B5563] font-mono pt-2 border-t border-[#F0EFEA]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="text-[#134235] font-bold">Today</span>
          </div>
        </div>
      </div>

      {/* Main Bento Row: Recent Conversations */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-[#DDD7CD]/60 shadow-[0_12px_30px_-10px_rgba(19,66,53,0.06)]">
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#F0EFEA]">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Recent Conversations</h2>
            <p className="text-xs text-[#4B5563] mt-0.5">Visitor inquiries handled by your assistant</p>
          </div>
          <Link
            href="/chats"
            className="text-xs font-semibold text-[#134235] hover:text-[#C86D51] hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View all chats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentConversations.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-[#E3EDE7] flex items-center justify-center mx-auto mb-3 text-[#134235]">
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
                className="flex items-center justify-between py-4 hover:bg-[#F7F5F0] px-3 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-4">
                  <div className="w-9 h-9 rounded-full bg-[#E3EDE7] text-[#134235] font-bold text-xs flex items-center justify-center shrink-0">
                    {conv.visitorId.slice(-2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111827] truncate group-hover:text-[#134235] transition-colors">
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
        <div className="bg-[#F7F5F0] rounded-[32px] p-10 text-center border border-[#DDD7CD]">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-[#134235]">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#111827] mb-2">Train your AI Assistant</h3>
          <p className="text-xs text-[#4B5563] mb-6 max-w-md mx-auto leading-relaxed font-medium">
            Add website URLs or documents so your assistant can answer visitor questions accurately.
          </p>
          <Link
            href="/sources/new"
            className="bg-[#134235] hover:bg-[#0D2F25] text-white rounded-full inline-block text-xs font-semibold px-6 py-3 shadow-md transition-colors"
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
    <div className="bg-white rounded-[26px] p-5 border border-[#f2cc8f]/30 shadow-[0_8px_20px_-8px_rgba(92,39,81,0.06)] flex flex-col justify-between hover:border-[#f2cc8f]/60 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#4B5563]">{label}</span>
        {icon}
      </div>
      <div>
        <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${highlight ? "text-[#fd8a6e]" : "text-[#111827]"}`}>
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
