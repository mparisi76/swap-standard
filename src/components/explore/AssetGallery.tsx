/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import { GalleryItem } from "@/types/schema";

interface AssetGalleryProps {
  thumbnail: string;
  photo_gallery: GalleryItem[];
  name: string;
  isSold: boolean;
}

export default function AssetGallery({
  thumbnail,
  photo_gallery,
  name,
  isSold,
}: AssetGalleryProps) {
  const uniqueGallery = (photo_gallery || []).filter(
    (item) => item.directus_files_id !== thumbnail,
  );
  const allImages = thumbnail
    ? [{ directus_files_id: thumbnail }, ...uniqueGallery]
    : uniqueGallery;

  const [activeImage, setActiveImage] = useState<string>(allImages[0]?.directus_files_id ?? "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleImageChange = (newId: string) => {
    if (newId === activeImage) return;
    setIsLoaded(false);
    setIsError(false);
    setActiveImage(newId);
  };

  return (
    <section className="lg:col-span-6 space-y-6">
      {/* Main Image Viewport */}
      <div className="aspect-4/5 bg-white relative overflow-hidden border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {allImages.length === 0 ? (
          /* NO IMAGE PLACEHOLDER */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100">
            <ImageIcon className="text-zinc-400 mb-3" size={40} strokeWidth={1} />
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500">
              No Image
            </span>
          </div>
        ) : (
          <>
            {/* SKELETON */}
            {!isLoaded && !isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100">
                <div className="animate-pulse flex flex-col items-center">
                  <ImageIcon className="text-zinc-500 mb-2" size={32} strokeWidth={1} />
                  <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-600">
                    Loading
                  </span>
                </div>
              </div>
            )}

            {/* IMAGE */}
            <img
              key={activeImage}
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${activeImage}?width=1000&quality=80&fit=inside`}
              alt={name}
              onLoad={() => setIsLoaded(true)}
              onError={() => { setIsError(true); setIsLoaded(true); }}
              ref={(img) => {
                if (img && img.complete && !isLoaded && !isError) setIsLoaded(true);
              }}
              className={`relative z-10 object-contain w-full h-full bg-[#F9F8F6] transition-all duration-500 ease-in-out
                ${isLoaded && !isError ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"}
                ${isSold ? "grayscale opacity-60" : "grayscale-0"}
              `}
            />

            {/* ERROR STATE */}
            {isError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-100 p-8 text-center">
                <AlertCircle className="text-zinc-500 mb-3" size={24} />
                <p className="text-label font-bold uppercase tracking-widest text-zinc-500">
                  Image not available
                </p>
              </div>
            )}
          </>
        )}

        {/* STATUS STAMP */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="border-2 border-zinc-900 px-6 py-2 text-zinc-900 font-black uppercase tracking-[0.4em] -rotate-12 bg-white shadow-xl">
              Archived
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {allImages.map((photo, idx) => (
            <button
              key={photo.directus_files_id}
              onClick={() => handleImageChange(photo.directus_files_id)}
              className={`relative shrink-0 w-20 aspect-4/5 border-2 transition-all bg-white overflow-hidden group ${
                activeImage === photo.directus_files_id
                  ? "border-emerald-600 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]"
                  : "border-zinc-900 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo.directus_files_id}?width=200&quality=60`}
                alt={`${name} view ${idx + 1}`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}