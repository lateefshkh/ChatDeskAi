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
    <div className="sticky top-4 z-40 mx-4 max-w-6xl lg:mx-auto">
      <header className="bg-[#FAF9F5]/90 backdrop-blur-xl border border-[#DDD7CD] rounded-full px-5 py-2.5 shadow-[0_10px_30px_-10px_rgba(19,66,53,0.06)] relative">
        <div className="h-11 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#134235] flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#111827]">
              ChatDesk <span className="text-[#134235] font-semibold">AI Automation</span>
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
          <div className="md:hidden absolute top-16 left-0 right-0 mt-2 bg-[#FAF9F5] border border-[#DDD7CD] rounded-3xl shadow-xl overflow-hidden z-30 p-3 space-y-1">
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
  );
}
