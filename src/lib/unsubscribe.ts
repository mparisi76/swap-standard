import { createHmac } from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

function generateToken(userId: string): string {
  return createHmac("sha256", process.env.UNSUBSCRIBE_SECRET!)
    .update(userId)
    .digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  return generateToken(userId) === token;
}

export function unsubscribeUrl(userId: string): string {
  return `${SITE_URL}/api/unsubscribe?uid=${encodeURIComponent(userId)}&token=${generateToken(userId)}`;
}
