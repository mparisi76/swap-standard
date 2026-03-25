"use client";

import { useTransition } from "react";
import { unpublishFlaggedAssetAction, dismissFlagAction } from "@/app/actions/admin/flags";

export function UnpublishButton({ assetId }: { assetId: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => unpublishFlaggedAssetAction(assetId))}
      className="text-label font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? "Archiving..." : "Archive"}
    </button>
  );
}

export function DismissButton({ flagId }: { flagId: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => dismissFlagAction(flagId))}
      className="text-label font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? "Dismissing..." : "Dismiss"}
    </button>
  );
}
