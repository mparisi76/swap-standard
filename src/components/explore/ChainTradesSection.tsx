import { features } from "@/lib/features";
import { ChainTrade, ChainTradeAsset } from "@/types/schema";
import { ArrowRight, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";
import ChainTradeActions from "./ChainTradeActions";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function fetchChainTrades(assetId: number): Promise<ChainTrade[]> {
  const fields = [
    "id", "chain_status",
    "user_a", "user_b", "user_c",
    "accepted_a", "accepted_b", "accepted_c",
    "asset_a.id", "asset_a.title", "asset_a.location_label", "asset_a.user_created.id", "asset_a.user_created.first_name", "asset_a.user_created.last_name",
    "asset_b.id", "asset_b.title", "asset_b.location_label", "asset_b.user_created.id", "asset_b.user_created.first_name", "asset_b.user_created.last_name",
    "asset_c.id", "asset_c.title", "asset_c.location_label", "asset_c.user_created.id", "asset_c.user_created.first_name", "asset_c.user_created.last_name",
  ].join(",");

  const url = new URL(`${BASE_URL}/items/chain_trades`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("filter[chain_status][_in]", "suggested,pending");
  url.searchParams.set("filter[_or][0][asset_a][_eq]", String(assetId));
  url.searchParams.set("filter[_or][1][asset_b][_eq]", String(assetId));
  url.searchParams.set("filter[_or][2][asset_c][_eq]", String(assetId));
  url.searchParams.set("limit", "5");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function userName(user: { first_name: string | null; last_name: string | null } | null): string {
  if (!user) return "Member";
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Member";
}

interface Props {
  assetId: number;
  currentUserId: string | null;
}

export default async function ChainTradesSection({ assetId, currentUserId }: Props) {
  if (!features.chainTrades || !currentUserId) return null;

  const chains = await fetchChainTrades(assetId);
  if (chains.length === 0) return null;

  return (
    <div className="space-y-3">
      {chains.map((chain) => {
        const a = chain.asset_a as ChainTradeAsset;
        const b = chain.asset_b as ChainTradeAsset;
        const c = chain.asset_c as ChainTradeAsset;

        const userPosition =
          currentUserId === chain.user_a ? "a"
          : currentUserId === chain.user_b ? "b"
          : currentUserId === chain.user_c ? "c"
          : null;

        const acceptedMap = { a: chain.accepted_a, b: chain.accepted_b, c: chain.accepted_c };
        const acceptedCount = [chain.accepted_a, chain.accepted_b, chain.accepted_c].filter(Boolean).length;
        const userMustAct = userPosition && !acceptedMap[userPosition];

        return (
          <div
            key={chain.id}
            className={`border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${userMustAct ? "border-emerald-600" : "border-zinc-900"}`}
          >
            {/* Header bar */}
            <div className={`px-4 py-2 flex items-center justify-between ${userMustAct ? "bg-emerald-600" : "bg-zinc-900"}`}>
              <div className="flex items-center gap-1.5">
                <Link2 size={12} className="text-white" strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">
                  {userMustAct ? "Chain Trade Available — Action Required" : "Chain Trade Available"}
                </span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">
                {acceptedCount}/3
              </span>
            </div>

            <div className={`px-4 py-3 flex items-center gap-3 ${userMustAct ? "bg-emerald-50" : "bg-white"}`}>
              {/* Chain diagram — all inline */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {([
                  { asset: a, accepted: chain.accepted_a },
                  { asset: b, accepted: chain.accepted_b },
                  { asset: c, accepted: chain.accepted_c },
                ] as const).map(({ asset, accepted }, idx) => (
                  <div key={idx} className="contents">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-0.5 truncate">
                        {userName(asset?.user_created ?? null)}
                      </p>
                      <Link
                        href={`/explore/${asset?.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-detail font-bold text-zinc-900 hover:text-emerald-700 transition-colors group truncate"
                      >
                        <span className="truncate">{asset?.title ?? "—"}</span>
                        <ExternalLink size={10} className="shrink-0 text-zinc-500 group-hover:text-emerald-600" />
                      </Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 border border-zinc-900 shrink-0 ${accepted ? "bg-emerald-500" : "bg-white"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${accepted ? "text-emerald-600" : "text-zinc-500"}`}>
                          {accepted ? "Accepted" : "Waiting"}
                        </span>
                      </div>
                      {asset?.location_label && (
                        <p className="text-[10px] text-zinc-600 truncate mt-0.5">{asset.location_label}</p>
                      )}
                    </div>
                    {idx < 2 && <ArrowRight size={20} className="text-zinc-500 shrink-0 mx-2" strokeWidth={2} />}
                  </div>
                ))}
              </div>

              {/* Action buttons inline */}
              {!currentUserId && (
                <div className="shrink-0 border-l-2 border-zinc-200 pl-3">
                  <Link
                    href={`/login?callbackUrl=/explore/${assetId}`}
                    className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-700 transition-colors whitespace-nowrap"
                  >
                    Log in to accept
                  </Link>
                </div>
              )}
              {userMustAct && (
                <div className="shrink-0 border-l-2 border-emerald-200 pl-3">
                  <ChainTradeActions
                    chainTradeId={chain.id}
                    position={userPosition}
                    assetId={assetId}
                    hasAccepted={false}
                  />
                </div>
              )}
              {userPosition && !userMustAct && (
                <div className="shrink-0 border-l-2 border-zinc-100 pl-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                    Accepted
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
