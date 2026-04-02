import { directus } from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { Asset } from "@/types/schema";
import Link from "next/link";
import { ArrowLeft, Tag, Clock, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import AssetGallery from "@/components/explore/AssetGallery";
import FlagButton from "@/components/explore/FlagButton";
import RecentViewTracker from "@/components/explore/RecentViewTracker";
import RecentlyViewed from "@/components/explore/RecentlyViewed";
import SimilarItems from "@/components/explore/SimilarItems";
import MoreFromMember from "@/components/explore/MoreFromMember";
import ShareButton from "./ShareButton";
import SaveButton from "./SaveButton";

import { Suspense } from "react";

import { getValidTokenWithUser } from "@/lib/auth";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

const FIELDS = [
  "id",
  "title",
  "offering",
  "seeking",
  "type",
  "asset_status",
  "location_label",
  "thumbnail",
  "image_gallery.directus_files_id",
  "date_created",
  "user_created",
  "featured_until",
] as unknown as (keyof Asset)[];

async function fetchAsset(id: string): Promise<Asset | null> {
  try {
    const response = await directus.request(
      readItem("assets", id, { fields: FIELDS }),
    );
    return response ? (response as unknown as Asset) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const asset = await fetchAsset(id);

  if (!asset) return { title: "Asset Not Found" };

  const description = asset.offering
    ? asset.offering.slice(0, 155).trimEnd() + (asset.offering.length > 155 ? "…" : "")
    : `${asset.type} available on SwapStandard.`;

  const ogImage = asset.thumbnail
    ? `${DIRECTUS_URL}/assets/${asset.thumbnail}?width=1200&height=630&fit=cover&quality=85`
    : undefined;

  return {
    title: asset.title,
    description,
    openGraph: {
      title: asset.title,
      description,
      type: "article",
      ...(asset.location_label && { locale: asset.location_label }),
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: asset.title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [asset, auth] = await Promise.all([fetchAsset(id), getValidTokenWithUser()]);
  if (!asset) notFound();

  const isLoggedIn = !!auth;
  const isOwner = !!auth && asset.user_created === auth.userId;

  // Check if current user has saved this asset
  let isSaved = false;
  if (auth) {
    const saveRes = await fetch(
      `${DIRECTUS_URL}/items/asset_saves?filter[user_created][_eq]=${auth.userId}&filter[asset][_eq]=${id}&limit=1&fields=id`,
      { headers: { Authorization: `Bearer ${process.env.DIRECTUS_STATIC_TOKEN!}` }, cache: "no-store" },
    );
    if (saveRes.ok) {
      const { data } = await saveRes.json();
      isSaved = data?.length > 0;
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: asset.title,
    description: asset.offering ?? undefined,
    image: asset.thumbnail
      ? `${DIRECTUS_URL}/assets/${asset.thumbnail}?width=1200&height=630&fit=cover`
      : `${siteUrl}/opengraph-image.png`,
    url: `${siteUrl}/explore/${asset.id}`,
    datePublished: asset.date_created,
    brand: {
      "@type": "Brand",
      name: "SwapStandard",
    },
    offers: {
      "@type": "Offer",
      availability: asset.asset_status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: "0",
      priceCurrency: "USD",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        doesNotShip: true,
      },
    },
  };

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentViewTracker assetId={id} />

      <div className="border-b-2 border-zinc-900 bg-white sticky top-(--header-height) z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Explore
          </Link>
          <span className="font-mono text-label text-zinc-500">
            REF—{String(asset.id).padStart(6, "0")}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Suspense fallback={null}>
        </Suspense>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-8">
            <AssetGallery
              thumbnail={asset.thumbnail as string}
              photo_gallery={asset.image_gallery}
              name={asset.title}
              isSold={asset.asset_status !== "available"}
            />
          </div>

          <div className="md:col-span-7 space-y-10">
            <header>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-label font-black uppercase text-emerald-700 tracking-[0.2em]">
                    {asset.asset_status || "Available"}
                  </span>
                  {asset.featured_until && new Date(asset.featured_until) > new Date() && (
                    <span className="flex items-center gap-1 text-label font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                      <Star size={9} fill="currentColor" strokeWidth={0} />
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  <SaveButton assetId={asset.id} initialSaved={isSaved} isLoggedIn={isLoggedIn} />
                  <ShareButton url={`${siteUrl}/explore/${asset.id}`} title={asset.title} />
                  {!isOwner && <FlagButton assetId={asset.id} assetTitle={asset.title} />}
                </div>
              </div>
              <h1 className="text-header font-black uppercase italic leading-tight text-zinc-900 border-b-4 border-zinc-900 pb-6">
                {asset.title}
              </h1>

              <div className="flex gap-10 pt-6">
                <div className="flex items-center gap-4">
                  <Tag size={18} className="text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-label font-black uppercase text-zinc-500 leading-none">
                      Category
                    </span>
                    <span className="text-body font-bold text-zinc-900 uppercase">
                      {asset.type || "General"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock size={18} className="text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-label font-black uppercase text-zinc-500 leading-none">
                      Logged Date
                    </span>
                    <span className="text-body font-bold text-zinc-900 uppercase">
                      {new Date(asset.date_created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-label font-black uppercase text-zinc-500">
                  I&apos;m offering:
                </label>
                <p className="text-body text-zinc-900 leading-relaxed">
                  {asset.offering || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-label font-black uppercase text-zinc-500">
                  I&apos;m seeking:
                </label>
                <p className="text-body font-bold text-zinc-900 leading-relaxed border-l-4 border-emerald-600 pl-6">
                  {asset.seeking || "—"}
                </p>
              </div>
            </div>

            <div className="pt-6">
              {!isLoggedIn ? (
                <Link
                  href={`/login?callbackUrl=/explore/${id}`}
                  className="block w-full text-center bg-zinc-900 text-white font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-emerald-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  Log In to Initiate Exchange
                </Link>
              ) : isOwner ? (
                <Link
                  href={`/dashboard/asset/${id}/edit`}
                  className="block w-full text-center border-2 border-zinc-900 bg-white text-zinc-900 font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-zinc-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Edit Listing
                </Link>
              ) : (
                <Link
                  href={`/dashboard/exchanges/new?asset=${id}`}
                  className="block w-full text-center bg-zinc-900 text-white font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-emerald-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  Initiate Exchange
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <SimilarItems type={asset.type} currentId={asset.id} />
      </Suspense>
      {asset.user_created && (
        <Suspense fallback={null}>
          <MoreFromMember userId={asset.user_created} currentId={asset.id} />
        </Suspense>
      )}
      <RecentlyViewed currentId={id} />
    </main>
  );
}
