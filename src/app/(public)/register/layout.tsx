import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join SwapStandard to start trading goods, skills, and services directly with your community.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
