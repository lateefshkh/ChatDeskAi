// src/app/(auth)/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Bot, Sparkles, ShieldCheck, TrendingUp, Check } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[1.15fr_1fr] bg-[#F4F3EE] text-[#111827] overflow-x-clip max-w-full">
      {/* ── Left: Tactile 3D Showcase (Trusty Storytelling Theme) ────── */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#ECEAE4] border-r border-[#DDD7CD] relative overflow-hidden">
        {/* Soft Warm Ambient Lighting */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#C86D51]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#134235]/15 blur-3xl pointer-events-none" />

        {/* Top: Logo & Verified Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#134235] flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">
              ChatDesk <span className="text-[#134235] font-semibold">AI Automation</span>
            </span>
          </Link>

          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#E3EDE7] border border-[#C5DCD0] text-xs font-semibold text-[#134235] shadow-sm">
            <span>Verified Grounding</span>
          </span>
        </div>

        {/* Center: Tactile 3D Cards Composition */}
        <div className="relative z-10 my-auto py-8 max-w-lg mx-auto w-full space-y-4">
          {/* Main White Tactile Chat Card */}
          <div className="bg-white rounded-[32px] p-6 border border-black/[0.04] shadow-[0_20px_40px_-12px_rgba(19,66,53,0.06)]">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#F0EFEA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#134235] flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    Acme Support Assistant <Sparkles className="w-3.5 h-3.5 text-[#134235]" />
                  </div>
                  <div className="text-[10px] text-[#6B7280]">Answers strictly from documentation</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#134235] bg-[#E3EDE7] px-2.5 py-0.5 rounded-full border border-[#C5DCD0]">
                Active
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3 mb-3">
              <div className="flex justify-end">
                <div className="bg-[#134235] text-white text-xs rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] shadow-sm">
                  Can you crawl our docs and send visitor leads straight to dashboard?
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#134235] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="bg-[#F8F7F3] border border-[#E5E3DC] text-[#27272A] text-xs rounded-2xl rounded-tl-sm p-3 shadow-sm space-y-1">
                  <p>
                    Yes, documentation indexing is automatic and contact leads are stored securely in your dashboard.
                  </p>
                  <div className="text-[10px] text-[#134235] font-medium bg-[#E3EDE7] px-2 py-0.5 rounded-md inline-block">
                    Source: docs.acme.com/pipeline
                  </div>
                </div>
              </div>
            </div>

            {/* Lead capture notification pill */}
            <div className="bg-[#E3EDE7] border border-[#C5DCD0] rounded-xl p-2.5 flex items-center justify-between text-xs text-[#134235]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#134235]" />
                <span className="font-semibold text-xs">Lead Captured: +91 98765 43210</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-[#134235]">Verified</span>
            </div>
          </div>

          {/* Lower Grid: Terracotta Card + Deep Pine Card */}
          <div className="grid grid-cols-2 gap-4">
            {/* Terracotta Sunset Card */}
            <div className="bg-gradient-to-br from-[#C86D51] via-[#B85D42] to-[#8C3F2B] rounded-[26px] p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                    Analytics
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-2xl font-extrabold font-mono tracking-tight">38.4%</div>
                <div className="text-[10px] text-white/90">Lead Conversion Rate</div>
              </div>
            </div>

            {/* Heritage Pine Card */}
            <div className="bg-gradient-to-br from-[#134235] to-[#0A261E] rounded-[26px] p-5 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                    Security
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#98C7B0]" />
                </div>
                <div className="text-2xl font-extrabold font-mono tracking-tight">100%</div>
                <div className="text-[10px] text-[#98C7B0]">Tenant DB Isolation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-4 border-t border-[#DDD7CD] flex items-center justify-between text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#134235]" /> Verified Sources Only
          </span>
          <span>© 2026 ChatDesk AI Automation</span>
        </div>
      </div>

      {/* ── Right: Auth Form Container (Clean Tactile Light Theme) ──── */}
      <div className="flex flex-col bg-[#F4F3EE] min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden p-5 border-b border-[#DDD7CD] flex items-center justify-between bg-white">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#134235] flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-[#111827] tracking-tight">ChatDesk AI Automation</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.04] shadow-[0_20px_45px_-12px_rgba(19,66,53,0.06)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
