"use client";

import { useRef, useState } from "react";
import { X, Plus, Loader, AlertCircle } from "lucide-react";

interface Photo {
  uid: string;        // local only, for react key / drag
  fileId: string;     // Directus file ID — empty while uploading
  preview: string;    // object URL or Directus asset URL
  uploading: boolean;
  error?: string;
}

export interface InitialPhoto {
  fileId: string;
  previewUrl: string;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function PhotoUploader({ initialPhotos }: { initialPhotos?: InitialPhoto[] }) {
  const [photos, setPhotos] = useState<Photo[]>(
    (initialPhotos ?? []).map((p) => ({
      uid: uid(),
      fileId: p.fileId,
      preview: p.previewUrl,
      uploading: false,
    })),
  );
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File, localUid: string) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setPhotos((prev) =>
        prev.map((p) =>
          p.uid === localUid ? { ...p, fileId: data.id, uploading: false } : p,
        ),
      );
    } catch {
      setPhotos((prev) =>
        prev.map((p) =>
          p.uid === localUid
            ? { ...p, uploading: false, error: "Upload failed" }
            : p,
        ),
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const localUid = uid();
      const preview = URL.createObjectURL(file);
      setPhotos((prev) => [
        ...prev,
        { uid: localUid, fileId: "", preview, uploading: true },
      ]);
      uploadFile(file, localUid);
    });
  };

  const remove = (targetUid: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.uid === targetUid);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.uid !== targetUid);
    });
  };

  // Drag-to-reorder
  const handleDragStart = (itemUid: string) => {
    dragItem.current = itemUid;
  };

  const handleDragEnter = (targetUid: string) => {
    setDragOver(targetUid);
  };

  const handleDrop = (targetUid: string) => {
    if (!dragItem.current || dragItem.current === targetUid) return;
    setPhotos((prev) => {
      const from = prev.findIndex((p) => p.uid === dragItem.current);
      const to = prev.findIndex((p) => p.uid === targetUid);
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragItem.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDragOver(null);
  };

  const thumbnailId = photos[0]?.fileId || "";
  const galleryIds = photos.slice(1).map((p) => p.fileId).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.uid}
            draggable
            onDragStart={() => handleDragStart(photo.uid)}
            onDragEnter={() => handleDragEnter(photo.uid)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(photo.uid)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square border-2 bg-zinc-100 overflow-hidden cursor-grab active:cursor-grabbing transition-all
              ${dragOver === photo.uid ? "border-emerald-600 shadow-[4px_4px_0px_0px_rgba(5,150,105,1)]" : "border-zinc-900"}
              ${photo.error ? "border-red-500" : ""}
            `}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.preview}
              alt=""
              className="w-full h-full object-cover"
            />

            {/* Main badge */}
            {index === 0 && (
              <div className="absolute top-0 left-0 bg-emerald-700 text-white text-[8px] font-black uppercase px-1.5 py-0.5 tracking-wider">
                Main
              </div>
            )}

            {/* IMG badge */}
            <div className="absolute top-0 right-0 bg-zinc-900 text-white text-[8px] px-1 font-mono uppercase">
              IMG
            </div>

            {/* Upload overlay */}
            {photo.uploading && (
              <div className="absolute inset-0 bg-zinc-900/60 flex items-center justify-center">
                <Loader size={20} className="text-white animate-spin" />
              </div>
            )}

            {/* Error overlay */}
            {photo.error && (
              <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center gap-1">
                <AlertCircle size={16} className="text-white" />
                <span className="text-[8px] text-white font-bold uppercase">Failed</span>
              </div>
            )}

            {/* Remove button */}
            {!photo.uploading && (
              <button
                type="button"
                onClick={() => remove(photo.uid)}
                className="absolute bottom-1 right-1 bg-white border border-zinc-900 p-0.5 hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Remove photo"
              >
                <X size={10} className="text-zinc-900" />
              </button>
            )}
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square border-2 border-dashed border-zinc-400 bg-white hover:border-zinc-900 hover:bg-zinc-50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
        >
          <Plus size={20} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors">
            Add
          </span>
        </button>
      </div>

      {photos.length > 0 && (
        <p className="text-label text-zinc-400 font-bold uppercase tracking-wide">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} — drag to reorder — first photo is the main image
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="thumbnailId" value={thumbnailId} />
      {galleryIds.map((id, i) => (
        <input key={i} type="hidden" name="galleryIds" value={id} />
      ))}
    </div>
  );
}
