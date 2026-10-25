import nodemailer from 'nodemailer';

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

let tx: nodemailer.Transporter | null = null;
function transport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null; // email not configured: skip silently
  if (!tx) {
    const port = Number(process.env.SMTP_PORT || 465);
    tx = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  }
  return tx;
}

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export async function sendPasswordReset(to: string, resetUrl: string) {
  const t = transport();
  if (!t) throw new Error('SMTP is not configured');
  const from = process.env.MAIL_FROM || `Fuelwell <${process.env.SMTP_USER}>`;
  const text = `We received a request to reset your Fuelwell password.\n\nUse this one-time link within 30 minutes:\n${resetUrl}\n\nIf you did not request a reset, you can ignore this email.`;
  const html = `<!doctype html><html><body style="margin:0;background:#F4F6FA;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0B1220"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:linear-gradient(135deg,#FFA24A,#E8601A);padding:28px 32px;color:#fff;font-size:26px;font-weight:800">Fuelwell</td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 12px;font-size:24px">Reset your password</h1><p style="font-size:16px;line-height:1.6;color:#334155">Use the button below to choose a new password. This one-time link expires in 30 minutes.</p><a href="${resetUrl}" style="display:inline-block;background:#E8601A;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Reset password</a><p style="font-size:13px;line-height:1.6;color:#64748B">If you did not request this, you can ignore this email. Your password will not change.</p></td></tr></table></td></tr></table></body></html>`;
  await t.sendMail({ from, to, subject: 'Reset your Fuelwell password', text, html, replyTo: process.env.MAIL_REPLY_TO || undefined });
}

/** Sends the welcome email. Never throws: a mail problem must not break subscribing. */
export async function sendWelcome(to: string) {
  const t = transport();
  if (!t) { console.warn('[mail] SMTP not configured, welcome email skipped'); return; }
  const url = site();
  const from = process.env.MAIL_FROM || `Fuelwell <${process.env.SMTP_USER}>`;
  const html = `<!doctype html><html><body style="margin:0;background:#F4F6FA;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0B1220">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:linear-gradient(135deg,#FFA24A,#E8601A);padding:28px 32px;color:#fff">
<div style="font-size:26px;font-weight:800;letter-spacing:-.5px">Fuel<span style="color:#0B1220">well</span></div></td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 12px;font-size:24px">Thank you for subscribing! 🎉</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155">Welcome to Fuelwell. You will now get practical, no-nonsense tips on weight loss, weight gain and protein, with Indian food in mind.</p>
<p style="margin:0 0 8px;font-size:16px;font-weight:700">Start here:</p>
<ul style="margin:0 0 24px;padding-left:20px;font-size:16px;line-height:1.8;color:#334155">
<li><a href="${url}/protein-calculator" style="color:#E8601A">Free protein calculator</a></li>
<li><a href="${url}/protein-per-rupee" style="color:#E8601A">Cheapest protein foods (protein per ₹)</a></li>
<li><a href="${url}/meal-plan" style="color:#E8601A">7-day Indian meal plan</a></li>
</ul>
<a href="${url}/blog" style="display:inline-block;background:#E8601A;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">Read latest articles</a>
<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#64748B">You received this because you subscribed at ${url.replace(/^https?:\/\//, '')}. If this was not you, or you want to stop emails, just reply to this message and we will remove you. This is general information, not medical advice.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `Thank you for subscribing to Fuelwell!\n\nYou will now get practical tips on weight loss, weight gain and protein.\n\nStart here:\n- Protein calculator: ${url}/protein-calculator\n- Protein per rupee: ${url}/protein-per-rupee\n- 7-day meal plan: ${url}/meal-plan\n- Latest articles: ${url}/blog\n\nTo stop emails, just reply to this message.`;
  try {
    await t.sendMail({ from, to, subject: 'Welcome to Fuelwell: thanks for subscribing!', text, html, replyTo: process.env.MAIL_REPLY_TO || undefined });
  } catch (err) {
    console.error('[mail] welcome email failed:', (err as Error).message);
  }
}
