import { NextResponse } from 'next/server';
import { sameOrigin, clientIp } from './auth';
import { allow } from './rate';
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
/** Same-origin check + JSON body parse + size cap. Returns the body or a ready error response. */
export async function readJson(req: Request, maxBytes = 20_000): Promise<{ body: Record<string, unknown> } | { res: NextResponse }> {
  if (!sameOrigin(req)) return { res: fail('Blocked request origin', 403) };
  const text = await req.text().catch(() => '');
  if (text.length > maxBytes) return { res: fail('Request too large', 413) };
  try { const body = JSON.parse(text); return body && typeof body === 'object' ? { body } : { res: fail('Invalid request') }; } catch { return { res: fail('Invalid request') }; }
}
export const limited = (req: Request, scope: string, max: number, windowMs: number) => !allow(`${scope}:${clientIp(req)}`, max, windowMs);
export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** A YYYY-MM-DD day sent by the browser (the visitor's own date). Accepts today +/- 1 day to allow for time zones. */
export const validDay = (s: unknown): s is string => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`); return Number.isFinite(t) && Math.abs(t - Date.now()) < 2.1 * 86400000;
};
/** Number within a range, or null when blank. Returns undefined when invalid. */
export const numIn = (v: unknown, min: number, max: number): number | null | undefined => {
  if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
};
