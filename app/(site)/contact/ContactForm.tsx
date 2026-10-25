'use client';
import { useState } from 'react';
const box = 'w-full border-2 border-mist bg-white px-3 py-2 text-lg';
export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', message: '', website: '' });
  const [state, setState] = useState<string>('idle');
  async function send() {
    setState('sending');
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const j = await r.json();
    if (r.ok) { setState('done'); setF({ name: '', email: '', message: '', website: '' }); } else setState(j.error);
  }
  if (state === 'done') return <p role="status" className="bg-white p-6 text-xl font-bold">Thanks, your message has been sent. We will reply by email.</p>;
  return (
    <div className="space-y-4">
      <label className="block"><span className="mb-1 block text-sm font-bold">Name</span><input className={box} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Email</span><input type="email" className={box} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Message</span><textarea rows={6} className={box} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></label>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={e => setF({ ...f, website: e.target.value })} />
      <button onClick={send} disabled={state === 'sending'} className="bg-tang px-6 py-3 text-lg font-extrabold text-ink disabled:opacity-60">{state === 'sending' ? 'Sending' : 'Send message'}</button>
      {state !== 'idle' && state !== 'sending' && <p role="alert" className="text-red-700">{state}</p>}
    </div>
  );
}
