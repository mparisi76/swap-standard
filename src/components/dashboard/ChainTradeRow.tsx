"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

interface Props {
  chainId: number;
  yourAssetTitle: string;
  othersDescription: string;
  accepted: boolean;
}

export default function ChainTradeRow({
  chainId,
  yourAssetTitle,
  othersDescription,
  accepted,
}: Props) {
  return (
    <div className="border-2 border-emerald-600 bg-emerald-50 p-4 flex gap-4 items-center">
      <Zap size={18} className="text-emerald-600 shrink-0" fill="currentColor" strokeWidth={0} />
      <div className="flex-1 min-w-0">
        <p className="text-label font-black uppercase text-emerald-700 tracking-widest leading-none mb-1">
          Chain Trade
        </p>
        <p className="text-body font-bold text-zinc-900 truncate">
          {yourAssetTitle} → {othersDescription}
        </p>
      </div>
      <span className={`text-label font-black uppercase tracking-widest shrink-0 mr-4 ${accepted ? "text-emerald-600" : "text-amber-600"}`}>
        {accepted ? "Accepted" : "Needs action"}
      </span>
      <Link
        href={`/dashboard/chain-trades/${chainId}`}
        className="text-label font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900 shrink-0"
      >
        View →
      </Link>
    </div>
  );
}
