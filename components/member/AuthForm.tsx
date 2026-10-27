'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const input = 'w-full rounded-xl border-2 border-mist bg-white px-4 py-3 text-lg transition focus:border-aqua';
export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '', website: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const reg = mode === 'register';
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const res = await fetch('/api/members/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: mode, ...f }) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(j.error || 'Something went wrong');
    router.push('/account'); router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mx-auto w-full max-w-md space-y-4 p-7 sm:p-9">
      <h1 className="text-3xl font-extrabold">{reg ? 'Create your free account' : 'Welcome back'}</h1>
      <p className="text-ink/70">{reg ? 'Track your health, join fitness challenges and share your own articles.' : 'Sign in to see your health chart and challenges.'}</p>
      {reg && <label className="block"><span className="mb-1 block text-sm font-bold">Your name</span><input className={input} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} autoComplete="name" required maxLength={60} /></label>}
      <label className="block"><span className="mb-1 block text-sm font-bold">Email</span><input type="email" className={input} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} autoComplete="email" required /></label>
      <label className="block"><span className="mb-1 flex justify-between text-sm font-bold"><span>Password{reg && ' (8+ characters)'}</span>{!reg && <Link href="/forgot-password" className="font-bold text-teal underline">Forgot password?</Link>}</span><input type="password" className={input} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} autoComplete={reg ? 'new-password' : 'current-password'} required minLength={reg ? 8 : 1} /></label>
      <input aria-hidden tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={e => setF({ ...f, website: e.target.value })} />
      {err && <p role="alert" className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{err}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
      <p className="text-center text-sm text-ink/70">{reg ? <>Already a member? <Link href="/login" className="font-bold text-teal underline">Sign in</Link></> : <>New here? <Link href="/register" className="font-bold text-teal underline">Create a free account</Link></>}</p>
    </form>
  );
}
