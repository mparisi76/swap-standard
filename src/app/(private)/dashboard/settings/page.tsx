import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

export const metadata: Metadata = {
  title: "Settings | SwapStandard",
};

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

async function getMe(token: string) {
  const res = await fetch(`${BASE_URL}/users/me?fields=first_name,last_name,handle,email`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data as { first_name: string; last_name: string; handle: string; email: string };
}

export default async function SettingsPage() {
  const token = await getValidToken();
  if (!token) redirect("/login");

  const user = await getMe(token);
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#F9F8F6] pb-20">
      {/* Breadcrumb */}
      <div className="border-b-2 border-zinc-900 bg-white sticky top-18 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-label font-bold uppercase tracking-widest text-zinc-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>
          <span className="font-mono text-label text-zinc-400 uppercase tracking-widest">
            Settings
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Profile */}
        <section>
          <header className="border-b-4 border-zinc-900 pb-6 mb-8">
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
              Account
            </span>
            <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
              Profile
            </h1>
          </header>
          <ProfileForm
            firstName={user.first_name ?? ""}
            lastName={user.last_name ?? ""}
            handle={user.handle ?? ""}
            email={user.email}
          />
        </section>

        {/* Password */}
        <section>
          <header className="border-b-4 border-zinc-900 pb-6 mb-8">
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-400 block mb-2">
              Security
            </span>
            <h1 className="text-header font-black uppercase italic text-zinc-900 leading-tight">
              Password
            </h1>
          </header>
          <PasswordForm />
        </section>
      </div>
    </main>
  );
}
