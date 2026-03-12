import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getValidTokenWithUser } from "@/lib/auth";
import { Asset, Exchange, ExchangeStatus } from "@/types/schema";
import { Plus, FileText, Globe, ArrowLeftRight } from "lucide-react";
import ListingsTable from "@/components/dashboard/ListingsTable";

export const metadata: Metadata = {
  title: "Dashboard | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;



const EXCHANGE_STATUS_BADGE: Record<ExchangeStatus, string> = {
  pending:   "text-amber-600",
  active:    "text-emerald-700",
  completed: "text-zinc-400",
  declined:  "text-zinc-400 opacity-60",
};

const EXCHANGE_STATUS_LABEL: Record<ExchangeStatus, string> = {
  pending:   "Pending",
  active:    "Active",
  completed: "Completed",
  declined:  "Declined",
};

async function getMyAssets(token: string): Promise<Asset[]> {
  const url = new URL(`${BASE_URL}/items/assets`);
  url.searchParams.set("fields", "id,title,type,status,asset_status,date_created");
  url.searchParams.set("filter[user_created][_eq]", "$CURRENT_USER");
  url.searchParams.set("sort", "-date_created");
  url.searchParams.set("limit", "50");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as Asset[]) ?? [];
}

async function getMyExchanges(token: string): Promise<Exchange[]> {
  const url = new URL(`${BASE_URL}/items/exchanges`);
  url.searchParams.set(
    "fields",
    "id,status,date_updated,asset.id,asset.title,asset.type,initiator.id,initiator.first_name,initiator.last_name,owner.id,owner.first_name,owner.last_name",
  );
  url.searchParams.set("filter[_and][0][_or][0][initiator][_eq]", "$CURRENT_USER");
  url.searchParams.set("filter[_and][0][_or][1][owner][_eq]", "$CURRENT_USER");
  url.searchParams.set("filter[_and][1][status][_nin]", "completed,declined");
  url.searchParams.set("sort", "-date_updated");
  url.searchParams.set("limit", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as Exchange[]) ?? [];
}

function memberName(user: { first_name: string | null; last_name: string | null }): string {
  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Anonymous";
}

export default async function DashboardPage() {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");
  const { token, userId } = auth;

  const [items, exchanges] = await Promise.all([
    getMyAssets(token),
    getMyExchanges(token),
  ]);

  const published = items.filter((i) => i.status === "published").length;
  const drafts = items.filter((i) => i.status === "draft").length;
  const activeExchanges = exchanges.filter((e) => e.status === "active" || e.status === "pending").length;

  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-10">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
            Member Portal
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900">
            Dashboard
          </h1>
        </header>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link
            href="/dashboard/asset/new"
            className="col-span-2 md:col-span-1 border-4 border-zinc-900 p-6 md:p-8 bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={20} className="mb-3 text-emerald-700 group-hover:text-white transition-colors" />
            <h2 className="text-body font-black uppercase">Register Asset</h2>
            <p className="text-detail uppercase mt-1 font-bold opacity-60">
              Share what you can offer
            </p>
          </Link>

          <div className="border-4 border-zinc-900 p-6 md:p-8 bg-white">
            <Globe size={20} className="mb-3 text-zinc-400" />
            <h2 className="text-body font-black uppercase text-zinc-900">Published</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {published}
            </p>
          </div>

          <div className="border-4 border-zinc-900 p-6 md:p-8 bg-white">
            <FileText size={20} className="mb-3 text-zinc-400" />
            <h2 className="text-body font-black uppercase text-zinc-900">Drafts</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {drafts}
            </p>
          </div>

          <div className="border-4 border-zinc-900 p-6 md:p-8 bg-white">
            <ArrowLeftRight size={20} className="mb-3 text-zinc-400" />
            <h2 className="text-body font-black uppercase text-zinc-900">Active Trades</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {activeExchanges}
            </p>
          </div>
        </div>

        {/* Active Trades */}
        {exchanges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-label font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-900 pb-4">
              Active Trades
            </h2>

            <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
              {exchanges.map((ex) => {
                const counterparty = ex.owner.id === userId ? ex.initiator : ex.owner;
                return (
                  <Link
                    key={ex.id}
                    href={`/dashboard/exchanges/${ex.id}`}
                    className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-zinc-50 transition-colors"
                  >
                    {/* Asset title + counterparty */}
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-black uppercase text-zinc-900 truncate">
                        {ex.asset.title}
                      </p>
                      <p className="text-label font-bold uppercase text-zinc-400">
                        With {memberName(counterparty)}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`text-label font-bold uppercase shrink-0 ${EXCHANGE_STATUS_BADGE[ex.status] ?? "text-zinc-400"}`}>
                      {EXCHANGE_STATUS_LABEL[ex.status]}
                    </span>

                    {/* Date — desktop only */}
                    <span className="font-mono text-label text-zinc-400 shrink-0 hidden md:block">
                      {new Date(ex.date_updated).toLocaleDateString()}
                    </span>

                    <span className="text-label font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 shrink-0">
                      Open →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* My Listings */}
        <section className="space-y-4">
          <h2 className="text-label font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-900 pb-4">
            My Listings
          </h2>

          {items.length === 0 ? (
            <div className="border-2 border-zinc-200 bg-white p-10 text-center">
              <p className="text-body font-bold uppercase text-zinc-400">No listings yet.</p>
              <Link
                href="/dashboard/asset/new"
                className="inline-block mt-4 text-label font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-700 hover:text-zinc-900 hover:border-zinc-900 transition-all"
              >
                Register your first asset →
              </Link>
            </div>
          ) : (
            <ListingsTable items={items} />
          )}
        </section>

      </div>
    </main>
  );
}
