"use client";

export const MODELS = [
  { id: "gemini-flash", name: "Gemini 2.0 Flash" },
  { id: "groq-llama", name: "Groq Llama 3.1" },
  { id: "cerebras-gpt-oss", name: "Cerebras GPT-OSS" },
  { id: "cloudflare-llama", name: "Cloudflare Llama 3.3" },
];

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select AI model"
      className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}