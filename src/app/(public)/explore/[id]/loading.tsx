import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-200 ${className ?? ""}`} />;
}

export default function AssetDetailLoading() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">
      {/* Breadcrumb bar */}
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-500"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Explore
          </Link>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left — gallery */}
          <div className="md:col-span-5 space-y-4">
            <div className="border-2 border-zinc-900 bg-zinc-100 aspect-square w-full animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border-2 border-zinc-200 bg-zinc-100 aspect-square animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right — detail */}
          <div className="md:col-span-7 space-y-10">
            <header>
              {/* Status */}
              <Skeleton className="h-3 w-20 mb-3" />

              {/* Title */}
              <div className="border-b-4 border-zinc-900 pb-6 space-y-2">
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-3/4" />
              </div>

              {/* Category + Date */}
              <div className="flex gap-10 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-4.5 h-4.5 bg-zinc-200 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4.5 h-4.5 bg-zinc-200 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </header>

            {/* Offering */}
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Seeking */}
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-24" />
              <div className="border-l-4 border-zinc-200 pl-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Button */}
            <div className="pt-6">
              <div className="w-full bg-zinc-200 animate-pulse h-14 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
