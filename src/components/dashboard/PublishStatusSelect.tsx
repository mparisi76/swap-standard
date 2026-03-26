"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { type DirectusStatus } from "@/types/schema";

const STATUS_STYLES: Record<DirectusStatus, string> = {
  published: "bg-emerald-700 text-white",
  draft:     "bg-zinc-200 text-zinc-600",
  archived:  "bg-zinc-900 text-white",
};

export default function PublishStatusSelect({
  assetId,
  current,
  onStatusChange,
}: {
  assetId: number;
  current: DirectusStatus;
  onStatusChange?: (next: DirectusStatus) => void;
}) {
  const [value, setValue] = useState<DirectusStatus>(current);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as DirectusStatus;
    setValue(next);
    onStatusChange?.(next);
    await fetch(`/api/assets/${assetId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  };

  return (
    <div className={`relative inline-flex items-center ${STATUS_STYLES[value]}`}>
      <select
        value={value}
        onChange={handleChange}
        className="appearance-none text-label font-black uppercase tracking-wider pl-2 pr-6 py-1 cursor-pointer border-0 outline-none bg-transparent"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <ChevronDown size={10} className="absolute right-1.5 pointer-events-none" />
    </div>
  );
}
