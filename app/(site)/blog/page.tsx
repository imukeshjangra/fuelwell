import { livePosts } from '@/lib/db';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/ui/Pagination';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'All articles', description: 'Every Fuelwell guide on weight loss, weight gain, nutrition and workouts.', alternates: { canonical: '/blog' } };
const PER = 9;
export default function Blog({ searchParams }: { searchParams: { page?: string } }) {
  const all = livePosts();
  const pages = Math.max(1, Math.ceil(all.length / PER));
  const page = Math.min(pages, Math.max(1, Number(searchParams.page) || 1));
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">All articles</h1>
      <p className="mb-8 mt-3 text-lg text-ink/70">{all.length} guides on weight loss, weight gain, nutrition and workouts.</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{all.slice((page - 1) * PER, page * PER).map(p => <PostCard key={p.id} p={p} />)}</div>
      <Pagination page={page} pages={pages} base="/blog" />
    </div>
  );
}
