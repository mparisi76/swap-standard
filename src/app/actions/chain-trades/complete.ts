"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export async function completeChainTrade(chainId: number) {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");

  const res = await fetch(`${BASE_URL}/items/chain_trades/${chainId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chain_status: "completed" }),
  });

  if (!res.ok) throw new Error("Failed to complete chain trade");

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/chain-trades/${chainId}`);
}
