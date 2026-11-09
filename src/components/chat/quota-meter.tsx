export function QuotaMeter({ used, total }: { used: number; total: number }) {
  const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const isExhausted = used >= total;

  return (
    <div className="flex items-center gap-3" role="status" aria-label={`Quota: ${used} of ${total} used`}>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isExhausted ? "bg-error" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-text/70">{used}/{total}</span>
    </div>
  );
}