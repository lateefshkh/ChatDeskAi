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
  onSkip: () => void; // <-- NAYA PROP
}

export function LeadForm({ publicId, conversationId, onSuccess, onSkip }: LeadFormProps) {
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
    <div className="p-4 bg-[#F8F7F3] rounded-2xl border border-[#EDECE6]">
      <p className="text-xs font-medium text-[#111827] mb-3">
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
              className="bg-white border-[#DDD7CD] rounded-full text-xs text-[#111827]"
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
              className="bg-white border-[#DDD7CD] rounded-full text-xs text-[#111827]"
            />
          </div>
        </div>
        
        <label className="flex items-center gap-2 text-xs text-[#6B7280]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="rounded border-[#DDD7CD] text-[#134235] focus:ring-[#134235]"
          />
          I agree to be contacted.
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="flex-1 rounded-full text-xs font-semibold border-[#DDD7CD] hover:bg-white text-[#111827]"
            disabled={loading}
          >
            Continue chatting
          </Button>
          <Button
            type="submit"
            disabled={loading || !name || !phone}
            className="flex-1 rounded-full text-xs font-semibold bg-[#134235] hover:bg-[#0D2F25] text-white"
          >
            {loading ? "Sending..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}