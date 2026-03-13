import { createHmac } from "crypto";

const SECRET = process.env.EMAIL_VERIFICATION_SECRET!;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateVerificationToken(email: string): string {
  const expires = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyEmailToken(token: string): { email: string } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;

    const { email, expires } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (Date.now() > expires) return null;

    return { email };
  } catch {
    return null;
  }
}
