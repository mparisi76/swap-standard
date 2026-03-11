import { Metadata } from "next";
import Link from "next/link";
import { getValidToken } from "@/lib/auth";
import { Asset } from "@/types/schema";
import { Plus, FileText, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | SwapStandard",
};

const STATUS_BADGE: Record<string, string> = {
  published: "bg-emerald-700 text-white",
  draft:     "bg-zinc-200 text-zinc-600",
  archived:  "bg-zinc-900 text-white",
};

const ASSET_STATUS_BADGE: Record<string, string> = {
  available:   "text-emerald-700",
  pending:     "text-amber-600",
  unavailable: "text-zinc-400",
};

async function getMyAssets(token: string): Promise<Asset[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/assets`,
  );
  url.searchParams.set(
    "fields",
    "id,title,type,status,asset_status,date_created",
  );
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

export default async function DashboardPage() {
  const token = await getValidToken();
  const items = token ? await getMyAssets(token) : [];

  const published = items.filter((i) => i.status === "published").length;
  const drafts = items.filter((i) => i.status === "draft").length;

  return (
    <main className="min-h-screen bg-[#F9F8F6] px-6 py-12">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/asset/new"
            className="border-4 border-zinc-900 p-8 bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus size={20} className="mb-3 text-emerald-700 group-hover:text-white transition-colors" />
            <h2 className="text-body font-black uppercase">Register Asset</h2>
            <p className="text-detail uppercase mt-1 font-bold opacity-60">
              Share what you can offer
            </p>
          </Link>

          <div className="border-4 border-zinc-900 p-8 bg-white">
            <Globe size={20} className="mb-3 text-zinc-400" />
            <h2 className="text-body font-black uppercase text-zinc-900">Published</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {published}
            </p>
          </div>

          <div className="border-4 border-zinc-900 p-8 bg-white">
            <FileText size={20} className="mb-3 text-zinc-400" />
            <h2 className="text-body font-black uppercase text-zinc-900">Drafts</h2>
            <p className="text-[calc(var(--text-header-size)*2)] font-black text-zinc-900 leading-none mt-1">
              {drafts}
            </p>
          </div>
        </div>

        {/* My items */}
        <section className="space-y-4">
          <h2 className="text-label font-black uppercase tracking-widest text-zinc-400 border-b-2 border-zinc-900 pb-4">
            My Listings
          </h2>

          {items.length === 0 ? (
            <div className="border-2 border-zinc-200 bg-white p-10 text-center">
              <p className="text-body font-bold uppercase text-zinc-400">
                No listings yet.
              </p>
              <Link
                href="/dashboard/asset/new"
                className="inline-block mt-4 text-label font-black uppercase tracking-widest text-emerald-700 border-b border-emerald-700 hover:text-zinc-900 hover:border-zinc-900 transition-all"
              >
                Register your first asset →
              </Link>
            </div>
          ) : (
            <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-6 px-6 py-4 hover:bg-zinc-50 transition-colors"
                >
                  {/* Ref */}
                  <span className="font-mono text-label text-zinc-400 shrink-0 w-20">
                    {String(item.id).padStart(6, "0")}
                  </span>

                  {/* Title + type */}
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-black uppercase text-zinc-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-label font-bold uppercase text-zinc-400">
                      {item.type}
                    </p>
                  </div>

                  {/* Directus status */}
                  <span className={`text-label font-black uppercase tracking-wider px-2 py-1 shrink-0 ${STATUS_BADGE[item.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {item.status}
                  </span>

                  {/* Asset status */}
                  <span className={`text-label font-bold uppercase shrink-0 ${ASSET_STATUS_BADGE[item.asset_status] ?? "text-zinc-400"}`}>
                    {item.asset_status}
                  </span>

                  {/* Date */}
                  <span className="font-mono text-label text-zinc-400 shrink-0 hidden md:block">
                    {new Date(item.date_created).toLocaleDateString()}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/dashboard/asset/${item.id}/edit`}
                      className="text-label font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      Edit
                    </Link>
                    {item.status === "published" && (
                      <Link
                        href={`/explore/${item.id}`}
                        className="text-label font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
