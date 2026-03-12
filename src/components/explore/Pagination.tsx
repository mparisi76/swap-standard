"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
}: {
  currentPage: number;
  totalCount: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // Build page window: always show first, last, current ±1
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center gap-1 justify-center pt-10 border-t-2 border-zinc-900 mt-10">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 border-2 border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center font-mono text-label text-zinc-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`w-9 h-9 border-2 text-label font-black transition-all cursor-pointer
              ${p === currentPage
                ? "bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 border-2 border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        aria-label="Next page"
      >
        <ChevronRight size={14} strokeWidth={2.5} />
      </button>

      <span className="ml-4 font-mono text-label text-zinc-400 uppercase tracking-widest">
        {totalCount} entries
      </span>
    </div>
  );
}
