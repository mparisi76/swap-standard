"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";
import { isBot } from "@/utils/honeypot";
import { sendExchangeMessageNotification } from "@/lib/email";

export type ReplyFormState = {
  error?: string;
  success?: boolean;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

export async function replyAction(
  exchangeId: number,
  _prevState: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState> {
  if (isBot(formData)) return null;

  const auth = await getValidTokenWithUser();
  if (!auth) return { error: "Not authenticated." };
  const { token, userId } = auth;

  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Message cannot be empty." };
  if (content.length > 2000) return { error: "Message must be under 2000 characters." };

  const res = await fetch(`${BASE_URL}/items/exchange_messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exchange: exchangeId,
      sender: userId,
      content,
    }),
  });

  if (!res.ok) {
    const err = await safeJson(res) as { errors?: { message: string }[] } | null;
    return { error: err?.errors?.[0]?.message || "Failed to send message." };
  }

  // Send email notification to counterparty (fire and forget)
  try {
    const exRes = await fetch(
      `${BASE_URL}/items/exchanges?filter[id][_eq]=${exchangeId}&fields=asset.title,initiator.id,initiator.first_name,initiator.last_name,owner.id,owner.first_name,owner.last_name&limit=1`,
      { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
    );
    if (exRes.ok) {
      const exJson = await exRes.json();
      const ex = exJson?.data?.[0];
      if (ex) {
        const isInitiator = ex.initiator?.id === userId;
        const counterparty = isInitiator ? ex.owner : ex.initiator;
        const sender = isInitiator ? ex.initiator : ex.owner;
        const senderName = `${sender?.first_name ?? ""} ${sender?.last_name ?? ""}`.trim() || "A member";

        if (counterparty?.id) {
          // Fetch counterparty's notification prefs directly — relational expansion
          // on directus_users custom fields is unreliable
          const cpRes = await fetch(
            `${BASE_URL}/users?filter[id][_eq]=${counterparty.id}&fields=email,email_unsubscribed,notify_messages&limit=1`,
            { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
          );
          if (cpRes.ok) {
            const { data: cpList } = await cpRes.json();
            const cp = cpList?.[0];
            if (cp?.email && !cp.email_unsubscribed && cp.notify_messages !== false) {
              await sendExchangeMessageNotification({
                to: cp.email,
                userId: counterparty.id,
                firstName: counterparty.first_name,
                senderName,
                assetTitle: ex.asset?.title ?? "your listing",
                exchangeId,
                messagePreview: content,
              });
            }
          }
        }
      }
    }
  } catch {
    // Don't fail the reply if email sending fails
  }

  revalidatePath(`/dashboard/exchanges/${exchangeId}`);
  return { success: true };
}
