import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/db';
import { sendWelcome } from '@/lib/mail';
import { readJson, limited, EMAIL } from '@/lib/http';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 2000); if ('res' in r) return r.res;
  if (r.body.website) return NextResponse.json({ ok: true }); // honeypot
  const e = String(r.body.email || '').trim().toLowerCase();
  if (!EMAIL.test(e) || e.length > 200) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  if (limited(req, 'subscribe', 10, 3600_000)) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  const added = addSubscriber(e);
  if (added.changes > 0) await sendWelcome(e); // only brand-new subscribers get the email
  return NextResponse.json({ ok: true });
}
