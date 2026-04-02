"use client";

import { useActionState, useState } from "react";
import { Flag, X } from "lucide-react";
import { flagAssetAction } from "@/app/actions/assets/flag";

const REASONS = [
  { value: "spam", label: "Spam or scam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "unavailable", label: "Already traded / no longer available" },
  { value: "wrong_category", label: "Wrong category" },
  { value: "other", label: "Other" },
];

export default function FlagButton({
  assetId,
  assetTitle,
}: {
  assetId: number;
  assetTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(flagAssetAction, null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Report this listing"
        className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
      >
        <Flag size={18} strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-zinc-900">
              <span className="text-label font-black uppercase tracking-[0.2em] text-zinc-900">
                Report Listing
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {state?.success ? (
              <div className="px-6 py-10 text-center space-y-4">
                <p className="text-body font-black uppercase text-zinc-900">
                  Report Received
                </p>
                <p className="text-detail text-zinc-500 leading-relaxed">
                  Thanks for letting us know. We review all reports and take action when needed.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form action={formAction} className="px-6 py-6 space-y-5">
                <input type="hidden" name="assetId" value={assetId} />
                <input type="hidden" name="assetTitle" value={assetTitle} />

                {state?.error && (
                  <p className="text-detail font-black uppercase tracking-widest text-red-600">
                    {state.error}
                  </p>
                )}

                <div className="space-y-2">
                  <label className="text-detail font-black uppercase tracking-widest text-zinc-500 block">
                    Reason
                  </label>
                  <div className="space-y-2">
                    {REASONS.map((r) => (
                      <label
                        key={r.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          required
                          className="accent-zinc-900 cursor-pointer"
                        />
                        <span className="text-body text-zinc-700 group-hover:text-zinc-900 transition-colors">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-detail font-black uppercase tracking-widest text-zinc-500 block">
                    Additional notes <span className="font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    maxLength={500}
                    placeholder="Any details that might help us review..."
                    className="w-full border-2 border-zinc-300 focus:border-zinc-900 px-3 py-2 text-body outline-none resize-none placeholder:text-zinc-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-zinc-900 text-white py-4 text-label font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
