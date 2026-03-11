"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentType = searchParams.get("type") || "all";
  const filters = ["all", "goods", "skills", "services"];

  return (
    <div className="sticky top-18.25 z-40 bg-[#F9F8F6] border-zinc-200 py-4">
      <div className="max-w-400 mx-auto px-6 flex gap-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilter(filter)}
            className={`text-label font-black uppercase tracking-widest px-6 py-3 border-2 transition-all cursor-pointer
              ${
                currentType === filter
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}