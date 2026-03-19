import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

  const res = await fetch(`${origin}/api/direct-match`, {
    method: "POST",
    headers: { "x-direct-match-secret": process.env.DIRECT_MATCH_SECRET! },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
