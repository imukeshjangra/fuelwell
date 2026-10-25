import { NextResponse } from 'next/server';
import { readJson, limited, fail, EMAIL } from '@/lib/http';
import { clientIp } from '@/lib/auth';
import { tooManyFails, recordFail, clearFails } from '@/lib/rate';
import { createMember, memberByEmail, makeMemberToken, checkPassword, MEMBER_COOKIE, MEMBER_SECONDS } from '@/lib/members';
export const runtime = 'nodejs';

function session(req: Request, id: number) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, makeMemberToken(id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: MEMBER_SECONDS, secure: req.headers.get('x-forwarded-proto') === 'https' });
  return res;
}

export async function POST(req: Request) {
  const r = await readJson(req, 3000); if ('res' in r) return r.res;
  const b = r.body; const action = String(b.action || '');
  if (action === 'logout') { const res = NextResponse.json({ ok: true }); res.cookies.set(MEMBER_COOKIE, '', { path: '/', maxAge: 0 }); return res; }
  const email = String(b.email || '').trim().toLowerCase(); const password = String(b.password || '');
  if (!EMAIL.test(email) || email.length > 200) return fail('Enter a valid email address');

  if (action === 'register') {
    if (b.website) return NextResponse.json({ ok: true }); // honeypot
    const name = String(b.name || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 60) return fail('Enter your name (2 to 60 characters)');
    if (password.length < 8 || password.length > 100) return fail('Password must be 8 to 100 characters');
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
