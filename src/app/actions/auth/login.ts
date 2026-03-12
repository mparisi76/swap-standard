"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTurnstile } from "@/utils/turnstile";

export type AuthState = { error?: string } | null;

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const turnstileToken = formData.get("cf-turnstile-response") as string;
  const turnstile = await verifyTurnstile(turnstileToken);
  if (!turnstileToken || !turnstile.success) {
    return { error: `Human verification failed. [${(turnstile.errorCodes ?? ["no-token"]).join(",")}]` };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password, mode: "json" }),
      headers: { "Content-Type": "application/json" },
    });

    const authData = await res.json();

    if (!res.ok) return { error: "Invalid Credentials" };

    const cookieStore = await cookies();
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };

    cookieStore.set("directus_session", authData.data.access_token, cookieOpts);
    cookieStore.set("directus_refresh_token", authData.data.refresh_token, cookieOpts);

  } catch {
    return { error: "Connection to Server failed" };
  }

  redirect("/dashboard");
}