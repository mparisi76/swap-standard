"use server";

import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";
import { isBot } from "@/utils/honeypot";
import { sendExchangeInitiatedNotification } from "@/lib/email";

export type ExchangeFormState = {
  error?: string;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

export async function initiateExchangeAction(
  _prevState: ExchangeFormState,
  formData: FormData,
): Promise<ExchangeFormState> {
  if (isBot(formData)) return null;

  const auth = await getValidTokenWithUser();
  if (!auth) return { error: "Not authenticated. Please log in." };
  const { token, userId } = auth;

  const assetId = formData.get("assetId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!assetId) return { error: "Missing asset." };
  if (!message) return { error: "Please write an opening message." };
  if (message.length > 2000) return { error: "Message must be under 2000 characters." };

  // Fetch asset owner
  const assetRes = await fetch(
    `${BASE_URL}/items/assets/${assetId}?fields=user_created`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!assetRes.ok) return { error: "Asset not found." };
  const assetJson = await safeJson(assetRes) as { data: { user_created: string } } | null;
  if (!assetJson?.data?.user_created) return { error: "Asset not found." };
  const ownerId: string = assetJson.data.user_created;

  if (userId === ownerId) {
    return { error: "You cannot initiate an exchange on your own listing." };
  }

  // Create exchange using static token so the full item is returned
  const exchangeRes = await fetch(`${BASE_URL}/items/exchanges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset: assetId,
      initiator: userId,
      owner: ownerId,
      status: "pending",
    }),
  });

  if (!exchangeRes.ok) {
    const err = await safeJson(exchangeRes) as { errors?: { message: string }[] } | null;
    return { error: err?.errors?.[0]?.message || "Failed to create exchange." };
  }

  const exchangeJson = await safeJson(exchangeRes) as { data?: { id: number } } | null;
  const exchangeId: number | undefined = exchangeJson?.data?.id;
  if (!exchangeId) return { error: "Exchange created but ID could not be read. Please contact support." };

  // Create opening message
  const msgRes = await fetch(`${BASE_URL}/items/exchange_messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exchange: exchangeId,
      sender: userId,
      content: message,
    }),
  });

  if (!msgRes.ok) {
    // Exchange was created — still redirect, message failure is non-critical
    console.error("Failed to create opening message for exchange", exchangeId);
  }

  // Notify owner (fire and forget)
  try {
    const ownerRes = await fetch(
      `${BASE_URL}/users?filter[id][_eq]=${ownerId}&fields=email,first_name,last_name,email_unsubscribed,notify_activity&limit=1`,
      { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
    );
    if (ownerRes.ok) {
      const { data: ownerList } = await ownerRes.json();
      const owner = ownerList?.[0];
      if (owner?.email && !owner.email_unsubscribed && owner.notify_activity !== false) {
        const initiatorRes = await fetch(
          `${BASE_URL}/users?filter[id][_eq]=${userId}&fields=first_name,last_name&limit=1`,
          { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
        );
        let initiatorName = "A member";
        if (initiatorRes.ok) {
          const { data: iList } = await initiatorRes.json();
          const ini = iList?.[0];
          if (ini) initiatorName = `${ini.first_name ?? ""} ${ini.last_name ?? ""}`.trim() || "A member";
        }
        const assetRes2 = await fetch(
          `${BASE_URL}/items/assets/${assetId}?fields=title`,
          { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
        );
        const assetTitle = assetRes2.ok ? ((await assetRes2.json()).data?.title ?? "your listing") : "your listing";
        await sendExchangeInitiatedNotification({
          to: owner.email,
          userId: ownerId,
          firstName: owner.first_name,
          initiatorName,
          assetTitle,
          exchangeId,
          messagePreview: message,
        });
      }
    }
  } catch {
    // Don't fail the redirect if email sending fails
  }

  redirect(`/dashboard/exchanges/${exchangeId}`);
}
