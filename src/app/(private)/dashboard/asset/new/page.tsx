import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewAssetForm from "./NewAssetForm";

export const metadata: Metadata = {
  title: "New Listing | SwapStandard",
};

export default function NewAssetPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">

      {/* Breadcrumb */}
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>
          <span className="font-mono text-label text-zinc-500 uppercase tracking-widest">
            New Entry
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="border-b-4 border-zinc-900 pb-8 mb-12">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Listings
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            New Listing
          </h1>
          <p className="text-body text-zinc-500 mt-4 leading-relaxed">
            Share what you have. State what you need. Your community is the network.
          </p>
        </header>

        <NewAssetForm />
      </div>
    </main>
  );
}
