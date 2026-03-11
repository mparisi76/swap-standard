import { createDirectus, rest } from "@directus/sdk";
import type { SwapSchema } from "../types/schema";

if (!process.env.NEXT_PUBLIC_DIRECTUS_URL) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not defined");
}

// We initialize the client without custom fetch configuration
// The SDK v21 automatically detects globalThis.fetch in modern Node/Next.js
export const directus = createDirectus<SwapSchema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL,
).with(rest());
