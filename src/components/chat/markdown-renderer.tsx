// src/components/chat/markdown-renderer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-xs text-[#18181B] prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-[#18181B] prose-strong:text-[#18181B] prose-a:text-[#0D4B37] prose-a:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // ✅ Table ko scrollable wrapper mein daalo
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-3 rounded-lg border border-[#EDECE6]">
              <table className="min-w-full text-left text-[11px] border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#F4F3EE]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 font-semibold text-[#18181B] border-b border-[#EDECE6] whitespace-nowrap" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-b border-[#EDECE6] whitespace-nowrap" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}