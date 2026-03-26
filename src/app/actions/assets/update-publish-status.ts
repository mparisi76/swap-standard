"use server";

import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export async function updatePublishStatusAction(formData: FormData) {
  const token = await getValidToken();
  if (!token) return;

  const assetId = formData.get("assetId") as string;
  const status = formData.get("status") as string;
  if (!assetId || !status) return;

  await fetch(`${BASE_URL}/items/assets/${assetId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

}
