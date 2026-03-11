"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

function RadiusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasLocation = Boolean(searchParams.get("lat"));
  const currentRadius = Number(searchParams.get("radius") || 10);

  if (!hasLocation) return null;

  const handleRadius = (r: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("radius", String(r));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-t border-zinc-200 pt-2 pb-1 flex items-center gap-3">
      <span className="text-label font-black uppercase tracking-widest text-zinc-400 shrink-0">
        Within:
      </span>
      <div className="flex gap-1">
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => handleRadius(r)}
            className={`text-label font-black uppercase tracking-wider px-3 py-1.5 border-2 transition-all cursor-pointer
              ${currentRadius === r
                ? "bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100"
              }`}
          >
            {r}mi
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ControlBar() {
  return (
    <div className="sticky top-18.25 z-40 bg-[#F9F8F6] border-b border-zinc-200 py-2 shadow-sm">
      <div className="max-w-400 mx-auto px-6">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="shrink-0">
            <FilterBar />
          </div>
        </div>
        <Suspense fallback={null}>
          <RadiusFilter />
        </Suspense>
      </div>
    </div>
  );
}
