'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Challenge } from '@/lib/challenges';
import type { MyChallenge } from '@/lib/members';

const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export default function ChallengeCard({ c, mine, signedIn }: { c: Challenge; mine?: MyChallenge; signedIn: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function act(action: 'join' | 'leave' | 'checkin') {
    if (action === 'leave' && !confirm('Leave this challenge? Your progress in it will be reset.')) return;
    setBusy(true); setErr('');
    const res = await fetch('/api/members/challenge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id: c.id, day: localDay() }) });
    const j = await res.json().catch(() => ({})); setBusy(false);
    if (!res.ok) return setErr(j.error || 'Something went wrong');
    router.refresh();
  }
  const pct = mine ? Math.min(100, Math.round((mine.count / c.days) * 100)) : 0;
  return (
    <article className="card card-hover flex flex-col overflow-hidden">
      <div className="p-5 text-white" style={{ backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
        <div className="flex items-center justify-between"><span className="text-4xl" aria-hidden>{c.icon}</span><span className="rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold">{c.level} · {c.days} days</span></div>
        <h3 className="mt-3 text-xl font-extrabold">{c.title}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-ink/75">{c.blurb}</p>
        <p className="text-sm font-bold">Daily goal: <span className="text-teal">{c.rule.label}</span></p>
        {mine && (
          <div>
            <div className="mb-1 flex justify-between text-sm font-bold"><span>{mine.done ? '🏆 Completed!' : `Day ${Math.min(c.days, mine.count + 1)} of ${c.days}`}</span><span>{mine.count}/{c.days} · 🔥 {mine.streak} streak</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-grad-sunrise transition-all duration-700" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        {!mine && <ul className="list-disc space-y-1 pl-5 text-sm text-ink/70">{c.tips.map(t => <li key={t}>{t}</li>)}</ul>}
        {err && <p role="alert" className="text-sm font-bold text-coral">{err}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {!signedIn && <Link href="/register" className="btn btn-primary">Join free</Link>}
          {signedIn && !mine && <button disabled={busy} onClick={() => act('join')} className="btn btn-primary disabled:opacity-60">Start challenge</button>}
          {signedIn && mine && !mine.done && c.rule.kind === 'manual' && <button disabled={busy} onClick={() => act('checkin')} className={`btn ${mine.today ? 'btn-dark' : 'btn-primary'} disabled:opacity-60`}>{mine.today ? '✓ Done today (undo)' : 'Mark today done'}</button>}
          {signedIn && mine && !mine.done && c.rule.kind !== 'manual' && <Link href="/account" className="btn btn-ghost">{mine.today ? '✓ Done today' : 'Log today →'}</Link>}
          {signedIn && mine && <button disabled={busy} onClick={() => act('leave')} className="btn btn-ghost text-sm">Leave</button>}
        </div>
      </div>
    </article>
  );
}
