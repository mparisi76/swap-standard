"use client";

import { Suspense } from "react";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { DEFAULT_RADIUS_MILES } from "@/lib/constants";

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

function ActiveTagsBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTags = searchParams.getAll("tag");

  if (activeTags.length === 0) return null;

  const removeTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const remaining = params.getAll("tag").filter((t) => t !== tag);
    params.delete("tag");
    remaining.forEach((t) => params.append("tag", t));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("tag");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="px-4 lg:px-6 pb-2 flex items-center gap-2 flex-wrap">
      <span className="text-label font-black uppercase tracking-widest text-zinc-500 shrink-0">
        Tags:
      </span>
      {activeTags.map((tag) => (
        <button
          key={tag}
          onClick={() => removeTag(tag)}
          className="flex items-center gap-1 text-label font-black uppercase tracking-wider px-2 py-1 bg-emerald-700 text-white border-2 border-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
        >
          {tag}
          <X size={10} strokeWidth={3} />
        </button>
      ))}
      {activeTags.length > 1 && (
        <button
          onClick={clearAll}
          className="text-label font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function RadiusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasLocation = Boolean(searchParams.get("lat"));
  const currentRadius = Number(searchParams.get("radius") || DEFAULT_RADIUS_MILES);

  if (!hasLocation) return null;

  const handleRadius = (r: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("radius", String(r));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex w-full lg:w-auto lg:shrink-0 lg:items-center lg:gap-2">
      <span className="hidden lg:block text-label font-black uppercase tracking-widest text-zinc-500 shrink-0">
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
    <div className="sticky top-(--header-height) z-40 bg-[#F9F8F6] border-b-2 border-zinc-200">
      <div className="pt-3 pb-2 px-4 lg:px-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="lg:flex-1">
          <SearchBar />
        </div>
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
        <Suspense fallback={null}>
          <RadiusFilter />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <ActiveTagsBar />
      </Suspense>
    </div>
  );
}
