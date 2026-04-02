"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SaveButton({
  assetId,
  initialSaved,
  isLoggedIn,
}: {
  assetId: number;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setPending(true);
    const res = await fetch(`/api/assets/${assetId}/save`, { method: "POST" });
    if (res.ok) {
      const { saved: newSaved } = await res.json();
      setSaved(newSaved);
    }
    setPending(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={saved ? "Remove from saved" : "Save listing"}
      className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
    >
      <Heart
        size={18}
        strokeWidth={2.5}
        className={saved ? "fill-red-500 text-red-500" : ""}
      />
    </button>
  );
}
