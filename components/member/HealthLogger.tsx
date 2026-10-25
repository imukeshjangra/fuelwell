'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Log } from '@/lib/members';

const input = 'w-full rounded-xl border-2 border-mist bg-white px-3 py-2 text-lg transition focus:border-aqua';
const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export default function HealthLogger({ today }: { today?: Log }) {
  const router = useRouter();
  const s = (v: number | null | undefined) => (v == null ? '' : String(v));
  const [f, setF] = useState({ weight: s(today?.weight), water: s(today?.water), steps: s(today?.steps), workout: s(today?.workout), sleep: s(today?.sleep) });
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function save(next = f) {
    setBusy(true); setMsg('');
    const res = await fetch('/api/members/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day: localDay(), ...next }) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setMsg(j.error || 'Could not save');
    setMsg('Saved ✓'); router.refresh(); setTimeout(() => setMsg(''), 2500);
  }
  const field = (k: keyof typeof f, label: string, hint: string, step = '1') => (
    <label className="block"><span className="mb-1 block text-sm font-bold">{label}</span>
      <input inputMode="decimal" type="number" step={step} min="0" className={input} value={f[k]} placeholder={hint} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>
  );
  return (
    <form onSubmit={e => { e.preventDefault(); save(); }} className="card space-y-4 p-6">
      <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Today&apos;s log</h2><span className="text-sm font-bold text-teal" aria-live="polite">{msg}</span></div>
      <div className="grid grid-cols-2 gap-3">
        {field('weight', 'Weight (kg)', 'e.g. 70.5', '0.1')}
        {field('water', 'Water (glasses)', 'e.g. 8')}
        {field('steps', 'Steps', 'e.g. 8000')}
        {field('workout', 'Exercise (minutes)', 'e.g. 30')}
        {field('sleep', 'Sleep (hours)', 'e.g. 7.5', '0.5')}
        <div className="flex items-end"><button type="button" className="btn btn-ghost w-full" onClick={() => { const n = { ...f, water: String((Number(f.water) || 0) + 1) }; setF(n); save(n); }}>+1 glass 💧</button></div>
      </div>
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Saving…' : 'Save today'}</button>
    </form>
  );
}
