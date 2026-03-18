/**
 * Formats a date string as M/D/YYYY using UTC fields so server and client
 * always produce the same string (no locale dependency, no hydration mismatch).
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}
