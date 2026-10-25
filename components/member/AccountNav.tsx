'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
const tabs = [{ href: '/account', t: '📊 My health' }, { href: '/account/challenges', t: '🏆 Challenges' }, { href: '/account/posts', t: '✍️ My articles' }];
export default function AccountNav() {
  const p = usePathname();
  const on = (h: string) => (h === '/account' ? p === h : p.startsWith(h));
  return (
    <nav aria-label="Account" className="flex flex-wrap items-center gap-2">
      {tabs.map(t => <Link key={t.href} href={t.href} aria-current={on(t.href) ? 'page' : undefined} className={`chip ${on(t.href) ? 'bg-ink text-white' : 'bg-white text-ink shadow-card'}`}>{t.t}</Link>)}
      <LogoutButton className="chip ml-auto bg-white text-ink/70 shadow-card" />
    </nav>
  );
}
