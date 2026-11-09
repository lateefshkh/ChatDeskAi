"use client";

interface Source {
  id: string;
  label: string;
  status: "queued" | "scraping" | "chunking" | "ready" | "failed";
}

export function ChatSidebar({ sources }: { sources: Source[] }) {
  return (
    <aside
      className="w-64 border-r border-border bg-card h-full overflow-y-auto"
      aria-label="Knowledge sources"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold">Sources</h2>
      </div>
      <ul className="p-2 space-y-1" role="list">
        {sources.map((source) => (
          <li
            key={source.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary text-sm"
          >
            <span className="truncate">{source.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                source.status === "ready"
                  ? "bg-success/20 text-success"
                  : source.status === "failed"
                  ? "bg-error/20 text-error"
                  : "bg-warning/20 text-warning"
              }`}
            >
              {source.status}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}