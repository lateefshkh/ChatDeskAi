"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
      <div ref={modalRef} tabIndex={-1} className="bg-surface border border-border rounded-xl p-6 max-w-md w-full">
        <h2 id="upgrade-title" className="text-lg font-semibold mb-2">Chat limit reached</h2>
        <p className="text-sm text-text/70 mb-4">
          You&apos;ve used all your free chats. Upgrade to continue.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { window.location.href = "/pricing"; }}>View plans</Button>
        </div>
      </div>
    </div>
  );
}