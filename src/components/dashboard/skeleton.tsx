// src/components/dashboard/skeleton.tsx
// Reusable skeleton primitives for dashboard loading states

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-neutral-200 animate-pulse rounded ${className}`} />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* card header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <Skeleton className="h-4 w-32" />
      </div>
      {/* rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-14 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="px-5 py-3.5 flex items-center gap-4 border-b border-neutral-100 last:border-0">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <Skeleton className="h-4 w-32" />
      </div>
      {/* header row */}
      <div className="px-5 py-2.5 flex gap-4 bg-neutral-50 border-b border-neutral-100">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24 flex-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      {/* data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonPageHeader({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`mb-6 space-y-2 ${wide ? "flex items-center justify-between" : ""}`}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3.5 w-52" />
      </div>
      {wide && <Skeleton className="h-9 w-24 rounded-lg" />}
    </div>
  );
}

export function SkeletonSourceRow() {
  return (
    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-16 ml-4 rounded" />
    </div>
  );
}
