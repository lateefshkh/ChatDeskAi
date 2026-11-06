// src/components/chat/lead-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadFormProps {
  publicId: string;
  conversationId: string | null;
  onSuccess: () => void;
}

export function LeadForm({ publicId, conversationId, onSuccess }: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please agree to share your contact details.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId,
          conversationId,
          name,
          phone,
          consent,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lead");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-neutral-50 border-t border-neutral-200">
      <p className="text-sm text-neutral-600 mb-3">
        Share your contact details and our team will get back to you.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="lead-name" className="sr-only">Name</Label>
            <Input
              id="lead-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="lead-phone" className="sr-only">Phone</Label>
            <Input
              id="lead-phone"
              placeholder="Phone / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="rounded border-neutral-300"
          />
          I agree to be contacted.
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button type="submit" disabled={loading || !name || !phone} className="w-full" size="sm">
          {loading ? "Sending..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}