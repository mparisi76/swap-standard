import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { getValidTokenWithUser } from "@/lib/auth";
import SavedGrid, { type SavedItem } from "./SavedGrid";

export const metadata: Metadata = {
  title: "Saved | SwapStandard",
};

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function getSavedAssets(userId: string): Promise<SavedItem[]> {
  const url = new URL(`${BASE_URL}/items/asset_saves`);
  url.searchParams.set("filter[user_created][_eq]", userId);
  url.searchParams.set("fields", "id,asset.id,asset.title,asset.type,asset.asset_status,asset.thumbnail,asset.offering,asset.user_created.first_name,asset.user_created.last_name");
  url.searchParams.set("sort", "-date_created");
  url.searchParams.set("limit", "100");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const { data } = await res.json();
  return (data as SavedItem[]).filter((s) => s.asset !== null) as SavedItem[];
}

export default async function SavedPage() {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");

  const saved = await getSavedAssets(auth.userId);

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>
          <span className="font-mono text-label text-zinc-500 uppercase tracking-widest">
            Saved
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="border-b-4 border-zinc-900 pb-6 mb-10">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Collection
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight flex items-center gap-3">
            Saved Listings
            <Heart size={22} className="text-red-500 fill-red-500" strokeWidth={2} />
          </h1>
        </header>

        <SavedGrid initialSaves={saved} />
      </div>
    </main>
  );
}
