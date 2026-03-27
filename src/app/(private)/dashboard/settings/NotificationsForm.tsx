"use client";

import { useTransition, useState } from "react";
import { updateNotificationsAction } from "@/app/actions/auth/update-notifications";

export default function NotificationsForm({ unsubscribed }: { unsubscribed: boolean }) {
  const [subscribed, setSubscribed] = useState(!unsubscribed);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setSubscribed(next);
    const fd = new FormData();
    if (next) fd.set("email_unsubscribed", "on");
    startTransition(() => updateNotificationsAction(fd));
  };

  return (
    <div className="flex items-center justify-between border-2 border-zinc-900 bg-white px-6 py-5">
      <div>
        <p className="text-body font-black uppercase text-zinc-900">Email Notifications</p>
        <p className="text-label font-bold text-zinc-500 mt-1">
          Trade matches, exchange messages, and activity alerts
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-6">
        <input
          type="checkbox"
          checked={subscribed}
          onChange={handleChange}
          disabled={isPending}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-zinc-200 border-2 border-zinc-900 peer-checked:bg-emerald-700 peer-disabled:opacity-50 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white border-2 border-zinc-900 transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
