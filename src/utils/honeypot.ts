/**
 * Returns true if the honeypot field was filled — indicates a bot submission.
 * Silently rejects rather than returning an error, so bots don't detect the trap.
 */
export function isBot(formData: FormData): boolean {
  return Boolean(formData.get("_trap"));
}
