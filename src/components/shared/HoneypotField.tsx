/**
 * Honeypot field — invisible to humans, filled by bots.
 * Must NOT use type="hidden" — bots skip those. CSS hides it instead.
 */
export default function HoneypotField() {
  return (
    <input
      type="text"
      name="_trap"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      data-np-intersection="0"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
      }}
    />
  );
}
