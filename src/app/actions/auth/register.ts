"use server";

import { redirect } from "next/navigation";
import { verifyTurnstile } from "@/utils/turnstile";
import {
  createDirectus,
  rest,
  staticToken,
  createUser,
  DirectusUser,
} from "@directus/sdk";
import { generateVerificationToken } from "@/utils/email-token";

export type AuthResponse = {
  error?: string;
  success?: boolean;
  fields?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    handle?: string;
    // inventoryType?: string;
  };
} | null;

interface DirectusError {
  errors: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

export async function registerAction(
  prevState: AuthResponse,
  formData: FormData,
): Promise<AuthResponse> {
  const turnstileToken = formData.get("cf-turnstile-response") as string;
  const turnstile = await verifyTurnstile(turnstileToken);
  if (!turnstileToken || !turnstile.success) {
    return { error: `Human verification failed. [${(turnstile.errorCodes ?? ["no-token"]).join(",")}]` };
  }

  const email = (formData.get("email") as string).toLowerCase().trim();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const handle = formData.get("handle") as string;
  const password = formData.get("password") as string;

  const fields = { email, firstName, lastName, handle };

  // Simple Regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address.", fields };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", fields };
  }

  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
  const vendorRoleId = process.env.DIRECTUS_MEMBER_ROLE_ID;

  if (!url || !adminToken) {
    return { error: "Server configuration missing.", fields };
  }

  const client = createDirectus(url).with(staticToken(adminToken)).with(rest());

  try {
    await client.request(
      createUser({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        role: vendorRoleId,
        status: "pending",
        handle: handle,
      } as DirectusUser & { handle: string }),
    );
  } catch (err: unknown) {
    const error = err as DirectusError;
    const errorCode = error.errors?.[0]?.extensions?.code;

    let message = error.errors?.[0]?.message || "Registration failed.";
    if (errorCode === "RECORD_NOT_UNIQUE") {
      message = "An account with this email already exists.";
    }

    return { error: message, fields };
  }

  const resendKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com";

  if (resendKey) {
    const token = generateVerificationToken(email);
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

    // Send verification email to new user
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SwapStandard <noreply@swapstandard.com>",
        to: email,
        subject: "Verify your SwapStandard account",
        text: `Hi ${firstName},\n\nVerify your email to activate your SwapStandard account:\n\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't create an account, you can ignore this email.\n\n— SwapStandard`,
      }),
    }).catch(() => {});

    // Notify admin of new signup
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SwapStandard <noreply@swapstandard.com>",
        to: "swapstandard@gmail.com",
        subject: "New member signup",
        text: `New member registered on SwapStandard.\n\nName: ${firstName} ${lastName}\nHandle: ${handle || "—"}\nEmail: ${email}\n`,
      }),
    }).catch(() => {});
  }

  redirect("/login?registered=true");
}
