import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = await getValidToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error("Directus upload rejected:", res.status, JSON.stringify(errBody));
    return NextResponse.json({ error: "Upload failed", detail: errBody }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ id: data.data.id });
}
