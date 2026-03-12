/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Asset } from "@/types/schema";

const STATUS_STYLES: Record<string, string> = {
  available: "text-emerald-700",
  pending:   "text-amber-600",
  unavailable: "text-zinc-400",
};

export default function AssetCard({ asset }: { asset: Asset }) {
  const isOffering = Boolean(asset.offering);
  const isSeeking = Boolean(asset.seeking);
  const isSwap = isOffering && isSeeking;
  const isActive = asset.asset_status === "available";

  return (
    <Link
      href={`/explore/${asset.id}`}
      className={`group flex flex-col border-2 border-zinc-900 bg-white p-5 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        ${!isActive ? "opacity-60" : ""}
        ${isSwap && isActive ? "border-l-4 border-l-emerald-600" : ""}`}
    >
      {/* 1. Header: Category Badge & Metadata Cluster */}
      <div className="flex justify-between items-start mb-3">
        <span className="bg-zinc-900 text-white text-label font-black px-2 py-1 uppercase tracking-wider">
          {asset.type || "General"}
        </span>
        <div className="flex flex-col items-end font-mono text-label text-zinc-500 leading-none gap-1 text-right">
          <span>ID—{String(asset.id).padStart(6, "0")}</span>
          <span className={`uppercase font-bold italic ${STATUS_STYLES[asset.asset_status] ?? "text-zinc-400"}`}>
            {asset.asset_status || "available"}
          </span>
          {asset.distance_miles != null && (
            <span className="text-emerald-700 font-black not-italic">
              {asset.distance_miles < 1
                ? `<1 mi`
                : `${Math.round(asset.distance_miles)} mi`}
            </span>
          )}
        </div>
      </div>

      {/* 2. Title Block: Full Width, No Constraints */}
      <div className="mb-4 border-b-2 border-zinc-900 pb-3">
        <h3 className="font-black uppercase text-header italic leading-tight text-zinc-900">
          {asset.title}
        </h3>
      </div>

      {/* 3. Data Body: Thumbnail and Logistics side-by-side */}
      <div className="flex gap-4">
        {/* Grungy Thumbnail Wrap (Now Color) */}
        <div className="w-24 h-24 shrink-0 border-2 border-zinc-900 bg-zinc-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[8px] px-1 font-mono uppercase z-10">
            IMG
          </div>
          {asset.thumbnail ? (
            <img
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${asset.thumbnail}?width=200`}
              alt={asset.title}
              // Color image, subtle zoom on hover
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-zinc-300 uppercase">
              Empty
            </div>
          )}
        </div>

        {/* Text Logistics */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {isOffering && (
            <div className="flex flex-col">
              <span className="text-label font-black uppercase text-zinc-400 leading-none mb-1">
                Offered:
              </span>
              <p className="text-detail font-medium text-zinc-900 leading-tight line-clamp-2">
                {asset.offering || "—"}
              </p>
            </div>
          )}
          {isSeeking && (
            <div className="flex flex-col">
              <span className="text-label font-black uppercase text-zinc-400 leading-none mb-1">
                Seeking:
              </span>
              <p className="text-detail font-bold text-emerald-900 leading-tight line-clamp-2">
                {asset.seeking || "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}