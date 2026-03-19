import { NextRequest, NextResponse } from "next/server";
import { parseTags } from "@/lib/tags";
import { haversineDistance } from "@/utils/geo";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const CHAIN_MATCH_SECRET = process.env.CHAIN_MATCH_SECRET!;
const CHAIN_TRADES_ENABLED = process.env.CHAIN_TRADES_ENABLED === "true";
const MAX_DISTANCE_MILES = 50;

interface AssetRow {
  id: number;
  user_created: string;
  offering_tags: string | null;
  seeking_tags: string | null;
  latitude: number | null;
  longitude: number | null;
}

function withinDistance(a: AssetRow, b: AssetRow): boolean {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return true;
  return haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude) <= MAX_DISTANCE_MILES;
}

function tagsOverlap(a: string | null, b: string | null): boolean {
  const tagsA = parseTags(a);
  const tagsB = parseTags(b);
  if (!tagsA.length || !tagsB.length) return false;
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));
  return tagsA.some((t) => setB.has(t.toLowerCase()));
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
  assetsUrl.searchParams.set("fields", "id,user_created,offering_tags,seeking_tags,latitude,longitude");
  assetsUrl.searchParams.set("limit", "-1");

  console.log("[chain-match] fetching assets...");
  const assetsRes = await fetch(assetsUrl.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });

  if (!assetsRes.ok) {
    const body = await assetsRes.text();
    return NextResponse.json({ error: "Failed to fetch assets", status: assetsRes.status, body }, { status: 500 });
  }

  const { data: assets }: { data: AssetRow[] } = await assetsRes.json();
  console.log(`[chain-match] fetched ${assets.length} assets`);

  // Filter to assets that have both tag types populated
  const eligible = assets.filter(
    (a) => parseTags(a.offering_tags).length > 0 && parseTags(a.seeking_tags).length > 0 && a.user_created,
  );
  console.log(`[chain-match] ${eligible.length} eligible assets`);

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
  console.log("[chain-match] fetching existing chain trades...");
  const existingRes = await fetch(
    `${BASE_URL}/items/chain_trades?filter[chain_status][_eq]=suggested&fields=asset_a,asset_b,asset_c&limit=-1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );

  console.log(`[chain-match] existing trades fetch status: ${existingRes.status}`);
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
  //
  // Build a lookup: tag → assets that offer it, for O(n) lookup instead of O(n³)
  const offeringIndex = new Map<string, AssetRow[]>();
  for (const asset of eligible) {
    for (const tag of parseTags(asset.offering_tags).map((t) => t.toLowerCase())) {
      if (!offeringIndex.has(tag)) offeringIndex.set(tag, []);
      offeringIndex.get(tag)!.push(asset);
    }
  }

  const MAX_NEW_CYCLES = 1000;
  const newCycles: { asset_a: number; asset_b: number; asset_c: number; user_a: string; user_b: string; user_c: string }[] = [];
  const seenKeys = new Set<string>(existingKeys);

  for (const a of eligible) {
    const aSeekingTags = parseTags(a.seeking_tags).map((t) => t.toLowerCase());
    const aOfferingTags = parseTags(a.offering_tags).map((t) => t.toLowerCase());

    // Find all B candidates: assets that offer something A seeks, within distance
    const bCandidates = new Map<number, AssetRow>();
    for (const tag of aSeekingTags) {
      for (const b of offeringIndex.get(tag) ?? []) {
        if (b.id !== a.id && b.user_created !== a.user_created && withinDistance(a, b)) {
          bCandidates.set(b.id, b);
        }
      }
    }

    for (const b of bCandidates.values()) {
      const bSeekingTags = parseTags(b.seeking_tags).map((t) => t.toLowerCase());

      // Find all C candidates: assets that offer something B seeks, within distance of both A and B
      const cCandidates = new Map<number, AssetRow>();
      for (const tag of bSeekingTags) {
        for (const c of offeringIndex.get(tag) ?? []) {
          if (
            c.id !== a.id && c.id !== b.id &&
            c.user_created !== a.user_created && c.user_created !== b.user_created &&
            withinDistance(b, c) && withinDistance(a, c)
          ) {
            cCandidates.set(c.id, c);
          }
        }
      }

      for (const c of cCandidates.values()) {
        // Check C→A: A offers something C seeks
        const cSeekingTags = new Set(parseTags(c.seeking_tags).map((t) => t.toLowerCase()));
        if (!aOfferingTags.some((t) => cSeekingTags.has(t))) continue;

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

        if (newCycles.length >= MAX_NEW_CYCLES) break;
      }
      if (newCycles.length >= MAX_NEW_CYCLES) break;
    }
    if (newCycles.length >= MAX_NEW_CYCLES) break;
  }

  // 4. Write new chain_trades in one batch request
  console.log(`[chain-match] found ${newCycles.length} new cycles, writing...`);
  let written = 0;
  if (newCycles.length > 0) {
    const res = await fetch(`${BASE_URL}/items/chain_trades`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STATIC_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCycles.map((cycle) => ({ ...cycle, chain_status: "suggested" }))),
    });
    if (res.ok) written = newCycles.length;
    else console.error("Failed to write chain_trades:", await res.text());
  }

  return NextResponse.json({
    assets_checked: eligible.length,
    new_cycles_found: newCycles.length,
    written,
  });
}
