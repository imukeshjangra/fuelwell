import { NextResponse } from 'next/server';
import { readJson, limited, fail, EMAIL } from '@/lib/http';
import { clientIp } from '@/lib/auth';
import { allow, tooManyFails, recordFail, clearFails } from '@/lib/rate';
import { sendReset } from '@/lib/mail';
import { createMember, memberByEmail, makeMemberToken, checkPassword, createReset, useReset, MEMBER_COOKIE, MEMBER_SECONDS } from '@/lib/members';
export const runtime = 'nodejs';

function session(req: Request, id: number) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, makeMemberToken(id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: MEMBER_SECONDS, secure: req.headers.get('x-forwarded-proto') === 'https' });
  return res;
}
const validPw = (p: string) => p.length >= 8 && p.length <= 100;

export async function POST(req: Request) {
  const r = await readJson(req, 3000); if ('res' in r) return r.res;
  const b = r.body; const action = String(b.action || '');
  if (action === 'logout') { const res = NextResponse.json({ ok: true }); res.cookies.set(MEMBER_COOKIE, '', { path: '/', maxAge: 0 }); return res; }

  if (action === 'reset') {
    const password = String(b.password || '');
    if (!validPw(password)) return fail('Password must be 8 to 100 characters');
    if (limited(req, 'reset-try', 10, 3600_000)) return fail('Too many attempts. Try again later.', 429);
    const uid = useReset(String(b.token || ''), password);
    return uid ? session(req, uid) : fail('This reset link is invalid or has expired. Please request a new one.', 400);
  }

  const email = String(b.email || '').trim().toLowerCase(); const password = String(b.password || '');
  if (!EMAIL.test(email) || email.length > 200) return fail('Enter a valid email address');

  if (action === 'forgot') {
    if (b.website) return NextResponse.json({ ok: true }); // honeypot
    if (limited(req, 'forgot', 5, 3600_000) || !allow(`forgot:${email}`, 3, 3600_000)) return fail('Too many requests. Please try again in an hour.', 429);
    const u = memberByEmail(email);
    if (u) void sendReset(u.email, u.name, createReset(u.id)); // not awaited: same response time whether or not the account exists
    return NextResponse.json({ ok: true }); // always the same answer, so nobody can probe which emails have accounts
  }
  if (action === 'register') {
    if (b.website) return NextResponse.json({ ok: true }); // honeypot
    const name = String(b.name || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 60) return fail('Enter your name (2 to 60 characters)');
    if (!validPw(password)) return fail('Password must be 8 to 100 characters');
    if (limited(req, 'register', 5, 3600_000)) return fail('Too many sign-ups from this network. Try again later.', 429);
    if (memberByEmail(email)) return fail('An account with this email already exists. Please sign in.', 409);
    return session(req, createMember(name, email, password));
  }
  if (action === 'login') {
    const key = `mlogin:${clientIp(req)}:${email}`;
    if (tooManyFails(key, 8, 15 * 60_000)) return fail('Too many attempts. Try again in 15 minutes.', 429);
    const u = memberByEmail(email);
    if (!u || !checkPassword(password, u.pass)) { recordFail(key); await new Promise(x => setTimeout(x, 600)); return fail('Wrong email or password', 401); }
    clearFails(key);
    return session(req, u.id);
  }
  return fail('Unknown action');
}
