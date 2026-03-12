"use client";

import { useRef, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { updatePublishStatusAction } from "@/app/actions/assets/update-publish-status";
import { type DirectusStatus } from "@/types/schema";

const STATUS_STYLES: Record<DirectusStatus, string> = {
  published: "bg-emerald-700 text-white",
  draft:     "bg-zinc-200 text-zinc-600",
  archived:  "bg-zinc-900 text-white",
};

export default function PublishStatusSelect({
  assetId,
  current,
}: {
  assetId: number;
  current: DirectusStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(() => {
      if (formRef.current) formRef.current.requestSubmit();
    });
  };

  return (
    <form ref={formRef} action={updatePublishStatusAction}>
      <input type="hidden" name="assetId" value={assetId} />
      <div className={`relative inline-flex items-center ${STATUS_STYLES[current]}`}>
        <select
          name="status"
          defaultValue={current}
          onChange={handleChange}
          disabled={isPending}
          className="appearance-none text-label font-black uppercase tracking-wider pl-2 pr-6 py-1 cursor-pointer disabled:opacity-50 border-0 outline-none bg-transparent"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <ChevronDown size={10} className="absolute right-1.5 pointer-events-none" />
      </div>
    </form>
  );
}
