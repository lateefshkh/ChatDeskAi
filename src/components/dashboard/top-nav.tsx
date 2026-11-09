// src/components/dashboard/top-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bot, Menu, X } from "lucide-react";
import { AccountMenu } from "@/components/auth/account-menu";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Chat", href: "/chat" },
  { label: "Sources", href: "/sources" },
  { label: "Chats", href: "/chats" },
  { label: "Leads", href: "/leads" },
  { label: "Pricing", href: "/pricing" },
];

interface TopNavProps {
  email: string;
  isAdmin: boolean;
}

export function TopNav({ email, isAdmin }: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <header className="bg-[#FAF9F5]/95 backdrop-blur-md border border-[#DDD7CD] rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-[0_12px_32px_-8px_rgba(19,66,53,0.12),0_2px_6px_rgba(0,0,0,0.04)] relative">
          <div className="h-10 sm:h-11 flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#134235] flex items-center justify-center text-white shadow-sm shrink-0">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#111827]">
                ChatDesk<span className="hidden sm:inline text-[#134235] font-semibold ml-1">AI Automation</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#ECEAE4]/60 p-1 rounded-full border border-[#DDD7CD]">
              {navItems.map(({ label, href }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#134235] text-white shadow-sm"
                        : "text-[#6B7280] hover:text-[#111827] hover:bg-white/50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-red-600 text-white shadow-sm"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right side: Account Menu */}
            <div className="flex items-center gap-2">
              <AccountMenu email={email} />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-black/5 text-[#18181B] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#FAF9F5] border border-[#DDD7CD] rounded-3xl shadow-xl overflow-hidden z-30 p-3 space-y-1">
              <nav className="space-y-1">
                {navItems.map(({ label, href }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors ${
                        active
                          ? "bg-[#134235] text-white"
                          : "text-[#6B7280] hover:text-[#111827] hover:bg-black/5"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-red-600 text-white"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}
