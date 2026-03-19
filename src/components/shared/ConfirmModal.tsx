"use client";

import { Trash2 } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  details,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-100 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="bg-[#F9F8F6] border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">

        {/* Header */}
        <div className="border-b-4 border-zinc-900 px-8 py-6">
          <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500 block mb-2">
            Confirm Action
          </span>
          <h2 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
            {title}
          </h2>
          <p className="text-detail text-zinc-500 mt-3 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Details list */}
        {details && details.length > 0 && (
          <div className="px-8 py-6 border-b-2 border-zinc-200 space-y-1 max-h-48 overflow-y-auto">
            {details.map((d, i) => (
              <p key={i} className="text-body font-bold text-zinc-900 uppercase truncate">
                {d}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="px-8 py-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-zinc-900 bg-white text-zinc-900 text-label font-black uppercase tracking-widest py-4 hover:bg-zinc-100 transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 border-2 border-red-600 bg-red-600 text-white text-label font-black uppercase tracking-widest py-4 hover:bg-red-700 hover:border-red-700 transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
          >
            <Trash2 size={13} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
