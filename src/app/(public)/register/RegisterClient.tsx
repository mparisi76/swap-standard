"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth/register";
import { Turnstile } from "@marsidev/react-turnstile";

export default function RegisterClient() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="w-full max-w-md bg-white border-4 border-zinc-900 p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <header className="mb-10 text-center space-y-4">
        <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
          Steward Registration
        </h1>
        <div className="w-12 h-1 bg-zinc-900 mx-auto" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
          Commit to the duty of care.
        </p>
      </header>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border-2 border-red-600 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              {state.error}
            </p>
          </div>
        )}

        {/* ... (Keep your existing grid and input fields here as they are) ... */}

        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          options={{ theme: "light" }}
        />

        <div className="pt-4">
          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          >
            {isPending ? "Registering..." : "Join the Registry"}
          </button>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors underline underline-offset-4"
          >
            Already a steward? Login
          </Link>
        </div>
      </form>
    </div>
  );
}
