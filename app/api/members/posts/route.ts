import { NextResponse } from 'next/server';
import { readJson, fail } from '@/lib/http';
import { getCat } from '@/lib/categories';
import { getMember, saveSubmission, deleteOwnSubmission, cleanBody, countRecentSubmissions, pendingOf } from '@/lib/members';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 60_000); if ('res' in r) return r.res;
  const m = getMember(); if (!m) return fail('Please sign in', 401);
  const b = r.body;
  if (b.action === 'delete') { deleteOwnSubmission(m.id, Number(b.id)); return NextResponse.json({ ok: true }); }
  const title = String(b.title || '').trim(), excerpt = String(b.excerpt || '').trim(), category = String(b.category || '');
  const body = cleanBody(String(b.body || '').trim()); const cover = String(b.cover || '');
  const tags = String(b.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 6).join(', ');
  if (title.length < 8 || title.length > 120) return fail('Title must be 8 to 120 characters');
  if (excerpt.length < 40 || excerpt.length > 200) return fail('Short summary must be 40 to 200 characters');
  if (!getCat(category)) return fail('Choose a category');
  if (body.length < 400) return fail('Please write at least 400 characters so the article is useful to readers');
  if (body.length > 40_000) return fail('Article is too long');
  if (cover && !/^\/uploads\/[a-f0-9]+\.(jpg|png|webp)$/.test(cover)) return fail('Invalid cover image');
  const id = Number(b.id) || 0;
  if (!id) {
    if (pendingOf(m.id) >= 5) return fail('You already have 5 articles waiting for review. Please wait for them to be reviewed.');
    if (countRecentSubmissions(m.id) >= 10) return fail('Daily limit reached. Try again tomorrow.', 429);
  }
  return NextResponse.json({ ok: true, id: saveSubmission(m.id, { title, excerpt, category, cover, tags, body }, id) });
}
