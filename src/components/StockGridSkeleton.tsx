'use client';

interface StockGridSkeletonProps {
  count?: number;
}

export default function StockGridSkeleton({ count = 4 }: StockGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="scifi-card overflow-hidden"
        >
          <div className="p-5 space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-20 skeleton-scifi rounded" />
                <div className="h-4 w-32 skeleton-scifi rounded" />
              </div>
              <div className="h-10 w-10 skeleton-scifi rounded-lg" />
            </div>

            {/* Price skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-28 skeleton-scifi rounded" />
              <div className="h-4 w-16 skeleton-scifi rounded" />
            </div>
          </div>

          {/* Bottom accent line animation */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
