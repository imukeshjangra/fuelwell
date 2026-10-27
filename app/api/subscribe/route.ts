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
  if (added.changes === 0) return NextResponse.json({ ok: true, already: true }); // already on the list: no second welcome email
  await sendWelcome(e);
  return NextResponse.json({ ok: true });
}
