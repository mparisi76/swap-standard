"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UnsubscribeContent() {
  const params = useSearchParams();
  const success = params.get("success") === "true";
  const error = params.get("error");

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-6">
      <div className="w-full max-w-md border-4 border-zinc-900 bg-[#F9F8F6] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-zinc-900 px-8 py-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            SwapStandard
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            {success ? "Unsubscribed" : "Something went wrong"}
          </h1>
        </div>
        <div className="px-8 py-8 space-y-4">
          {success && (
            <p className="text-body text-zinc-600 leading-relaxed">
              You've been unsubscribed from SwapStandard email notifications. You won't receive match or trade alerts going forward.
            </p>
          )}
          {error && (
            <p className="text-body text-zinc-600 leading-relaxed">
              This unsubscribe link is invalid or has already been used. If you're still receiving emails, contact us.
            </p>
          )}
          <Link
            href="/explore"
            className="inline-block border-2 border-zinc-900 bg-white text-zinc-900 text-label font-black uppercase tracking-widest px-6 py-3 hover:bg-zinc-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Back to Exchange
          </Link>
        </div>
      </div>
    </div>
  );
}
