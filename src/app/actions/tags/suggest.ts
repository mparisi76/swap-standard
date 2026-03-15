"use server";

import { cookies } from "next/headers";

export async function suggestTagAction(tag: string): Promise<{ ok: boolean }> {
  const trimmed = tag.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 60) return { ok: false };

  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

  try {
    await fetch(`${baseUrl}/items/tag_suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ tag: trimmed }),
    });
  } catch {
    // Fail silently — suggestion is best-effort
  }

  return { ok: true };
}
