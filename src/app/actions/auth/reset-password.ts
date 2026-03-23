"use server";

import { redirect } from "next/navigation";
import { verifyPasswordResetToken } from "@/utils/password-reset-token";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export type ResetPasswordState = { error?: string } | null;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token) return { error: "Missing reset token." };
  if (!password || password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const parsed = verifyPasswordResetToken(token);
  if (!parsed) return { error: "This link has expired or is invalid. Please request a new one." };

  const res = await fetch(`${DIRECTUS_URL}/users/${parsed.userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) return { error: "Failed to update password. Please try again." };

  redirect("/login?reset=true");
}
