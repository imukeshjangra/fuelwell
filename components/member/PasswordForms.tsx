'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const input = 'w-full rounded-xl border-2 border-mist bg-white px-4 py-3 text-lg transition focus:border-aqua';
async function post(body: object) {
  const res = await fetch('/api/members/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: res.ok, j: await res.json().catch(() => ({})) as { error?: string } };
}

export function ForgotForm() {
  const [email, setEmail] = useState(''); const [website, setWebsite] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { ok, j } = await post({ action: 'forgot', email, website }); setBusy(false);
    if (!ok) return setErr(j.error || 'Something went wrong'); setSent(true);
  }
  if (sent) return (
    <div className="card mx-auto w-full max-w-md space-y-3 p-7 text-center sm:p-9">
      <div className="text-5xl" aria-hidden>📧</div>
      <h1 className="text-2xl font-extrabold">Check your email</h1>
      <p className="text-ink/75">If an account exists for <b>{email}</b>, we have sent a link to reset your password. It expires in 1 hour. Check your spam folder too.</p>
      <Link href="/login" className="btn btn-ghost">Back to sign in</Link>
    </div>
  );
  return (
    <form onSubmit={submit} className="card mx-auto w-full max-w-md space-y-4 p-7 sm:p-9">
      <h1 className="text-3xl font-extrabold">Forgot your password?</h1>
      <p className="text-ink/70">Enter the email you signed up with and we will send you a link to choose a new password.</p>
      <label className="block"><span className="mb-1 block text-sm font-bold">Email</span><input type="email" required autoComplete="email" className={input} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <input aria-hidden tabIndex={-1} autoComplete="off" className="hidden" value={website} onChange={e => setWebsite(e.target.value)} />
      {err && <p role="alert" className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{err}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
      <p className="text-center text-sm"><Link href="/login" className="font-bold text-teal underline">Back to sign in</Link></p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (pw !== pw2) return setErr('The two passwords do not match');
    setBusy(true); const { ok, j } = await post({ action: 'reset', token, password: pw }); setBusy(false);
    if (!ok) return setErr(j.error || 'Something went wrong');
    router.push('/account'); router.refresh();
  }
  return (
    <form onSubmit={submit} className="card mx-auto w-full max-w-md space-y-4 p-7 sm:p-9">
      <h1 className="text-3xl font-extrabold">Choose a new password</h1>
      <label className="block"><span className="mb-1 block text-sm font-bold">New password (8+ characters)</span><input type="password" required minLength={8} autoComplete="new-password" className={input} value={pw} onChange={e => setPw(e.target.value)} /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Repeat new password</span><input type="password" required minLength={8} autoComplete="new-password" className={input} value={pw2} onChange={e => setPw2(e.target.value)} /></label>
      {err && <p role="alert" className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{err}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Saving…' : 'Save new password'}</button>
    </form>
  );
}
