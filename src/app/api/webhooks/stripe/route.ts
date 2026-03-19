import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;


export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const assetId = session.metadata?.asset_id;

    if (assetId) {
      const featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`${DIRECTUS_URL}/items/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured_until: featuredUntil }),
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const assetId = charge.metadata?.asset_id;

    if (assetId) {
      await fetch(`${DIRECTUS_URL}/items/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured_until: null }),
      });
    }
  }

  return NextResponse.json({ received: true });
}
