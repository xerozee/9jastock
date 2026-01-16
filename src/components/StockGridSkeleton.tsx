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
          className="bg-gray-100 dark:bg-slate-800 animate-pulse h-40 rounded-2xl"
        />
      ))}
    </div>
  );
}
