"use server";

import { headers } from "next/headers";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

const REASONS: Record<string, string> = {
  spam: "Spam or scam",
  inappropriate: "Inappropriate content",
  unavailable: "Already traded / no longer available",
  wrong_category: "Wrong category",
  other: "Other",
};

export type FlagState = { success: boolean; error?: string } | null;

export async function flagAssetAction(
  _prev: FlagState,
  formData: FormData,
): Promise<FlagState> {
  const assetId = formData.get("assetId") as string;
  const assetTitle = formData.get("assetTitle") as string;
  const reason = formData.get("reason") as string;
  const notes = (formData.get("notes") as string).trim();

  if (!assetId || !reason || !REASONS[reason]) {
    return { success: false, error: "Missing required fields." };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  // Rate limit: max 5 flags per IP per 24 hours
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const countRes = await fetch(
    `${DIRECTUS_URL}/items/asset_flags?filter[ip][_eq]=${encodeURIComponent(ip)}&filter[asset_id][_eq]=${assetId}&filter[date_created][_gte]=${encodeURIComponent(since)}&aggregate[count]=*`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (countRes.ok) {
    const { data } = await countRes.json();
    const count = Number(data?.[0]?.count ?? 0);
    if (count >= 1) return { success: false, error: "You've already reported this listing recently." };
  }

  const res = await fetch(`${DIRECTUS_URL}/items/asset_flags`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ asset_id: Number(assetId), reason, notes: notes || null, ip }),
  });

  if (!res.ok) return { success: false, error: "Failed to submit report. Please try again." };

  // Notify admin
  if (RESEND_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SwapStandard <noreply@swapstandard.com>",
        to: "swapstandard@gmail.com",
        subject: `Listing flagged: ${assetTitle}`,
        text: `A listing has been flagged.\n\nListing: ${assetTitle}\nReason: ${REASONS[reason]}\nNotes: ${notes || "—"}\nIP: ${ip}\n\nReview: ${SITE_URL}/explore/${assetId}`,
      }),
    }).catch(() => {});
  }

  return { success: true };
}
