import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";
import { Asset, Exchange, ExchangeStatus, DirectMatch, DirectMatchAsset, ChainTrade, ChainTradeAsset } from "@/types/schema";
import { Plus, Globe, ArrowLeftRight, Zap } from "lucide-react";
import { formatDate } from "@/utils/date";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ChainTradeRow from "@/components/dashboard/ChainTradeRow";
import { features } from "@/lib/features";

export const metadata: Metadata = {
  title: "Dashboard | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;



const EXCHANGE_STATUS_BADGE: Record<ExchangeStatus, string> = {
  pending:   "text-amber-600",
  active:    "text-emerald-700",
  completed: "text-zinc-500",
  declined:  "text-zinc-500 opacity-60",
};

const EXCHANGE_STATUS_LABEL: Record<ExchangeStatus, string> = {
  pending:   "Pending",
  active:    "Active",
  completed: "Completed",
  declined:  "Declined",
};

async function getMyAssets(token: string): Promise<Asset[]> {
  const url = new URL(`${BASE_URL}/items/assets`);
  url.searchParams.set("fields", "id,title,type,status,asset_status,date_created,featured_until");
  url.searchParams.set("filter[user_created][_eq]", "$CURRENT_USER");
  url.searchParams.set("sort", "-date_created");
  url.searchParams.set("limit", "50");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as Asset[]) ?? [];
}

async function getMyExchanges(token: string): Promise<Exchange[]> {
  const url = new URL(`${BASE_URL}/items/exchanges`);
  url.searchParams.set(
    "fields",
    "id,status,date_updated,asset.id,asset.title,asset.type,initiator.id,initiator.first_name,initiator.last_name,owner.id,owner.first_name,owner.last_name",
  );
  url.searchParams.set("filter[_and][0][_or][0][initiator][_eq]", "$CURRENT_USER");
  url.searchParams.set("filter[_and][0][_or][1][owner][_eq]", "$CURRENT_USER");
  url.searchParams.set("filter[_and][1][status][_nin]", "completed,declined");
  url.searchParams.set("sort", "-date_updated");
  url.searchParams.set("limit", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as Exchange[]) ?? [];
}

async function getMyMatches(userId: string): Promise<DirectMatch[]> {
  if (!features.directMatches) return [];
  const fields = [
    "id", "match_status", "user_a", "user_b",
    "asset_a.id", "asset_a.title", "asset_a.seeking_tags", "asset_a.user_created.first_name",
    "asset_b.id", "asset_b.title", "asset_b.user_created.first_name",
  ].join(",");
  const url = new URL(`${BASE_URL}/items/direct_matches`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("filter[match_status][_eq]", "suggested");
  url.searchParams.set("filter[_or][0][user_a][_eq]", userId);
  url.searchParams.set("filter[_or][1][user_b][_eq]", userId);
  url.searchParams.set("sort", "-date_created");
  url.searchParams.set("limit", "10");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as DirectMatch[]) ?? [];
}

async function getMyChainTrades(userId: string): Promise<ChainTrade[]> {
  if (!features.chainTrades) return [];
  const fields = [
    "id", "chain_status", "user_a", "user_b", "user_c",
    "accepted_a", "accepted_b", "accepted_c",
    "asset_a.id", "asset_a.title",
    "asset_b.id", "asset_b.title",
    "asset_c.id", "asset_c.title",
  ].join(",");
  const url = new URL(`${BASE_URL}/items/chain_trades`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("filter[chain_status][_in]", "suggested,pending");
  url.searchParams.set("filter[_or][0][user_a][_eq]", userId);
  url.searchParams.set("filter[_or][1][user_b][_eq]", userId);
  url.searchParams.set("filter[_or][2][user_c][_eq]", userId);
  url.searchParams.set("sort", "-date_created");
  url.searchParams.set("limit", "10");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as ChainTrade[]) ?? [];
}

function memberName(user: { first_name: string | null; last_name: string | null }): string {
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Anonymous";
}

