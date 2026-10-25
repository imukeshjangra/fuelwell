'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type L = { href: string; t: string };

// Mobile menu that closes after a link tap, an outside tap, or Escape.
export default function MobileMenu({ links }: { links: L[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const close = () => ref.current?.removeAttribute('open');

  useEffect(close, [pathname]);

  useEffect(() => {
    const onDown = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  const item = 'block rounded-lg px-3 py-2 font-semibold transition hover:translate-x-1 hover:bg-ground hover:text-teal';
  return (
    <details ref={ref} className="group relative ml-auto md:ml-0 xl:hidden">
      <summary aria-label="Menu" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white text-xl shadow-card transition active:scale-90">☰</summary>
      <div className="absolute right-0 mt-2 w-64 origin-top-right animate-scale-in rounded-2xl bg-white p-3 shadow-lift">
        <form action="/search" role="search" onSubmit={close} className="mb-2">
          <input name="q" aria-label="Search articles" placeholder="Search articles…" className="w-full rounded-full border border-mist bg-ground px-4 py-2 text-sm" />
        </form>
        {links.map(l => <Link key={l.href} href={l.href} onClick={close} className={item}>{l.t}</Link>)}
        <Link href="/contact" onClick={close} className={item}>Contact</Link>
      </div>
    </details>
  );
}
