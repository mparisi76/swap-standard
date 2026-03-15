"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(formData: FormData) {
  const cookieStore = await cookies();
  cookieStore.delete("directus_session");
  cookieStore.delete("directus_refresh_token");

  const returnTo = formData.get("returnTo") as string | null;
  const isPublic = returnTo && !returnTo.startsWith("/dashboard");
  redirect(isPublic ? returnTo : "/login");
}