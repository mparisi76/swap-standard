"use client";

import { useRef, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { updateAssetStatusAction } from "@/app/actions/assets/update-status";
import { type AssetStatus } from "@/types/schema";

const STATUS_STYLES: Record<AssetStatus, string> = {
  available:   "text-emerald-700",
  pending:     "text-amber-600",
  unavailable: "text-zinc-400",
};

export default function AssetStatusSelect({
  assetId,
  current,
}: {
  assetId: number;
  current: AssetStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    });
  };

  return (
    <form ref={formRef} action={updateAssetStatusAction}>
      <input type="hidden" name="assetId" value={assetId} />
      <div className="relative inline-flex items-center">
        <select
          name="asset_status"
          defaultValue={current}
          onChange={handleChange}
          disabled={isPending}
          className={`appearance-none text-label font-bold uppercase bg-transparent border-0 outline-none cursor-pointer disabled:opacity-50 pr-5 ${STATUS_STYLES[current]}`}
        >
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <ChevronDown size={10} className={`absolute right-0 pointer-events-none ${STATUS_STYLES[current]}`} />
      </div>
    </form>
  );
}
