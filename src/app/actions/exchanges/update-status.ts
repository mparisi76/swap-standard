"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";
import { type ExchangeStatus } from "@/types/schema";

export type UpdateStatusState = {
  error?: string;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

export async function updateExchangeStatusAction(
  exchangeId: number,
  newStatus: ExchangeStatus,
  _prevState: UpdateStatusState,
  _formData: FormData,
): Promise<UpdateStatusState> {
  const auth = await getValidTokenWithUser();
  if (!auth) return { error: "Not authenticated." };
  const { token, userId } = auth;

  // Fetch current exchange state
  const checkRes = await fetch(
    `${BASE_URL}/items/exchanges?filter[id][_eq]=${exchangeId}&fields=status,asset.id,initiator.id,owner.id&limit=1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return { error: "Exchange not found." };
  const checkJson = await safeJson(checkRes) as { data: { status: string; asset: { id: number }; initiator: { id: string }; owner: { id: string } }[] } | null;
  if (!checkJson?.data?.[0]) return { error: "Exchange not found." };
  const ex = checkJson.data[0];

  const isOwner = ex.owner.id === userId;
  const isInitiator = ex.initiator.id === userId;

  // Validate transition
  if (ex.status === "pending" && newStatus === "active" && !isOwner) {
    return { error: "Only the listing owner can accept an exchange." };
  }
  if (ex.status === "pending" && newStatus === "declined" && !isOwner) {
    return { error: "Only the listing owner can decline an exchange." };
  }
  if (newStatus === "completed" && !isOwner && !isInitiator) {
    return { error: "Not authorised." };
  }
  if (!["pending", "active"].includes(ex.status)) {
    return { error: "This exchange is already closed." };
  }
  if (newStatus === "cancelled" && !isOwner && !isInitiator) {
    return { error: "Not authorised." };
  }

  const res = await fetch(`${BASE_URL}/items/exchanges/${exchangeId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    const err = await safeJson(res) as { errors?: { message: string }[] } | null;
    return { error: err?.errors?.[0]?.message || "Failed to update status." };
  }

  // Sync asset with exchange status
  const assetUpdates: Partial<Record<ExchangeStatus, object>> = {
    active:    { asset_status: "pending" },
    completed: { asset_status: "unavailable", status: "archived" },
    declined:  { asset_status: "available" },
    cancelled: { asset_status: "available" },
  };
  const assetPatch = assetUpdates[newStatus];
  if (assetPatch && ex.asset?.id) {
    await fetch(`${BASE_URL}/items/assets/${ex.asset.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${STATIC_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assetPatch),
    });
  }

  revalidatePath(`/dashboard/exchanges/${exchangeId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/explore/${ex.asset?.id}`);
  return null;
}
