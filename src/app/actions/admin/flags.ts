"use server";

import { revalidatePath } from "next/cache";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export async function unpublishFlaggedAssetAction(assetId: number): Promise<{ error?: string }> {
  const res = await fetch(`${DIRECTUS_URL}/items/assets/${assetId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "archived" }),
  });

  if (!res.ok) return { error: "Failed to unpublish asset." };

  revalidatePath("/admin/flags");
  return {};
}

export async function dismissFlagAction(flagId: number): Promise<{ error?: string }> {
  const res = await fetch(`${DIRECTUS_URL}/items/asset_flags/${flagId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dismissed: true }),
  });

  if (!res.ok) return { error: "Failed to dismiss flag." };

  revalidatePath("/admin/flags");
  return {};
}
