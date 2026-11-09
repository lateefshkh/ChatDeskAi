// src/app/page.tsx
import Link from "next/link";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Check,
  Globe,
  Database,
  Users,
  Search,
  Lock,
  Code2,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F3EE] text-[#111827] selection:bg-[#134235] selection:text-white">
      {/* ── Soft Warm Ambient Lighting (Storytelling depth) ──────────── */}
      <div className="fixed top-0 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-b from-[#C86D51]/10 via-[#D97746]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-[#134235]/15 via-[#98C7B0]/5 to-transparent blur-3xl pointer-events-none" />

      {/* ── Floating Tactile Pill Navigation Bar ─────────────────────── */}
      <header className="sticky top-5 z-50 max-w-6xl mx-auto px-4">
        <div className="bg-[#FAF9F5]/90 backdrop-blur-xl border border-[#DDD7CD] rounded-full px-4 py-2.5 sm:px-6 sm:py-3 shadow-[0_10px_30px_-10px_rgba(19,66,53,0.06)] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#134235] flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[#111827] whitespace-nowrap">
              ChatDesk <span className="text-[#134235] font-semibold">AI Automation</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-[#6B7280]">
            <Link href="#features" className="hover:text-[#111827] transition-colors">
              Features
            </Link>
            <Link href="#preview" className="hover:text-[#111827] transition-colors">
              Interactive Preview
            </Link>
            <Link href="#how-it-works" className="hover:text-[#111827] transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="hover:text-[#111827] transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-[#111827] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-black/5 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="tactile-pill-btn text-xs sm:text-sm font-semibold px-4 py-1.5 sm:px-5 sm:py-2 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Customer Narrative & High Trust) ────────────── */}
      <section className="pt-14 pb-12 md:pt-22 md:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Soft Tactile Pill Badge in Sage Frost */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#E3EDE7] border border-[#C5DCD0] shadow-sm text-xs sm:text-sm font-medium text-[#134235] mb-6">
          <span>Website Support & Lead Capture</span>
          <span className="w-px h-3.5 bg-[#C5DCD0]" />
          <span className="text-[#134235] font-bold">10 Free Chats Included</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#111827] max-w-3xl mx-auto leading-[1.12] mb-5">
          Turn your website into a{" "}
          <span className="text-[#134235]">
            24/7 customer assistant
          </span>
          .
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#4B5563] max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          Upload website links or product documentation. ChatDesk answers visitor inquiries accurately
          from your content and captures verified sales leads automatically.
        </p>

        {/* Tactile Action Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Link
            href="/signup"
            className="tactile-pill-btn w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
          >
            <span>Start with 10 Free Chats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#preview"
            className="tactile-pill-secondary w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
          >
            <Activity className="w-4 h-4 text-[#134235]" />
            <span>Explore Architecture</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-[#4B5563]">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Check className="w-4 h-4 text-[#134235] shrink-0" />
            <span>No card needed</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Check className="w-4 h-4 text-[#134235] shrink-0" />
            <span>Quick 2-minute setup</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Check className="w-4 h-4 text-[#134235] shrink-0" />
            <span>Verified source citations</span>
          </span>
        </div>
      </section>

      {/* ── 3D Tactile Showcase (Matches Reference Photo Composition) ─── */}
      <section id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* The Raised Clay Board Container */}
        <div className="bg-[#ECEAE4] p-5 sm:p-8 rounded-[36px] border border-[#DDD9D0] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.07)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Card 1 (Tall Left White Hero Card - Like Left Card in Photo) */}
            <div className="md:col-span-5 bg-white rounded-[32px] p-6 sm:p-7 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EFEA]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#134235] flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111827]">Acme Support Assistant</div>
                      <div className="text-[10px] text-[#6B7280]">Synchronized with documentation</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E3EDE7] text-[#134235] border border-[#C5DCD0]">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-[#111827] mb-2 leading-snug">
                  Automated customer conversations with lead capture
                </h3>
                <p className="text-sm text-[#4B5563] mb-5 leading-relaxed">
                  Answers customer inquiries directly using indexed sections of your documentation.
                </p>

                {/* Simulated Conversation */}
                <div className="space-y-3 bg-[#F8F7F3] p-4 rounded-2xl border border-[#EDECE6] mb-5">
                  <div className="flex justify-end">
                    <div className="bg-[#134235] text-white text-xs sm:text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[90%] shadow-sm">
                      Do you support phone lead capture and custom webhook sync?
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#134235] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="bg-white border border-[#E5E3DC] text-[#27272A] text-xs sm:text-sm rounded-2xl rounded-tl-sm p-3.5 shadow-sm space-y-2">
                      <p className="leading-relaxed">
                        Yes, ChatDesk captures visitor contact details automatically and syncs to your
                        dashboard or webhook in real time.
                      </p>
                      <div className="text-xs text-[#134235] font-medium bg-[#E3EDE7] px-2.5 py-1 rounded-md inline-block">
                        Source: docs.acme.com/features (Section 3)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tactile Pill Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <span className="tactile-pill-btn text-xs px-5 py-2 font-medium cursor-pointer">
                  Try Demo
                </span>
                <span className="tactile-pill-secondary text-xs px-4 py-2 font-medium text-[#4B5563]">
                  99.8% Accuracy
                </span>
              </div>
            </div>

            {/* Right Column Grid (Cards matching the terracotta & pine storytelling theme) */}
            <div className="md:col-span-7 flex flex-col gap-5">
              {/* Row 1: Terracotta Cognac Card + White Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Terracotta Gradient Card */}
                <div className="bg-gradient-to-br from-[#C86D51] via-[#B85D42] to-[#8C3F2B] rounded-[30px] p-6 text-white shadow-[0_20px_40px_-12px_rgba(200,109,81,0.38)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/25">
                        Performance
                      </span>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-1 text-white">Conversation Analytics</h4>
                    <p className="text-xs text-white/90 leading-relaxed mb-4 font-medium">
                      Continuous inquiry tracking with zero unanswered question gaps.
                    </p>
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                      38.4%
                    </div>
                    <div className="text-xs text-[#FDEEE9] mt-0.5 font-medium">Average lead conversion rate</div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-white font-medium">1,240 conversations handled today</span>
                    <span className="bg-white text-[#8C3F2B] text-xs font-bold px-3.5 py-1 rounded-full shadow-sm">
                      Top Rated
                    </span>
                  </div>
                </div>

                {/* White Tactile Stat Card */}
                <div className="bg-white rounded-[30px] p-6 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-medium text-[#6B7280]">Response Speed</span>
                      <Zap className="w-4 h-4 text-[#134235]" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#111827] font-mono">1.18s</div>
                    <p className="text-xs text-[#6B7280] mt-1">Average response streaming latency</p>

                    <div className="mt-4 p-3 bg-[#F8F7F3] rounded-2xl border border-[#EDECE6] space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#4B5563]">Answered</span>
                        <span className="font-semibold text-[#134235]">99.4%</span>
                      </div>
                      <div className="w-full bg-[#E5E3DC] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#134235] h-full w-[99.4%] rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <span className="tactile-pill-btn text-xs px-4 py-1.5 font-medium inline-block">
                      View Metrics
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Heritage Deep Pine Feature Card */}
              <div className="bg-gradient-to-br from-[#134235] via-[#0F352A] to-[#0A261E] rounded-[30px] p-6 sm:p-7 text-white shadow-[0_20px_40px_-12px_rgba(19,66,53,0.38)] flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#98C7B0] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#98C7B0]" />
                    <span>Database-Level Security</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    Enterprise Knowledge Partitioning
                  </h4>
                  <p className="text-xs text-[#E1EFE7] max-w-md leading-relaxed font-medium">
                    URLs and documents are partitioned per tenant. Zero cross-tenant data access,
                    strictly enforced with database-level isolation.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center min-w-[140px] shrink-0">
                  <div className="text-2xl font-bold font-mono text-white">100%</div>
                  <div className="text-xs text-[#98C7B0] mt-0.5 font-medium">Isolated & Verified</div>
                  <div className="mt-2 text-xs bg-[#98C7B0] text-[#0A261E] font-bold py-1 px-3 rounded-full shadow-sm">
                    Audited
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tactile Metrics Strip ─────────────────────────────────────── */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-mono">12.4M+</div>
            <div className="text-xs text-[#6B7280] mt-1 font-medium">Customer Messages Handled</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#134235] font-mono">48,200+</div>
            <div className="text-xs text-[#6B7280] mt-1 font-medium">Verified Leads Captured</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C86D51] font-mono">99.8%</div>
            <div className="text-xs text-[#6B7280] mt-1 font-medium">Documentation Accuracy</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-mono">1.18s</div>
            <div className="text-xs text-[#6B7280] mt-1 font-medium">Average Latency</div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Features ───────────────────────────────────────── */}
      <section id="features" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-bold text-[#134235] uppercase tracking-wider mb-2">
            Product Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] mb-3">
            Built for modern businesses answering customer inquiries
          </h2>
          <p className="text-sm text-[#4B5563]">
            Designed for teams that want reliable website support backed by their own documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#E3EDE7] text-[#134235] flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Automated URL Scraping</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Add any website URL. We extract readable text, clean headers, and structure content into semantic search chunks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#F8EBE6] text-[#C86D51] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Verified Knowledge Retrieval</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Accurate answers without hallucinations. Responses cite exact sources from your documents.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#E3EDE7] text-[#134235] flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Contact Lead Capture</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Prompts engaged visitors for their name and phone number, storing encrypted contacts for your team.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#F0EFEA] text-[#111827] flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Unanswered Question Tracker</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Identifies questions your documentation didn&apos;t cover so your team can fill information gaps immediately.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#E3EDE7] text-[#134235] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">Database Tenant Isolation</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Each company&apos;s data and conversations are isolated by database constraints, ensuring complete privacy.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-[28px] p-7 border border-black/[0.04] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all">
            <div className="w-11 h-11 rounded-2xl bg-[#F8EBE6] text-[#C86D51] flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-2">One-Line Embed Code</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Add a dedicated support widget to any web page or share a direct customer link anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3-Step Process ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 bg-[#ECEAE4]/60 border-y border-[#DDD7CD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              Ready in three simple steps
            </h2>
            <p className="text-sm text-[#52525B] mt-1.5">Simple setup without complex engineering.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[26px] p-6 border border-black/[0.04] shadow-sm">
              <div className="text-3xl font-black text-[#134235] font-mono mb-3">01</div>
              <h3 className="text-base font-bold text-[#111827] mb-1">Add Knowledge</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Paste your website URL or upload documentation files. Content is processed and indexed automatically.
              </p>
            </div>

            <div className="bg-white rounded-[26px] p-6 border border-black/[0.04] shadow-sm">
              <div className="text-3xl font-black text-[#134235] font-mono mb-3">02</div>
              <h3 className="text-base font-bold text-[#111827] mb-1">Get Your Link</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Copy your dedicated chat link or embed snippet to add directly to your website.
              </p>
            </div>

            <div className="bg-white rounded-[26px] p-6 border border-black/[0.04] shadow-sm">
              <div className="text-3xl font-black text-[#134235] font-mono mb-3">03</div>
              <h3 className="text-base font-bold text-[#111827] mb-1">Capture Leads</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Your assistant answers inquiries around the clock, collects qualified leads, and flags unanswered questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Matrix ────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-[#52525B]">
            Start free with 10 chats. Upgrade as your customer volume grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-[28px] p-8 border border-black/[0.04] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Free Trial</h3>
              <p className="text-sm text-[#52525B] mt-1">Try ChatDesk with no card required.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[#111827]">₹0</span>
                <span className="text-xs text-[#6B7280] ml-1">forever</span>
              </div>
              <ul className="space-y-3 text-sm text-[#52525B]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> 10 free chats
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> 1 knowledge source (URL/PDF)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Lead capture with phone encryption
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Full dashboard access
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="tactile-pill-secondary mt-8 w-full py-3 text-center text-sm font-semibold block"
            >
              Start Free
            </Link>
          </div>

          {/* Starter Plan (Most Popular) */}
          <div className="bg-white rounded-[28px] p-8 border-2 border-[#134235] shadow-[0_16px_36px_-10px_rgba(19,66,53,0.18)] flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#134235] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Starter Pack</h3>
              <p className="text-sm text-[#52525B] mt-1">One-time pack. Perfect for testing.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[#111827]">₹49</span>
                <span className="text-xs text-[#6B7280] ml-1">one-time</span>
              </div>
              <ul className="space-y-3 text-sm text-[#52525B]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> 30 additional chats
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Unlimited knowledge sources
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Lead capture with notifications
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Priority support
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="tactile-pill-btn mt-8 w-full py-3 text-center text-sm font-semibold block"
            >
              Buy Starter
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="bg-white rounded-[28px] p-8 border border-black/[0.04] shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Growth Monthly</h3>
              <p className="text-sm text-[#52525B] mt-1">For active websites with regular visitors.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-[#111827]">₹399</span>
                <span className="text-xs text-[#6B7280] ml-1">/month</span>
              </div>
              <ul className="space-y-3 text-sm text-[#52525B]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> 3,000 chats every month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Unlimited knowledge sources
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Low-latency response streaming
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#134235]" /> Export leads to CSV or CRM
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="tactile-pill-secondary mt-8 w-full py-3 text-center text-sm font-semibold block"
            >
              Start Growth
            </Link>
          </div>
        </div>
      </section>

      {/* ── Call To Action Banner ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#134235] text-white rounded-[32px] p-8 sm:p-12 text-center shadow-[0_20px_40px_-15px_rgba(19,66,53,0.4)]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Ready to automate your website support?
          </h2>
          <p className="text-white/90 text-sm sm:text-base max-w-lg mx-auto mb-7">
            Setup takes 2 minutes. Start with 10 free chats with zero card requirements.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-[#134235] font-bold text-sm hover:bg-[#F7F5F0] transition-colors shadow-lg"
          >
            <span>Start Free with 10 Chats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#DDD7CD] py-8 text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-[#134235] text-white flex items-center justify-center text-[10px] font-bold">
              C
            </div>
            <span>© 2026 ChatDesk AI Automation. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#111827] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#111827] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
