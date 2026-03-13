"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function deleteAssetAction(formData: FormData) {
  const token = await getValidToken();
  if (!token) redirect("/login");

  const assetId = formData.get("assetId") as string;

  const res = await fetch(`${BASE_URL}/items/assets/${assetId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return;

  revalidatePath("/dashboard");
}
