import Link from 'next/link';
import { requireMember, mySubmissions } from '@/lib/members';
import DeleteSubmission from './DeleteSubmission';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My articles', robots: { index: false, follow: false } };
const badge = { pending: 'bg-sun/30 text-ink', approved: 'bg-lime/30 text-ink', rejected: 'bg-coral/20 text-coral' } as const;
export default function Page() {
  const list = mySubmissions(requireMember().id);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">My articles</h1><Link href="/account/posts/new" className="btn btn-primary">+ Write an article</Link></div>
      <p className="mb-6 mt-2 max-w-2xl text-ink/70">Share your story or tips with the Fuelwell community. Every article is reviewed before it is published with your name on it.</p>
      {list.length === 0 ? <p className="card p-8 text-center text-ink/70">You have not written anything yet. Your first article could help someone start their journey.</p> :
        <ul className="space-y-3">{list.map(s => (
          <li key={s.id} className="card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1"><h2 className="truncate font-extrabold">{s.title}</h2><p className="text-sm text-ink/60">{s.created.slice(0, 10)}</p>{s.status === 'rejected' && s.note && <p className="mt-1 text-sm text-coral">Reviewer note: {s.note}</p>}</div>
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${badge[s.status]}`}>{s.status === 'pending' ? 'In review' : s.status}</span>
            {s.status === 'approved' ? <Link href={`/blog/${s.slug}`} className="btn btn-ghost !py-2">View live</Link> : <><Link href={`/account/posts/${s.id}`} className="btn btn-ghost !py-2">Edit</Link><DeleteSubmission id={s.id} /></>}
          </li>))}</ul>}
    </div>
  );
}
