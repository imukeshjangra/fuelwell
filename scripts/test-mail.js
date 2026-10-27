#!/usr/bin/env node
// Sends a test email using the SMTP settings in .env.local and prints the exact error if it fails.
// Usage (on the server, inside /var/www/fuelwell):  node scripts/test-mail.js you@gmail.com
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const nodemailer = require('nodemailer');

const to = process.argv[2];
if (!to) { console.error('Usage: node scripts/test-mail.js you@example.com'); process.exit(1); }
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
console.log('SMTP_HOST :', SMTP_HOST || 'MISSING');
console.log('SMTP_PORT :', SMTP_PORT || '465 (default)');
console.log('SMTP_USER :', SMTP_USER || 'MISSING');
console.log('SMTP_PASS :', SMTP_PASS ? `set (${SMTP_PASS.length} characters)` : 'MISSING');
console.log('MAIL_FROM :', MAIL_FROM || `(default) Fuelwell <${SMTP_USER}>`);
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) { console.error('\nFAIL: add the missing values to .env.local, then run this again.'); process.exit(1); }

const port = Number(SMTP_PORT || 465);
const t = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS }, connectionTimeout: 15000 });
(async () => {
  try {
    await t.verify(); console.log('\nLogin to the mail server: OK');
    const info = await t.sendMail({ from: MAIL_FROM || `Fuelwell <${SMTP_USER}>`, to, subject: 'Fuelwell test email', text: 'If you can read this, your Fuelwell email settings work.' });
    console.log('Sent: OK  ->', info.response);
    console.log('\nCheck the inbox AND the spam folder of', to);
  } catch (e) {
    console.error('\nFAIL:', e.message); if (e.code) console.error('code:', e.code); if (e.response) console.error('server said:', e.response);
    process.exit(1);
  }
})();
