"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/actions/user/change-password";

const inputClass = "w-full border-2 border-zinc-900 px-4 py-3 outline-none text-body bg-white font-bold text-zinc-900 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all";
const labelClass = "text-label font-black uppercase tracking-widest text-zinc-500 block mb-1";

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
        <input name="password" type="password" required minLength={8} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <input name="confirmPassword" type="password" required className={inputClass} />
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
