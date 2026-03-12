"use client";

import { useEffect, useState } from "react";
import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Asset } from "@/types/schema";
import Link from "next/link";
import { getRecentIds } from "@/utils/recent-storage";
import AssetCard from "@/components/explore/AssetCard";

export default function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<Asset[]>([]);
  const [totalInHistory, setTotalInHistory] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedIds = getRecentIds();
        const filteredIds = storedIds.filter(
          (id) => String(id) !== String(currentId),
        );

        setTotalInHistory(filteredIds.length);
        const idsToFetch = filteredIds.slice(0, 6);

        if (idsToFetch.length === 0) {
          setHasChecked(true);
          return;
        }

        const response = await directus.request(
          readItems("assets", {
            filter: { id: { _in: idsToFetch.map(Number) } },
            fields: [
              "id",
              "title",
              "type",
              "offering",
              "seeking",
              "thumbnail",
              "asset_status",
            ] as unknown as (keyof Asset)[],
          }),
        ) as unknown as Asset[];

        const data: Asset[] = Array.isArray(response) ? response : [];

        const sorted = [...data].sort(
          (a: Asset, b: Asset) =>
            idsToFetch.indexOf(String(a.id)) - idsToFetch.indexOf(String(b.id)),
        );

        setItems(sorted);
      } catch (error) {
        console.error("RecentlyViewed Error:", error);
      } finally {
        setHasChecked(true);
      }
    };

    fetchHistory();
  }, [currentId]);

  if (!hasChecked || items.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 mt-12 border-t-2 border-zinc-900 pt-16 pb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-header font-bold uppercase tracking-tighter text-zinc-900 italic">
            Recently Viewed
          </h2>
        </div>

        {totalInHistory > items.length && (
          <Link
            href="/history"
            className="text-label font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-700 pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-all"
          >
            View All ({totalInHistory})
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <AssetCard key={item.id} asset={item} />
        ))}
      </div>
    </section>
  );
}
