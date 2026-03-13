import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { getValidTokenWithUser } from "@/lib/auth";
import { initiateExchangeAction, type ExchangeFormState } from "@/app/actions/exchanges/initiate";
import InitiateExchangeForm from "./InitiateExchangeForm";

export const metadata: Metadata = {
  title: "Initiate Exchange | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

async function getAssetForExchange(token: string, assetId: string) {
  const res = await fetch(
    `${BASE_URL}/items/assets/${assetId}?fields=id,title,type,thumbnail,offering,asset_status,user_created`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const { data } = await res.json();
  return data;
}

export default async function NewExchangePage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const { asset: assetId } = await searchParams;
  const auth = await getValidTokenWithUser();
  if (!auth) redirect("/login");

  if (!assetId) redirect("/explore");

  const asset = await getAssetForExchange(auth.token, assetId);
  if (!asset) redirect("/explore");

  if (asset.user_created === auth.userId) {
    redirect(`/explore/${assetId}`);
  }

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">

      {/* Breadcrumb */}
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/explore/${assetId}`}
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Listing
          </Link>
          <span className="font-mono text-label text-zinc-400 uppercase tracking-widest">
            New Exchange
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="border-b-4 border-zinc-900 pb-8 mb-12">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
            Exchanges
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            Initiate Exchange
          </h1>
          <p className="text-body text-zinc-500 mt-4 leading-relaxed">
            Introduce yourself and describe what you&apos;d like to offer in return.
          </p>
        </header>

        {/* Asset context card */}
        <div className="border-2 border-zinc-900 bg-white p-5 flex gap-4 mb-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-20 h-20 shrink-0 border-2 border-zinc-900 bg-zinc-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[8px] px-1 font-mono uppercase z-10">
              IMG
            </div>
            {asset.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${BASE_URL}/assets/${asset.thumbnail}?width=160`}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-zinc-300 uppercase">
                Empty
              </div>
            )}
          </div>
          <div className="min-w-0">
            <span className="bg-zinc-900 text-white text-label font-black px-2 py-0.5 uppercase tracking-wider text-[10px]">
              {asset.type}
            </span>
            <h2 className="text-body font-black uppercase italic text-zinc-900 mt-1 leading-tight">
              {asset.title}
            </h2>
            {asset.offering && (
              <p className="text-detail text-zinc-500 mt-1 line-clamp-2 leading-tight">
                {asset.offering}
              </p>
            )}
          </div>
        </div>

        <InitiateExchangeForm assetId={String(asset.id)} />
      </div>
    </main>
  );
}
