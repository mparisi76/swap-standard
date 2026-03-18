"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Trash2, Star, X } from "lucide-react";
import { Asset } from "@/types/schema";
import { formatDate } from "@/utils/date";
import { duplicateAssetAction } from "@/app/actions/assets/duplicate";
import { deleteAssetAction } from "@/app/actions/assets/delete";
import AssetStatusSelect from "./AssetStatusSelect";
import PublishStatusSelect from "./PublishStatusSelect";

function FeatureButton({ assetId, featuredUntil }: { assetId: number; featuredUntil?: string | null }) {
  const [loading, setLoading] = useState(false);
  const isActive = featuredUntil && new Date(featuredUntil) > new Date();

  if (isActive) {
    return (
      <span className="text-label font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1 shrink-0">
        <Star size={11} fill="currentColor" />
        Featured until {formatDate(featuredUntil!)}
      </span>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-label font-black uppercase tracking-wider text-zinc-500 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
    >
      <Star size={11} />
      {loading ? "..." : "Feature"}
    </button>
  );
}

function FeaturedPromo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("featured_promo_dismissed")) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem("featured_promo_dismissed", "1");
    setVisible(false);
  };

  return (
    <div className="border-2 border-emerald-700 bg-emerald-50 p-4 flex gap-4 items-start">
      <Star size={18} className="text-emerald-700 shrink-0 mt-0.5" fill="currentColor" strokeWidth={0} />
      <div className="flex-1 min-w-0">
        <p className="text-body font-black uppercase text-emerald-900">Featured Listings</p>
        <p className="text-detail text-emerald-800 mt-1 leading-relaxed">
          Feature a published listing to pin it to the top of the explore feed and show a Featured badge for <span className="font-black">7 days</span>. Great for items you want more eyes on fast.
        </p>
      </div>
      <button onClick={dismiss} className="text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

const TYPE_FILTERS = ["all", "goods", "skills", "services"] as const;
const STATUS_FILTERS = ["all", "published", "draft", "archived"] as const;

type TypeFilter = typeof TYPE_FILTERS[number];
type StatusFilter = typeof STATUS_FILTERS[number];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-label font-black uppercase tracking-widest px-3 py-1.5 border-2 transition-colors cursor-pointer
        ${active
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
        }`}
    >
      {children}
    </button>
  );
}

export default function ListingsTable({ items }: { items: Asset[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = items.filter((item) => {
    const typeMatch = typeFilter === "all" || item.type === typeFilter;
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    const searchMatch = !search.trim() || item.title.toLowerCase().includes(search.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || search.trim() !== "";

  return (
    <div className="space-y-4">
      <FeaturedPromo />
      {/* Search */}
      <div className="flex border-2 border-zinc-900 bg-white">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="flex-1 px-4 py-2.5 text-body outline-none placeholder:text-zinc-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="px-4 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-500 shrink-0">Type</span>
          <div className="flex gap-1">
            {TYPE_FILTERS.map((f) => (
              <FilterPill key={f} active={typeFilter === f} onClick={() => setTypeFilter(f)}>
                {f}
              </FilterPill>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-mono text-detail uppercase tracking-widest text-zinc-500 shrink-0">Status</span>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <FilterPill key={f} active={statusFilter === f} onClick={() => setStatusFilter(f)}>
                {f}
              </FilterPill>
            ))}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
            className="text-detail font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-zinc-200 bg-white p-10 text-center">
          <p className="text-body font-bold uppercase text-zinc-500">No listings match these filters.</p>
        </div>
      ) : (
        <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 px-4 md:px-6 py-4 hover:bg-zinc-50 transition-colors"
            >
              {/* Title + type — always visible */}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-body font-black uppercase text-zinc-900 truncate">{item.title}</p>
                  <p className="text-label font-bold uppercase text-zinc-500">{item.type}</p>
                </div>
                {/* Actions — top right on mobile */}
                <div className="flex md:hidden items-center gap-4 shrink-0">
                  <Link href={`/dashboard/asset/${item.id}/edit`} className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                    Edit
                  </Link>
                  {item.status === "published" && (
                    <Link href={`/explore/${item.id}`} className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                      View →
                    </Link>
                  )}
                  <form action={deleteAssetAction}>
                    <input type="hidden" name="assetId" value={item.id} />
                    <button
                      type="submit"
                      title="Delete"
                      onClick={(e) => { if (!confirm(`Delete "${item.title}"?`)) e.preventDefault(); }}
                      className="text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Status selects — inline row on mobile */}
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <PublishStatusSelect assetId={item.id} current={item.status} />
                </div>
                <div className="shrink-0">
                  <AssetStatusSelect assetId={item.id} current={item.asset_status} />
                </div>
                <span className="font-mono text-label text-zinc-500 shrink-0 hidden md:block">
                  {formatDate(item.date_created)}
                </span>
              </div>

              {/* Actions — desktop only */}
              <div className="hidden md:flex items-center gap-4 shrink-0">
                <Link href={`/dashboard/asset/${item.id}/edit`} className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                  Edit
                </Link>
                {item.status === "published" && (
                  <Link href={`/explore/${item.id}`} className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                    View →
                  </Link>
                )}
                {item.status === "published" && (
                  <FeatureButton assetId={item.id} featuredUntil={item.featured_until} />
                )}
                <form action={duplicateAssetAction}>
                  <input type="hidden" name="assetId" value={item.id} />
                  <button type="submit" title="Duplicate" className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
                    <Copy size={14} />
                  </button>
                </form>
                <form action={deleteAssetAction}>
                  <input type="hidden" name="assetId" value={item.id} />
                  <button
                    type="submit"
                    title="Delete"
                    onClick={(e) => { if (!confirm(`Delete "${item.title}"?`)) e.preventDefault(); }}
                    className="text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-mono text-detail text-zinc-500 text-right">
        {filtered.length} of {items.length} listings
      </p>
    </div>
  );
}
