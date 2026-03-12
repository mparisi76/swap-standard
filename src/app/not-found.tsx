"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 bg-[#F9F8F6] flex items-center justify-center px-6">
      <div className="max-w-md w-full border-2 border-zinc-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-zinc-900 px-8 py-5 flex items-center justify-between">
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-400">Status</span>
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-400">404</span>
        </div>
        <div className="px-8 py-10 space-y-6">
          <div>
            <h1 className="text-header font-black uppercase italic text-zinc-900 leading-none">
              Not Found
            </h1>
            <p className="mt-3 text-body text-zinc-500">
              This resource is not in the registry. It may have been removed or the address is incorrect.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white text-label font-black uppercase tracking-widest px-5 py-3 hover:bg-zinc-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
