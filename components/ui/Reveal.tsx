'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Fades and lifts its children into view as they scroll on screen. Visible by default for no-JS and crawlers. */
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'ssr' | 'hidden' | 'shown'>('ssr');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { setState('shown'); return; }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) { setState('shown'); return; } // already on screen: no flash
    setState('hidden');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState('shown'); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  const P = Tag as 'div';
  return <P ref={ref as React.RefObject<HTMLDivElement>} data-reveal={state === 'ssr' ? undefined : state} style={style} className={className}>{children}</P>;
}
