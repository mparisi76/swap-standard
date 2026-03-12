"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";
import { isBot } from "@/utils/honeypot";

export type ReplyFormState = {
  error?: string;
  success?: boolean;
} | null;

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

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

  revalidatePath(`/dashboard/exchanges/${exchangeId}`);
  return { success: true };
}
