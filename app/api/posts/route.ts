import { NextResponse } from 'next/server';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { savePost, deletePost, getPost, bulkSetStatus, bulkDelete, bulkSetCategory, toggleFeatured, slugTaken, logActivity } from '@/lib/db';
import { getCat } from '@/lib/categories';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const guard = (req: Request) => (!sameOrigin(req) ? bad('Blocked request origin', 403) : !isAdmin() ? bad('Not signed in. Refresh the page and sign in again.', 401) : null);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function POST(req: Request) {
  const g = guard(req); if (g) return g;
  const p = await req.json().catch(() => null);
  if (!p) return bad('Invalid request');
  if (!p.slug || !p.title || !p.body) return bad('Title, web address and article text are required');
  if (!SLUG.test(p.slug) || p.slug.length > 120) return bad('Web address may only use lowercase letters, numbers and dashes');
  if (!getCat(p.category)) return bad('Choose a category');
  if (p.cover && !/^\/uploads\/[a-f0-9]{16}\.(jpg|png|webp)$/.test(p.cover)) return bad('Invalid cover image');
  const publish_at = String(p.publish_at || '');
  if (publish_at && !/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(publish_at)) return bad('Invalid publish date');
  if (String(p.body).length > 400_000) return bad('Article is too long');
  if (!p.isEdit && slugTaken(p.slug)) return bad('That web address is already used by another article. Change it.', 409);
  const tags = String(p.tags || '').split(',').map((t: string) => t.trim().slice(0, 30)).filter(Boolean).slice(0, 8).join(', ');
  const created = savePost({ slug: p.slug, title: String(p.title).slice(0, 200), excerpt: String(p.excerpt || '').slice(0, 300), category: p.category, cover: p.cover || '', featured: p.featured ? 1 : 0, status: p.status === 'draft' ? 'draft' : 'published', body: p.body, tags, publish_at });
  return NextResponse.json({ ok: true, created });
}

/** Bulk actions: { action: 'publish' | 'draft' | 'delete' | 'category' | 'feature', slugs: string[], category? } */
export async function PATCH(req: Request) {
  const g = guard(req); if (g) return g;
  const b = await req.json().catch(() => null);
  const slugs: string[] = Array.isArray(b?.slugs) ? b.slugs.filter((s: unknown) => typeof s === 'string' && SLUG.test(s)).slice(0, 200) : [];
  if (!slugs.length) return bad('Select at least one article');
  switch (b.action) {
    case 'publish': bulkSetStatus(slugs, 'published'); break;
    case 'draft': bulkSetStatus(slugs, 'draft'); break;
    case 'delete': bulkDelete(slugs); break;
    case 'category': if (!getCat(b.category)) return bad('Choose a category'); bulkSetCategory(slugs, b.category); break;
    case 'feature': slugs.forEach(toggleFeatured); logActivity('feature', `${slugs.length} article(s)`); break;
    default: return bad('Unknown action');
  }
  return NextResponse.json({ ok: true, count: slugs.length });
}

export async function DELETE(req: Request) {
  const g = guard(req); if (g) return g;
  const slug = new URL(req.url).searchParams.get('slug') || '';
  const post = getPost(slug);
  if (!post) return bad('Article not found', 404);
  deletePost(slug);
  logActivity('delete', post.title);
  return NextResponse.json({ ok: true });
}
