'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type R = { slug: string; title: string; excerpt: string; category: string };
export default function InstantSearch({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const [res, setRes] = useState<R[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    setBusy(true);
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal }).then(r => r.json()).then(j => { setRes(j.results || []); setBusy(false); }).catch(() => {});
    }, 180);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);
  return (
    <div>
      <form action="/search" role="search" className="my-6 flex max-w-xl gap-3">
        <input name="q" value={q} onChange={e => setQ(e.target.value)} autoFocus aria-label="Search" placeholder="Try protein, vegetarian or workout" className="min-w-0 flex-1 rounded-full border-2 border-mist bg-white px-5 py-3 text-lg" />
        <button className="rounded-full bg-tang px-6 py-3 font-extrabold text-ink">Search</button>
      </form>
      <p className="mb-6 min-h-6 text-ink/70" role="status" aria-live="polite">{q.trim().length >= 2 ? (busy ? 'Searching…' : `${res.length} result${res.length === 1 ? '' : 's'} for “${q.trim()}”`) : ''}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {res.map(r => <li key={r.slug}><Link href={`/blog/${r.slug}`} className="card card-hover block h-full rounded-2xl border border-ink/5 bg-white p-5 shadow-card"><span className="text-xs font-extrabold uppercase tracking-wide text-teal">{r.category}</span><span className="mt-1 block text-lg font-bold leading-snug">{r.title}</span><span className="mt-1 line-clamp-2 block text-sm text-ink/70">{r.excerpt}</span></Link></li>)}
      </ul>
    </div>
  );
}
