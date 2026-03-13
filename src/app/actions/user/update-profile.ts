"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export type ProfileState = { error?: string; success?: boolean } | null;

export async function updateProfileAction(
  prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const token = await getValidToken();
  if (!token) redirect("/login");

  const firstName = (formData.get("firstName") as string).trim();
  const lastName  = (formData.get("lastName") as string).trim();
  const handle    = (formData.get("handle") as string).trim();

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ first_name: firstName, last_name: lastName, handle }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: err?.errors?.[0]?.message ?? "Failed to update profile." };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
