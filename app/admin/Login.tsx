'use client';
import { useEffect, useRef, useState } from 'react';
import { Ic } from './ui';

export default function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => { box.current?.focus(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { onDone(); return; }
      setErr(j.error || 'Sign in failed'); setShake(s => s + 1); box.current?.select();
    } catch { setErr('Cannot reach the server. Check your connection and try again.'); }
    setBusy(false);
  }

  return (
    <div className="aw aw-login" data-theme="light">
      <i className="aw-orb a" /><i className="aw-orb b" /><i className="aw-orb c" />
      <form key={shake} onSubmit={submit} className={`aw-lcard ${shake ? 'shake' : ''}`}>
        <span className="aw-logo">F</span>
        <h1>Fuelwell Admin</h1>
        <p>Sign in to write articles, read messages and check your traffic.</p>
        <label className="aw-label" htmlFor="pw">Password</label>
        <div style={{ position: 'relative' }}>
          <input id="pw" ref={box} className="aw-input" type={show ? 'text' : 'password'} value={pw} autoComplete="current-password" placeholder="Enter your admin password"
            onChange={e => setPw(e.target.value)} onKeyUp={e => setCaps(e.getModifierState?.('CapsLock') ?? false)} aria-invalid={!!err} />
          <button type="button" className="aw-icon-btn aw-eye" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Ic n={show ? 'x' : 'eye'} /></button>
        </div>
        {caps && <p style={{ margin: '8px 0 0', fontSize: '.8rem', color: '#B26A00', fontWeight: 700 }}>Caps Lock is on</p>}
        {err && <div className="aw-err" role="alert"><Ic n="alert" />{err}</div>}
        <button type="submit" className="aw-btn primary" disabled={busy || !pw} style={{ width: '100%', marginTop: 18, padding: '13px 16px', fontSize: '1rem' }}>
          {busy ? <><span className="aw-spin" />Signing in…</> : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
