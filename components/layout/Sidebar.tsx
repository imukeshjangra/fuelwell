import Link from 'next/link';
import { getCategories } from '@/lib/categories';
import { popularPosts, allTags, livePosts } from '@/lib/db';
import { PostRow } from '@/components/blog/PostCard';
import Newsletter from '@/components/ui/Newsletter';
export default function Sidebar({ exclude = 0 }: { exclude?: number }) {
  const pop = popularPosts(5, exclude);
  const tags = allTags().slice(0, 14);
  const all = livePosts();
  return (
    <aside className="space-y-8">
      <Link href="/protein-calculator" className="group relative block overflow-hidden rounded-2xl bg-grad-sunrise bg-[length:200%_200%] p-6 shadow-glow transition duration-300 animate-gradient-x hover:-translate-y-1">
        <p className="text-sm font-bold uppercase tracking-wide text-ink/70">Free tool</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">How much protein do you need?</p>
        <p className="mt-2 font-bold text-ink">Open the calculator <span aria-hidden className="inline-block transition group-hover:translate-x-1.5">→</span></p><span aria-hidden className="absolute -right-4 -top-4 text-7xl opacity-20 transition duration-500 group-hover:rotate-12 group-hover:scale-110">🧮</span>
      </Link>
      {pop.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-card" aria-label="Popular articles">
          <h2 className="mb-4 text-lg font-extrabold">Most read</h2>
          <div className="space-y-4">{pop.map((p, i) => <PostRow key={p.id} p={p} n={i + 1} />)}</div>
        </section>
      )}
      <section className="rounded-2xl bg-white p-6 shadow-card" aria-label="Categories">
        <h2 className="mb-3 text-lg font-extrabold">Browse by topic</h2>
        <ul className="space-y-1">
          {getCategories().map(c => (
            <li key={c.slug}><Link href={`/category/${c.slug}`} className="group flex items-center justify-between rounded-lg px-2 py-2 font-semibold transition hover:translate-x-1 hover:bg-ground"><span><span className="inline-block transition duration-300 ease-spring group-hover:scale-125">{c.icon}</span> {c.name}</span><span className="text-sm text-ink/50">{all.filter(p => p.category === c.slug).length}</span></Link></li>
          ))}
        </ul>
      </section>
      {tags.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-card" aria-label="Tags">
          <h2 className="mb-3 text-lg font-extrabold">Popular tags</h2>
          <div className="flex flex-wrap gap-2">{tags.map(t => <Link key={t.slug} href={`/tag/${t.slug}`} className="rounded-full bg-ground px-3 py-1 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-teal hover:text-white">#{t.name}</Link>)}</div>
        </section>
      )}
      <Newsletter compact />
    </aside>
  );
}
