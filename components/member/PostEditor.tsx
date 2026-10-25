'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/db';

const input = 'w-full rounded-xl border-2 border-mist bg-white px-4 py-3 text-lg transition focus:border-aqua';
type Init = { id?: number; title: string; excerpt: string; category: string; cover: string; tags: string; body: string };
export default function PostEditor({ init, categories }: { init: Init; categories: Category[] }) {
  const router = useRouter();
  const [f, setF] = useState(init);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [up, setUp] = useState(false);
  async function upload(file?: File) {
    if (!file) return; setUp(true); setErr('');
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd }); const j = await res.json().catch(() => ({}));
    setUp(false); if (!res.ok) return setErr(j.error || 'Upload failed'); setF(v => ({ ...v, cover: j.url }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/members/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setErr(j.error || 'Could not submit');
    router.push('/account/posts'); router.refresh();
  }
  const label = (t: string, hint: string, el: React.ReactNode) => <label className="block"><span className="mb-1 block font-bold">{t} <span className="text-sm font-normal text-ink/55">{hint}</span></span>{el}</label>;
  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      {label('Title', '(8 to 120 characters)', <input className={input} value={f.title} maxLength={120} required onChange={e => setF({ ...f, title: e.target.value })} />)}
      {label('Short summary', '(40 to 200 characters, shown on Google)', <textarea className={input} rows={2} maxLength={200} required value={f.excerpt} onChange={e => setF({ ...f, excerpt: e.target.value })} />)}
      <div className="grid gap-5 sm:grid-cols-2">
        {label('Category', '', <select className={input} required value={f.category} onChange={e => setF({ ...f, category: e.target.value })}><option value="">Choose…</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>)}
        {label('Tags', '(comma separated, up to 6)', <input className={input} value={f.tags} onChange={e => setF({ ...f, tags: e.target.value })} placeholder="fat loss, beginners" />)}
      </div>
      <div>
        <span className="mb-1 block font-bold">Cover image <span className="text-sm font-normal text-ink/55">(JPG, PNG or WebP, up to 10 MB)</span></span>
        {f.cover && <img src={f.cover} alt="Cover preview" className="mb-3 aspect-[16/9] w-full max-w-md rounded-2xl object-cover" />}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => upload(e.target.files?.[0])} />
        {up && <span className="ml-3 text-sm font-bold text-teal">Uploading…</span>}
      </div>
      {label('Article', '(Markdown works: ## Heading, **bold**, - list. At least 400 characters)', <textarea className={`${input} font-mono text-base`} rows={16} required value={f.body} onChange={e => setF({ ...f, body: e.target.value })} />)}
      <p className="rounded-xl bg-sun/20 p-3 text-sm">Your article is reviewed before it goes live. Write original, helpful content. Do not copy from other sites or give medical advice you are not qualified to give.</p>
      {err && <p role="alert" className="rounded-xl bg-coral/10 p-3 font-bold text-coral">{err}</p>}
      <button disabled={busy || up} className="btn btn-primary disabled:opacity-60">{busy ? 'Submitting…' : init.id ? 'Resubmit for review' : 'Submit for review'}</button>
    </form>
  );
}
