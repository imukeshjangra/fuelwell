'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission } from '@/lib/members';

export default function SubmissionsClient({ items }: { items: Submission[] }) {
  const router = useRouter(); const [open, setOpen] = useState(0); const [busy, setBusy] = useState(0); const [err, setErr] = useState('');
  async function act(id: number, action: 'approve' | 'reject' | 'delete') {
    let note = ''; if (action === 'reject') { note = prompt('Short note for the author (what to improve):') ?? ''; if (!note) return; }
    if (action === 'delete' && !confirm('Delete permanently?')) return;
    setBusy(id); setErr('');
    const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id, note }) });
    const j = await res.json().catch(() => ({})); setBusy(0);
    if (!res.ok) return setErr(j.error || 'Failed'); router.refresh();
  }
  if (!items.length) return <p style={{ padding: 24, background: '#F5F8FF', borderRadius: 16 }}>No member articles yet.</p>;
  const col = { pending: '#FFC53D', approved: '#7ED957', rejected: '#FF5A7A' } as const;
  const btn = (bg: string, color = '#fff') => ({ background: bg, color, border: 0, borderRadius: 999, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' } as const);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {err && <p role="alert" style={{ color: '#FF5A7A', fontWeight: 700 }}>{err}</p>}
      {items.map(s => (
        <article key={s.id} style={{ border: '1px solid #DDE5EE', borderRadius: 16, padding: 16, background: '#fff' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: col[s.status], borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{s.status}</span>
            <strong style={{ flex: 1, minWidth: 200 }}>{s.title}</strong>
            <span style={{ color: '#64748B', fontSize: 13 }}>by {s.author || 'unknown'} · {s.created.slice(0, 10)}</span>
          </div>
          <p style={{ color: '#475569', margin: '8px 0' }}>{s.excerpt}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btn('#E2E8F0', '#0F1B2D')} onClick={() => setOpen(open === s.id ? 0 : s.id)}>{open === s.id ? 'Hide' : 'Read article'}</button>
            {s.status !== 'approved' && <button disabled={busy === s.id} style={btn('#0B6E70')} onClick={() => act(s.id, 'approve')}>Approve & publish</button>}
            {s.status === 'pending' && <button disabled={busy === s.id} style={btn('#FF7A1A')} onClick={() => act(s.id, 'reject')}>Reject</button>}
            {s.status === 'approved' && <a href={`/blog/${s.slug}`} target="_blank" rel="noreferrer" style={{ ...btn('#E2E8F0', '#0F1B2D'), textDecoration: 'none' }}>View live</a>}
            <button disabled={busy === s.id} style={btn('#fff', '#FF5A7A')} onClick={() => act(s.id, 'delete')}>Delete</button>
          </div>
          {open === s.id && <pre style={{ whiteSpace: 'pre-wrap', background: '#F5F8FF', borderRadius: 12, padding: 14, marginTop: 12, fontFamily: 'inherit', maxHeight: 420, overflow: 'auto' }}>{s.body}</pre>}
        </article>
      ))}
    </div>
  );
}
