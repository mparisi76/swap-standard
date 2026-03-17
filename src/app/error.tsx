"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 bg-[#F9F8F6] flex items-center justify-center px-6">
      <div className="max-w-md w-full border-2 border-zinc-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-zinc-900 px-8 py-5 flex items-center justify-between">
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-500">Status</span>
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-500">Error</span>
        </div>
        <div className="px-8 py-10 space-y-6">
          <div>
            <h1 className="text-header font-black uppercase italic text-zinc-900 leading-none">
              Something went wrong
            </h1>
            <p className="mt-3 text-body text-zinc-500">
              An unexpected error occurred. Try again or return to the home page.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-detail text-zinc-500">
                Ref: {error.digest}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="bg-zinc-900 text-white text-label font-black uppercase tracking-widest px-5 py-3 hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="text-label font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Home →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
