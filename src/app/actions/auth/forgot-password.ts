"use server";

import { generatePasswordResetToken } from "@/utils/password-reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export type ForgotPasswordState = { sent: boolean; error?: string } | null;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get("email") as string).toLowerCase().trim();
  if (!email) return { sent: false, error: "Email is required." };

  try {
    const res = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,first_name&limit=1`,
      { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
    );
    if (res.ok) {
      const { data } = await res.json();
      const user = data?.[0];
      if (user) {
        const token = generatePasswordResetToken(user.id);
        await sendPasswordResetEmail({ to: email, firstName: user.first_name, token });
      }
    }
  } catch {
    // Swallow errors — always show success to avoid email enumeration
  }

  // Always return sent:true so we don't reveal whether the email exists
  return { sent: true };
}
