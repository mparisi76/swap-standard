"use server";

import { revalidatePath } from "next/cache";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

export async function updateNotificationsAction(formData: FormData) {
  const auth = await getValidTokenWithUser();
  if (!auth) return;

  await fetch(`${BASE_URL}/users/${auth.userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notify_matches:  formData.get("notify_matches")  === "true",
      notify_messages: formData.get("notify_messages") === "true",
      notify_activity: formData.get("notify_activity") === "true",
    }),
  });

  revalidatePath("/dashboard/settings");
}
