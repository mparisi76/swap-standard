"use client";

import { useActionState, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth/reset-password";

function PasswordInput({ name, label }: { name: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={8}
          className="w-full border-2 border-zinc-900 px-4 py-3 pr-12 outline-none text-sm bg-zinc-50 font-bold text-zinc-900"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-red-600">
          Invalid or missing reset link.
        </p>
        <Link
          href="/forgot-password"
          className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 underline underline-offset-4 hover:text-emerald-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
          New Password
        </h1>
        <div className="w-12 h-1 bg-zinc-900 mx-auto" />
      </header>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="token" value={token} />

        {state?.error && (
          <div className="bg-red-50 border-2 border-red-600 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              {state.error}
            </p>
          </div>
        )}

        <PasswordInput name="password" label="New Password" />
        <PasswordInput name="confirm" label="Confirm Password" />

        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          {isPending ? "Saving..." : "Set New Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
      <Suspense fallback={<div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
