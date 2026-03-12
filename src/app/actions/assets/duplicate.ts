"use server";

import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function duplicateAssetAction(formData: FormData) {
  const token = await getValidToken();
  if (!token) redirect("/login");

  const assetId = formData.get("assetId") as string;

  // Fetch the original asset
  const fields = "title,type,offering,seeking,asset_status,thumbnail,image_gallery.directus_files_id,latitude,longitude,location_label";
  const res = await fetch(`${BASE_URL}/items/assets/${assetId}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return;
  const { data: asset } = await res.json();

  // Build gallery payload
  const image_gallery = (asset.image_gallery ?? []).map(
    (g: { directus_files_id: string }) => ({ directus_files_id: g.directus_files_id }),
  );

  // Create the duplicate as draft
  const createRes = await fetch(`${BASE_URL}/items/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `${asset.title} (copy)`,
      type: asset.type,
      offering: asset.offering,
      seeking: asset.seeking,
      asset_status: asset.asset_status ?? "available",
      status: "draft",
      thumbnail: asset.thumbnail ?? null,
      image_gallery,
      latitude: asset.latitude ?? null,
      longitude: asset.longitude ?? null,
      location_label: asset.location_label ?? null,
    }),
  });

  if (!createRes.ok) return;

  redirect("/dashboard");
}
