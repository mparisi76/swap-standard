"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export type AcceptChainTradeResult = { error: string } | { success: true };

export async function acceptChainTradeAction(
  chainTradeId: number,
  position: "a" | "b" | "c",
): Promise<AcceptChainTradeResult> {
  const auth = await getValidTokenWithUser();
  if (!auth) return { error: "Not authenticated." };
  const { token, userId } = auth;

  // Fetch current state to verify the user owns this position
  const fetchRes = await fetch(
    `${BASE_URL}/items/chain_trades/${chainTradeId}?fields=chain_status,user_a,user_b,user_c,accepted_a,accepted_b,accepted_c,asset_a,asset_b,asset_c`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!fetchRes.ok) return { error: "Chain trade not found." };
  const { data } = await fetchRes.json();

  if (!["suggested", "pending"].includes(data.chain_status)) {
    return { error: "This chain trade is no longer active." };
  }

  if (data[`user_${position}`] !== userId) {
    return { error: "You are not part of this chain trade." };
  }

  // Determine if all 3 will be accepted after this action
  const nextAccepted = {
    accepted_a: data.accepted_a,
    accepted_b: data.accepted_b,
    accepted_c: data.accepted_c,
    [`accepted_${position}`]: true,
  };
  const allAccepted = nextAccepted.accepted_a && nextAccepted.accepted_b && nextAccepted.accepted_c;

  const patchRes = await fetch(`${BASE_URL}/items/chain_trades/${chainTradeId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      [`accepted_${position}`]: true,
      ...(allAccepted && { chain_status: "pending" }),
    }),
  });

  if (!patchRes.ok) return { error: "Failed to accept chain trade." };

  revalidatePath(`/explore/${data[`asset_${position}`]}`);
  return { success: true };
}

export async function declineChainTradeAction(
  chainTradeId: number,
  position: "a" | "b" | "c",
  assetId: number,
): Promise<AcceptChainTradeResult> {
  const auth = await getValidTokenWithUser();
  if (!auth) return { error: "Not authenticated." };
  const { token, userId } = auth;

  // Verify ownership of position
  const fetchRes = await fetch(
    `${BASE_URL}/items/chain_trades/${chainTradeId}?fields=chain_status,user_${position}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!fetchRes.ok) return { error: "Chain trade not found." };
  const { data } = await fetchRes.json();

  if (data[`user_${position}`] !== userId) {
    return { error: "You are not part of this chain trade." };
  }

  if (!["suggested", "pending"].includes(data.chain_status)) {
    return { error: "This chain trade is no longer active." };
  }

  const patchRes = await fetch(`${BASE_URL}/items/chain_trades/${chainTradeId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chain_status: "declined" }),
  });

  if (!patchRes.ok) return { error: "Failed to decline chain trade." };

  revalidatePath(`/explore/${assetId}`);
  return { success: true };
}
