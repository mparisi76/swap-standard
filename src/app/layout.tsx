import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getValidToken } from "@/lib/auth";
import { createDirectus, rest, staticToken, readMe } from "@directus/sdk";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Define the interface to match what the Header expects
interface UserData {
  name: string;
  email: string;
  role: string;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapstandard.com",
  ),
  title: {
    default: "SwapStandard",
    template: "%s | SwapStandard",
  },
  description:
    "A stewardship registry built on the duty of care. Share what you have, find what you need — direct exchange with your community.",
  openGraph: {
    siteName: "SwapStandard",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getValidToken();
  let userData: UserData | undefined = undefined;

  if (token) {
    try {
      const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
        .with(staticToken(token))
        .with(rest());

      const user = (await client.request(
        readMe({
          fields: ["first_name", "last_name", "email", { role: ["name"] }],
        }),
      )) as {
        first_name: string | null;
        last_name: string | null;
        email: string;
        role?: { name: string };
      };

      userData = {
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
        email: user.email,
        role: user.role?.name || "Steward",
      };
    } catch {
      console.error("Session fetch skipped or failed.");
    }
  }

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F9F8F6] flex flex-col min-h-full`}
      >
        <Header user={userData} />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
