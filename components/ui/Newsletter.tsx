'use client';
import { useState } from 'react';
export default function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [hp, setHp] = useState('');
  async function send() {
    setState('sending');
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, website: hp }) });
    const j = await r.json();
    setState(r.ok ? (j.already ? 'already' : 'done') : j.error);
  }
  const form = state === 'done' || state === 'already' ? <p role="status" className="mt-4 animate-pop text-xl font-bold text-sun">{state === 'already' ? '👍 This email is already subscribed. You are all set!' : '🎉 You are subscribed. Thank you!'}</p> : (
    <div className="mt-4 flex flex-wrap gap-3">
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={hp} onChange={e => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="email" aria-label="Email address" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="min-w-0 flex-1 rounded-full border-0 bg-white px-4 py-3 text-ink shadow-inner" />
      <button onClick={send} disabled={state === 'sending'} className="btn btn-primary disabled:opacity-60">Subscribe</button>
      {state !== 'idle' && state !== 'sending' && state !== 'done' && state !== 'already' && <p role="alert" className="w-full text-tang">{state}</p>}
    </div>
  );
  if (compact) return <section className="relative overflow-hidden rounded-2xl bg-grad-night p-6 text-white shadow-card"><div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-tang/30 blur-2xl" /><h2 className="text-lg font-extrabold">One practical guide a week</h2><p className="mt-1 text-sm text-white/75">Free tips by email. Unsubscribe any time.</p>{form}</section>;
  return (
    <section className="relative my-12 overflow-hidden rounded-3xl bg-grad-night p-8 text-white shadow-lift sm:p-10">
      <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 animate-blob rounded-full bg-tang/30 blur-3xl" /><div aria-hidden className="absolute -bottom-20 left-10 h-64 w-64 animate-blob rounded-full bg-aqua/25 blur-3xl [animation-delay:-8s]" />
      <div className="relative">
      <h2 className="text-3xl font-extrabold">Get one practical guide a week</h2>
      <p className="mt-2 max-w-xl text-white/80">Weight loss, weight gain and nutrition tips by email. No spam, unsubscribe any time.</p>
      <div className="max-w-lg">{form}</div>
      </div>
    </section>
  );
}
