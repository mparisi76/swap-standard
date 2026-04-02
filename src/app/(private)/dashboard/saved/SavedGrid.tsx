"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, X, Trash2 } from "lucide-react";
import AssetThumbnail from "@/components/assets/AssetThumbnail";

export interface SavedItem {
  id: number;
  asset: {
    id: number;
    title: string;
    type: string;
    asset_status: string;
    thumbnail: string | null;
    offering: string | null;
    user_created: { first_name: string | null; last_name: string | null } | null;
  };
}

const STATUS_COLOUR: Record<string, string> = {
  available:   "text-emerald-700",
  pending:     "text-amber-600",
  unavailable: "text-zinc-400",
};

export default function SavedGrid({ initialSaves }: { initialSaves: SavedItem[] }) {
  const [saves, setSaves] = useState(initialSaves);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [removing, setRemoving] = useState(false);

  const toggleSelect = (saveId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(saveId) ? next.delete(saveId) : next.add(saveId);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(saves.map((s) => s.id)));
  const clearSelection = () => setSelected(new Set());

  const cancelSelect = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const removeOne = async (saveId: number, assetId: number) => {
    // Optimistic
    setSaves((prev) => prev.filter((s) => s.id !== saveId));
    await fetch(`/api/assets/${assetId}/save`, { method: "POST" });
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    setRemoving(true);
    const ids = [...selected];
    // Optimistic
    setSaves((prev) => prev.filter((s) => !selected.has(s.id)));
    setSelected(new Set());
    setSelecting(false);
    await fetch("/api/saves/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setRemoving(false);
  };

  if (saves.length === 0) {
    return (
      <div className="border-2 border-zinc-200 bg-white p-12 text-center">
        <Heart size={32} className="text-zinc-300 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-body font-black uppercase text-zinc-400">No saved listings yet</p>
        <p className="text-detail text-zinc-400 mt-2">Tap the heart on any listing to save it here.</p>
        <Link
          href="/explore"
          className="inline-block mt-6 px-6 py-3 bg-zinc-900 text-white text-label font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-detail font-bold uppercase text-zinc-500">
          {saves.length} listing{saves.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-4">
          {selecting ? (
            <>
              <button
                onClick={selected.size === saves.length ? clearSelection : selectAll}
                className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                {selected.size === saves.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={removeSelected}
                disabled={selected.size === 0 || removing}
                className="flex items-center gap-2 text-label font-black uppercase tracking-widest px-4 py-2 bg-zinc-900 text-white hover:bg-red-700 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 size={13} strokeWidth={2.5} />
                Remove{selected.size > 0 ? ` (${selected.size})` : ""}
              </button>
              <button
                onClick={cancelSelect}
                className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelecting(true)}
              className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Select
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {saves.map(({ id: saveId, asset }) => {
          const ownerName = asset.user_created
            ? `${asset.user_created.first_name ?? ""} ${asset.user_created.last_name ?? ""}`.trim() || "Member"
            : "Member";
          const isSelected = selected.has(saveId);

          return (
            <div
              key={saveId}
              className={`relative border-2 border-zinc-900 bg-white group transition-shadow ${
                selecting ? "cursor-pointer" : ""
              } ${isSelected ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-zinc-900" : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}
              onClick={selecting ? () => toggleSelect(saveId) : undefined}
            >
              {/* Selection checkbox */}
              {selecting && (
                <div className="absolute top-3 left-3 z-10 w-5 h-5 border-2 border-zinc-900 bg-white flex items-center justify-center">
                  {isSelected && <div className="w-3 h-3 bg-zinc-900" />}
                </div>
              )}

              {/* Remove button (non-select mode) */}
              {!selecting && (
                <button
                  onClick={(e) => { e.preventDefault(); removeOne(saveId, asset.id); }}
                  title="Remove from saved"
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-white border-2 border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}

              <Link href={`/explore/${asset.id}`} className={selecting ? "pointer-events-none" : ""}>
                <div className="relative aspect-4/3 w-full bg-zinc-100 border-b-2 border-zinc-900 overflow-hidden">
                  <AssetThumbnail thumbnail={asset.thumbnail} title={asset.title} />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-label font-black uppercase tracking-wider text-zinc-500">{asset.type}</span>
                    <span className={`text-label font-black uppercase tracking-wider ${STATUS_COLOUR[asset.asset_status] ?? "text-zinc-400"}`}>
                      {asset.asset_status}
                    </span>
                  </div>
                  <h2 className="text-body font-black uppercase italic text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">
                    {asset.title}
                  </h2>
                  {asset.offering && (
                    <p className="text-detail text-zinc-500 line-clamp-2">{asset.offering}</p>
                  )}
                  <p className="text-detail font-bold uppercase text-zinc-400">By {ownerName}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
