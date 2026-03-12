"use server";

export async function verifyTurnstile(token: string): Promise<{ success: boolean; errorCodes?: string[] }> {
  // Skip verification in development — use Cloudflare's test keys locally
  if (process.env.NODE_ENV !== "production") return { success: true };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return { success: false, errorCodes: ["missing-secret"] };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });

    if (!res.ok) {
      console.error("Turnstile siteverify request failed:", res.status);
      return { success: false, errorCodes: [`http-${res.status}`] };
    }

    const data = await res.json() as { success: boolean; "error-codes"?: string[] };
    return { success: data.success, errorCodes: data["error-codes"] };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return { success: false, errorCodes: ["fetch-error"] };
  }
}
