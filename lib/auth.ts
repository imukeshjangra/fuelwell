import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'll_admin';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

// In production there is no default password: ADMIN_PASSWORD must be set.
export const adminPassword = () => process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'admin');
export const weakPassword = (p: string) => ['admin', 'change-me', 'password', '123456'].includes(p) || p.length < 8;

const secret = () => `${process.env.AUTH_SECRET || 'dev'}::${adminPassword()}`;
const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

export const safeEqual = (a: string, b: string) => {
  const h = (x: string) => crypto.createHash('sha256').update(x).digest();
  return crypto.timingSafeEqual(h(a), h(b));
};

/** Signed session token: "<expiryUnixSeconds>.<nonce>.<hmac>". Expires on its own and dies if the password or secret changes. */
export const makeToken = () => {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const body = `${exp}.${crypto.randomBytes(8).toString('hex')}`;
  return `${body}.${sign(body)}`;
};

export const verifyToken = (t?: string | null) => {
  if (!t || !adminPassword()) return false;
  const parts = t.split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  try { return safeEqual(sig, sign(`${exp}.${nonce}`)); } catch { return false; }
};

export const isAdmin = () => verifyToken(cookies().get(COOKIE)?.value);

/** Same-origin check for state-changing requests (CSRF defence on top of SameSite cookies). */
export const sameOrigin = (req: Request) => {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser clients and same-origin GET/HEAD
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try { return new URL(origin).host === host; } catch { return false; }
};

export const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
