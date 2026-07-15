/**
 * Branded HTML email templates for Splitza.
 *
 * Design goal: make an inbox feel like the app. Splitza's identity is a paper
 * receipt — warm rice-paper neutrals, an emerald primary, and dashed "torn"
 * edges — so the emails reuse that: the emerald chip + wordmark lockup from the
 * nav, dashed perforations for dividers, and monospace figures for money.
 *
 * Email rendering is a constrained medium, so this stays table-based with
 * inline styles (Outlook uses Word's engine — no flexbox/grid), uses a
 * bulletproof table-cell button, and ships a real dark-mode variant via a
 * <style> block instead of leaving clients to auto-invert the palette.
 *
 * Every interpolated value that could contain user input (names, bill titles)
 * is passed through escapeHtml — these strings end up in an HTML document sent
 * to another person.
 */

import { appUrl } from "./index";

/*
 * Palette converted from the app's oklch design tokens (app/globals.css) to the
 * hex that email clients need. Light is the inline default; the dark values
 * below are applied through the @media (prefers-color-scheme: dark) block.
 */
const PAPER = "#faf8f2"; // rice-paper background
const CARD = "#fffdf9"; // near-white card
const INK = "#2b2721"; // warm charcoal text
const MUTED = "#7c7568"; // muted foreground
const FAINT = "#a49b8b"; // fine print
const BRAND = "#11926a"; // emerald primary
const BORDER = "#e8e2d6"; // hairline / perforation
const PANEL = "#f4f0e7"; // inset panel (receipt total)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SANS =
  "'Bricolage Grotesque',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const BODY_SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO =
  "'Geist Mono',ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

/** The receipt glyph from the nav, as inline SVG (shows in Apple Mail/iOS; a
 *  Gmail-stripped SVG still leaves the emerald chip, which reads as the mark). */
const RECEIPT_GLYPH = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
  <path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>`;

/** Emerald chip + "Splitza" wordmark — the exact lockup from the app nav. */
function brandLockup(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="34" valign="middle" bgcolor="${BRAND}" class="brand-chip" style="width:34px;height:34px;background:${BRAND};border-radius:10px;text-align:center;" align="center">${RECEIPT_GLYPH}</td>
    <td valign="middle" style="padding-left:11px;font-family:${SANS};font-size:20px;font-weight:700;letter-spacing:-0.02em;color:${INK};" class="ink">Splitza</td>
  </tr></table>`;
}

/** A dashed rule — the receipt "tear". */
function perforation(): string {
  return `<div class="hr" style="border-top:1px dashed ${BORDER};font-size:0;line-height:0;">&nbsp;</div>`;
}

function heading(text: string): string {
  return `<h1 class="ink" style="margin:0 0 10px;font-family:${SANS};font-size:21px;font-weight:700;letter-spacing:-0.01em;color:${INK};">${text}</h1>`;
}

function paragraph(html: string): string {
  return `<p class="ink" style="margin:0 0 18px;font-family:${BODY_SANS};font-size:15px;line-height:1.62;color:${INK};">${html}</p>`;
}

function fineprint(html: string): string {
  return `<p class="muted" style="margin:0;font-family:${BODY_SANS};font-size:13px;line-height:1.55;color:${MUTED};">${html}</p>`;
}

/** Bulletproof button: color lives on the <td>, so Outlook keeps it. */
function button(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 22px;"><tr>
    <td align="center" bgcolor="${BRAND}" class="btn-cell" style="border-radius:11px;background:${BRAND};">
      <a href="${safeHref}" target="_blank" class="btn-link" style="display:inline-block;padding:13px 26px;font-family:${BODY_SANS};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:11px;">${safeLabel} &rarr;</a>
    </td>
  </tr></table>`;
}

/** A printed-receipt total: mono figure under a dashed rule with a small label. */
function receiptTotal(label: string, amount: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr>
    <td class="panel" style="background:${PANEL};border:1px solid ${BORDER};border-radius:14px;padding:18px 20px;">
      <div class="muted" style="font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};">${label}</div>
      <div class="hr" style="border-top:1px dashed ${BORDER};margin:12px 0;font-size:0;line-height:0;">&nbsp;</div>
      <div style="font-family:${MONO};font-size:30px;font-weight:700;letter-spacing:-0.5px;color:${BRAND};">${escapeHtml(amount)}</div>
    </td>
  </tr></table>`;
}

/**
 * Document shell: <head> color-scheme + dark-mode styles, a hidden preheader
 * (inbox preview line), the framed receipt card, and a footer.
 */
