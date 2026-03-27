"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";
import { type ExchangeStatus } from "@/types/schema";
import { sendExchangeStatusNotification } from "@/lib/email";

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
    `${BASE_URL}/items/exchanges?filter[id][_eq]=${exchangeId}&fields=status,asset.id,asset.title,initiator.id,initiator.first_name,initiator.last_name,owner.id,owner.first_name,owner.last_name&limit=1`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return { error: "Exchange not found." };
  const checkJson = await safeJson(checkRes) as { data: { status: string; asset: { id: number; title: string }; initiator: { id: string; first_name: string | null; last_name: string | null }; owner: { id: string; first_name: string | null; last_name: string | null } }[] } | null;
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

  // Notify counterparty of status change (fire and forget)
  if (["active", "declined", "cancelled", "completed"].includes(newStatus)) {
    try {
      const actor = isOwner ? ex.owner : ex.initiator;
      const counterparty = isOwner ? ex.initiator : ex.owner;
      const actorName = `${actor.first_name ?? ""} ${actor.last_name ?? ""}`.trim() || "A member";

      if (counterparty?.id) {
        // Fetch counterparty's notification prefs directly — relational expansion
        // on directus_users custom fields is unreliable
        const cpRes = await fetch(
          `${BASE_URL}/users/${counterparty.id}?fields=email,email_unsubscribed,notify_activity`,
          { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
        );
        if (cpRes.ok) {
          const { data: cp } = await cpRes.json();
          if (cp?.email && !cp.email_unsubscribed && cp.notify_activity !== false) {
            await sendExchangeStatusNotification({
              to: cp.email,
              userId: counterparty.id,
              firstName: counterparty.first_name,
              counterpartyName: actorName,
              assetTitle: ex.asset?.title ?? "your listing",
              exchangeId,
              newStatus: newStatus as "active" | "declined" | "cancelled" | "completed",
            });
          }
        }
      }
    } catch {
      // Don't fail the action if email sending fails
    }
  }

  revalidatePath(`/dashboard/exchanges/${exchangeId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/explore/${ex.asset?.id}`);
  return null;
}
