// src/components/auth/account-menu.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteAccountModal } from "@/components/auth/delete-account-modal";

interface AccountMenuProps {
  email: string;
}

export function AccountMenu({ email }: AccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      // Force full page reload to clear all React state and browser memory
      window.location.href = "/login?loggedout=1";
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-medium flex items-center justify-center">
          {email.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-[180px] truncate">{email}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Click-away overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-neutral-200 shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-neutral-100">
              <p className="text-xs text-neutral-500">Signed in as</p>
              <p className="text-sm font-medium text-neutral-900 truncate">{email}</p>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                setShowDeleteModal(true);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100 disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </>
      )}

      {/* Delete account modal */}
      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        email={email}
      />
    </div>
  );
}