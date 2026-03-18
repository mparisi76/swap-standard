/* eslint-disable @next/next/no-img-element */
import { Image as ImageIcon } from "lucide-react";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

export default function AssetThumbnail({
  thumbnail,
  title,
  width = 600,
  imgClassName = "w-full h-full object-cover",
}: {
  thumbnail: string | null | undefined;
  title: string;
  width?: number;
  imgClassName?: string;
}) {
  if (thumbnail) {
    return (
      <img
        src={`${DIRECTUS_URL}/assets/${thumbnail}?width=${width}&fit=cover`}
        alt={title}
        className={imgClassName}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 gap-1">
      <ImageIcon className="text-zinc-400" size={24} strokeWidth={1} />
      <span className="font-mono text-label text-zinc-400 uppercase tracking-widest">No Image</span>
    </div>
  );
}
