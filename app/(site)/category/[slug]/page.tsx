import Link from 'next/link';
import { notFound } from 'next/navigation';
import { livePosts } from '@/lib/db';
import { getCategories, getLiveCat } from '@/lib/categories';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/ui/Pagination';
import AdSlot from '@/components/ui/AdSlot';
import Reveal from '@/components/ui/Reveal';
export const dynamic = 'force-dynamic';
export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = getLiveCat(params.slug);
  return c ? { title: c.name, description: c.blurb || c.intro.slice(0, 160), alternates: { canonical: `/category/${c.slug}` } } : {};
}
const PER = 9;
export default function Category({ params, searchParams }: { params: { slug: string }; searchParams: { page?: string } }) {
  const c = getLiveCat(params.slug);
  if (!c) notFound();
  const posts = livePosts().filter(p => p.category === c.slug);
  const pages = Math.max(1, Math.ceil(posts.length / PER));
  const page = Math.min(pages, Math.max(1, Number(searchParams.page) || 1));
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: base }, { '@type': 'ListItem', position: 2, name: c.name, item: `${base}/category/${c.slug}` }] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="relative overflow-hidden py-16 text-white sm:py-20" style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
        {c.banner && <img src={c.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />}
        <div aria-hidden className="dot-grid absolute inset-0 opacity-30 [background-image:radial-gradient(#fff_1.3px,transparent_1.3px)]" />
        <div aria-hidden className="absolute -right-16 -top-16 h-80 w-80 animate-blob rounded-full bg-white/15 blur-2xl" />
        <div aria-hidden className="absolute -bottom-24 left-1/4 h-72 w-72 animate-blob rounded-full bg-black/10 blur-2xl [animation-delay:-9s]" />
        <span aria-hidden className="absolute right-[8%] top-1/2 hidden -translate-y-1/2 animate-float text-[9rem] opacity-25 drop-shadow-xl md:block">{c.icon}</span>
        <div className="relative mx-auto max-w-6xl px-5">
          <nav aria-label="Breadcrumb" className="animate-fade-in text-sm text-white/80"><Link href="/" className="hover:underline">Home</Link> / {c.name}</nav>
          <p className="mt-4 animate-pop text-5xl [animation-delay:.1s]">{c.icon}</p>
          <h1 className="mt-2 animate-fade-up text-4xl font-extrabold sm:text-6xl">{c.name}</h1>
          {c.blurb && <p className="mt-3 max-w-xl animate-fade-up text-lg text-white/90 [animation-delay:.12s]">{c.blurb}</p>}
          <p className="mt-5 inline-block animate-fade-up rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold backdrop-blur [animation-delay:.2s]">{posts.length} article{posts.length === 1 ? '' : 's'}</p>
        </div>
        <svg aria-hidden viewBox="0 0 1440 50" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] h-10 w-full fill-ground"><path d="M0 50V20C200 0 400 0 640 18s500 28 800 4v28z" /></svg>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">
        {c.intro && <Reveal><p className="mb-8 max-w-3xl whitespace-pre-line font-body text-lg leading-8 text-ink/75">{c.intro}</p></Reveal>}
        <div className="mb-8 flex flex-wrap gap-2">{getCategories().filter(x => x.slug !== c.slug).map(x => <Link key={x.slug} href={`/category/${x.slug}`} className="chip bg-white shadow-card hover:bg-tang hover:shadow-glow"><span className="chip-ic">{x.icon}</span>{x.name}</Link>)}</div>
        {posts.length === 0 ? <p className="card p-8">No articles in this category yet.</p> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.slice((page - 1) * PER, page * PER).map((p, i) => <Reveal key={p.id} delay={(i % 3) * 90} className="h-full"><PostCard p={p} /></Reveal>)}</div>}
        <Pagination page={page} pages={pages} base={`/category/${c.slug}`} />
        <AdSlot />
      </div>
    </>
  );
}
