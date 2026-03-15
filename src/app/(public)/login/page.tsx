"use client";

import { useActionState, Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth/login";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const isRegistered = searchParams.get("registered") === "true";
  const isExpired = searchParams.get("error") === "session_expired";

  useEffect(() => {
    if (state?.error) turnstileRef.current?.reset();
  }, [state?.error]);

  useEffect(() => {
    if (isExpired) {
      document.cookie =
        "directus_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }, [isExpired]);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  return (
    <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
          Login
        </h1>
        <div className="w-12 h-1 bg-zinc-900 mx-auto" />
      </header>

      {isRegistered && (
        <div className="bg-emerald-700 p-4 text-center mb-8 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
            Account Created
          </p>
          <p className="text-[10px] text-emerald-100 tracking-wide">
            Check your email to verify your account.
          </p>
        </div>
      )}

      {isExpired && (
        <div className="border-2 border-amber-500 p-4 text-center mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
            Session Expired
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {state?.error && (
          <div className="bg-red-50 border-2 border-red-600 p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              {state.error}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full border-2 border-zinc-900 px-4 py-3 outline-none text-sm bg-zinc-50 font-bold text-zinc-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full border-2 border-zinc-900 px-4 py-3 outline-none text-sm bg-zinc-50 font-bold text-zinc-900"
          />
        </div>

        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          options={{ theme: "light" }}
        />

        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          {isPending ? "Authenticating..." : "Login"}
        </button>

        <div className="text-center pt-4">
          <Link
            href="/register"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 underline underline-offset-4 hover:text-emerald-700"
          >
            Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
      <Suspense
        fallback={
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
