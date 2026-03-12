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
    <div className="flex w-full lg:w-auto lg:gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilter(filter)}
          className={`flex-1 lg:flex-none text-label font-black uppercase tracking-widest px-4 py-2 border-2 transition-all cursor-pointer
            ${currentType === filter
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100"
            }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}