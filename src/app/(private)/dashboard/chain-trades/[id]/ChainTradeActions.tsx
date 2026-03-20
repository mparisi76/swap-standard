"use client";

import { useTransition } from "react";
import { respondToChainTrade } from "@/app/actions/chain-trades/respond";
import { completeChainTrade } from "@/app/actions/chain-trades/complete";

interface Partner {
  firstName: string | null;
  assetTitle: string;
}

interface Props {
  chainId: number;
  position: "a" | "b" | "c";
  accepted: boolean;
  chainStatus: string;
  partners: Partner[];
}

export default function ChainTradeActions({ chainId, position, accepted, chainStatus, partners }: Props) {
  const [isPending, startTransition] = useTransition();

  if (chainStatus === "declined") {
    return (
      <div className="border-4 border-zinc-300 bg-white p-6 text-center">
        <p className="text-body font-black uppercase text-zinc-500">This trade has been declined.</p>
      </div>
    );
  }

  if (chainStatus === "completed") {
    return (
      <div className="border-4 border-emerald-600 bg-emerald-50 p-6 text-center">
        <p className="text-body font-black uppercase text-emerald-700">Trade completed.</p>
      </div>
    );
  }

  if (chainStatus === "pending") {
    return (
      <div className="border-4 border-emerald-600 bg-emerald-50 p-6 space-y-6">
        <div>
          <p className="text-label font-black uppercase tracking-widest text-emerald-700 mb-2">All members accepted</p>
          <p className="text-body text-zinc-700">
            Everyone is in. Reach out to your trade partners to coordinate. Once goods or services have changed hands, mark the trade as complete.
          </p>
        </div>
        <div className="space-y-2">
          {partners.map((p, i) => (
            <div key={i} className="border-2 border-emerald-200 bg-white px-4 py-3">
              <p className="text-label font-black uppercase text-zinc-500">{p.firstName ?? "Member"}</p>
              <p className="text-body font-bold text-zinc-900">{p.assetTitle}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => startTransition(() => completeChainTrade(chainId))}
          disabled={isPending}
          className="w-full bg-zinc-900 text-white font-black uppercase tracking-[0.2em] py-4 text-label hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Mark as Completed"}
        </button>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="border-4 border-zinc-300 bg-white p-6">
        <p className="text-label font-black uppercase tracking-widest text-emerald-700 mb-2">You&apos;ve accepted</p>
        <p className="text-body text-zinc-500">
          Waiting for the other members to accept. You&apos;ll receive an email once everyone is in.
        </p>
      </div>
    );
  }

  return (
    <div className="border-4 border-zinc-900 bg-white p-6 space-y-4">
      <h2 className="text-body font-black uppercase text-zinc-900">Your Response</h2>
      <p className="text-body text-zinc-500">
        Accepting this trade is not a commitment — it simply lets the other members know you&apos;re interested and opens the door for a conversation. You can work out the details directly before anything changes hands.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => startTransition(() => respondToChainTrade(chainId, position, true))}
          disabled={isPending}
          className="flex-1 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] py-4 text-label hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Accept Trade"}
        </button>
        <button
          onClick={() => startTransition(() => respondToChainTrade(chainId, position, false))}
          disabled={isPending}
          className="border-4 border-zinc-300 bg-white text-zinc-500 font-black uppercase tracking-[0.2em] py-4 px-8 text-label hover:border-zinc-900 hover:text-zinc-900 transition-all disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
