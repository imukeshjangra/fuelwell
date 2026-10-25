import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createPasswordReset, deletePasswordReset, memberByEmail, resetPassword } from '@/lib/members';
import { mailConfigured, sendPasswordReset } from '@/lib/mail';
import { EMAIL, fail, limited, readJson } from '@/lib/http';

export const runtime = 'nodejs';

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function POST(req: Request) {
  const parsed = await readJson(req, 3000);
  if ('res' in parsed) return parsed.res;
  const { body } = parsed;
  const action = String(body.action || '');

  if (action === 'request') {
    if (limited(req, 'password-reset-request', 5, 60 * 60_000)) return fail('Too many requests. Please try again later.', 429);
    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL.test(email) || email.length > 200) return fail('Enter a valid email address');
    if (!mailConfigured()) return fail('Password reset email is unavailable. Please contact support.', 503);

    const member = memberByEmail(email);
    if (member) {
      const token = crypto.randomBytes(32).toString('base64url');
      createPasswordReset(member.id, token, Date.now() + 30 * 60_000);
      try {
        const url = new URL('/forgot-password', site());
        url.searchParams.set('token', token);
        await sendPasswordReset(email, url.toString());
      } catch (error) {
        deletePasswordReset(token);
        console.error('[mail] password reset email failed:', error);
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'reset') {
    if (limited(req, 'password-reset-submit', 10, 15 * 60_000)) return fail('Too many attempts. Please try again later.', 429);
    const token = String(body.token || '');
    const password = String(body.password || '');
    if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return fail('This reset link is invalid or has expired.', 400);
    if (password.length < 8 || password.length > 100) return fail('Password must be 8 to 100 characters');
    if (!resetPassword(token, password)) return fail('This reset link is invalid or has expired.', 400);
    return NextResponse.json({ ok: true });
  }

  return fail('Unknown action');
}
