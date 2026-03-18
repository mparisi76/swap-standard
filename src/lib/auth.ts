import { cookies, headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

async function attemptRefresh(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<string | null> {
  const refreshToken = cookieStore.get("directus_refresh_token")?.value;
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const { data } = await res.json();
  cookieStore.set("directus_session", data.access_token, COOKIE_OPTS);
  cookieStore.set("directus_refresh_token", data.refresh_token, COOKIE_OPTS);
  return data.access_token;
}

/**
 * Returns a valid Directus access token.
 * On dashboard routes, middleware forwards the pre-validated token via header.
 * On API routes (outside middleware), validates and refreshes as needed.
 */
export async function getValidToken(): Promise<string | null> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-auth-token");
  if (forwarded) return forwarded;

  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  if (!token) return null;

  const check = await fetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (check.ok) return token;
  return attemptRefresh(cookieStore);
}

/**
 * Returns a valid token + the current user's ID.
 * On dashboard routes, both are forwarded by middleware — no extra fetch needed.
 * On API routes, validates and refreshes as needed.
 */
export async function getValidTokenWithUser(): Promise<{ token: string; userId: string } | null> {
  const headerStore = await headers();
  const forwardedToken = headerStore.get("x-auth-token");
  const forwardedUserId = headerStore.get("x-auth-user-id");

  if (forwardedToken && forwardedUserId) {
    return { token: forwardedToken, userId: forwardedUserId };
  }

  // API route — validate independently
  const cookieStore = await cookies();
  let token = cookieStore.get("directus_session")?.value;
  if (!token) return null;

  let check = await fetch(`${BASE_URL}/users/me?fields=id`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!check.ok) {
    token = (await attemptRefresh(cookieStore)) ?? undefined;
    if (!token) return null;

    check = await fetch(`${BASE_URL}/users/me?fields=id`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!check.ok) return null;
  }

  const { data } = await check.json();
  return { token, userId: data.id };
}
