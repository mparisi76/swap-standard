"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center group/share">
      <button
        onClick={handleShare}
        className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
      >
        {copied
          ? <Check size={18} strokeWidth={2.5} className="text-emerald-700" />
          : <Share2 size={18} strokeWidth={2.5} />
        }
      </button>
      {!copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap pointer-events-none opacity-0 group-hover/share:opacity-100 transition-opacity">
          Copy link
        </div>
      )}
    </div>
  );
}
