'use client';
import { useEffect, useState } from 'react';

/** Floating button with a progress ring that fills as you scroll. */
export default function BackToTop() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const h = document.documentElement.scrollHeight - window.innerHeight; setP(h > 0 ? Math.min(1, window.scrollY / h) : 0); }); };
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  const show = p > 0.06;
  const C = 2 * Math.PI * 20;
  return (
    <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} tabIndex={show ? 0 : -1}
      className={`no-print fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-lift transition duration-300 ease-spring hover:-translate-y-1 hover:bg-ink hover:text-white ${show ? 'scale-100 opacity-100' : 'pointer-events-none scale-50 opacity-0'}`}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r="20" fill="none" stroke="#DDE5EE" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#FF7A1A" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
      </svg>
      <span className="relative text-lg font-extrabold" aria-hidden>↑</span>
    </button>
  );
}
