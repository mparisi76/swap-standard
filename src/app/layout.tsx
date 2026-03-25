import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F9F8F6",
};

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
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read token directly — no refresh here. Refreshing from a server component
  // consumes the single-use refresh token without being able to save the new one.
  // The middleware handles refresh correctly on /dashboard routes.
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  let userData: UserData | undefined = undefined;

  if (token) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me?fields=first_name,last_name,email,role.name`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
      );
      if (res.ok) {
        const { data: user } = await res.json();
        userData = {
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
          email: user.email,
          role: user.role?.name || "Steward",
        };
      }
    } catch {
      // network error — show no avatar
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
