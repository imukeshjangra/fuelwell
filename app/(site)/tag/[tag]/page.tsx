import { notFound } from 'next/navigation';
import { postsByTag, allTags } from '@/lib/db';
import PostCard from '@/components/blog/PostCard';
export const dynamic = 'force-dynamic';
export function generateMetadata({ params }: { params: { tag: string } }) {
  const t = allTags().find(x => x.slug === params.tag);
  return t ? { title: `${t.name} articles`, description: `Fuelwell guides tagged ${t.name}.`, alternates: { canonical: `/tag/${t.slug}` } } : { robots: { index: false } };
}
export default function Tag({ params }: { params: { tag: string } }) {
  const t = allTags().find(x => x.slug === params.tag);
  if (!t) notFound();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-bold text-teal">Tag</p>
      <h1 className="text-4xl font-extrabold sm:text-5xl">#{t.name}</h1>
      <p className="mb-8 mt-3 text-lg text-ink/70">{t.n} article{t.n === 1 ? '' : 's'}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{postsByTag(t.slug).map(p => <PostCard key={p.id} p={p} />)}</div>
    </div>
  );
}
