"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { type AssetStatus } from "@/types/schema";

const STATUS_STYLES: Record<AssetStatus, string> = {
  available:   "text-emerald-700",
  pending:     "text-amber-600",
  unavailable: "text-zinc-500",
};

export default function AssetStatusSelect({
  assetId,
  current,
  onStatusChange,
}: {
  assetId: number;
  current: AssetStatus;
  onStatusChange?: (next: AssetStatus) => void;
}) {
  const [value, setValue] = useState<AssetStatus>(current);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as AssetStatus;
    setValue(next);
    onStatusChange?.(next);
    await fetch(`/api/assets/${assetId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_status: next }),
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={handleChange}
        className={`appearance-none text-label font-bold uppercase bg-transparent border-0 outline-none cursor-pointer pr-5 ${STATUS_STYLES[value]}`}
      >
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="unavailable">Unavailable</option>
      </select>
      <ChevronDown size={10} className={`absolute right-0 pointer-events-none ${STATUS_STYLES[value]}`} />
    </div>
  );
}
