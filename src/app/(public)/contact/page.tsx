import { type Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Lightbulb, Bug } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SwapStandard team — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <main className="flex-1 bg-[#F9F8F6] px-6 py-20">
      <div className="w-full max-w-lg mx-auto">

        <header className="border-b-4 border-zinc-900 pb-8 mb-12">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Get in Touch
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            We want to hear from you
          </h1>
          <p className="text-body text-zinc-600 mt-4 leading-relaxed">
            SwapStandard is built by a small team that genuinely cares about this community. Your feedback, ideas, and bug reports directly shape what gets built next.
          </p>
        </header>

        <div className="space-y-4 mb-10">
          <div className="border-2 border-zinc-200 bg-white p-5 flex gap-4 items-start">
            <Lightbulb size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-label font-black uppercase tracking-widest text-zinc-900 mb-1">Feature Requests</p>
              <p className="text-body text-zinc-500">Have an idea that would make SwapStandard better for your community? Tell us.</p>
            </div>
          </div>
          <div className="border-2 border-zinc-200 bg-white p-5 flex gap-4 items-start">
            <MessageSquare size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-label font-black uppercase tracking-widest text-zinc-900 mb-1">General Feedback</p>
              <p className="text-body text-zinc-500">Love something? Frustrated by something? We read every message.</p>
            </div>
          </div>
          <div className="border-2 border-zinc-200 bg-white p-5 flex gap-4 items-start">
            <Bug size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-label font-black uppercase tracking-widest text-zinc-900 mb-1">Bug Reports</p>
              <p className="text-body text-zinc-500">Found something broken? Let us know and we'll fix it fast.</p>
            </div>
          </div>
        </div>

        <div className="border-4 border-zinc-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-label font-black uppercase tracking-[0.2em] text-zinc-500 block mb-4">
            Drop us a line
          </p>
          <a
            href="mailto:swapstandard@gmail.com"
            className="flex items-center gap-3 text-body font-black text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <Mail size={18} strokeWidth={2.5} className="shrink-0" />
            swapstandard@gmail.com
          </a>
          <p className="text-detail text-zinc-400 mt-4">
            We typically respond within 1–2 business days.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
