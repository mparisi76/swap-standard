"use server";

import { revalidatePath } from "next/cache";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function updateAssetStatusAction(formData: FormData) {
  const token = await getValidToken();
  if (!token) return;

  const assetId = formData.get("assetId") as string;
  const asset_status = formData.get("asset_status") as string;

  if (!assetId || !asset_status) return;

  await fetch(`${BASE_URL}/items/assets/${assetId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ asset_status }),
  });

  revalidatePath("/dashboard");
}
