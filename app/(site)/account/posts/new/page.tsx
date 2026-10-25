import PostEditor from '@/components/member/PostEditor';
import { getCategories } from '@/lib/categories';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Write an article', robots: { index: false, follow: false } };
export default function Page() {
  return <div><h1 className="mb-6 text-3xl font-extrabold">Write an article</h1><PostEditor init={{ title: '', excerpt: '', category: '', cover: '', tags: '', body: '' }} categories={getCategories()} /></div>;
}
