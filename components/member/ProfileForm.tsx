'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Member } from '@/lib/members';
const input = 'w-full rounded-xl border-2 border-mist bg-white px-3 py-2 text-lg transition focus:border-aqua';
export default function ProfileForm({ m }: { m: Member }) {
  const router = useRouter();
  const [f, setF] = useState({ sex: m.sex || 'male', age: m.age ? String(m.age) : '', height_cm: m.height_cm ? String(m.height_cm) : '', goal: m.goal || 'lose', goal_kg: m.goal_kg ? String(m.goal_kg) : '' });
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const res = await fetch('/api/members/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setMsg(j.error || 'Could not save');
    setMsg('Saved ✓'); router.refresh();
  }
  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Your goal</h2><span className="text-sm font-bold text-teal">{msg}</span></div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1 block text-sm font-bold">Sex</span><select className={input} value={f.sex} onChange={e => setF({ ...f, sex: e.target.value })}><option value="male">Male</option><option value="female">Female</option></select></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Age</span><input type="number" min="18" max="90" required className={input} value={f.age} onChange={e => setF({ ...f, age: e.target.value })} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Height (cm)</span><input type="number" min="120" max="230" required className={input} value={f.height_cm} onChange={e => setF({ ...f, height_cm: e.target.value })} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Goal</span><select className={input} value={f.goal} onChange={e => setF({ ...f, goal: e.target.value })}><option value="lose">Lose weight</option><option value="maintain">Maintain weight</option><option value="gain">Gain weight</option></select></label>
        <label className="col-span-2 block"><span className="mb-1 block text-sm font-bold">Goal weight (kg)</span><input type="number" step="0.1" min="30" max="250" className={input} value={f.goal_kg} onChange={e => setF({ ...f, goal_kg: e.target.value })} /></label>
      </div>
      <button disabled={busy} className="btn btn-dark w-full disabled:opacity-60">{busy ? 'Saving…' : 'Save goal'}</button>
      <p className="text-xs text-ink/60">Adults 18+ only. This is general guidance, not medical advice.</p>
    </form>
  );
}
