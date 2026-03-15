"use client";

import { Suspense } from "react";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
    <div className="flex w-full lg:w-auto lg:shrink-0 lg:items-center lg:gap-2">
      <span className="hidden lg:block text-label font-black uppercase tracking-widest text-zinc-400 shrink-0">
        Within:
      </span>
      {RADIUS_OPTIONS.map((r) => (
        <button
          key={r}
          onClick={() => handleRadius(r)}
          className={`flex-1 lg:flex-none text-label font-black uppercase tracking-wider px-3 py-2 border-2 transition-all cursor-pointer
            ${currentRadius === r
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100"
            }`}
        >
          {r}mi
        </button>
      ))}
    </div>
  );
}

export default function ControlBar() {
  return (
    <div className="sticky top-(--header-height) z-40 bg-[#F9F8F6] border-b border-zinc-200 shadow-sm">
      <div className="py-3 px-4 lg:px-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="lg:flex-1">
          <SearchBar />
        </div>
        <FilterBar />
        <Suspense fallback={null}>
          <RadiusFilter />
        </Suspense>
      </div>
    </div>
  );
}
