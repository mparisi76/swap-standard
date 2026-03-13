"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/user/update-profile";

const inputClass = "w-full border-2 border-zinc-900 px-4 py-3 outline-none text-body bg-white font-bold text-zinc-900 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all";
const labelClass = "text-label font-black uppercase tracking-widest text-zinc-400 block mb-1";

export default function ProfileForm({
  firstName,
  lastName,
  handle,
  email,
}: {
  firstName: string;
  lastName: string;
  handle: string;
  email: string;
}) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border-2 border-red-600 p-4">
          <p className="text-label font-black uppercase tracking-widest text-red-600">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="bg-emerald-50 border-2 border-emerald-600 p-4">
          <p className="text-label font-black uppercase tracking-widest text-emerald-700">Profile updated.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>First Name</label>
          <input name="firstName" defaultValue={firstName} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input name="lastName" defaultValue={lastName} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Handle</label>
        <input name="handle" defaultValue={handle} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          value={email}
          disabled
          className={`${inputClass} bg-zinc-100 text-zinc-400 cursor-not-allowed`}
        />
        <p className="text-detail text-zinc-400 mt-1">Email cannot be changed here. Contact an admin.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-zinc-900 text-white px-8 py-3 text-label font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
