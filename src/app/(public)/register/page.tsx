"use client";

import { useActionState, useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/app/actions/auth/register";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileVerified, setTurnstileVerified] = useState(false);

  // Reset widget whenever the action returns an error so the token stays fresh
  useEffect(() => {
    if (state?.error) {
      turnstileRef.current?.reset();
      setTurnstileVerified(false);
    }
  }, [state?.error]);

  // Keep track of form values so they don't vanish
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    handle: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 bg-[#F9F8F6]">
      <div className="w-full max-w-lg bg-white border-4 border-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <header className="mb-8">
          <h1 className="text-header font-black uppercase tracking-tighter text-zinc-900">Create Account</h1>
        </header>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border-2 border-red-600 p-4 text-xs font-black text-red-600 uppercase">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="border-2 border-zinc-900 p-3 w-full bg-white text-zinc-900 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="border-2 border-zinc-900 p-3 w-full bg-white text-zinc-900 font-bold" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Member Handle</label>
              <input name="handle" value={formData.handle} onChange={handleChange} required className="border-2 border-zinc-900 p-3 w-full bg-white text-zinc-900 font-bold" />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" required className="border-2 border-zinc-900 p-3 w-full bg-white text-zinc-900 font-bold" />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Password</label>
              <div className="relative">
                <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} required className="border-2 border-zinc-900 p-3 pr-10 w-full bg-white text-zinc-900 font-bold" />
                <button type="button" onClick={togglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            options={{ theme: "light" }}
            onSuccess={() => setTurnstileVerified(true)}
            onError={() => setTurnstileVerified(false)}
            onExpire={() => setTurnstileVerified(false)}
          />

          <button
            disabled={isPending || !turnstileVerified}
            type="submit"
            className="w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
          >
            {isPending ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t-2 border-zinc-100 pt-6">
          <Link href="/login" className="text-[10px] font-black uppercase text-zinc-900 underline hover:text-emerald-700">
            Already a member? Login
          </Link>
        </div>
      </div>
    </main>
  );
}