import { NextRequest, NextResponse } from "next/server";
import { getValidTokenWithUser } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getValidTokenWithUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token, userId } = auth;
  const { id: assetId } = await params;

  // Check if already saved
  const checkRes = await fetch(
    `${BASE_URL}/items/asset_saves?filter[user_created][_eq]=${userId}&filter[asset][_eq]=${assetId}&limit=1&fields=id`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!checkRes.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
  const { data } = await checkRes.json();

  if (data?.[0]) {
    // Already saved — delete it
    const delRes = await fetch(`${BASE_URL}/items/asset_saves/${data[0].id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!delRes.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
    return NextResponse.json({ saved: false });
  } else {
    // Not saved — create it; user token auto-sets user_created correctly
    const createRes = await fetch(`${BASE_URL}/items/asset_saves`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ asset: assetId }),
    });
    if (!createRes.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });
    return NextResponse.json({ saved: true });
  }
}
