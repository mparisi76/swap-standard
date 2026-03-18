import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getValidTokenWithUser } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const auth = await getValidTokenWithUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { assetId } = await req.json();
  if (!assetId) return NextResponse.json({ error: "Missing assetId" }, { status: 400 });

  // Use request origin so this works in both dev (localhost) and production
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_FEATURED_PRICE_ID!, quantity: 1 }],
      metadata: { asset_id: String(assetId), user_id: auth.userId },
      success_url: `${origin}/dashboard/featured/success?asset=${assetId}`,
      cancel_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout/featured]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
