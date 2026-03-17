"use client";

import { SearchX, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  activeSearch?: string;
  activeTags?: string[];
}

export default function EmptyState({ activeSearch, activeTags }: EmptyStateProps) {
  const hasSearch = Boolean(activeSearch?.trim());
  const hasTags = activeTags && activeTags.length > 0;

  const requestUrl = hasSearch
    ? `/contact?type=request&asset=${encodeURIComponent(activeSearch!)}`
    : "/contact?type=request";

  let message: string;
  if (hasSearch && hasTags) {
    message = `No results for "${activeSearch}" tagged ${activeTags!.map((t) => `"${t}"`).join(", ")}.`;
  } else if (hasSearch) {
    message = `No results for "${activeSearch}". Try different terms or broaden your filters.`;
  } else if (hasTags) {
    message = `Nothing tagged ${activeTags!.map((t) => `"${t}"`).join(", ")} in the exchange yet.`;
  } else {
    message = "The exchange is empty at the moment. Check back soon or be the first to list something.";
  }

  return (
    <div className="py-20 text-center border-2 border-dashed border-zinc-300 bg-[#f9f8f6]">
      <div className="max-w-sm mx-auto space-y-6 px-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-white border-2 border-zinc-900 flex items-center justify-center">
            <SearchX className="text-zinc-900" size={24} strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-header font-black uppercase tracking-tighter text-zinc-900 italic">
            Entry not found
          </h3>
          <p className="text-label text-zinc-600 font-medium">{message}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          {(hasSearch || hasTags) && (
            <Link
              href="/explore"
              className="inline-block text-label font-black uppercase tracking-[0.2em] text-white bg-zinc-900 px-6 py-4 border-2 border-zinc-900 hover:bg-emerald-700 transition-all text-center"
            >
              Clear Filters
            </Link>
          )}
          <Link
            href={requestUrl}
            className="group inline-flex items-center justify-center gap-2 text-label font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 transition-colors py-2"
          >
            Submit request
            <ArrowRight
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}