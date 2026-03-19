import { Filter } from "bad-words";

const filter = new Filter();

export async function moderateContent(fields: Record<string, string>): Promise<string | null> {
  const input = Object.values(fields).filter(Boolean).join("\n");

  // Profanity check
  if (filter.isProfane(input)) {
    return "Your listing contains inappropriate language and could not be submitted.";
  }

  // OpenAI harmful content check
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!res.ok) return null; // fail open — don't block submission on API error

    const { results } = await res.json();
    if (results?.[0]?.flagged) {
      return "Your listing was flagged for inappropriate content and could not be submitted.";
    }
  } catch {
    return null; // fail open
  }

  return null;
}
