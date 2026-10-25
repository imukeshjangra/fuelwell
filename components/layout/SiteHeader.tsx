import Link from 'next/link';
import MobileMenu from '@/components/layout/MobileMenu';
import { menuCategories } from '@/lib/categories';
import { getMember } from '@/lib/members';
export default function SiteHeader() {
  const links = [...menuCategories().map(c => ({ href: `/category/${c.slug}`, t: c.name })), { href: '/foods', t: 'Food Database' }, { href: '/diet-plan', t: 'Diet Plan' }, { href: '/challenges', t: 'Challenges' }, { href: '/protein-per-rupee', t: 'Protein per ₹' }, { href: '/tools', t: 'Tools' }, { href: '/blog', t: 'All articles' }, { href: '/hi', t: 'हिन्दी' }, { href: '/about', t: 'About' }];
  const me = getMember();
  const nav = links.filter(l => !['About', 'All articles', 'Protein per ₹'].includes(l.t));
  const account = { href: me ? '/account' : '/login', t: me ? `👤 ${me.name.split(' ')[0]}` : 'Sign in' };
  return (
    <header className="no-print sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="hidden bg-gradient-to-r from-ink via-[#16345a] to-ink bg-[length:200%_100%] text-xs text-white/80 animate-gradient-x md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-1.5">
          <span>Practical guides on weight loss, weight gain and protein</span>
          <Link href="/protein-calculator" className="font-semibold text-sun transition hover:text-white">Free protein calculator →</Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 2xl:max-w-[1440px]">
        <Link href="/" className="group flex shrink-0 items-center gap-2 text-2xl font-extrabold tracking-tight">
          <img src="/fuelwell-icon.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-xl shadow-glow transition duration-500 ease-spring group-hover:rotate-[10deg] group-hover:scale-110" />
          <span>Fuel<span className="text-tang">well</span></span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 text-sm font-semibold xl:flex">
          {nav.map(l => (
            <Link key={l.href} href={l.href} className="group relative whitespace-nowrap rounded-full px-3 py-1.5 transition hover:text-teal">
              {l.t}
              <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-grad-sunrise transition duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>
        <form action="/search" role="search" className="ml-auto hidden 2xl:block">
          <input name="q" aria-label="Search articles" placeholder="Search articles…" className="w-40 rounded-full border border-mist bg-white/80 px-4 py-2 text-sm transition-all duration-300 focus:w-56" />
        </form>
        <Link href={account.href} className="btn btn-dark hidden shrink-0 whitespace-nowrap !px-4 !py-2 text-sm md:inline-flex">{account.t}</Link>
        <MobileMenu links={[...links, { href: me ? '/account' : '/register', t: me ? '👤 My account' : 'Join free' }, ...(me ? [] : [{ href: '/login', t: 'Sign in' }])]} />
      </div>
    </header>
  );
}
