import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getValidTokenWithUser } from "@/lib/auth";
import { type Exchange, type ExchangeMessage } from "@/types/schema";
import StatusActions from "./StatusActions";
import ReplyForm from "./ReplyForm";
import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exchange | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

const EXCHANGE_FIELDS = [
  "id", "status", "date_created", "date_updated",
  "asset.id", "asset.title", "asset.type", "asset.thumbnail", "asset.asset_status",
  "initiator.id", "initiator.first_name", "initiator.last_name",
  "owner.id", "owner.first_name", "owner.last_name",
].join(",");

// Directus may return M2O relations as a UUID string or a full object depending on permissions
type UserField = { id: string; first_name: string | null; last_name: string | null } | string | null;

function resolveUserId(field: UserField): string {
  if (!field) return "";
  return typeof field === "string" ? field : field.id;
}

function memberName(field: UserField): string {
  if (!field || typeof field === "string") return "Member";
  return `${field.first_name ?? ""} ${field.last_name ?? ""}`.trim() || "Member";
}

export default async function ExchangeThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { token, userId } = auth;

  const [exchangeRes, messagesRes] = await Promise.all([
    fetch(`${BASE_URL}/items/exchanges?filter[id][_eq]=${id}&fields=${EXCHANGE_FIELDS}&limit=1`, {
      headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
      cache: "no-store",
    }),
    fetch(
      `${BASE_URL}/items/exchange_messages?filter[exchange][_eq]=${id}&fields=id,sender.id,sender.first_name,sender.last_name,content,date_created&sort=date_created&limit=100`,
      { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
    ),
  ]);

  const exchangeText = await exchangeRes.text();

  if (!exchangeRes.ok) {
    throw new Error(`Exchange fetch failed (${exchangeRes.status}): ${exchangeText.slice(0, 300)}`);
  }

  const exchangeJson = exchangeText ? JSON.parse(exchangeText) : null;
  const exchange = (exchangeJson?.data?.[0] ?? null) as Exchange | null;
  if (!exchange) notFound();
  const ex = exchange!;

  // Ensure the current user is a party to this exchange
  const initiatorId = resolveUserId(ex.initiator as UserField);
  const ownerId = resolveUserId(ex.owner as UserField);
  if (userId !== initiatorId && userId !== ownerId) notFound();

  const messagesText = await messagesRes.text();
  const messages: ExchangeMessage[] = messagesRes.ok && messagesText
    ? (JSON.parse(messagesText).data ?? [])
    : [];

  const isOwner = resolveUserId(ex.owner as UserField) === userId;
  const counterparty = isOwner ? ex.initiator : ex.owner;
  const isClosed = ex.status === "completed" || ex.status === "declined" || !ex.asset;

  return (
    <main className="flex flex-col bg-[#F9F8F6] overflow-hidden" style={{ height: "calc(100dvh - 72px)" }}>
      <AutoRefresh intervalMs={15000} />

      {/* Breadcrumb */}
      <div className="border-b-2 border-zinc-900 bg-white shrink-0">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>
          <span className="font-mono text-label text-zinc-500 uppercase tracking-widest">
            Exch—{String(ex.id).padStart(6, "0")}
          </span>
        </div>
      </div>

      {/* Body: asset panel (fixed) + message section (fills remaining height) */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="max-w-2xl mx-auto w-full px-6 pt-8 pb-4 shrink-0">

          {/* Asset + exchange metadata — single panel */}
          <div className="border-2 border-zinc-900 bg-white">

            {/* Asset row */}
            {ex.asset ? (
              <Link
                href={`/explore/${ex.asset.id}`}
                className="flex gap-4 p-5 border-b-2 border-zinc-900 hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-16 h-16 shrink-0 border-2 border-zinc-900 bg-zinc-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[8px] px-1 font-mono uppercase z-10">
                    IMG
                  </div>
                  {ex.asset.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${BASE_URL}/assets/${ex.asset.thumbnail}?width=160`}
                      alt={ex.asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-zinc-400 uppercase">
                      Empty
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-zinc-900 text-white text-label font-black px-2 py-0.5 uppercase tracking-wider text-[10px]">
                      {ex.asset.type}
                    </span>
                    <span className={`text-label font-black px-2 py-0.5 uppercase tracking-wider text-[10px] ${isOwner ? "bg-emerald-700 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      {isOwner ? "Your listing" : "Their listing"}
                    </span>
                  </div>
                  <h2 className="text-body font-black uppercase italic text-zinc-900 mt-1 leading-tight">
                    {ex.asset.title}
                  </h2>
                </div>
                <span className="text-label font-bold text-emerald-700 uppercase tracking-wide shrink-0 self-center">
                  View →
                </span>
              </Link>
            ) : (
              <div className="flex gap-4 p-5 border-b-2 border-zinc-900">
                <div className="min-w-0 flex-1">
                  <p className="text-body font-black uppercase italic text-zinc-500">Listing deleted</p>
                </div>
              </div>
            )}

            {/* Exchange metadata + status */}
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-6 text-label font-mono text-zinc-500">
                <div>
                  <span className="font-black uppercase text-zinc-500 block tracking-widest">With</span>
                  <span className="text-zinc-900 font-bold">{memberName(counterparty)}</span>
                </div>
                <div>
                  <span className="font-black uppercase text-zinc-500 block tracking-widest">Initiated</span>
                  <span className="text-zinc-900 font-bold">
                    {new Date(ex.date_created).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-black uppercase text-zinc-500 block tracking-widest">Updated</span>
                  <span className="text-zinc-900 font-bold">
                    {new Date(ex.date_updated).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <StatusActions exchange={exchange} currentUserId={userId} />
            </div>
          </div>
        </div>

        {/* Message section — fills all remaining height */}
        <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full px-6 pb-6 flex flex-col">
          <section className="border-2 border-zinc-900 bg-white flex flex-col flex-1 min-h-0">
            <h2 className="text-label font-black uppercase tracking-widest text-zinc-500 border-b-2 border-zinc-900 px-6 py-4 shrink-0">
              Messages
            </h2>

            {/* Scrollable message list */}
            <div className="overflow-y-auto flex-1 px-6 py-6">
              {messages.length === 0 ? (
                <p className="text-detail text-zinc-500 italic">No messages yet.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = resolveUserId(msg.sender as UserField) === userId;
                    return (
                      <div key={msg.id} className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className={`font-mono text-label font-bold ${isMe ? "text-zinc-900" : "text-emerald-700"}`}>
                            {isMe ? "You" : memberName(msg.sender)}
                          </span>
                          <span className="font-mono text-detail text-zinc-500">
                            {new Date(msg.date_created).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-body leading-relaxed whitespace-pre-wrap text-zinc-800">{msg.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reply form — always anchored at bottom */}
            {!isClosed && (
              <div className="border-t-2 border-zinc-900 px-6 py-5 space-y-3 bg-[#F9F8F6] shrink-0">
                <ReplyForm exchangeId={ex.id} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
