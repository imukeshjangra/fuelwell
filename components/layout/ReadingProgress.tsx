'use client';
import { useEffect, useState } from 'react';
export default function ReadingProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const f = () => { const h = document.documentElement; setW(Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100)); };
    window.addEventListener('scroll', f, { passive: true }); f();
    return () => window.removeEventListener('scroll', f);
  }, []);
  return <div aria-hidden className="fixed left-0 top-0 z-40 h-1 rounded-r-full bg-gradient-to-r from-tang via-coral to-violet shadow-glow" style={{ width: `${w}%` }} />;
}
