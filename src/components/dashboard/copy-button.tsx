// src/components/dashboard/copy-button.tsx
"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        copied
          ? "bg-[#E3EDE7] text-[#134235] border-[#C5DCD0]"
          : "bg-white text-[#134235] border-[#DDD7CD] hover:bg-[#F4F1EA]"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}