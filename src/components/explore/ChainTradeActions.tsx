"use client";

import { useState } from "react";
import { Loader } from "lucide-react";
import { acceptChainTradeAction, declineChainTradeAction } from "@/app/actions/chain-trades/accept";

interface Props {
  chainTradeId: number;
  position: "a" | "b" | "c";
  assetId: number;
  hasAccepted: boolean;
}

export default function ChainTradeActions({ chainTradeId, position, assetId, hasAccepted }: Props) {
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(hasAccepted);
  const [error, setError] = useState<string | null>(null);

  if (accepted) {
    return (
      <span className="text-label font-black uppercase tracking-widest text-emerald-700">
        Accepted
      </span>
    );
  }

  const handleAccept = async () => {
    setPending(true);
    setError(null);
    const result = await acceptChainTradeAction(chainTradeId, position);
    setPending(false);
    if ("error" in result) setError(result.error);
    else setAccepted(true);
  };

  const handleDecline = async () => {
    setPending(true);
    setError(null);
    const result = await declineChainTradeAction(chainTradeId, position, assetId);
    setPending(false);
    if ("error" in result) setError(result.error);
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={pending}
          className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 bg-zinc-900 text-white border-2 border-zinc-900 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {pending ? <Loader size={10} className="animate-spin" /> : "Accept"}
        </button>
        <button
          onClick={handleDecline}
          disabled={pending}
          className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 bg-white text-zinc-900 border-2 border-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Decline
        </button>
      </div>
      {error && (
        <p className="text-detail font-bold text-red-600 uppercase">{error}</p>
      )}
    </div>
  );
}
