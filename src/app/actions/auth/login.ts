"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthState = { error?: string } | null;

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Attempting login to:", process.env.NEXT_PUBLIC_DIRECTUS_URL);
  console.log("Email being sent:", email);

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
      secure: false,
      sameSite: "lax" as const,
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