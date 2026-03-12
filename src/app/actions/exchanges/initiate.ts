"use server";

import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";
import { isBot } from "@/utils/honeypot";

export type ExchangeFormState = {
  error?: string;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

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

  // Create exchange
  const exchangeRes = await fetch(`${BASE_URL}/items/exchanges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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

  // Directus may not return the id in the POST response — fetch the newly created exchange.
  const findUrl = new URL(`${BASE_URL}/items/exchanges`);
  findUrl.searchParams.set("filter[initiator][_eq]", "$CURRENT_USER");
  findUrl.searchParams.set("filter[asset][_eq]", assetId);
  findUrl.searchParams.set("sort", "-date_created");
  findUrl.searchParams.set("limit", "1");
  findUrl.searchParams.set("fields", "id");

  const findRes = await fetch(findUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const findText = await findRes.text();
  if (!findRes.ok) return { error: `Exchange created but retrieval failed (${findRes.status}): ${findText.slice(0, 300)}` };
  const findJson = (findText ? JSON.parse(findText) : null) as { data: { id: number }[] } | null;
  const exchangeId: number | undefined = findJson?.data?.[0]?.id;
  if (!exchangeId) return { error: `Exchange created but ID not found. Body: ${findText.slice(0, 300)}` };

  // Create opening message
  const msgRes = await fetch(`${BASE_URL}/items/exchange_messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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

  redirect(`/dashboard/exchanges/${exchangeId}`);
}
