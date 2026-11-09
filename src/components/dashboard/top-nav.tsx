// src/components/dashboard/top-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

// ✅ YEH EXPORT HONA CHAHIYE: export function TopNav
export function TopNav({ email, isAdmin }: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-4 z-30 mx-4 max-w-6xl lg:mx-auto">
      <header className="bg-card rounded-[26px] shadow-sm relative">
        
        <div className="px-6 h-16 flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-ink tracking-tight">
            ChatDesk
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-background text-ink"
                      : "text-text hover:text-ink hover:bg-background/50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-red-50 text-red-600"
                    : "text-red-500 hover:bg-red-50"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <AccountMenu email={email} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-background text-text transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 mt-2 bg-card border border-divider rounded-[26px] shadow-lg overflow-hidden z-20">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(({ label, href }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-background text-ink"
                        : "text-text hover:text-ink hover:bg-background/50"
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
                  className={`block px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-red-50 text-red-600"
                      : "text-red-500 hover:bg-red-50"
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