import { NextRequest, NextResponse } from "next/server";
import { parseTags } from "@/lib/tags";
import { haversineDistance } from "@/utils/geo";
import { sendCombinedMatchDigest } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const DIRECT_MATCH_SECRET = process.env.DIRECT_MATCH_SECRET!;
const MAX_DISTANCE_MILES = 50;
const MAX_NEW_MATCHES = 1000;

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

// Directional key: seeker → offerer (not sorted — A seeking from B ≠ B seeking from A)
function matchKey(seeker: number, offerer: number): string {
  return `${seeker}:${offerer}`;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-direct-match-secret");
  if (!DIRECT_MATCH_SECRET || secret !== DIRECT_MATCH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch all published assets
  const assetsUrl = new URL(`${BASE_URL}/items/assets`);
  assetsUrl.searchParams.set("filter[status][_eq]", "published");
  assetsUrl.searchParams.set("fields", "id,user_created.id,user_created.email,title,offering_tags,seeking_tags,latitude,longitude");
  assetsUrl.searchParams.set("limit", "-1");

  const assetsRes = await fetch(assetsUrl.toString(), {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!assetsRes.ok) return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });

  const { data: assets }: { data: RawAssetRow[] } = await assetsRes.json();
  const normalize = (a: RawAssetRow): AssetRow => ({
    ...a,
    user_created: typeof a.user_created === "object" ? a.user_created.id : (a.user_created as string),
    _email: typeof a.user_created === "object" ? a.user_created.email : "",
  });

  const allReal = assets
    .filter((a) => a.user_created)
    .map(normalize)
    .filter((a) => !a._email.endsWith("@seed.swapstandard.com"));

  // Seekers: have seeking_tags — want to be notified of matches
  const seekers = allReal.filter((a) => parseTags(a.seeking_tags).length > 0);
  // Offerers: have offering_tags — can satisfy seekers
  const offerers = allReal.filter((a) => parseTags(a.offering_tags).length > 0);

  console.log(`[direct-match] ${seekers.length} seekers, ${offerers.length} offerers`);

  const debug = new URL(req.url).searchParams.get("debug") === "true";
  if (debug) {
    return NextResponse.json({
      seekers: seekers.map((a) => ({ id: a.id, title: a.title, user_created: a.user_created, seeking_tags: a.seeking_tags })),
      offerers: offerers.map((a) => ({ id: a.id, title: a.title, user_created: a.user_created, offering_tags: a.offering_tags })),
    });
  }

  // 2. Fetch existing matches to deduplicate
  const existingRes = await fetch(
    `${BASE_URL}/items/direct_matches?filter[match_status][_eq]=suggested&fields=asset_a,asset_b&limit=-1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  const existingKeys = new Set<string>();
  if (existingRes.ok) {
    const { data: existing }: { data: { asset_a: number; asset_b: number }[] } = await existingRes.json();
    for (const row of existing) existingKeys.add(matchKey(row.asset_a, row.asset_b));
  }

  // 3. Build offering index
  const offeringIndex = new Map<string, typeof offerers[number][]>();
  for (const asset of offerers) {
    for (const tag of parseTags(asset.offering_tags).map((t) => t.toLowerCase())) {
      if (!offeringIndex.has(tag)) offeringIndex.set(tag, []);
      offeringIndex.get(tag)!.push(asset);
    }
  }

  // 4. For each seeker, find offerers whose offering_tags overlap with seeker's seeking_tags
  //    asset_a = seeker (gets notified), asset_b = offerer
  const newMatches: { asset_a: number; asset_b: number; user_a: string; user_b: string; title_a: string; title_b: string }[] = [];
  const seenKeys = new Set<string>(existingKeys);

  for (const seeker of seekers) {
    const seekingTags = parseTags(seeker.seeking_tags).map((t) => t.toLowerCase());

    const candidates = new Map<number, typeof offerers[number]>();
    for (const tag of seekingTags) {
      for (const offerer of offeringIndex.get(tag) ?? []) {
        if (offerer.id !== seeker.id && offerer.user_created !== seeker.user_created && withinDistance(seeker, offerer)) {
          candidates.set(offerer.id, offerer);
        }
      }
    }

    for (const offerer of candidates.values()) {
      const key = matchKey(seeker.id, offerer.id);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      newMatches.push({ asset_a: seeker.id, asset_b: offerer.id, user_a: seeker.user_created, user_b: offerer.user_created, title_a: seeker.title, title_b: offerer.title });
      if (newMatches.length >= MAX_NEW_MATCHES) break;
    }
    if (newMatches.length >= MAX_NEW_MATCHES) break;
  }

  console.log(`[direct-match] found ${newMatches.length} new matches`);

  // 5. Write new matches in batch
  let written = 0;
  if (newMatches.length > 0) {
    const res = await fetch(`${BASE_URL}/items/direct_matches`, {
      method: "POST",
      headers: { Authorization: `Bearer ${STATIC_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        newMatches.map((m) => ({
          asset_a: m.asset_a,
          asset_b: m.asset_b,
          user_a: m.user_a,
          user_b: m.user_b,
          match_status: "suggested",
          accepted_a: false,
          accepted_b: false,
        })),
      ),
    });
    if (res.ok) written = newMatches.length;
    else console.error("[direct-match] failed to write:", await res.text());
  }

  // 6. Send digest emails grouped by user
  if (written > 0) {
    const userIds = [...new Set(newMatches.flatMap((m) => [m.user_a, m.user_b]))];

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

    // Group all matches per user — one email per user regardless of seeker/offerer role
    type MatchEntry = { yourAssetTitle: string; theirAssetTitle: string; assetId: number };
    const userSeeking = new Map<string, MatchEntry[]>();
    const userOffering = new Map<string, MatchEntry[]>();

    for (const m of newMatches) {
      if (!userSeeking.has(m.user_a)) userSeeking.set(m.user_a, []);
      userSeeking.get(m.user_a)!.push({ yourAssetTitle: m.title_a, theirAssetTitle: m.title_b, assetId: m.asset_a });

      if (!userOffering.has(m.user_b)) userOffering.set(m.user_b, []);
      userOffering.get(m.user_b)!.push({ yourAssetTitle: m.title_b, theirAssetTitle: m.title_a, assetId: m.asset_b });
    }

    const allUserIds = new Set([...userSeeking.keys(), ...userOffering.keys()]);
    const emailPromises = [...allUserIds].map((userId) => {
      const user = userMap.get(userId);
      if (!user?.email) return Promise.resolve();
      return sendCombinedMatchDigest({
        to: user.email,
        userId,
        firstName: user.first_name,
        seeking: userSeeking.get(userId) ?? [],
        offering: userOffering.get(userId) ?? [],
      });
    });

    await Promise.allSettled(emailPromises);
    console.log(`[direct-match] sent emails to ${allUserIds.size} users`);
  }

  return NextResponse.json({ seekers: seekers.length, offerers: offerers.length, new_matches_found: newMatches.length, written });
}
