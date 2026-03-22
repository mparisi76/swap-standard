"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/app/actions/user/change-password";
import { Eye, EyeOff } from "lucide-react";

const labelClass = "text-label font-black uppercase tracking-widest text-zinc-500 block mb-1";

function PasswordInput({ name, required, minLength }: { name: string; required?: boolean; minLength?: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        className="w-full border-2 border-zinc-900 px-4 py-3 pr-12 outline-none text-body bg-white font-bold text-zinc-900 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border-2 border-red-600 p-4">
          <p className="text-label font-black uppercase tracking-widest text-red-600">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-50 border-2 border-emerald-600 p-4">
          <p className="text-label font-black uppercase tracking-widest text-emerald-700">Password updated.</p>
        </div>
      )}

      <div>
        <label className={labelClass}>New Password</label>
        <PasswordInput name="password" required minLength={8} />
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <PasswordInput name="confirmPassword" required />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-zinc-900 text-white px-8 py-3 text-label font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
      >
        {isPending ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
