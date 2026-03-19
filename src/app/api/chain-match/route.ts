import { NextRequest, NextResponse } from "next/server";
import { parseTags } from "@/lib/tags";
import { haversineDistance } from "@/utils/geo";
import { sendChainTradeDigest } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const CHAIN_MATCH_SECRET = process.env.CHAIN_MATCH_SECRET!;
const CHAIN_TRADES_ENABLED = process.env.CHAIN_TRADES_ENABLED === "true";
const MAX_DISTANCE_MILES = 50;

interface RawAssetRow {
  id: number;
  user_created: string | { id: string; email: string };
  title: string;
  offering_tags: string | null;
  seeking_tags: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface AssetRow extends Omit<RawAssetRow, "user_created"> {
  user_created: string;
  _email: string;
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
  assetsUrl.searchParams.set("fields", "id,user_created,title,offering_tags,seeking_tags,latitude,longitude,user_created.email");
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

  const { data: assets }: { data: RawAssetRow[] } = await assetsRes.json();
  console.log(`[chain-match] fetched ${assets.length} assets`);

  // Filter to assets that have both tag types populated, excluding seed users
  const eligible = assets
    .filter((a) => parseTags(a.offering_tags).length > 0 && parseTags(a.seeking_tags).length > 0 && a.user_created)
    .map((a): AssetRow => ({
      ...a,
      user_created: typeof a.user_created === "object" ? a.user_created.id : (a.user_created as string),
      _email: typeof a.user_created === "object" ? a.user_created.email : "",
    }))
    .filter((a) => !a._email.endsWith("@seed.swapstandard.com"));
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
  const newCycles: { asset_a: number; asset_b: number; asset_c: number; user_a: string; user_b: string; user_c: string; title_a: string; title_b: string; title_c: string }[] = [];
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
          title_a: a.title,
          title_b: b.title,
          title_c: c.title,
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

  // 5. Send digest emails grouped by user
  if (written > 0) {
    const userIds = [...new Set(newCycles.flatMap((c) => [c.user_a, c.user_b, c.user_c]))];

    const usersRes = await fetch(
      `${BASE_URL}/users?filter[id][_in]=${userIds.join(",")}&fields=id,email,first_name,email_unsubscribed`,
      { headers: { Authorization: `Bearer ${STATIC_TOKEN}` } },
    );

    const userMap = new Map<string, { email: string; first_name: string | null }>();
    if (usersRes.ok) {
      const { data: users } = await usersRes.json();
      for (const u of users) {
        if (!u.email_unsubscribed) userMap.set(u.id, { email: u.email, first_name: u.first_name });
      }
    }

    // Group cycles by user, pick their first involved asset for the email
    const userCycles = new Map<string, { assetTitle: string; assetId: number; count: number }>();
    for (const cycle of newCycles) {
      const entries: [string, string, number][] = [
        [cycle.user_a, cycle.title_a, cycle.asset_a],
        [cycle.user_b, cycle.title_b, cycle.asset_b],
        [cycle.user_c, cycle.title_c, cycle.asset_c],
      ];
      for (const [userId, title, assetId] of entries) {
        if (!userCycles.has(userId)) {
          userCycles.set(userId, { assetTitle: title, assetId, count: 0 });
        }
        userCycles.get(userId)!.count++;
      }
    }

    const emailPromises = [...userCycles.entries()].map(([userId, { assetTitle, assetId, count }]) => {
      const user = userMap.get(userId);
      if (!user?.email) return Promise.resolve();
      return sendChainTradeDigest({ to: user.email, userId, firstName: user.first_name, assetTitle, assetId, chainCount: count });
    });

    await Promise.allSettled(emailPromises);
    console.log(`[chain-match] sent emails to ${userCycles.size} users`);
  }

  return NextResponse.json({
    assets_checked: eligible.length,
    new_cycles_found: newCycles.length,
    written,
  });
}
