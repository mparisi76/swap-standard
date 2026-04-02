import { NextRequest, NextResponse } from "next/server";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function POST(req: NextRequest) {
  const auth = await getValidTokenWithUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token } = auth;

  const { ids } = await req.json() as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  const res = await fetch(`${BASE_URL}/items/asset_saves`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ keys: ids }),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
