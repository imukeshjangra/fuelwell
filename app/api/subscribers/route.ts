import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { allSubscribers, deleteSubscriber } from '@/lib/db';

const csvCell = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""');

export function GET() {
  if (!isAdmin()) return new Response('Not signed in', { status: 401 });
  const csv = 'email,subscribed\n' + allSubscribers().map(s => `"${csvCell(s.email)}","${s.created}"`).join('\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=subscribers.csv' } });
}

export function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Blocked request origin' }, { status: 403 });
  if (!isAdmin()) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  deleteSubscriber(id);
  return NextResponse.json({ ok: true });
}
