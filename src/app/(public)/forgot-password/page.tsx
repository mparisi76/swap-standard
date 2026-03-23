"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth/forgot-password";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  if (state?.sent) {
    return (
      <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
        <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
              Check Your Email
            </h1>
            <div className="w-12 h-1 bg-zinc-900 mx-auto" />
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            If an account exists for that email, we&apos;ve sent a password reset link. Check your inbox — the link expires in 1 hour.
          </p>
          <Link
            href="/login"
            className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 underline underline-offset-4 hover:text-emerald-700"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
      <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <header className="mb-10 text-center space-y-2">
          <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
            Reset Password
          </h1>
          <div className="w-12 h-1 bg-zinc-900 mx-auto" />
          <p className="text-[10px] text-zinc-500 pt-2 leading-relaxed">
            Enter your email and we&apos;ll send you a reset link.
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

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              className="w-full border-2 border-zinc-900 px-4 py-3 outline-none text-sm bg-zinc-50 font-bold text-zinc-900"
            />
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          >
            {isPending ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center pt-4">
            <Link
              href="/login"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 underline underline-offset-4 hover:text-emerald-700"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
