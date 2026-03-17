"use client";

import { useActionState, useState } from "react";
import { initiateExchangeAction, type ExchangeFormState } from "@/app/actions/exchanges/initiate";
import { Loader } from "lucide-react";
import HoneypotField from "@/components/shared/HoneypotField";

export default function InitiateExchangeForm({ assetId }: { assetId: string }) {
  const [state, action, pending] = useActionState<ExchangeFormState, FormData>(
    initiateExchangeAction,
    null,
  );
  const [message, setMessage] = useState("");
  const isValid = message.trim().length > 0;

  return (
    <form action={action} className="space-y-8">
      <HoneypotField />
      <input type="hidden" name="assetId" value={assetId} />

      {state?.error && (
        <div className="border-2 border-red-600 bg-red-50 px-6 py-4">
          <p className="text-label font-black uppercase text-red-600 tracking-wide">
            {state.error}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-label font-black uppercase tracking-widest text-zinc-500 block"
        >
          Opening Message
        </label>
        <p className="text-detail text-zinc-500 italic">
          Introduce yourself, share what you can offer in return, and any details about availability.
        </p>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi, I saw your listing and I'd like to offer..."
          className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-400 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none border-l-4 border-l-emerald-600"
        />
      </div>

      <div className="pt-4 border-t-4 border-zinc-900">
        <button
          type="submit"
          disabled={pending || !isValid}
          className="w-full bg-zinc-900 text-white font-black uppercase tracking-[0.3em] py-5 text-label hover:bg-emerald-700 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-3">
              <Loader size={14} className="animate-spin" />
              Initiating...
            </span>
          ) : (
            "Send Request"
          )}
        </button>
      </div>
    </form>
  );
}
