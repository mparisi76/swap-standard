import { createHmac } from "crypto";

const SECRET = process.env.EMAIL_VERIFICATION_SECRET!;
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function generatePasswordResetToken(userId: string): string {
  const expires = Date.now() + TTL_MS;
  const payload = Buffer.from(JSON.stringify({ userId, expires })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyPasswordResetToken(token: string): { userId: string } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;

    const { userId, expires } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (Date.now() > expires) return null;

    return { userId };
  } catch {
    return null;
  }
}
