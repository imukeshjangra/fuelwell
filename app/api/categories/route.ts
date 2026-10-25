import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { allCategories, saveCategory, deleteCategory, reorderCategories, categorySlugTaken, postsInCategory } from '@/lib/db';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const guard = (req: Request) => (!sameOrigin(req) ? bad('Blocked request origin', 403) : !isAdmin() ? bad('Not signed in. Refresh the page and sign in again.', 401) : null);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const BANNER = /^\/uploads\/[a-f0-9]{16}\.(jpg|png|webp)$/;
const refresh = () => { revalidatePath('/', 'layout'); };
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Create or update one category: { oldSlug?, slug, name, icon, from, to, blurb, intro, banner, menu, home, visible } */
export async function POST(req: Request) {
  const g = guard(req); if (g) return g;
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return bad('Invalid request');
  const oldSlug = str(b.oldSlug, 80);
  const slug = str(b.slug, 80);
  const name = str(b.name, 40);
  if (!name) return bad('Give the category a name');
  if (!SLUG.test(slug)) return bad('Web address may only use lowercase letters, numbers and dashes');
  if (!HEX.test(str(b.from, 7)) || !HEX.test(str(b.to, 7))) return bad('Pick two valid colours');
  const banner = str(b.banner, 80);
  if (banner && !BANNER.test(banner)) return bad('Invalid banner image');
  if (oldSlug && !allCategories().some(c => c.slug === oldSlug)) return bad('Category not found', 404);
  if ((!oldSlug || oldSlug !== slug) && categorySlugTaken(slug)) return bad('That web address is already used by another category', 409);
  saveCategory({
    slug, name, icon: str(b.icon, 8), from: str(b.from, 7), to: str(b.to, 7),
    blurb: str(b.blurb, 160), intro: str(b.intro, 700), banner,
    menu: !!b.menu, home: !!b.home, visible: b.visible !== false,
  }, oldSlug);
  refresh();
  return NextResponse.json({ ok: true });
}

/** Reorder: { order: string[] } */
export async function PATCH(req: Request) {
  const g = guard(req); if (g) return g;
  const b = await req.json().catch(() => null);
  const known = new Set(allCategories().map(c => c.slug));
  const order: string[] = Array.isArray(b?.order) ? b.order.filter((s: unknown) => typeof s === 'string' && known.has(s)) : [];
  if (!order.length) return bad('Nothing to reorder');
  reorderCategories([...new Set(order)]);
  refresh();
  return NextResponse.json({ ok: true });
}

/** Delete: ?slug=...&moveTo=other-slug (moveTo is required while the category still has articles) */
export async function DELETE(req: Request) {
  const g = guard(req); if (g) return g;
  const u = new URL(req.url);
  const slug = u.searchParams.get('slug') || '';
  const moveTo = u.searchParams.get('moveTo') || '';
  const all = allCategories();
  if (!all.some(c => c.slug === slug)) return bad('Category not found', 404);
  if (all.length <= 1) return bad('Keep at least one category');
  const n = postsInCategory(slug);
  if (n > 0 && (!moveTo || moveTo === slug || !all.some(c => c.slug === moveTo))) return bad(`This category has ${n} article${n === 1 ? '' : 's'}. Choose a category to move them to.`);
  deleteCategory(slug, n > 0 ? moveTo : '');
  refresh();
  return NextResponse.json({ ok: true });
}
