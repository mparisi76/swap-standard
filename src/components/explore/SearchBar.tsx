"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // We read the current search term directly from the URL.
  const initialValue = searchParams.get("search") || "";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Extract the value directly from the form event
    const formData = new FormData(e.currentTarget);
    const value = formData.get("search") as string;
    
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      key={initialValue} // This forces the input to reset if the URL changes externally
      className="flex h-[38px] border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center px-3 text-zinc-400">
        {/* Hard-locked size so the icon doesn't scale with text */}
        <Search size={20} strokeWidth={2.5} />
      </div>
      <input
        name="search"
        defaultValue={initialValue}
        placeholder="Search for tools, skills, or items..."
        /* Swapped text-sm for text-body to hook into the scaler */
        className="flex-1 px-2 text-body font-bold uppercase tracking-wide outline-none text-zinc-900 placeholder:text-zinc-300"
      />
      <button 
        type="submit"
        /* Swapped text-xs for text-label */
        className="px-6 bg-zinc-900 text-white font-black uppercase tracking-widest text-label hover:bg-emerald-700 transition-colors cursor-pointer"
      >
        Find
      </button>
    </form>
  );
}