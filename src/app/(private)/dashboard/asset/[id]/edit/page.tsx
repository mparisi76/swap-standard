import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getValidToken } from "@/lib/auth";
import { Asset } from "@/types/schema";
import EditAssetForm from "./EditAssetForm";
import type { InitialPhoto } from "@/components/assets/PhotoUploader";

export const metadata: Metadata = {
  title: "Edit Asset | SwapStandard",
};

async function getAsset(token: string, id: string): Promise<Asset | null> {
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
  const fields = [
    "id", "status", "title", "type", "offering", "offering_tags", "seeking", "seeking_tags",
    "asset_status", "thumbnail", "image_gallery.directus_files_id",
    "latitude", "longitude", "location_label",
  ].join(",");

  const res = await fetch(
    `${baseUrl}/items/assets/${id}?fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (res.status === 403 || res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as Asset;
}

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getValidToken();
  if (!token) redirect("/login");

  const asset = await getAsset(token, id);
  if (!asset) notFound();

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

  const initialPhotos: InitialPhoto[] = [];

  if (asset.thumbnail) {
    initialPhotos.push({
      fileId: asset.thumbnail,
      previewUrl: `${directusUrl}/assets/${asset.thumbnail}?width=400&quality=80`,
    });
  }

  for (const item of asset.image_gallery ?? []) {
    const fid = item.directus_files_id;
    if (fid && fid !== asset.thumbnail) {
      initialPhotos.push({
        fileId: fid,
        previewUrl: `${directusUrl}/assets/${fid}?width=400&quality=80`,
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">

      {/* Breadcrumb */}
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>
          <span className="font-mono text-label text-zinc-400 uppercase tracking-widest">
            Ref—{String(asset.id).padStart(6, "0")}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="border-b-4 border-zinc-900 pb-8 mb-12">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
            Listings
          </span>
          <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            Edit Asset
          </h1>
          <p className="text-body text-zinc-500 mt-4 leading-relaxed">
            {asset.title}
          </p>
        </header>

        <EditAssetForm asset={asset} initialPhotos={initialPhotos} />
      </div>
    </main>
  );
}
