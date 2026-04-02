"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User dismissed — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      title="Share listing"
      className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
    >
      {copied
        ? <Check size={18} strokeWidth={2.5} className="text-emerald-700" />
        : <Share2 size={18} strokeWidth={2.5} />
      }
    </button>
  );
}
