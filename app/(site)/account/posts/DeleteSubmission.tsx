'use client';
import { useRouter } from 'next/navigation';
export default function DeleteSubmission({ id }: { id: number }) {
  const router = useRouter();
  return <button className="btn btn-ghost !py-2 text-coral" onClick={async () => { if (!confirm('Delete this article?')) return; await fetch('/api/members/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) }); router.refresh(); }}>Delete</button>;
}
