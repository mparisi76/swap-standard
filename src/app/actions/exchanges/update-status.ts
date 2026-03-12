"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";
import { type ExchangeStatus } from "@/types/schema";

export type UpdateStatusState = {
  error?: string;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

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
    `${BASE_URL}/items/exchanges?filter[id][_eq]=${exchangeId}&fields=status,initiator.id,owner.id&limit=1`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return { error: "Exchange not found." };
  const checkJson = await safeJson(checkRes) as { data: { status: string; initiator: { id: string }; owner: { id: string } }[] } | null;
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

  const res = await fetch(`${BASE_URL}/items/exchanges/${exchangeId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    const err = await safeJson(res) as { errors?: { message: string }[] } | null;
    return { error: err?.errors?.[0]?.message || "Failed to update status." };
  }

  revalidatePath(`/dashboard/exchanges/${exchangeId}`);
  revalidatePath("/dashboard");
  return null;
}
