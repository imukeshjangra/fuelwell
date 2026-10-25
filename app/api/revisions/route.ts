import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { revisionsFor, getRevision } from '@/lib/db';

export function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const u = new URL(req.url);
  const id = Number(u.searchParams.get('id'));
  if (id) { const r = getRevision(id); return r ? NextResponse.json({ revision: r }) : NextResponse.json({ error: 'Not found' }, { status: 404 }); }
  return NextResponse.json({ revisions: revisionsFor(u.searchParams.get('slug') || '') });
}
