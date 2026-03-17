import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};
import { verifyEmailToken } from "@/utils/email-token";
import {
  createDirectus,
  rest,
  staticToken,
  readUsers,
  updateUser,
} from "@directus/sdk";

async function activateUser(email: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
  if (!url || !adminToken) return false;

  const client = createDirectus(url).with(staticToken(adminToken)).with(rest());

  try {
    const users = await client.request(
      readUsers({ filter: { email: { _eq: email } }, fields: ["id", "status"] }),
    );
    const user = users[0];
    if (!user) return false;
    if (user.status === "active") return true; // already verified

    await client.request(updateUser(user.id, { status: "active" }));
    return true;
  } catch {
    return false;
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let status: "success" | "invalid" | "expired" | "error" = "invalid";

  if (token) {
    const result = verifyEmailToken(token);
    if (result) {
      const activated = await activateUser(result.email);
      status = activated ? "success" : "error";
    } else {
      // Token parse failed — could be expired or malformed
      // Try to give a better hint by checking if payload decodes (expired vs invalid)
      try {
        const [payload] = token.split(".");
        if (payload) {
          const { expires } = JSON.parse(Buffer.from(payload, "base64url").toString());
          if (expires && Date.now() > expires) status = "expired";
        }
      } catch {
        // leave as "invalid"
      }
    }
  }

  const messages = {
    success: {
      heading: "Email Verified",
      body: "Your account is now active. You can log in.",
      cta: { label: "Go to Login", href: "/login" },
      accent: "bg-emerald-700",
      accentText: "text-white",
    },
    expired: {
      heading: "Link Expired",
      body: "This verification link has expired. Register again to receive a new one.",
      cta: { label: "Register", href: "/register" },
      accent: "border-2 border-amber-500",
      accentText: "text-amber-700",
    },
    invalid: {
      heading: "Invalid Link",
      body: "This verification link is invalid or has already been used.",
      cta: { label: "Register", href: "/register" },
      accent: "border-2 border-red-600",
      accentText: "text-red-600",
    },
    error: {
      heading: "Something Went Wrong",
      body: "We couldn't activate your account. Please try again or contact support.",
      cta: { label: "Register", href: "/register" },
      accent: "border-2 border-red-600",
      accentText: "text-red-600",
    },
  };

  const msg = messages[status];

  return (
    <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
      <div className="w-full max-w-sm bg-white border-4 border-zinc-900 p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <header className="mb-10 text-center space-y-2">
          <h1 className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-900">
            Verification
          </h1>
          <div className="w-12 h-1 bg-zinc-900 mx-auto" />
        </header>

        <div className={`${msg.accent} p-4 text-center mb-8`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${msg.accentText}`}>
            {msg.heading}
          </p>
        </div>

        <p className="text-[11px] text-zinc-600 text-center leading-relaxed mb-8">
          {msg.body}
        </p>

        <Link
          href={msg.cta.href}
          className="block w-full bg-zinc-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
        >
          {msg.cta.label}
        </Link>
      </div>
    </main>
  );
}
