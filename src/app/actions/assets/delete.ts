"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function cancelExchangesForAssets(assetIds: number[]) {
  if (assetIds.length === 0) return;
  // Find open exchanges for these assets
  const filter = assetIds.map((id) => `filter[asset][_in][]=${id}`).join("&");
  const res = await fetch(
    `${BASE_URL}/items/exchanges?${filter}&filter[status][_in][]=pending&filter[status][_in][]=active&fields=id&limit=100`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) return;
  const json = await res.json();
  const ids: number[] = (json?.data ?? []).map((e: { id: number }) => e.id);
  if (ids.length === 0) return;
  // Cancel them all
  await Promise.all(
    ids.map((id) =>
      fetch(`${BASE_URL}/items/exchanges/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${STATIC_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      }),
    ),
  );
}

async function deleteMatchesForAssets(assetIds: number[]) {
  if (assetIds.length === 0) return;
  const idList = assetIds.join(",");

  // Delete direct matches
  const dmRes = await fetch(
    `${BASE_URL}/items/direct_matches?filter[_or][0][asset_a][_in]=${idList}&filter[_or][1][asset_b][_in]=${idList}&fields=id&limit=100`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (dmRes.ok) {
    const dmJson = await dmRes.json();
    const dmIds = (dmJson?.data ?? []).map((m: { id: number }) => m.id);
    if (dmIds.length > 0) {
      await fetch(`${BASE_URL}/items/direct_matches`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${STATIC_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(dmIds),
      });
    }
  }

  // Delete chain trades
  const ctRes = await fetch(
    `${BASE_URL}/items/chain_trades?filter[_or][0][asset_a][_in]=${idList}&filter[_or][1][asset_b][_in]=${idList}&filter[_or][2][asset_c][_in]=${idList}&fields=id&limit=100`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (ctRes.ok) {
    const ctJson = await ctRes.json();
    const ctIds = (ctJson?.data ?? []).map((c: { id: number }) => c.id);
    if (ctIds.length > 0) {
      await fetch(`${BASE_URL}/items/chain_trades`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${STATIC_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(ctIds),
      });
    }
  }
}

export async function deleteAssetAction(formData: FormData) {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { userId } = auth;

  const assetId = formData.get("assetId") as string;

  // Verify ownership
  const checkRes = await fetch(
    `${BASE_URL}/items/assets?filter[id][_eq]=${assetId}&filter[user_created][_eq]=${userId}&fields=id&limit=1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return;
  const checkJson = await checkRes.json();
  if (!checkJson?.data?.[0]) return;

  // Cancel any open exchanges and matches for this asset
  await cancelExchangesForAssets([Number(assetId)]);
  await deleteMatchesForAssets([Number(assetId)]);

  const res = await fetch(`${BASE_URL}/items/assets/${assetId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
  });

  if (!res.ok) return;

  revalidatePath("/dashboard");
}

export async function bulkDeleteAssetsAction(ids: number[]) {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { userId } = auth;

  if (ids.length === 0) return;

  // Filter to only assets owned by this user
  const checkRes = await fetch(
    `${BASE_URL}/items/assets?filter[id][_in]=${ids.join(",")}&filter[user_created][_eq]=${userId}&fields=id&limit=${ids.length}`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return;
  const checkJson = await checkRes.json();
  const ownedIds = (checkJson?.data ?? []).map((a: { id: number }) => a.id);
  if (ownedIds.length === 0) return;

  // Cancel any open exchanges and matches for these assets
  await cancelExchangesForAssets(ownedIds);
  await deleteMatchesForAssets(ownedIds);

  await fetch(`${BASE_URL}/items/assets`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ownedIds),
  });

  revalidatePath("/dashboard");
}
