'use client';
import Link from 'next/link';
import { useState } from 'react';

const input = 'w-full rounded-xl border-2 border-mist bg-white px-4 py-3 text-lg transition focus:border-aqua';

export default function PasswordResetForm({ token }: { token?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (token && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/members/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { action: 'reset', token, password } : { action: 'request', email }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      if (token) {
        window.location.assign('/login?passwordReset=1');
      } else {
        setMessage('If an account uses that email address, a password reset link will be sent. Please check your inbox and spam folder.');
        setEmail('');
      }
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto w-full max-w-md space-y-4 p-7 sm:p-9">
      <h1 className="text-3xl font-extrabold">{token ? 'Choose a new password' : 'Reset your password'}</h1>
      <p className="text-ink/70">{token ? 'Enter a new password for your Fuelwell account.' : 'Enter your account email and we will send you a password reset link.'}</p>
      {token ? (
        <>
          <label className="block"><span className="mb-1 block text-sm font-bold">New password (8+ characters)</span><input type="password" className={input} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={100} /></label>
          <label className="block"><span className="mb-1 block text-sm font-bold">Confirm new password</span><input type="password" className={input} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={100} /></label>
        </>
      ) : (
        <label className="block"><span className="mb-1 block text-sm font-bold">Email</span><input type="email" className={input} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={200} /></label>
      )}
      {error && <p role="alert" className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-teal/10 p-3 text-sm font-bold text-teal">{message}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Please wait…' : token ? 'Save new password' : 'Send reset link'}</button>
      <p className="text-center text-sm text-ink/70"><Link href="/login" className="font-bold text-teal underline">Back to sign in</Link></p>
    </form>
  );
}
