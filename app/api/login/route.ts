import { NextResponse } from 'next/server';
import { makeToken, adminPassword, safeEqual, weakPassword, sameOrigin, clientIp, COOKIE, SESSION_SECONDS } from '@/lib/auth';
import { tooManyFails, recordFail, clearFails } from '@/lib/rate';
import { logActivity } from '@/lib/db';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Blocked request origin' }, { status: 403 });
  const { password } = await req.json().catch(() => ({ password: '' }));
  const real = adminPassword();
  if (!real) return NextResponse.json({ error: 'Set ADMIN_PASSWORD on the server first' }, { status: 500 });
  if (process.env.NODE_ENV === 'production' && weakPassword(real)) return NextResponse.json({ error: 'ADMIN_PASSWORD is too weak. Use 8+ characters and change it.' }, { status: 500 });
  const ip = clientIp(req);
  if (tooManyFails(`login:${ip}`, 8, 15 * 60_000)) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (!safeEqual(String(password || ''), real)) {
    recordFail(`login:${ip}`);
    logActivity('login-failed', ip);
    await new Promise(r => setTimeout(r, 600)); // slows down guessing
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }
  clearFails(`login:${ip}`);
  logActivity('login', ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS, secure: req.headers.get('x-forwarded-proto') === 'https' });
  return res;
}