function shell(
  inner: string,
  opts: { preheader: string; footnote: string },
): string {
  const year = new Date().getFullYear();
  const home = appUrl();
  const preheader = escapeHtml(opts.preheader);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    /* Dark mode: real palette instead of a client's auto-inversion. Apple Mail,
       iOS, and Outlook mobile honor this; !important beats the inline light
       defaults. Near-black warm charcoal, never pure black. */
    @media (prefers-color-scheme: dark) {
      .email-bg, .email-bg-td { background:#1c1a17 !important; }
      .card { background:#232019 !important; border-color:#3a352d !important; }
      .ink { color:#f0ece3 !important; }
      .muted { color:#a9a294 !important; }
      .faint { color:#8c8475 !important; }
      .hr { border-color:#3a352d !important; }
      .panel { background:#27231c !important; border-color:#3a352d !important; }
      .btn-cell, .btn-link { background:#16a37a !important; }
    }
    /* Outlook.com applies dark mode via these prefixes. */
    [data-ogsc] .ink { color:#f0ece3 !important; }
    [data-ogsc] .muted { color:#a9a294 !important; }
    [data-ogsb] .card { background:#232019 !important; }
    [data-ogsb] .panel { background:#27231c !important; }
    a { color:${BRAND}; }
    @media only screen and (max-width:520px) {
      .card-pad { padding:26px 22px !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background:${PAPER};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${PAPER};">${preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" class="email-bg-td" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:34px 16px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px;max-width:480px;">
          <tr>
            <td class="card card-pad" style="background:${CARD};border:1px solid ${BORDER};border-radius:20px;padding:30px 34px;">
              <div style="margin-bottom:22px;">${brandLockup()}</div>
              ${perforation()}
              <div style="height:22px;line-height:22px;font-size:0;">&nbsp;</div>
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 34px 0;">
              <p class="muted" style="margin:0 0 6px;font-family:${MONO};font-size:12px;color:${MUTED};">&copy; ${year} Splitza &middot; split bills without the awkward math</p>
              <p class="faint" style="margin:0;font-family:${BODY_SANS};font-size:12px;line-height:1.55;color:${FAINT};">
                <a href="${escapeHtml(home)}" target="_blank" style="color:${MUTED};text-decoration:underline;">splitza.app</a>
                &nbsp;&middot;&nbsp; ${escapeHtml(opts.footnote)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verifyEmail(opts: { name: string; url: string }): string {
  const name = escapeHtml(opts.name || "there");
  return shell(
    `${heading("Confirm your email")}
     ${paragraph(`Hi ${name}, welcome to Splitza. Confirm this address to finish setting up your account — the link is good for one hour.`)}
     ${button(opts.url, "Verify email")}
     ${fineprint("Didn't create a Splitza account? You can safely ignore this email — nothing happens without confirming.")}`,
    {
      preheader: "Confirm your email to finish setting up Splitza.",
      footnote: "You received this because this address was used to sign up.",
    },
  );
}

export function resetPasswordEmail(opts: { name: string; url: string }): string {
  const name = escapeHtml(opts.name || "there");
  return shell(
    `${heading("Reset your password")}
     ${paragraph(`Hi ${name}, we got a request to reset your Splitza password. Choose a new one below — the link expires in one hour.`)}
     ${button(opts.url, "Reset password")}
     ${fineprint("Didn't ask for this? Nothing has changed. You can safely ignore this email and keep your current password.")}`,
    {
      preheader: "Choose a new Splitza password — link expires in an hour.",
      footnote: "You received this because a password reset was requested.",
    },
  );
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
    ? ` <span class="muted" style="color:${MUTED};">(@${escapeHtml(opts.fromUsername)})</span>`
    : "";
  return shell(
    `${heading(`${fromName} wants to split bills with you`)}
     ${paragraph(`Hi ${toName}, <strong>${fromName}</strong>${handle} sent you a friend request on Splitza. Accept it and you can share and settle bills together.`)}
     ${button(opts.url, "View request")}
     ${fineprint("Not expecting this? You can ignore the request — it won't be accepted on its own.")}`,
    {
      preheader: `${opts.fromName} sent you a friend request on Splitza.`,
      footnote: "You received this because someone added your email as a friend.",
    },
  );
}

export function billShareEmail(opts: {
  fromName: string;
  billTitle: string;
  amount: string;
  url: string;
}): string {
  const fromName = escapeHtml(opts.fromName);
  const billTitle = escapeHtml(opts.billTitle || "a bill");
  return shell(
    `${heading(`${fromName} sent you a bill`)}
     ${paragraph(`Here's your share of <strong>${billTitle}</strong>. Open it to see the full itemized breakdown and how to pay.`)}
     ${receiptTotal(`Your share of ${billTitle}`, opts.amount)}
     ${button(opts.url, "View & pay")}
     ${fineprint("See something off? Open the bill and let them know — you can dispute it from there.")}`,
    {
      preheader: `Your share of ${opts.billTitle || "a bill"} is ${opts.amount}.`,
      footnote: `You received this because ${opts.fromName} split a bill with you.`,
    },
  );
}
