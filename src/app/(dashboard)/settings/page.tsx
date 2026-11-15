// src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Lock,
  CreditCard,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DeleteAccountModal } from "@/components/auth/delete-account-modal";

interface UsageData {
  planId: string | null;
  planName: string;
  quotaMonthlyChats: number;
  quotaUsedChats: number;
  quotaPeriodStart: string | null;
  sourcesCount: number;
  messagesCount: number;
  storageBytes: number;
}

interface PaymentRow {
  id: string;
  amountPaise: number;
  status: string;
  createdAt: string;
  razorpayPaymentId: string | null;
}

export default function SettingsPage() {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Account
  const [userName, setUserName] = useState("");
  const [originalUserName, setOriginalUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [originalTenantName, setOriginalTenantName] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Security
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Plan & Usage
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  // Danger
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        const rawText = await res.text();

        if (!rawText || rawText.trim() === "") {
          throw new Error(`Empty response (HTTP ${res.status})`);
        }

        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `Non-JSON response (HTTP ${res.status}): ${rawText.slice(0, 200)}`
          );
        }

        if (!res.ok) throw new Error(data?.error || "Failed to load settings");

        setUserName(data.userName || "");
        setOriginalUserName(data.userName || "");
        setUserEmail(data.userEmail || "");
        setTenantName(data.tenantName || "");
        setOriginalTenantName(data.tenantName || "");
        setUsage(data.usage);
        setPayments(data.payments || []);
      } catch (e: any) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Save Account ──────────────────────────────────────────────────
  async function onSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setAccountMsg(null);
    setSavingAccount(true);
    try {
      const res = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          tenantName: tenantName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");

      setOriginalUserName(userName.trim());
      setOriginalTenantName(tenantName.trim());
      setAccountMsg({ type: "ok", text: "Account updated" });
      router.refresh();
    } catch (err: any) {
      setAccountMsg({ type: "err", text: err.message });
    } finally {
      setSavingAccount(false);
    }
  }

  // ── Change Password ───────────────────────────────────────────────
  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 10) {
      setPwdMsg({ type: "err", text: "Password must be at least 10 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "err", text: "Passwords do not match" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to change password");

      setPwdMsg({ type: "ok", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Close after 2 seconds
      setTimeout(() => {
        setPasswordOpen(false);
        setPwdMsg(null);
      }, 2000);
    } catch (err: any) {
      setPwdMsg({ type: "err", text: err.message });
    } finally {
      setSavingPassword(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAmount(paise: number): string {
    return `₹${(paise / 100).toFixed(2)}`;
  }

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0D4B37]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  const accountDirty =
    userName.trim() !== originalUserName.trim() ||
    tenantName.trim() !== originalTenantName.trim();

  const usagePct =
    usage && usage.quotaMonthlyChats > 0
      ? Math.min(100, Math.round((usage.quotaUsedChats / usage.quotaMonthlyChats) * 100))
      : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[#0D4B37] hover:underline mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">Settings</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Manage your account, security, and plan.
        </p>
      </div>

      {/* ── 1. ACCOUNT ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[#0D4B37]" />
          <h2 className="text-sm font-bold text-[#18181B]">Account</h2>
        </div>
        <form onSubmit={onSaveAccount} className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18181B]">Name</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={100}
              className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18181B]">Email</label>
            <input
              value={userEmail}
              readOnly
              disabled
              className="w-full px-4 py-2.5 bg-[#F0EFE9] border border-[#E4E2DC] rounded-2xl text-xs text-[#71717A] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#A1A1AA]">Email cannot be changed.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18181B]">Workspace Name</label>
            <input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="My Workspace"
              required
              maxLength={100}
              className="w-full px-4 py-2.5 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
            />
          </div>

          {accountMsg && (
            <div className={`flex items-center gap-1.5 text-xs ${accountMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>
              {accountMsg.type === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{accountMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={savingAccount || !accountDirty}
            className="tactile-pill-btn px-5 py-2 text-xs font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {savingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{savingAccount ? "Saving..." : "Save Changes"}</span>
          </button>
        </form>
      </div>

      {/* ── 2. SECURITY (Collapsible + Hidden Passwords) ───────── */}
      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-[#0D4B37]" />
          <h2 className="text-sm font-bold text-[#18181B]">Security</h2>
        </div>

        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setPasswordOpen(!passwordOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl hover:bg-[#F0EFE9] transition-colors"
        >
          <span className="text-xs font-semibold text-[#18181B]">Change Password</span>
          {passwordOpen ? (
            <ChevronUp className="w-4 h-4 text-[#71717A]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#71717A]" />
          )}
        </button>

        {/* Collapsible content */}
        {passwordOpen && (
          <form onSubmit={onChangePassword} className="space-y-3 mt-3">
            {/* Current password */}
            <div className="relative">
              <input
                type={showCurrentPwd ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-10 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
                aria-label={showCurrentPwd ? "Hide password" : "Show password"}
              >
                {showCurrentPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* New password */}
            <div className="relative">
              <input
                type={showNewPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 10 characters)"
                required
                minLength={10}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-10 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
                aria-label={showNewPwd ? "Hide password" : "Show password"}
              >
                {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={10}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-10 bg-[#F9F8F5] border border-[#E4E2DC] rounded-2xl text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0D4B37] focus:ring-2 focus:ring-[#0D4B37]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
                aria-label={showConfirmPwd ? "Hide password" : "Show password"}
              >
                {showConfirmPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {pwdMsg && (
              <div className={`flex items-center gap-1.5 text-xs ${pwdMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>
                {pwdMsg.type === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPasswordOpen(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPwdMsg(null);
                }}
                disabled={savingPassword}
                className="px-4 py-2 text-xs font-semibold text-[#71717A] border border-[#E4E2DC] rounded-full hover:bg-[#F9F8F5] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="tactile-pill-btn px-5 py-2 text-xs font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{savingPassword ? "Changing..." : "Change Password"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── 3. PLAN & USAGE ────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[#0D4B37]" />
          <h2 className="text-sm font-bold text-[#18181B]">Plan & Usage</h2>
        </div>

        {usage && (
          <>
            <div className="bg-[#F9F8F5] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#71717A] uppercase tracking-wide">Current Plan</p>
                  <p className="text-sm font-bold text-[#18181B] mt-0.5">{usage.planName}</p>
                </div>
                {usage.quotaPeriodStart && (
                  <div className="text-right">
                    <p className="text-[11px] text-[#71717A]">Renews</p>
                    <p className="text-xs font-semibold text-[#18181B]">{formatDate(usage.quotaPeriodStart)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-[#18181B]">Chat Messages</span>
                  <span className="text-[11px] text-[#71717A]">
                    {usage.quotaUsedChats} / {usage.quotaMonthlyChats}
                  </span>
                </div>
                <div className="h-2 bg-[#F0EFE9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D4B37] transition-all"
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F9F8F5] rounded-2xl p-3">
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wide">Sources</p>
                  <p className="text-sm font-bold text-[#18181B] mt-0.5">{usage.sourcesCount}</p>
                </div>
                <div className="bg-[#F9F8F5] rounded-2xl p-3">
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wide">Messages</p>
                  <p className="text-sm font-bold text-[#18181B] mt-0.5">{usage.messagesCount}</p>
                </div>
              </div>

              <div className="bg-[#F9F8F5] rounded-2xl p-3">
                <p className="text-[10px] text-[#71717A] uppercase tracking-wide">Storage</p>
                <p className="text-sm font-bold text-[#18181B] mt-0.5">{formatBytes(usage.storageBytes)}</p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="tactile-pill-btn inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold mb-4"
            >
              <span>Upgrade Plan</span>
            </Link>

            <div>
              <p className="text-[11px] font-semibold text-[#18181B] mb-2">Payment History</p>
              {payments.length === 0 ? (
                <p className="text-[11px] text-[#A1A1AA]">No payments yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-[#F9F8F5] rounded-xl px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#18181B]">{formatAmount(p.amountPaise)}</p>
                        <p className="text-[10px] text-[#71717A]">{formatDate(p.createdAt)}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.status === "captured" || p.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : p.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 4. DANGER ZONE ─────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] p-8 border border-red-200 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
        </div>
        <p className="text-xs text-[#71717A] mb-4">
          Deleting your account will permanently remove your workspace, sources, chunks, and all data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2 text-xs font-semibold text-red-600 border border-red-300 rounded-full hover:bg-red-50 transition-colors"
        >
          Delete Account
        </button>
      </div>

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        email={userEmail}
      />
    </div>
  );
}