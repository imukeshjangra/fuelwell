'use client';
import { useRef, type ReactNode } from 'react';

/** Gentle 3D tilt that follows the pointer, with a soft light glare. Mouse and pen only; off for touch and reduced motion. */
export default function Tilt({ children, max = 6, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;
  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current; if (!el || e.pointerType === 'touch' || !ok()) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    el.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-(y - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    el.classList.add('is-active');
  }
  function leave() {
    const el = ref.current; if (!el) return;
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.classList.remove('is-active');
  }
  return <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt relative ${className}`}>{children}<span aria-hidden className="tilt-glare" /></div>;
}
