// src/components/auth/delete-account-modal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function DeleteAccountModal({ open, onClose, email }: DeleteAccountModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleDelete() {
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Success - redirect to home page
       router.push("/signup?deleted=1");
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Delete failed. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  // Close modal aur reset state
  function handleClose() {
    if (loading) return;
    setPassword("");
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Delete your account?
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            This will <strong>permanently delete</strong> your account, workspace, knowledge base,
            chats, leads, and all associated data. This action cannot be undone.
          </p>
        </div>

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700">
            <strong>Warning:</strong> All data will be erased immediately. No recovery is possible.
          </p>
        </div>

        {/* Account email display */}
        <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Account to be deleted:</p>
          <p className="text-sm font-medium text-neutral-900">{email}</p>
        </div>

        <div className="space-y-1.5 mb-6">
          <Label htmlFor="confirm-password">
            Enter your password to confirm
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="Your current password"
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter" && password) {
                handleDelete();
              }
            }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={!password || loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Deleting..." : "Delete forever"}
          </Button>
        </div>
      </div>
    </div>
  );
}