import Link from 'next/link';
import { allTags } from '@/lib/db';
import InstantSearch from '@/components/ui/InstantSearch';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Search articles', description: 'Search every Fuelwell guide by topic, food or goal.', robots: { index: false } };
export default function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim().slice(0, 80);
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-4xl font-extrabold">Search articles</h1>
      <InstantSearch initial={q} />
      {q.length < 2 && <div className="flex flex-wrap gap-2">{allTags().slice(0, 12).map(t => <Link key={t.slug} href={`/search?q=${encodeURIComponent(t.name)}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-card hover:bg-tang">{t.name}</Link>)}</div>}
    </div>
  );
}
