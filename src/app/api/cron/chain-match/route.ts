import { NextRequest, NextResponse } from "next/server";

// Called hourly by Vercel cron (vercel.json)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

  const res = await fetch(`${origin}/api/chain-match`, {
    method: "POST",
    headers: { "x-chain-match-secret": process.env.CHAIN_MATCH_SECRET! },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
