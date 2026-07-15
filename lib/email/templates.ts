/**
 * Plain HTML email templates. Every interpolated value that could contain user
 * input (names, bill titles) is passed through escapeHtml — these strings end
 * up in an HTML document sent to another person.
 */

const BRAND = "#0f9068"; // emerald, matching the app's primary
const INK = "#2b2b2b";
const MUTED = "#6b6b6b";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d6;">
            <tr>
              <td style="padding:24px 32px 8px;">
                <span style="font-size:18px;font-weight:700;color:${INK};">Split Bill</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;color:${INK};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="max-width:480px;color:${MUTED};font-size:12px;line-height:1.5;margin:16px auto 0;">
            You're receiving this because someone used your email on Split Bill. If it wasn't you, you can ignore this message.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${escapeHtml(label)}</a>`;
}

export function resetPasswordEmail(opts: { name: string; url: string }): string {
  const name = escapeHtml(opts.name || "there");
  return shell(`
    <h1 style="font-size:20px;margin:12px 0 8px;color:${INK};">Reset your password</h1>
    <p style="margin:0 0 20px;">Hi ${name}, we got a request to reset your Split Bill password. Click below to choose a new one — the link expires in an hour.</p>
    <p style="margin:0 0 24px;">${button(opts.url, "Reset password")}</p>
    <p style="margin:0;color:${MUTED};font-size:13px;">Didn't ask for this? Nothing has changed — you can safely ignore this email.</p>
  `);
}

export function friendRequestEmail(opts: {
  toName: string;
  fromName: string;
  fromUsername: string | null;
  url: string;
}): string {
  const toName = escapeHtml(opts.toName || "there");
  const fromName = escapeHtml(opts.fromName);
  const handle = opts.fromUsername
    ? ` (@${escapeHtml(opts.fromUsername)})`
    : "";
  return shell(`
    <h1 style="font-size:20px;margin:12px 0 8px;color:${INK};">${fromName} wants to be friends</h1>
    <p style="margin:0 0 20px;">Hi ${toName}, ${fromName}${handle} sent you a friend request on Split Bill. Accept it to split bills together.</p>
    <p style="margin:0 0 8px;">${button(opts.url, "View request")}</p>
  `);
}

export function billShareEmail(opts: {
  fromName: string;
  billTitle: string;
  amount: string;
  url: string;
}): string {
  const fromName = escapeHtml(opts.fromName);
  const billTitle = escapeHtml(opts.billTitle || "a bill");
  const amount = escapeHtml(opts.amount);
  return shell(`
    <h1 style="font-size:20px;margin:12px 0 8px;color:${INK};">${fromName} sent you a bill</h1>
    <p style="margin:0 0 4px;">Your share of <strong>${billTitle}</strong> is</p>
    <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:${BRAND};">${amount}</p>
    <p style="margin:0 0 8px;">${button(opts.url, "View & pay")}</p>
  `);
}
