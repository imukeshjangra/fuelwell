import Link from 'next/link';
import Cover from '@/components/ui/Cover';
import { getCat } from '@/lib/categories';
import type { Post } from '@/lib/db';
export const fmt = (d: string) => new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const readMins = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 200));
export function CatPill({ slug, className = '' }: { slug: string; className?: string }) {
  const c = getCat(slug);
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${className}`} style={{ background: `linear-gradient(135deg,${c?.from ?? '#0F1B2D'},${c?.to ?? '#2B5C8A'})` }}>{c?.icon && <span aria-hidden>{c.icon}</span>}{c?.name}</span>;
}
export default function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/blog/${p.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
      <div className="relative overflow-hidden">
        <Cover cover={p.cover} cat={p.category} title={p.title} className="aspect-[16/10] w-full transition duration-700 ease-out group-hover:scale-110 group-hover:rotate-[.6deg]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        <CatPill slug={p.category} className="absolute left-3 top-3 shadow-lg" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-snug group-hover:text-teal">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-ink/70">{p.excerpt}</p>
        <p className="mt-auto flex items-center justify-between pt-4 text-xs font-semibold text-ink/55"><span>{fmt(p.created)} · {readMins(p.body)} min read</span><span aria-hidden className="translate-x-[-6px] text-base font-extrabold text-tang opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span></p>
      </div>
    </Link>
  );
}
export function PostRow({ p, n }: { p: Post; n?: number }) {
  return (
    <Link href={`/blog/${p.slug}`} className="group flex items-start gap-3">
      {n !== undefined ? <span className="w-8 shrink-0 bg-grad-sunrise bg-clip-text text-3xl font-extrabold leading-none text-transparent transition duration-300 ease-spring group-hover:scale-125">{n}</span> : null}
      <span><span className="block font-bold leading-snug group-hover:text-teal">{p.title}</span><span className="mt-1 block text-xs font-semibold text-ink/55">{getCat(p.category)?.name} · {readMins(p.body)} min read</span></span>
    </Link>
  );
}
