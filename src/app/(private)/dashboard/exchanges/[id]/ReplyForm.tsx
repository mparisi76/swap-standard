"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyAction, type ReplyFormState } from "@/app/actions/exchanges/reply";
import { Loader } from "lucide-react";
import HoneypotField from "@/components/shared/HoneypotField";

export default function ReplyForm({ exchangeId }: { exchangeId: number }) {
  const boundAction = replyAction.bind(null, exchangeId);
  const [state, action, pending] = useActionState<ReplyFormState, FormData>(
    boundAction,
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.success && textareaRef.current) {
      textareaRef.current.value = "";
    }
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <HoneypotField />
      {state?.error && (
        <p className="text-label font-bold text-red-600 uppercase">{state.error}</p>
      )}
      <textarea
        ref={textareaRef}
        name="content"
        rows={3}
        maxLength={2000}
        placeholder="Write a message..."
        className="w-full border-2 border-zinc-900 px-5 py-4 text-body text-zinc-900 placeholder:text-zinc-300 outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="text-label font-black uppercase tracking-widest px-8 py-3 bg-zinc-900 text-white border-2 border-zinc-900 hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <Loader size={13} className="animate-spin" />
              Sending...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </form>
  );
}
