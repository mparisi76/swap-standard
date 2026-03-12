"use server";

import { revalidatePath } from "next/cache";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function updatePublishStatusAction(formData: FormData) {
  const token = await getValidToken();
  if (!token) return;

  const assetId = formData.get("assetId") as string;
  const status = formData.get("status") as string;

  if (!assetId || !status) return;

  await fetch(`${BASE_URL}/items/assets/${assetId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  revalidatePath("/dashboard");
}
