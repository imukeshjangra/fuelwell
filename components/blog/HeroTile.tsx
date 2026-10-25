import Link from 'next/link';
import Cover from '@/components/ui/Cover';
import { CatPill, fmt, readMins } from '@/components/blog/PostCard';
import type { Post } from '@/lib/db';
export default function HeroTile({ p, big = false }: { p: Post; big?: boolean }) {
  return (
    <Link href={`/blog/${p.slug}`} className={`group relative block h-full min-h-[16rem] overflow-hidden rounded-3xl bg-ink shadow-card transition duration-500 ease-out hover:-translate-y-1 hover:shadow-lift ${big ? 'lg:col-span-2 lg:row-span-2 lg:min-h-[32rem]' : ''}`}>
      <Cover cover={p.cover} cat={p.category} title={p.title} priority={big} className="absolute inset-0 h-full w-full transition duration-[900ms] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent transition duration-500 group-hover:from-ink/95" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
        <CatPill slug={p.category} />
        <h2 className={`mt-3 font-extrabold leading-tight transition duration-500 group-hover:translate-x-1 ${big ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'}`}>{p.title}</h2>
        {big && <p className="mt-3 line-clamp-2 max-w-xl text-lg text-white/85">{p.excerpt}</p>}
        <p className="mt-3 text-xs font-semibold text-white/75">{fmt(p.created)} · {readMins(p.body)} min read</p>
      </div>
    </Link>
  );
}
