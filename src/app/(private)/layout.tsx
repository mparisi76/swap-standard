import { redirect } from "next/navigation";
import { getValidToken } from "@/lib/auth";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getValidToken();

  if (!token) {
    redirect("/login?error=session_expired");
  }

  return <>{children}</>;
}
