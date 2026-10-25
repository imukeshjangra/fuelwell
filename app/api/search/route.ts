import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/db';
import { getCat } from '@/lib/categories';
import { allow } from '@/lib/rate';
import { clientIp } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export function GET(req: Request) {
  if (!allow(`search:${clientIp(req)}`, 60, 60_000)) return NextResponse.json({ results: [] }, { status: 429 });
  const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = searchPosts(q).slice(0, 8).map(p => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: getCat(p.category)?.name || '' }));
  return NextResponse.json({ results });
}
