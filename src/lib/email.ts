import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "SwapStandard <noreply@swapstandard.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swapstandard.com";

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9F8F6;font-family:monospace">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F8F6;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="border:4px solid #18181b;background:#F9F8F6;box-shadow:8px 8px 0 0 #18181b">
        <tr>
          <td style="border-bottom:4px solid #18181b;padding:28px 32px">
            <p style="margin:0 0 8px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.3em;color:#71717a">SwapStandard</p>
            <h1 style="margin:0;font-size:18px;font-weight:900;text-transform:uppercase;color:#18181b;font-style:italic">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">${body}</td>
        </tr>
        <tr>
          <td style="border-top:2px solid #e4e4e7;padding:16px 32px">
            <p style="margin:0;font-size:10px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.15em">SwapStandard — Local Barter Exchange</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function matchRow(yourTitle: string, theirTitle: string, assetId: number): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #18181b;margin-bottom:12px">
      <tr>
        <td style="padding:12px 16px;border-bottom:2px solid #18181b;background:#f4f4f5">
          <p style="margin:0 0 3px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#71717a">Your listing</p>
          <p style="margin:0;font-size:13px;font-weight:900;text-transform:uppercase;color:#18181b">${yourTitle}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#fff">
          <p style="margin:0 0 3px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#71717a">They are offering</p>
          <p style="margin:0 0 3px;font-size:9px;color:#71717a;font-style:italic">(matches what you're looking for)</p>
          <p style="margin:0;font-size:13px;font-weight:900;text-transform:uppercase;color:#18181b">${theirTitle}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-top:2px solid #18181b;background:#18181b">
          <a href="${SITE_URL}/explore/${assetId}" style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#fff;text-decoration:none">View match →</a>
        </td>
      </tr>
    </table>`;
}

export interface DirectMatchEmailData {
  to: string;
  firstName: string | null;
  matches: { yourAssetTitle: string; theirAssetTitle: string; assetId: number }[];
}

export async function sendDirectMatchDigest({ to, firstName, matches }: DirectMatchEmailData) {
  const name = firstName ?? "Member";
  const count = matches.length;

  const rows = matches.slice(0, 5).map((m) => matchRow(m.yourAssetTitle, m.theirAssetTitle, m.assetId)).join("");
  const more = count > 5 ? `<p style="margin:12px 0 0;font-size:11px;color:#71717a">+ ${count - 5} more match${count - 5 > 1 ? "es" : ""} in your dashboard.</p>` : "";

  const body = `
    <p style="margin:0 0 8px;font-size:14px;color:#18181b">Hey ${name},</p>
    <p style="margin:0 0 24px;font-size:13px;color:#3f3f46;line-height:1.6">
      You have <strong>${count} new trade match${count > 1 ? "es" : ""}</strong>.
      ${count > 1 ? "Members nearby are offering things you're looking for." : "A member nearby is offering something you're looking for."}
    </p>
    ${rows}
    ${more}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${count} new trade match${count > 1 ? "es" : ""} on SwapStandard`,
    html: baseTemplate(`${count} Trade Match${count > 1 ? "es" : ""} Found`, body),
  });
}

export interface ChainTradeEmailData {
  to: string;
  firstName: string | null;
  assetTitle: string;
  assetId: number;
  chainCount: number;
}

export async function sendChainTradeDigest({ to, firstName, chainCount, assetTitle, assetId }: ChainTradeEmailData) {
  const name = firstName ?? "Member";

  const body = `
    <p style="margin:0 0 8px;font-size:14px;color:#18181b">Hey ${name},</p>
    <p style="margin:0 0 24px;font-size:13px;color:#3f3f46;line-height:1.6">
      ${chainCount > 1 ? `${chainCount} chain trade cycles have been` : "A chain trade cycle has been"} identified involving your listings.
      In a chain trade, three members exchange in a cycle — no direct swap required.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #18181b;margin-bottom:24px">
      <tr>
        <td style="padding:16px;background:#f4f4f5">
          <p style="margin:0 0 4px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#71717a">Your listing</p>
          <p style="margin:0;font-size:14px;font-weight:900;text-transform:uppercase;color:#18181b">${assetTitle}</p>
        </td>
      </tr>
    </table>
    <a href="${SITE_URL}/explore/${assetId}" style="display:inline-block;background:#18181b;color:#fff;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;padding:14px 28px;text-decoration:none">Review Chain Trade →</a>
    <p style="margin:20px 0 0;font-size:11px;color:#71717a">All three members must accept for the trade to proceed.</p>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Chain trade opportunity — ${assetTitle}`,
    html: baseTemplate("Chain Trade Found", body),
  });
}
