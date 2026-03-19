import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  if (!uid || !token || !verifyUnsubscribeToken(uid, token)) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=invalid`);
  }

  const res = await fetch(`${BASE_URL}/users/${uid}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_unsubscribed: true }),
  });

  if (!res.ok) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=failed`);
  }

  return NextResponse.redirect(`${SITE_URL}/unsubscribe?success=true`);
}
