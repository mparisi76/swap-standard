import { type Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SwapStandard team for questions, issues, or administrative matters.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 flex items-center justify-center bg-[#F9F8F6] px-6 py-20">
      <div className="w-full max-w-lg">
        <header className="border-b-4 border-zinc-900 pb-8 mb-12">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
            Admin
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            Contact
          </h1>
          <p className="text-body text-zinc-500 mt-4 leading-relaxed">
            Questions, issues, or administrative matters — reach out directly.
          </p>
        </header>

        <div className="border-2 border-zinc-900 bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-label font-black uppercase tracking-[0.2em] text-zinc-400 block mb-4">
            Email
          </span>
          <a
            href="mailto:swapstandard@gmail.com"
            className="flex items-center gap-3 text-body font-black text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <Mail size={18} strokeWidth={2.5} className="shrink-0" />
            swapstandard@gmail.com
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-label font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
