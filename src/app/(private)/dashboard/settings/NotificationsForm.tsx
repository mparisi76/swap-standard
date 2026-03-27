"use client";

import { useTransition, useState } from "react";
import { updateNotificationsAction } from "@/app/actions/auth/update-notifications";

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`shrink-0 w-12 h-6 border-2 border-zinc-900 relative transition-colors disabled:opacity-50 cursor-pointer ${checked ? "bg-emerald-700" : "bg-zinc-200"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white border-2 border-zinc-900 transition-all ${checked ? "left-6" : "left-0.5"}`} />
    </button>
  );
}

export default function NotificationsForm({
  notifyMatches,
  notifyMessages,
  notifyActivity,
}: {
  notifyMatches: boolean;
  notifyMessages: boolean;
  notifyActivity: boolean;
}) {
  const [prefs, setPrefs] = useState({ notifyMatches, notifyMessages, notifyActivity });
  const [isPending, startTransition] = useTransition();

  const update = (next: typeof prefs) => {
    setPrefs(next);
    const fd = new FormData();
    fd.set("notify_matches",  String(next.notifyMatches));
    fd.set("notify_messages", String(next.notifyMessages));
    fd.set("notify_activity", String(next.notifyActivity));
    startTransition(() => updateNotificationsAction(fd));
  };

  const rows: { key: keyof typeof prefs; label: string; description: string }[] = [
    { key: "notifyMatches",  label: "Trade Matches",      description: "Direct matches and chain trade alerts" },
    { key: "notifyMessages", label: "Exchange Messages",  description: "New messages in your trade threads" },
    { key: "notifyActivity", label: "Exchange Activity",  description: "Trade accepted, declined, or completed" },
  ];

  return (
    <div className="border-2 border-zinc-900 bg-white divide-y-2 divide-zinc-100">
      {rows.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-body font-black uppercase text-zinc-900">{label}</p>
            <p className="text-label font-bold text-zinc-500 mt-1">{description}</p>
          </div>
          <Toggle
            checked={prefs[key]}
            onChange={(v) => update({ ...prefs, [key]: v })}
            disabled={isPending}
          />
        </div>
      ))}
    </div>
  );
}
