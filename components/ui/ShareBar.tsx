'use client';
import { useState } from 'react';
export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const btn = 'rounded-full bg-ink px-4 py-2 text-white hover:bg-teal';
  async function copy() {
    try { if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { await navigator.share({ title, url }); return; } await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <div className="my-8 flex flex-wrap items-center gap-2 text-sm font-bold">
      <span className="mr-1">Share:</span>
      <a className={btn} href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className={btn} href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">X</a>
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">Facebook</a>
      <a className={btn} href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">Telegram</a>
      <button onClick={copy} className="rounded-full border-2 border-ink px-4 py-2 hover:bg-ink hover:text-white">{copied ? 'Link copied ✓' : 'Copy link'}</button>
    </div>
  );
}
