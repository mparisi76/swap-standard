import { features } from "@/lib/features";
import { DirectMatch, DirectMatchAsset } from "@/types/schema";
import { ArrowLeftRight, ExternalLink } from "lucide-react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function fetchDirectMatches(assetId: number): Promise<DirectMatch[]> {
  const fields = [
    "id", "match_status", "user_a", "user_b", "accepted_a", "accepted_b",
    "asset_a.id", "asset_a.title", "asset_a.location_label", "asset_a.user_created.id", "asset_a.user_created.first_name", "asset_a.user_created.last_name",
    "asset_b.id", "asset_b.title", "asset_b.location_label", "asset_b.user_created.id", "asset_b.user_created.first_name", "asset_b.user_created.last_name",
  ].join(",");

  const url = new URL(`${BASE_URL}/items/direct_matches`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("filter[match_status][_eq]", "suggested");
  url.searchParams.set("filter[_or][0][asset_a][_eq]", String(assetId));
  url.searchParams.set("filter[_or][1][asset_b][_eq]", String(assetId));
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

export default async function DirectMatchSection({ assetId, currentUserId }: Props) {
  if (!features.directMatches || !currentUserId) return null;

  const matches = await fetchDirectMatches(assetId);
  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const a = match.asset_a as DirectMatchAsset;
        const b = match.asset_b as DirectMatchAsset;

        const userPosition = currentUserId === match.user_a ? "a" : currentUserId === match.user_b ? "b" : null;
        const userMustAct = userPosition && !(userPosition === "a" ? match.accepted_a : match.accepted_b);

        const [yourAsset, theirAsset] = userPosition === "b" ? [b, a] : [a, b];

        return (
          <div
            key={match.id}
            className={`border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${userMustAct ? "border-emerald-600" : "border-zinc-900"}`}
          >
            {/* Header */}
            <div className={`px-4 py-2 flex items-center justify-between ${userMustAct ? "bg-emerald-600" : "bg-zinc-900"}`}>
              <div className="flex items-center gap-1.5">
                <ArrowLeftRight size={12} className="text-white" strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">
                  {userMustAct ? "Direct Trade Match — Action Required" : "Direct Trade Match"}
                </span>
              </div>
            </div>

            <div className={`px-4 py-3 flex items-center gap-3 ${userMustAct ? "bg-emerald-50" : "bg-white"}`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Your asset */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-0.5 truncate">
                    {userName(yourAsset?.user_created ?? null)}
                  </p>
                  <Link
                    href={`/explore/${yourAsset?.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-detail font-bold text-zinc-900 hover:text-emerald-700 transition-colors group truncate"
                  >
                    <span className="truncate">{yourAsset?.title ?? "—"}</span>
                    <ExternalLink size={10} className="shrink-0 text-zinc-500 group-hover:text-emerald-600" />
                  </Link>
                  {yourAsset?.location_label && (
                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">{yourAsset.location_label}</p>
                  )}
                </div>

                <ArrowLeftRight size={16} className="text-zinc-400 shrink-0" strokeWidth={2} />

                {/* Their asset */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-0.5 truncate">
                    {userName(theirAsset?.user_created ?? null)}
                  </p>
                  <Link
                    href={`/explore/${theirAsset?.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-detail font-bold text-zinc-900 hover:text-emerald-700 transition-colors group truncate"
                  >
                    <span className="truncate">{theirAsset?.title ?? "—"}</span>
                    <ExternalLink size={10} className="shrink-0 text-zinc-500 group-hover:text-emerald-600" />
                  </Link>
                  {theirAsset?.location_label && (
                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">{theirAsset.location_label}</p>
                  )}
                </div>
              </div>

              {/* Status / action */}
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
              {userPosition && !userMustAct && (
                <div className="shrink-0 border-l-2 border-zinc-100 pl-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Accepted</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
