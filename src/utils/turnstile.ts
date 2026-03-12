"use server";

export async function verifyTurnstile(token: string): Promise<boolean> {
  // Skip verification in development — use Cloudflare's test keys locally
  if (process.env.NODE_ENV !== "production") return true;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
    });

    if (!res.ok) {
      console.error("Turnstile siteverify request failed:", res.status);
      return false;
    }

    const data = await res.json() as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.error("Turnstile verification failed:", data["error-codes"]);
    }
    return data.success;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}
