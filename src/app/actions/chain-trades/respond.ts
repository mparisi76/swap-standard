"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";
import { sendChainTradeConfirmed } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

type Position = "a" | "b" | "c";

interface ChainTradeRow {
  id: number;
  chain_status: string;
  user_a: string;
  user_b: string;
  user_c: string;
  accepted_a: boolean;
  accepted_b: boolean;
  accepted_c: boolean;
  asset_a: { id: number; title: string };
  asset_b: { id: number; title: string };
  asset_c: { id: number; title: string };
}

async function fetchChainTrade(chainId: number): Promise<ChainTradeRow | null> {
  const fields = [
    "id", "chain_status", "user_a", "user_b", "user_c",
    "accepted_a", "accepted_b", "accepted_c",
    "asset_a.id", "asset_a.title",
    "asset_b.id", "asset_b.title",
    "asset_c.id", "asset_c.title",
  ].join(",");
  const res = await fetch(`${BASE_URL}/items/chain_trades/${chainId}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as ChainTradeRow;
}

async function sendConfirmationEmails(chain: ChainTradeRow) {
  const userIds = [chain.user_a, chain.user_b, chain.user_c];
  const usersRes = await fetch(
    `${BASE_URL}/users?filter[id][_in]=${userIds.join(",")}&fields=id,email,first_name,email_unsubscribed`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!usersRes.ok) return;

  const { data: users } = await usersRes.json();
  const userMap = new Map<string, { email: string; first_name: string | null }>();
  for (const u of users) {
    if (!u.email_unsubscribed) userMap.set(u.id, { email: u.email, first_name: u.first_name });
  }

  const slots = [
    { userId: chain.user_a, asset: chain.asset_a },
    { userId: chain.user_b, asset: chain.asset_b },
    { userId: chain.user_c, asset: chain.asset_c },
  ];

  const emailPromises = slots.map(({ userId, asset }) => {
    const user = userMap.get(userId);
    if (!user?.email) return Promise.resolve();
    const partners = slots
      .filter((s) => s.userId !== userId)
      .map((s) => {
        const partner = userMap.get(s.userId);
        return { firstName: partner?.first_name ?? null, assetTitle: s.asset.title };
      });
    return sendChainTradeConfirmed({
      to: user.email,
      userId,
      firstName: user.first_name,
      chainId: chain.id,
      yourAssetTitle: asset.title,
      partners,
    });
  });

  await Promise.allSettled(emailPromises);
}

export async function respondToChainTrade(
  chainId: number,
  position: Position,
  accept: boolean,
) {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");

  const field = `accepted_${position}`;
  const patch: Record<string, unknown> = { [field]: accept };
  if (!accept) patch.chain_status = "declined";

  const res = await fetch(`${BASE_URL}/items/chain_trades/${chainId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) throw new Error("Failed to update chain trade");

  if (accept) {
    const chain = await fetchChainTrade(chainId);
    if (chain && chain.accepted_a && chain.accepted_b && chain.accepted_c) {
      await fetch(`${BASE_URL}/items/chain_trades/${chainId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${STATIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chain_status: "pending" }),
      });
      await sendConfirmationEmails(chain);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/chain-trades/${chainId}`);
}
