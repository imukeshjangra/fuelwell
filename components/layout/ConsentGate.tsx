'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
export default function ConsentGate({ adId }: { adId?: string }) {
  const [c, setC] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setC(localStorage.getItem('fw_consent'));
    const reset = () => setC(null);
    window.addEventListener('fw-consent-reset', reset);
    return () => window.removeEventListener('fw-consent-reset', reset);
  }, []);
  const set = (v: string) => { localStorage.setItem('fw_consent', v); setC(v); };
  return (
    <>
      {adId && c === 'yes' && <Script async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adId}`} />}
      {c === null && (
        <div role="dialog" aria-label="Cookie consent" className="no-print fixed inset-x-0 bottom-0 z-30 bg-ink p-4 text-white shadow-2xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <p className="max-w-3xl text-sm">We use cookies to show ads and understand how the site is used. You can accept or decline. Read our <a href="/privacy" className="underline">privacy policy</a>.</p>
            <div className="flex gap-3"><button onClick={() => set('no')} className="border-2 border-white px-4 py-2 font-bold">Decline</button><button onClick={() => set('yes')} className="bg-tang px-4 py-2 font-extrabold text-ink">Accept</button></div>
          </div>
        </div>
      )}
    </>
  );
}
