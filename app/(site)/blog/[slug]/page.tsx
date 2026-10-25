import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { marked } from 'marked';
import { livePosts, getPost, bumpViews, isLive, tagList, tagSlug } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getCat } from '@/lib/categories';
import Cover from '@/components/ui/Cover';
import PostCard, { CatPill, fmt, readMins } from '@/components/blog/PostCard';
import AdSlot from '@/components/ui/AdSlot';
import Newsletter from '@/components/ui/Newsletter';
import ReadingProgress from '@/components/layout/ReadingProgress';
import ShareBar from '@/components/ui/ShareBar';
import Sidebar from '@/components/layout/Sidebar';
export const dynamic = 'force-dynamic';
const iso = (d: string) => d.replace(' ', 'T') + 'Z';
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p || !isLive(p)) return { robots: { index: false } };
  return {
    title: p.title, description: p.excerpt, keywords: tagList(p), alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.excerpt, type: 'article', publishedTime: iso(p.created), modifiedTime: iso(p.updated || p.created), tags: tagList(p), images: [p.cover || `/og/${p.slug}`] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: [p.cover || `/og/${p.slug}`] },
  };
}
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|curl|wget|headless/i;
export default function PostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  const admin = isAdmin();
  const live = !!p && isLive(p);
  if (!p || (!live && !admin)) notFound();
  if (!admin && live && !BOT.test(headers().get('user-agent') || '')) bumpViews(p.id);
  const c = getCat(p.category);
  const tags = tagList(p);
  const toc: { id: string; t: string }[] = [];
  const html = (marked.parse(p.body, { async: false }) as string).replace(/<h2>(.*?)<\/h2>/g, (_, t: string) => {
    const id = t.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, t }); return `<h2 id="${id}">${t}</h2>`;
  });
  const parts = html.split('</p>');
  const head = parts.slice(0, 2).join('</p>') + (parts.length > 1 ? '</p>' : '');
  const tail = parts.slice(2).join('</p>');
  const mins = readMins(p.body);
  const related = livePosts().filter(x => x.id !== p.id).map(x => ({ x, s: (x.category === p.category ? 2 : 0) + tagList(x).filter(t => tags.includes(t)).length })).filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.x);
  const feed = livePosts();
  const idx = feed.findIndex(x => x.id === p.id);
  const newer = idx > 0 ? feed[idx - 1] : undefined;
  const older = idx >= 0 ? feed[idx + 1] : undefined;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const full = `${base}/blog/${p.slug}`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.excerpt, datePublished: iso(p.created), dateModified: iso(p.updated || p.created), mainEntityOfPage: full, keywords: tags.join(', '), articleSection: c?.name, author: p.author_name ? { '@type': 'Person', name: p.author_name } : { '@type': 'Organization', name: 'Fuelwell Editorial Team' }, publisher: { '@type': 'Organization', name: 'Fuelwell' }, image: p.cover ? base + p.cover : `${base}/og/${p.slug}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: base }, { '@type': 'ListItem', position: 2, name: c?.name, item: `${base}/category/${p.category}` }, { '@type': 'ListItem', position: 3, name: p.title, item: full }] },
  ];
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          {!live && <p className="mb-4 rounded-xl bg-tang p-3 font-bold">{p.status === 'draft' ? 'Draft preview.' : 'Scheduled article.'} Only you can see this.</p>}
          <nav aria-label="Breadcrumb" className="text-sm text-ink/70"><Link href="/" className="hover:text-teal">Home</Link> / <Link href={`/category/${p.category}`} className="hover:text-teal">{c?.name}</Link></nav>
          <CatPill slug={p.category} className="mt-5" />
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">{p.title}</h1>
          <p className="mt-4 font-body text-xl text-ink/75">{p.excerpt}</p>
          <div className="mt-5 flex items-center gap-3 text-sm">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-extrabold text-tang">{(p.author_name || 'F').charAt(0).toUpperCase()}</span>
            <span><span className="block font-bold">{p.author_name || 'Fuelwell Editorial Team'}{p.author_name && <span className="ml-2 rounded-full bg-aqua/20 px-2 py-0.5 text-xs font-bold text-teal">Community author</span>}</span><span className="text-ink/60">{fmt(p.created)}{p.updated && p.updated.slice(0, 10) !== p.created.slice(0, 10) ? ` · Updated ${fmt(p.updated)}` : ''} · {mins} min read</span></span>
          </div>
          <Cover cover={p.cover} cat={p.category} title={p.title} priority className="mt-6 aspect-[16/9] w-full rounded-3xl shadow-card" />
          {toc.length >= 2 && (
            <details open className="mt-8 rounded-2xl bg-white p-5 shadow-card lg:hidden"><summary className="cursor-pointer font-extrabold">In this article</summary>
              <ul className="mt-2 space-y-1">{toc.map(t => <li key={t.id}><a href={`#${t.id}`} className="text-teal underline" dangerouslySetInnerHTML={{ __html: t.t }} /></li>)}</ul>
            </details>
          )}
          <div className="article mt-8" dangerouslySetInnerHTML={{ __html: head }} />
          <AdSlot />
          <div className="article" dangerouslySetInnerHTML={{ __html: tail }} />
          {tags.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{tags.map(t => <Link key={t} href={`/tag/${tagSlug(t)}`} className="rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-card hover:bg-teal hover:text-white">#{t}</Link>)}</div>}
          <ShareBar url={full} title={p.title} />
          <Link href="/protein-calculator" className="block rounded-2xl bg-gradient-to-r from-tang to-[#ffb347] p-6 text-lg font-extrabold text-ink shadow-card hover:brightness-95">Find out how much protein you need with our free calculator →</Link>
          <div className="mt-8 flex gap-4 rounded-2xl bg-white p-6 shadow-card">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-2xl font-extrabold text-tang">F</span>
            <p className="text-sm text-ink/75"><span className="block text-base font-extrabold text-ink">Written by the Fuelwell Editorial Team</span>We write plain-language guides on food, protein and training. This article is general information, not medical advice. <Link href="/disclaimer" className="font-bold text-teal underline">Read the full disclaimer</Link>.</p>
          </div>
          <AdSlot />
          {(newer || older) && (
            <nav aria-label="More articles" className="mt-10 grid gap-4 sm:grid-cols-2">
              {older ? <Link href={`/blog/${older.slug}`} rel="prev" className="card card-hover rounded-2xl bg-white p-5 shadow-card"><span className="text-xs font-extrabold uppercase tracking-wide text-teal">← Previous</span><span className="mt-1 block font-bold leading-snug">{older.title}</span></Link> : <span />}
              {newer ? <Link href={`/blog/${newer.slug}`} rel="next" className="card card-hover rounded-2xl bg-white p-5 text-right shadow-card"><span className="text-xs font-extrabold uppercase tracking-wide text-teal">Next →</span><span className="mt-1 block font-bold leading-snug">{newer.title}</span></Link> : <span />}
            </nav>
          )}
          <Newsletter />
        </article>
        <div className="space-y-8 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {toc.length >= 2 && (
            <nav aria-label="In this article" className="hidden rounded-2xl bg-white p-6 shadow-card lg:block">
              <p className="font-extrabold">In this article</p>
              <ul className="mt-3 space-y-2 text-sm">{toc.map(t => <li key={t.id}><a href={`#${t.id}`} className="hover:text-teal hover:underline" dangerouslySetInnerHTML={{ __html: t.t }} /></li>)}</ul>
            </nav>
          )}
          <Sidebar exclude={p.id} />
        </div>
      </div>
      {related.length > 0 && <section className="mt-16"><h2 className="mb-6 text-2xl font-extrabold">Keep reading</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map(r => <PostCard key={r.id} p={r} />)}</div></section>}
    </div>
  );
}
