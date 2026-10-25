'use client';
import { useEffect, useState } from 'react';
type Entry = { d: string; w: number; p?: number; n?: string };
const KEY = 'fw_tracker_v1';
const today = () => new Date().toISOString().slice(0, 10);
const csvCell = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v).replace(/"/g, '""');
export default function Tracker() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ d: today(), w: '', p: '', n: '' });
  const [err, setErr] = useState('');
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(v)) setRows(v.filter(x => x && /^\d{4}-\d\d-\d\d$/.test(x.d) && Number.isFinite(x.w))); } catch {}
    setReady(true);
  }, []);
  const save = (r: Entry[]) => { const s = [...r].sort((a, b) => a.d.localeCompare(b.d)); setRows(s); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { setErr('Your browser blocked saving. Turn off private mode to keep your log.'); } };
  function add() {
    const w = Number(f.w), p = f.p === '' ? undefined : Number(f.p);
    if (!/^\d{4}-\d\d-\d\d$/.test(f.d) || f.d > today()) return setErr('Pick a valid date that is not in the future.');
    if (!Number.isFinite(w) || w < 20 || w > 300) return setErr('Enter a weight between 20 and 300 kg.');
    if (p !== undefined && (!Number.isFinite(p) || p < 0 || p > 500)) return setErr('Protein must be between 0 and 500 g.');
    setErr(''); save([...rows.filter(r => r.d !== f.d), { d: f.d, w: Math.round(w * 10) / 10, p, n: f.n.slice(0, 120) || undefined }]); setF({ ...f, w: '', p: '', n: '' });
  }
  const csv = () => {
    const body = 'date,weight_kg,protein_g,note\n' + rows.map(r => `"${r.d}","${r.w}","${r.p ?? ''}","${csvCell(r.n || '')}"`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = 'my-progress.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  const first = rows[0], last = rows[rows.length - 1], diff = first && last ? Math.round((last.w - first.w) * 10) / 10 : 0;
  const W = 640, H = 200, P = 28;
  const ws = rows.map(r => r.w), lo = Math.min(...ws) - 1, hi = Math.max(...ws) + 1;
  const pts = rows.map((r, i) => `${P + (rows.length === 1 ? (W - 2 * P) / 2 : (i / (rows.length - 1)) * (W - 2 * P))},${H - P - ((r.w - lo) / (hi - lo || 1)) * (H - 2 * P)}`);
  const box = 'w-full rounded-xl border-2 border-mist bg-white px-3 py-2 text-lg';
  return (
    <div>
      <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="block"><span className="mb-1 block text-sm font-bold">Date</span><input type="date" max={today()} className={box} value={f.d} onChange={e => setF({ ...f, d: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Weight (kg)</span><input inputMode="decimal" className={box} value={f.w} onChange={e => setF({ ...f, w: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Protein eaten (g, optional)</span><input inputMode="numeric" className={box} value={f.p} onChange={e => setF({ ...f, p: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Note (optional)</span><input maxLength={120} className={box} value={f.n} onChange={e => setF({ ...f, n: e.target.value })} /></label>
        </div>
        <button onClick={add} className="mt-5 rounded-full bg-ink px-7 py-3 font-extrabold text-white shadow-card hover:bg-teal">Save entry</button>
        {err && <p role="alert" className="mt-3 font-bold text-red-700">{err}</p>}
        <p className="mt-3 text-xs text-ink/60">Your log is saved only in this browser on this device. We never receive it. Clearing browser data deletes it, so download a copy now and then.</p>
      </div>
      {ready && rows.length > 0 && (<>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[[`${last.w} kg`, 'Latest'], [`${diff > 0 ? '+' : ''}${diff} kg`, `Since ${first.d}`], [`${rows.length}`, 'Entries']].map(([v, l]) => <div key={l} className="rounded-2xl bg-white p-4 shadow-card"><p className="text-2xl font-extrabold text-teal">{v}</p><p className="text-xs font-semibold text-ink/60">{l}</p></div>)}
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-4 shadow-card">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weight over time" className="h-auto w-full min-w-[420px]">
            <text x={4} y={P} fontSize="11" fill="#0F1B2D" opacity=".6">{hi.toFixed(0)}</text><text x={4} y={H - P} fontSize="11" fill="#0F1B2D" opacity=".6">{lo.toFixed(0)}</text>
            {rows.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke="#0B6E70" strokeWidth="3" strokeLinejoin="round" />}
            {pts.map((p, i) => <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="4" fill="#FF7A1A" />)}
          </svg>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[480px] text-left text-sm"><thead className="bg-ink text-white"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">Protein</th><th className="px-4 py-3">Note</th><th className="px-4 py-3"><span className="sr-only">Delete</span></th></tr></thead>
            <tbody>{[...rows].reverse().map(r => <tr key={r.d} className="border-t border-mist"><td className="px-4 py-2">{r.d}</td><td className="px-4 py-2 font-bold">{r.w} kg</td><td className="px-4 py-2">{r.p ?? '-'}</td><td className="px-4 py-2">{r.n || ''}</td><td className="px-4 py-2 text-right"><button aria-label={`Delete ${r.d}`} onClick={() => save(rows.filter(x => x.d !== r.d))} className="font-bold text-red-700 hover:underline">Delete</button></td></tr>)}</tbody></table>
        </div>
        <button onClick={csv} className="mt-5 rounded-full bg-tang px-6 py-2.5 font-extrabold text-ink shadow-card hover:brightness-95">Download CSV</button>
      </>)}
    </div>
  );
}
