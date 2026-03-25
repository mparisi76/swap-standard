import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getValidTokenWithUser } from "@/lib/auth";
import { UnpublishButton, DismissButton } from "./FlagActions";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
const STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN!;

const REASON_LABELS: Record<string, string> = {
  spam: "Spam or scam",
  inappropriate: "Inappropriate content",
  unavailable: "Already traded / no longer available",
  wrong_category: "Wrong category",
  other: "Other",
};

interface Flag {
  id: number;
  asset_id: number;
  reason: string;
  notes: string | null;
  ip: string | null;
  date_created: string;
  dismissed: boolean;
  asset?: { id: number; title: string; status: string } | null;
}

async function getAdminRole(token: string): Promise<string | null> {
  const res = await fetch(`${DIRECTUS_URL}/users/me?fields=role.name`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data?.role?.name ?? null;
}

async function getFlags(): Promise<Flag[]> {
  const res = await fetch(
    `${DIRECTUS_URL}/items/asset_flags?fields=id,asset_id,reason,notes,ip,date_created,dismissed&filter[dismissed][_neq]=true&sort=-date_created&limit=100`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  if (!res.ok) return [];
  const { data } = await res.json();
  const flags = (data as Flag[]) ?? [];

  // Fetch asset titles for unique asset IDs
  const assetIds = [...new Set(flags.map((f) => f.asset_id).filter(Boolean))];
  if (assetIds.length === 0) return flags;

  const assetsRes = await fetch(
    `${DIRECTUS_URL}/items/assets?fields=id,title,status&filter[id][_in]=${assetIds.join(",")}&limit=${assetIds.length}`,
    { headers: { Authorization: `Bearer ${STATIC_TOKEN}` }, cache: "no-store" },
  );
  const assetsJson = assetsRes.ok ? await assetsRes.json() : { data: [] };
  const assetsMap = Object.fromEntries(
    (assetsJson.data as { id: number; title: string; status: string }[]).map((a) => [a.id, a]),
  );

  return flags.map((f) => ({ ...f, asset: assetsMap[f.asset_id] ?? null }));
}

export default async function AdminFlagsPage() {
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");

  const role = await getAdminRole(auth.token);
  if (role !== "Administrator") notFound();

  const flags = await getFlags();
  const activeFlags = flags.filter((f) => !f.dismissed);

  return (
    <main className="min-h-screen bg-[#F9F8F6] px-4 md:px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        <header className="border-b-4 border-zinc-900 pb-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-1">
            Admin
          </span>
          <div className="flex items-center justify-between">
            <h1 className="text-header font-black uppercase italic text-zinc-900">
              Flagged Listings
            </h1>
            <span className="font-mono text-label text-zinc-500">
              {activeFlags.length} pending
            </span>
          </div>
        </header>

        {activeFlags.length === 0 ? (
          <div className="border-2 border-zinc-200 bg-white p-10 text-center">
            <p className="text-body font-bold uppercase text-zinc-500">No pending flags.</p>
          </div>
        ) : (
          <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
            {activeFlags.map((flag) => (
              <div key={flag.id} className="px-6 py-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    {flag.asset ? (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/explore/${flag.asset.id}`}
                          className="text-body font-black uppercase italic text-zinc-900 hover:text-emerald-700 transition-colors"
                        >
                          {flag.asset.title}
                        </Link>
                        <span className={`text-label font-black uppercase px-2 py-0.5 ${
                          flag.asset.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {flag.asset.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-body font-black uppercase text-zinc-400">
                        Asset #{flag.asset_id} (deleted)
                      </span>
                    )}
                    <p className="text-label font-bold uppercase tracking-widest text-zinc-500">
                      {REASON_LABELS[flag.reason] ?? flag.reason}
                    </p>
                    {flag.notes && (
                      <p className="text-body text-zinc-600 italic">&ldquo;{flag.notes}&rdquo;</p>
                    )}
                    <p className="font-mono text-detail text-zinc-400">
                      {new Date(flag.date_created).toLocaleString()} · IP: {flag.ip ?? "unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {flag.asset?.status === "published" && (
                      <UnpublishButton assetId={flag.asset_id} />
                    )}
                    <DismissButton flagId={flag.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-label font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
