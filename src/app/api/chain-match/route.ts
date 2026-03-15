import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const CHAIN_MATCH_SECRET = process.env.CHAIN_MATCH_SECRET!;
const CHAIN_TRADES_ENABLED = process.env.CHAIN_TRADES_ENABLED === "true";

interface AssetRow {
  id: number;
  user_created: string;
  offering_tags: string[] | null;
  seeking_tags: string[] | null;
}

function tagsOverlap(a: string[] | null, b: string[] | null): boolean {
  if (!a?.length || !b?.length) return false;
  const setB = new Set(b.map((t) => t.toLowerCase()));
  return a.some((t) => setB.has(t.toLowerCase()));
}

/** Canonical key for a triple so (A,B,C) and (B,C,A) are treated as the same cycle */
function cycleKey(a: number, b: number, c: number): string {
  return [a, b, c].sort((x, y) => x - y).join("-");
}

export async function POST(req: NextRequest) {
  if (!CHAIN_TRADES_ENABLED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authenticate the cron caller
  const secret = req.headers.get("x-chain-match-secret");
  if (!CHAIN_MATCH_SECRET || secret !== CHAIN_MATCH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const debug = new URL(req.url).searchParams.get("debug") === "true";

  // 1. Fetch all published assets with tag data
  const assetsUrl = new URL(`${BASE_URL}/items/assets`);
  assetsUrl.searchParams.set("filter[status][_eq]", "published");
  assetsUrl.searchParams.set("fields", "id,user_created,offering_tags,seeking_tags");
  assetsUrl.searchParams.set("limit", "-1");

  const assetsRes = await fetch(assetsUrl.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });

  if (!assetsRes.ok) {
    const body = await assetsRes.text();
    return NextResponse.json({ error: "Failed to fetch assets", status: assetsRes.status, body }, { status: 500 });
  }

  const { data: assets }: { data: AssetRow[] } = await assetsRes.json();

  // Filter to assets that have both tag types populated
  const eligible = assets.filter(
    (a) => a.offering_tags?.length && a.seeking_tags?.length && a.user_created,
  );

  if (debug) {
    return NextResponse.json({
      total_assets: assets.length,
      eligible_assets: eligible.map((a) => ({
        id: a.id,
        user_created: a.user_created,
        offering_tags: a.offering_tags,
        seeking_tags: a.seeking_tags,
      })),
    });
  }

  // 2. Fetch existing suggested chain_trades to avoid duplicates
  const existingRes = await fetch(
    `${BASE_URL}/items/chain_trades?filter[chain_status][_eq]=suggested&fields=asset_a,asset_b,asset_c&limit=-1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );

  const existingKeys = new Set<string>();
  if (existingRes.ok) {
    const { data: existing }: { data: { asset_a: number; asset_b: number; asset_c: number }[] } =
      await existingRes.json();
    for (const row of existing) {
      existingKeys.add(cycleKey(row.asset_a, row.asset_b, row.asset_c));
    }
  }

  // 3. Find 3-cycles: A→B→C→A
  //    A→B: B.offering_tags ∩ A.seeking_tags ≠ ∅
  //    B→C: C.offering_tags ∩ B.seeking_tags ≠ ∅
  //    C→A: A.offering_tags ∩ C.seeking_tags ≠ ∅
  const newCycles: { asset_a: number; asset_b: number; asset_c: number; user_a: string; user_b: string; user_c: string }[] = [];
  const seenKeys = new Set<string>(existingKeys);

  for (const a of eligible) {
    for (const b of eligible) {
      if (b.id === a.id || b.user_created === a.user_created) continue;
      if (!tagsOverlap(b.offering_tags, a.seeking_tags)) continue;

      for (const c of eligible) {
        if (c.id === a.id || c.id === b.id) continue;
        if (c.user_created === a.user_created || c.user_created === b.user_created) continue;
        if (!tagsOverlap(c.offering_tags, b.seeking_tags)) continue;
        if (!tagsOverlap(a.offering_tags, c.seeking_tags)) continue;

        const key = cycleKey(a.id, b.id, c.id);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        newCycles.push({
          asset_a: a.id,
          asset_b: b.id,
          asset_c: c.id,
          user_a: a.user_created,
          user_b: b.user_created,
          user_c: c.user_created,
        });
      }
    }
  }

  // 4. Write new chain_trades
  let written = 0;
  for (const cycle of newCycles) {
    const res = await fetch(`${BASE_URL}/items/chain_trades`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STATIC_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...cycle, chain_status: "suggested" }),
    });
    if (res.ok) written++;
    else console.error("Failed to write chain_trade:", await res.text());
  }

  return NextResponse.json({
    assets_checked: eligible.length,
    new_cycles_found: newCycles.length,
    written,
  });
}
