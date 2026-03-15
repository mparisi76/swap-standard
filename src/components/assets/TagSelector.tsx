"use client";

import { useRef, useState } from "react";
import { ALL_TAGS } from "@/lib/tags";
import { suggestTagAction } from "@/app/actions/tags/suggest";
import { X } from "lucide-react";

const MAX_TAGS = 5;

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  name: string;
  placeholder?: string;
}

export default function TagSelector({ selected, onChange, name, placeholder = "Type to search tags…" }: TagSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [suggested, setSuggested] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim().length === 0
    ? []
    : ALL_TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(query.toLowerCase()) &&
          !selected.includes(tag),
      ).slice(0, 8);

  const atLimit = selected.length >= MAX_TAGS;

  const add = (tag: string) => {
    if (atLimit) return;
    onChange([...selected, tag]);
    setQuery("");
    setOpen(false);
  };

  const remove = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  const handleSuggest = async () => {
    const term = query.trim();
    if (!term) return;
    await suggestTagAction(term);
    setSuggested(term);
    setQuery("");
    setOpen(false);
  };

  const trimmedQuery = query.trim();
  const exactMatch = ALL_TAGS.some((t) => t.toLowerCase() === trimmedQuery.toLowerCase());
  const showSuggest = open && trimmedQuery.length > 0 && !exactMatch;
  const noResults = showSuggest && filtered.length === 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-label font-black uppercase tracking-wider px-2 py-1 bg-zinc-900 text-white border-2 border-zinc-900"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={10} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      {atLimit ? (
        <p className="text-detail font-bold text-zinc-400 uppercase tracking-wide">
          Max {MAX_TAGS} tags
        </p>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setSuggested(null); }}
          onFocus={() => query.trim().length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full border-2 border-zinc-900 px-4 py-3 text-body text-zinc-900 placeholder:text-zinc-300 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white"
        />
      )}

      {/* Dropdown — results + optional suggest */}
      {(open && filtered.length > 0) || noResults ? (
        <ul className="absolute z-10 top-full left-0 right-0 border-2 border-t-0 border-zinc-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {noResults && (
            <li className="px-4 pt-3 pb-1">
              <p className="text-detail text-zinc-400 italic">
                No matching tags for &ldquo;{trimmedQuery}&rdquo;.
              </p>
            </li>
          )}
          {filtered.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={() => add(tag)}
                className="w-full text-left px-4 py-3 text-body text-zinc-900 font-bold hover:bg-zinc-100 transition-colors cursor-pointer border-b border-zinc-100"
              >
                {tag}
              </button>
            </li>
          ))}
          {showSuggest && (
            <li>
              <button
                type="button"
                onMouseDown={handleSuggest}
                className="w-full text-left px-4 py-3 text-label font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer border-t border-zinc-200"
              >
                + Suggest &ldquo;{trimmedQuery}&rdquo; as a tag
              </button>
            </li>
          )}
        </ul>
      ) : null}

      {/* Suggestion confirmed */}
      {suggested && (
        <p className="mt-1.5 text-detail font-bold text-emerald-700 uppercase tracking-wide">
          &ldquo;{suggested}&rdquo; submitted for review — thanks.
        </p>
      )}

      {/* Hidden inputs for form submission */}
      {selected.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
    </div>
  );
}
