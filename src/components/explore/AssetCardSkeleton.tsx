export default function AssetCardSkeleton() {
  return (
    <div className="flex flex-col border-2 border-zinc-900 bg-white">
      {/* Image area */}
      <div className="relative aspect-4/3 w-full bg-zinc-100 border-b-2 border-zinc-200 animate-pulse">
        {/* Type badge */}
        <div className="absolute bottom-0 left-0 h-6 w-14 bg-zinc-200" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="h-5 w-3/4 bg-zinc-200 animate-pulse" />
          <div className="h-5 w-1/2 bg-zinc-200 animate-pulse" />
        </div>

        {/* Offering / Seeking rows */}
        <div className="border-t-2 border-zinc-100 pt-2 flex flex-col gap-3">
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-zinc-100 animate-pulse" />
            <div className="h-3 w-4/5 bg-zinc-100 animate-pulse" />
            {/* Tag pills */}
            <div className="flex gap-1 pt-0.5">
              <div className="h-4 w-12 bg-zinc-100 animate-pulse" />
              <div className="h-4 w-16 bg-zinc-100 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-zinc-100 animate-pulse" />
            <div className="h-3 w-2/3 bg-zinc-100 animate-pulse" />
            <div className="flex gap-1 pt-0.5">
              <div className="h-4 w-14 bg-zinc-100 animate-pulse" />
              <div className="h-4 w-10 bg-zinc-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetFeedSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  );
}
