import { notFound } from 'next/navigation';
import PostEditor from '@/components/member/PostEditor';
import { getCategories } from '@/lib/categories';
import { requireMember, getSubmission } from '@/lib/members';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit article', robots: { index: false, follow: false } };
export default function Page({ params }: { params: { id: string } }) {
  const s = getSubmission(Number(params.id));
  if (!s || s.user_id !== requireMember().id || s.status === 'approved') notFound();
  return <div><h1 className="mb-6 text-3xl font-extrabold">Edit article</h1><PostEditor init={{ id: s.id, title: s.title, excerpt: s.excerpt, category: s.category, cover: s.cover, tags: s.tags, body: s.body.replace(/&lt;/g, '<') }} categories={getCategories()} /></div>;
}
