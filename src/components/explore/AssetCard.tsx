/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Asset } from "@/types/schema";

export default function AssetCard({ asset }: { asset: Asset }) {
  const isOffering = Boolean(asset.offering);
  const isSeeking  = Boolean(asset.seeking);
  const isSwap     = isOffering && isSeeking;
  const isActive   = asset.asset_status === "available";

  return (
    <Link
      href={`/explore/${asset.id}`}
      className={`group flex flex-col border-2 border-zinc-900 bg-white transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        ${!isActive ? "opacity-60" : ""}
        ${isSwap && isActive ? "border-l-4 border-l-emerald-600" : ""}`}
    >
      {/* Image — full width, fixed aspect ratio */}
      <div className="relative aspect-4/3 w-full bg-zinc-100 border-b-2 border-zinc-900 overflow-hidden">
        {asset.thumbnail ? (
          <img
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${asset.thumbnail}?width=600&height=450&fit=cover`}
            alt={asset.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-label text-zinc-300 uppercase tracking-widest">
            No Image
          </div>
        )}

        {/* Type badge — overlaid bottom-left */}
        <span className="absolute bottom-0 left-0 bg-zinc-900 text-white text-label font-black px-2 py-1 uppercase tracking-wider">
          {asset.type || "General"}
        </span>

        {/* Distance — overlaid bottom-right */}
        {asset.distance_miles != null && (
          <span className="absolute bottom-0 right-0 bg-white border-l-2 border-t-2 border-zinc-900 text-label font-black px-2 py-1 text-emerald-700">
            {asset.distance_miles < 1 ? "<1 mi" : `${Math.round(asset.distance_miles)} mi`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-black uppercase italic leading-tight text-header text-zinc-900">
          {asset.title}
        </h3>

        {(isOffering || isSeeking) && (
          <div className="border-t-2 border-zinc-100 pt-2 flex flex-col gap-1.5">
            {isOffering && (
              <p className="text-detail text-zinc-600 leading-tight line-clamp-2">
                <span className="font-black uppercase text-zinc-600">Offering: </span>
                {asset.offering}
              </p>
            )}
            {asset.offering_tags && asset.offering_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.offering_tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-zinc-300 text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {isSeeking && (
              <p className="text-detail text-zinc-600 leading-tight line-clamp-2">
                <span className="font-black uppercase text-zinc-600">Seeking: </span>
                {asset.seeking}
              </p>
            )}
            {asset.seeking_tags && asset.seeking_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.seeking_tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-emerald-300 text-emerald-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
