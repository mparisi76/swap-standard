"use server";

import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export type PasswordState = { error?: string; success?: boolean } | null;

export async function changePasswordAction(
  prevState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const token = await getValidToken();
  if (!token) redirect("/login");

  const password    = formData.get("password") as string;
  const confirmPass = formData.get("confirmPassword") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPass) {
    return { error: "Passwords do not match." };
  }

  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { error: err?.errors?.[0]?.message ?? "Failed to update password." };
  }

  return { success: true };
}
