/**
 * SwapStandard Seed Data Cleanup
 * --------------------------------
 * Deletes all assets owned by seed users, then optionally deletes the
 * seed user accounts themselves.
 *
 * Usage:
 *   node scripts/delete-seed-listings.mjs            # delete assets only
 *   node scripts/delete-seed-listings.mjs --users    # delete assets + users
 *
 * Seed users are identified by their @seed.swapstandard.com email domain —
 * nothing else on the platform is touched.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
try {
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env.local");
  process.exit(1);
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;
const DELETE_USERS = process.argv.includes("--users");

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error("Missing NEXT_PUBLIC_DIRECTUS_URL or DIRECTUS_STATIC_TOKEN");
  process.exit(1);
}

const SEED_EMAIL_DOMAIN = "@seed.swapstandard.com";

async function getSeedUserIds() {
  const res = await fetch(
    `${DIRECTUS_URL}/users?filter[email][_contains]=${encodeURIComponent(SEED_EMAIL_DOMAIN)}&fields=id,first_name,last_name,email&limit=100`,
    { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch seed users: ${res.status}`);
  const { data } = await res.json();
  return data;
}

async function getAssetIdsByUsers(userIds) {
  const filterParts = userIds
    .map((id) => `filter[user_created][_in][]=${id}`)
    .join("&");
  const res = await fetch(
    `${DIRECTUS_URL}/items/assets?${filterParts}&fields=id,title&limit=-1`,
    { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch assets: ${res.status}`);
  const { data } = await res.json();
  return data;
}

async function deleteAssets(ids) {
  const res = await fetch(`${DIRECTUS_URL}/items/assets`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`Failed to delete assets: ${await res.text()}`);
}

async function deleteUsers(ids) {
  const res = await fetch(`${DIRECTUS_URL}/users`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error(`Failed to delete users: ${await res.text()}`);
}

async function main() {
  console.log(`\nSwapStandard Seed Cleanup`);
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Mode: delete assets${DELETE_USERS ? " + seed users" : " only"}\n`);

  // 1. Find seed users
  const seedUsers = await getSeedUserIds();
  if (seedUsers.length === 0) {
    console.log("No seed users found — nothing to delete.");
    return;
  }

  console.log(`Found ${seedUsers.length} seed user(s):`);
  for (const u of seedUsers) {
    console.log(`  ${u.first_name} ${u.last_name} — ${u.email} (${u.id})`);
  }

  // 2. Find their assets
  const userIds = seedUsers.map((u) => u.id);
  const assets = await getAssetIdsByUsers(userIds);
  console.log(`\nFound ${assets.length} asset(s) owned by seed users.`);

  if (assets.length === 0 && !DELETE_USERS) {
    console.log("Nothing to delete.");
    return;
  }

  // 3. Confirm before proceeding
  console.log("\nThis will permanently delete:");
  console.log(`  • ${assets.length} asset(s)`);
  if (DELETE_USERS) console.log(`  • ${seedUsers.length} seed user account(s)`);
  console.log("\nPress Ctrl+C within 5 seconds to abort...");
  await new Promise((r) => setTimeout(r, 5000));

  // 4. Delete assets
  if (assets.length > 0) {
    const assetIds = assets.map((a) => a.id);
    process.stdout.write(`Deleting ${assetIds.length} assets... `);
    await deleteAssets(assetIds);
    console.log("✓");
  }

  // 5. Optionally delete users
  if (DELETE_USERS) {
    process.stdout.write(`Deleting ${seedUsers.length} seed users... `);
    await deleteUsers(userIds);
    console.log("✓");
  }

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