export default async function DashboardPage() {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { token, userId } = auth;

  const [items, exchanges, matches, chainTrades] = await Promise.all([
    getMyAssets(token),
    getMyExchanges(token),
    getMyMatches(userId),
    getMyChainTrades(userId),
  ]);

  const published = items.filter((i) => i.status === "published").length;
  const drafts = items.filter((i) => i.status === "draft").length;
  const activeExchanges = exchanges.filter((e) => e.status === "active" || e.status === "pending").length;

  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Member Portal
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900">
            Dashboard
          </h1>
        </header>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link
            href="/dashboard/asset/new"
            className="col-span-2 md:col-span-1 border-4 border-zinc-900 p-6 md:p-8 bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={20} className="mb-3 text-emerald-700 group-hover:text-white transition-colors" />
            <h2 className="text-body font-black uppercase">New Listing</h2>
            <p className="text-detail uppercase mt-1 font-bold opacity-60">
              Share what you can offer
            </p>
          </Link>

          <div className="border-4 border-zinc-900 p-6 md:p-8 bg-white">
            <Globe size={20} className="mb-3 text-zinc-500" />
            <h2 className="text-body font-black uppercase text-zinc-900">Listings</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {published}
            </p>
            <p className="text-detail font-bold uppercase text-zinc-500 mt-1">
              {drafts} draft{drafts !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="border-4 border-zinc-900 p-6 md:p-8 bg-white">
            <ArrowLeftRight size={20} className="mb-3 text-zinc-500" />
            <h2 className="text-body font-black uppercase text-zinc-900">Active Trades</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {activeExchanges}
            </p>
          </div>

          {(features.directMatches || features.chainTrades) && (
            <div className="border-4 border-emerald-600 p-6 md:p-8 bg-white">
              <Zap size={20} className="mb-3 text-emerald-600" />
              <h2 className="text-body font-black uppercase text-zinc-900">Matches</h2>
              <p className="text-[calc(var(--text-header-size)*2)] font-black text-emerald-600 leading-none mt-1">
                {matches.length + chainTrades.length}
              </p>
            </div>
          )}
        </div>

        {/* Active Trades */}
        {exchanges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-label font-black uppercase tracking-widest text-zinc-500 border-b-2 border-zinc-900 pb-4">
              Active Trades
            </h2>

            <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
              {exchanges.map((ex) => {
                const counterparty = ex.owner.id === userId ? ex.initiator : ex.owner;
                return (
                  <Link
                    key={ex.id}
                    href={`/dashboard/exchanges/${ex.id}`}
                    className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    {/* Asset title + counterparty */}
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-black uppercase text-zinc-900 truncate">
                        {ex.asset.title}
                      </p>
                      <p className="text-label font-bold uppercase text-zinc-500">
                        With {memberName(counterparty)}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`text-label font-bold uppercase shrink-0 ${EXCHANGE_STATUS_BADGE[ex.status] ?? "text-zinc-500"}`}>
                      {EXCHANGE_STATUS_LABEL[ex.status]}
                    </span>

                    {/* Date — desktop only */}
                    <span className="font-mono text-label text-zinc-500 shrink-0 hidden md:block">
                      {formatDate(ex.date_updated)}
                    </span>

                    <span className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 shrink-0">
                      Open →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Matches */}
        {(matches.length > 0 || chainTrades.length > 0) && (
          <section className="space-y-4">
            <h2 className="text-label font-black uppercase tracking-widest text-zinc-500 border-b-2 border-zinc-900 pb-4">
              Trade Matches
            </h2>
            <div className="space-y-3">
              {matches.map((match) => {
                const a = match.asset_a as DirectMatchAsset;
                const b = match.asset_b as DirectMatchAsset;
                const isSeeker = match.user_a === userId;
                const theirAsset = isSeeker ? b : a;
                const seekingTag = a?.seeking_tags?.split(",")[0]?.trim() ?? "something";
                const theirName = isSeeker
                  ? (b?.user_created?.first_name ?? "A nearby member")
                  : (a?.user_created?.first_name ?? "A nearby member");
                const description = isSeeker
                  ? `You are looking for a ${seekingTag}. ${theirName} is offering one.`
                  : `${theirName} is looking for a ${seekingTag}. You are offering one.`;
                return (
                  <div
                    key={`dm-${match.id}`}
                    className="border-2 border-emerald-600 bg-emerald-50 p-4 flex gap-4 items-center"
                  >
                    <Zap size={18} className="text-emerald-600 shrink-0" fill="currentColor" strokeWidth={0} />
                    <div className="flex-1 min-w-0">
                      <p className="text-label font-black uppercase text-emerald-700 tracking-widest leading-none mb-1">
                        Direct Match
                      </p>
                      <p className="text-body font-bold text-zinc-900 truncate">{description}</p>
                    </div>
                    <Link href={`/explore/${theirAsset?.id}`} className="text-label font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900 shrink-0">View →</Link>
                    <Link href={`/dashboard/exchanges/new?asset=${theirAsset?.id}`} className="text-label font-black uppercase tracking-widest text-zinc-900 hover:text-emerald-700 shrink-0">Contact →</Link>
                  </div>
                );
              })}
              {chainTrades.map((chain) => {
                const a = chain.asset_a as ChainTradeAsset;
                const b = chain.asset_b as ChainTradeAsset;
                const c = chain.asset_c as ChainTradeAsset;
                const pos = chain.user_a === userId ? "a" : chain.user_b === userId ? "b" : "c";
                const yourAsset = pos === "a" ? a : pos === "b" ? b : c;
                const others = [a, b, c].filter((x) => x?.id !== yourAsset?.id);
                const accepted = pos === "a" ? chain.accepted_a : pos === "b" ? chain.accepted_b : chain.accepted_c;
                return (
                  <ChainTradeRow
                    key={`ct-${chain.id}`}
                    chainId={chain.id}
                    yourAssetTitle={yourAsset?.title ?? "—"}
                    othersDescription={others.map((o) => o?.title).filter(Boolean).join(" → ")}
                    accepted={accepted}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* My Listings */}
        <section className="space-y-4">
          <h2 className="text-label font-black uppercase tracking-widest text-zinc-500 border-b-2 border-zinc-900 pb-4">
            My Listings
          </h2>

          {items.length === 0 ? (
            <div className="border-2 border-zinc-200 bg-white p-10 text-center">
              <p className="text-body font-bold uppercase text-zinc-500">No listings yet.</p>
              <Link
                href="/dashboard/asset/new"
                className="inline-block mt-4 text-label font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-700 hover:text-zinc-900 hover:border-zinc-900 transition-all"
              >
                Add your first listing →
              </Link>
            </div>
          ) : (
            <ListingsTable items={items} />
          )}
        </section>

      </div>
    </main>
  );
}
