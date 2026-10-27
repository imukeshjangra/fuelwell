import Link from 'next/link';
import { menuCategories } from '@/lib/categories';
import Newsletter from '@/components/ui/Newsletter';
import CookieSettings from '@/components/layout/CookieSettings';
export default function SiteFooter() {
  return (
    <footer className="no-print relative mt-24 bg-ink text-sm text-white/70">
      <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 -top-[59px] h-[60px] w-full fill-ink"><path d="M0 60V28C180 0 360 0 540 20s360 34 540 12 270-30 360-18v46z" /></svg>
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-tang via-coral via-violet to-aqua bg-[length:200%_100%] animate-gradient-x" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 text-2xl font-extrabold text-white"><span className="grid h-9 w-9 place-items-center rounded-xl bg-grad-sunrise text-xl text-ink shadow-glow">F</span>Fuelwell</p>
          <p className="mt-3 max-w-sm">Plain-language guides on losing weight, gaining weight and eating enough protein. Built for real routines, real budgets and real kitchens.</p>
          <div className="mt-5 max-w-sm"><Newsletter compact /></div>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">Topics</p>
          <ul className="space-y-2">{menuCategories().map(c => <li key={c.slug}><Link href={`/category/${c.slug}`} className="hover:text-tang">{c.name}</Link></li>)}<li><Link href="/protein-calculator" className="hover:text-tang">Protein calculator</Link></li><li><Link href="/foods" className="hover:text-tang">Food database</Link></li><li><Link href="/protein-per-rupee" className="hover:text-tang">Protein per ₹</Link></li><li><Link href="/meal-plan" className="hover:text-tang">Meal plan</Link></li><li><Link href="/tools" className="hover:text-tang">All tools</Link></li><li><Link href="/hi" className="hover:text-tang">हिन्दी</Link></li></ul>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">Site</p>
          <ul className="space-y-2">{[['/blog', 'All articles'], ['/diet-plan', 'Diet plan'], ['/challenges', 'Fitness challenges'], ['/register', 'Join free'], ['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/disclaimer', 'Medical disclaimer'], ['/feed.xml', 'RSS feed']].map(([h, t]) => <li key={h}><Link href={h} className="hover:text-tang">{t}</Link></li>)}<li><CookieSettings /></li></ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} Fuelwelllll. Information only, not medical advice.</div>
    </footer>
  );
}
