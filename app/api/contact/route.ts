import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { addMessage, deleteMessage, markMessage, markAllMessagesRead } from '@/lib/db';
import { sameOrigin } from '@/lib/auth';
import { readJson, limited } from '@/lib/http';
export async function POST(req: Request) {
  const r = await readJson(req); if ('res' in r) return r.res;
  const b = r.body as Record<string, unknown>;
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: pretend success
  if (limited(req, 'contact', 5, 3600_000)) return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429 });
  const name = String(b.name || '').trim(), email = String(b.email || '').trim(), message = String(b.message || '').trim();
  if (!name || name.length > 100) return NextResponse.json({ error: 'Enter your name' }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  if (message.length < 10 || message.length > 3000) return NextResponse.json({ error: 'Write a message of 10 to 3000 characters' }, { status: 400 });
  addMessage({ name, email, message });
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Blocked request origin' }, { status: 403 });
  if (!isAdmin()) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  deleteMessage(Number(new URL(req.url).searchParams.get('id')));
  return NextResponse.json({ ok: true });
}

/** Mark one message read/unread: { id, read } or all: { all: true } */
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Blocked request origin' }, { status: 403 });
  if (!isAdmin()) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (b.all) markAllMessagesRead(); else if (Number(b.id)) markMessage(Number(b.id), !!b.read); else return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
