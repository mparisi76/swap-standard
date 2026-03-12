export default function AssetCardSkeleton() {
  return (
    <div className="flex flex-col border-[3px] border-zinc-200 bg-white p-5">
      {/* Header: category badge + ID/status cluster */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-6 w-16 bg-zinc-200 animate-pulse" />
        <div className="flex flex-col items-end gap-1">
          <div className="h-3.5 w-20 bg-zinc-200 animate-pulse" />
          <div className="h-3.5 w-14 bg-zinc-200 animate-pulse" />
        </div>
      </div>

      {/* Title block */}
      <div className="mb-4 border-b-2 border-zinc-100 pb-3 space-y-2">
        <div className="h-6 w-3/4 bg-zinc-200 animate-pulse" />
        <div className="h-6 w-1/2 bg-zinc-200 animate-pulse" />
      </div>

      {/* Body: thumbnail + text */}
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0 bg-zinc-200 animate-pulse" />
        <div className="flex flex-col gap-3 flex-1">
          <div className="space-y-1.5">
            <div className="h-3 w-14 bg-zinc-200 animate-pulse" />
            <div className="h-3.5 w-full bg-zinc-200 animate-pulse" />
            <div className="h-3.5 w-4/5 bg-zinc-200 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-14 bg-zinc-200 animate-pulse" />
            <div className="h-3.5 w-full bg-zinc-200 animate-pulse" />
            <div className="h-3.5 w-2/3 bg-zinc-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetFeedSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  );
}
