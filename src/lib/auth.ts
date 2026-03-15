import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;


/**
 * Returns a valid Directus access token, refreshing it if expired.
 * Returns null if no session exists or refresh fails.
 */
export async function getValidToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  if (!token) return null;

  const check = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return check.ok ? token : null;
}

/**
 * Returns a valid token AND the current user's ID in one call,
 * avoiding the double /users/me hit when both are needed.
 */
export async function getValidTokenWithUser(): Promise<{ token: string; userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  if (!token) return null;

  const check = await fetch(`${BASE_URL}/users/me?fields=id`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!check.ok) return null;
  const { data } = await check.json();
  return { token, userId: data.id };
}
