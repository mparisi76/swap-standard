import { Fragment } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Zap, ArrowRight } from "lucide-react";
import { getValidTokenWithUser } from "@/lib/auth";
import ChainTradeActions from "./ChainTradeActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chain Trade | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

const FIELDS = [
  "id", "chain_status", "user_a", "user_b", "user_c",
  "accepted_a", "accepted_b", "accepted_c",
  "asset_a.id", "asset_a.title", "asset_a.offering", "asset_a.seeking", "asset_a.thumbnail",
  "asset_a.user_created.id", "asset_a.user_created.first_name", "asset_a.user_created.last_name",
  "asset_b.id", "asset_b.title", "asset_b.offering", "asset_b.seeking", "asset_b.thumbnail",
  "asset_b.user_created.id", "asset_b.user_created.first_name", "asset_b.user_created.last_name",
  "asset_c.id", "asset_c.title", "asset_c.offering", "asset_c.seeking", "asset_c.thumbnail",
  "asset_c.user_created.id", "asset_c.user_created.first_name", "asset_c.user_created.last_name",
].join(",");

interface AssetDetail {
  id: number;
  title: string;
  offering: string | null;
  seeking: string | null;
  thumbnail: string | null;
  user_created: { id: string; first_name: string | null; last_name: string | null } | null;
}

interface ChainTradeDetail {
  id: number;
  chain_status: string;
  user_a: string;
  user_b: string;
  user_c: string;
  accepted_a: boolean;
  accepted_b: boolean;
  accepted_c: boolean;
  asset_a: AssetDetail;
  asset_b: AssetDetail;
  asset_c: AssetDetail;
}

function memberName(user: { first_name: string | null; last_name: string | null } | null): string {
  if (!user) return "Member";
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Member";
}

function AssetCard({ asset, accepted, isYou }: { asset: AssetDetail; accepted: boolean; isYou: boolean }) {
  return (
    <div className={`border-4 p-6 space-y-4 h-full ${isYou ? "border-zinc-900 bg-emerald-50" : "border-zinc-300 bg-white"}`}>
      {asset.thumbnail && (
        <img
          src={`${DIRECTUS_URL}/assets/${asset.thumbnail}?width=400&height=300&fit=cover`}
          alt={asset.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div>
        {isYou && (
          <span className="text-label font-black uppercase tracking-widest text-emerald-700 block mb-1">
            Your listing
          </span>
        )}
        <h3 className="text-body font-black uppercase text-zinc-900">{asset.title}</h3>
        <p className="text-label font-bold text-zinc-500 uppercase mt-0.5">
          {memberName(asset.user_created)}
        </p>
      </div>
      {asset.offering && (
        <div>
          <p className="text-label font-black uppercase text-zinc-500 mb-1">Offering</p>
          <p className="text-body text-zinc-900">{asset.offering}</p>
        </div>
      )}
      {asset.seeking && (
        <div>
          <p className="text-label font-black uppercase text-zinc-500 mb-1">Seeking</p>
          <p className="text-body font-bold text-zinc-900 border-l-4 border-emerald-600 pl-4">{asset.seeking}</p>
        </div>
      )}
      <div className="pt-2">
        <Link
          href={`/explore/${asset.id}`}
          className="text-label font-black uppercase tracking-widest text-emerald-700 hover:text-zinc-900"
        >
          View listing →
        </Link>
      </div>
      <div className={`text-label font-black uppercase tracking-widest ${accepted ? "text-emerald-600" : "text-amber-600"}`}>
        {accepted ? "✓ Accepted" : "Pending acceptance"}
      </div>
    </div>
  );
}

export default async function ChainTradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { userId } = auth;

  const res = await fetch(
    `${BASE_URL}/items/chain_trades/${id}?fields=${FIELDS}`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );

  if (!res.ok) notFound();
  const json = await res.json();
  const chain = json.data as ChainTradeDetail;

  // Verify user is part of this trade
  if (chain.user_a !== userId && chain.user_b !== userId && chain.user_c !== userId) {
    notFound();
  }

  const pos = chain.user_a === userId ? "a" : chain.user_b === userId ? "b" : "c";
  const accepted = pos === "a" ? chain.accepted_a : pos === "b" ? chain.accepted_b : chain.accepted_c;

  const slots: Array<{ asset: AssetDetail; accepted: boolean; pos: "a" | "b" | "c" }> = [
    { asset: chain.asset_a, accepted: chain.accepted_a, pos: "a" },
    { asset: chain.asset_b, accepted: chain.accepted_b, pos: "b" },
    { asset: chain.asset_c, accepted: chain.accepted_c, pos: "c" },
  ];

  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        <header className="border-b-4 border-zinc-900 pb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-emerald-600" fill="currentColor" strokeWidth={0} />
            <span className="text-label font-black uppercase tracking-[0.3em] text-emerald-700">
              Chain Trade
            </span>
          </div>
          <h1 className="text-header font-black uppercase italic text-zinc-900">
            3-Way Trade Opportunity
          </h1>
          <p className="text-body text-zinc-500 mt-2">
            Each member gives their listing to the next — everyone gets what they&apos;re looking for.
          </p>
        </header>

        {/* Trade chain visualization */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {slots.map(({ asset, accepted: slotAccepted, pos: slotPos }, i) => (
            <Fragment key={asset.id}>
              <div className="flex-1">
                <AssetCard
                  asset={asset}
                  accepted={slotAccepted}
                  isYou={slotPos === pos}
                />
              </div>
              {i < 2 && (
                <div className="hidden md:flex justify-center items-center shrink-0 px-2">
                  <ArrowRight size={28} className="text-emerald-600" strokeWidth={2.5} />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <ChainTradeActions
          chainId={chain.id}
          position={pos}
          accepted={accepted}
          chainStatus={chain.chain_status}
          partners={slots
            .filter((s) => s.pos !== pos)
            .map((s) => ({
              firstName: s.asset.user_created?.first_name ?? null,
              assetTitle: s.asset.title,
            }))}
        />

      </div>
    </main>
  );
}
