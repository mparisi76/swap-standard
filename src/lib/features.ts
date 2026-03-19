/**
 * Feature flags derived from environment variables.
 * All checks are server-side only — never expose these to the client directly.
 */
export const features = {
  chainTrades: process.env.CHAIN_TRADES_ENABLED === "true",
  directMatches: process.env.DIRECT_MATCHES_ENABLED === "true",
} as const;
