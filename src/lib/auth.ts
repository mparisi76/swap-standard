import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

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

  if (check.ok) return token;

  // Token expired — try to refresh
  const refreshToken = cookieStore.get("directus_refresh_token")?.value;
  if (!refreshToken) return null;

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
  });

  if (!refreshRes.ok) return null;

  const { data } = await refreshRes.json();
  if (!data?.access_token) return null;

  cookieStore.set("directus_session", data.access_token, COOKIE_OPTS);
  if (data.refresh_token) {
    cookieStore.set("directus_refresh_token", data.refresh_token, COOKIE_OPTS);
  }

  return data.access_token;
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

  if (check.ok) {
    const { data } = await check.json();
    return { token, userId: data.id };
  }

  // Token expired — try to refresh
  const refreshToken = cookieStore.get("directus_refresh_token")?.value;
  if (!refreshToken) return null;

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
  });

  if (!refreshRes.ok) return null;

  const { data: refreshData } = await refreshRes.json();
  if (!refreshData?.access_token) return null;

  cookieStore.set("directus_session", refreshData.access_token, COOKIE_OPTS);
  if (refreshData.refresh_token) {
    cookieStore.set("directus_refresh_token", refreshData.refresh_token, COOKIE_OPTS);
  }

  // Fetch user ID with the new token
  const meRes = await fetch(`${BASE_URL}/users/me?fields=id`, {
    headers: { Authorization: `Bearer ${refreshData.access_token}` },
    cache: "no-store",
  });
  if (!meRes.ok) return null;
  const { data: meData } = await meRes.json();

  return { token: refreshData.access_token, userId: meData.id };
}
