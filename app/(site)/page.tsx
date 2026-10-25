import Link from 'next/link';
import { livePosts } from '@/lib/db';
import { getCategories, homeCategories } from '@/lib/categories';
import { FOODS } from '@/lib/foods';
import HeroTile from '@/components/blog/HeroTile';
import PostCard from '@/components/blog/PostCard';
import Sidebar from '@/components/layout/Sidebar';
import AdSlot from '@/components/ui/AdSlot';
import Newsletter from '@/components/ui/Newsletter';
import Reveal from '@/components/ui/Reveal';
import Tilt from '@/components/ui/Tilt';
import CountUp from '@/components/ui/CountUp';
import Marquee from '@/components/ui/Marquee';
export const dynamic = 'force-dynamic';
export const metadata = { alternates: { canonical: '/', languages: { 'en-IN': '/', 'hi-IN': '/hi' } } };

const TOOLS: [string, string, string, string, string][] = [
  ['/protein-per-rupee', '₹', 'Protein per ₹10', 'The cheapest protein foods in India', 'from-tang to-sun'],
  ['/foods', '🥗', 'Food database', 'Protein and calories in Indian foods', 'from-aqua to-lime'],
  ['/meal-plan', '🍛', '7-day meal plan', 'Built around your budget, printable', 'from-coral to-tang'],
  ['/tools', '🧮', 'More free tools', 'Calories, BMI, water, goal date, tracker', 'from-violet to-sky'],
];

export default function Home() {
  const posts = livePosts();
  const cats = getCategories();
  const hero = [...posts.filter(p => p.featured), ...posts.filter(p => !p.featured)].slice(0, 3);
  const rest = posts.filter(p => !hero.includes(p));
  const ticker = [...cats.map(c => ({ icon: c.icon, text: c.name })), { icon: '🧮', text: 'Free protein calculator' }, { icon: '🥗', text: 'Indian food database' }, { icon: '🍛', text: 'Budget meal plans' }, { icon: '📈', text: 'Progress tracker' }];
  const stats: [number, string, string][] = [[posts.length, '', 'Guides published'], [FOODS.length, '+', 'Indian foods listed'], [cats.length, '', 'Topics to explore'], [9, '', 'Free tools']];
  return (
    <>
      <section className="relative mx-auto max-w-6xl px-5 pb-2 pt-8 sm:pt-12">
        <Tilt max={2.5} className="mb-8 rounded-[2rem]">
          <div className="glass relative grid items-center gap-7 overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1.2fr_.8fr]">
            <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_70%_at_30%_30%,#000,transparent)]" />
            <div className="relative z-10 animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/15 bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-teal shadow-card">
                <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ring-pulse rounded-full bg-tang" /><span className="relative h-2.5 w-2.5 rounded-full bg-tang" /></span> Your everyday wellness guide
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">Small habits. <span className="gradient-text">Stronger you.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink/70 sm:text-lg">Practical, no-nonsense guides to nutrition, protein, weight goals and workouts, built for real life.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/blog" className="btn btn-primary">Explore the guides <span aria-hidden>→</span></Link>
                <Link href="/protein-calculator" className="btn btn-ghost">Calculate protein</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink/60"><span>✓ Simple, useful advice</span><span>✓ Everyday food ideas</span><span>✓ Beginner friendly</span></div>
            </div>
            <div className="relative hidden min-h-[290px] items-center justify-center lg:flex" aria-hidden>
              <div className="absolute h-72 w-72 animate-orbit rounded-full border border-dashed border-teal/30">
                {['🥗', '💪', '🍳', '🏃'].map((e, i) => (
                  <span key={e} className="absolute grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-lift" style={{ left: `${50 + 50 * Math.cos((i * Math.PI) / 2)}%`, top: `${50 + 50 * Math.sin((i * Math.PI) / 2)}%`, transform: 'translate(-50%,-50%)' }}>
                    <span className="block animate-orbit [animation-direction:reverse]">{e}</span>
                  </span>
                ))}
              </div>
              <div className="relative grid h-52 w-52 animate-float place-items-center rounded-[2.5rem] bg-gradient-to-br from-ink via-teal to-aqua shadow-lift">
                <div className="absolute inset-3 rounded-[2rem] border border-white/20" />
                <div className="text-center text-white"><div className="text-6xl">✳</div><p className="mt-2 text-sm font-extrabold uppercase tracking-[.22em]">Fuelwell</p><p className="mt-1 text-xs text-white/70">Feel good. Get stronger.</p></div>
              </div>
            </div>
          </div>
        </Tilt>
        {posts.length > 0 && <div className="grid gap-4 lg:grid-cols-3">{hero.map((p, i) => <Reveal key={p.id} delay={i * 110} className={i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}><HeroTile p={p} big={i === 0} /></Reveal>)}</div>}
        <Reveal delay={80}>
          <div className="mt-6 flex gap-3 overflow-x-auto p-2 pb-3" aria-label="Categories">
            {cats.map(c => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="chip shrink-0 px-5 py-2.5 text-base text-white shadow-card hover:shadow-lift" style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
                <span className="chip-ic">{c.icon}</span>{c.name}
              </Link>
            ))}
            <Link href="/protein-calculator" className="chip shrink-0 bg-ink px-5 py-2.5 text-base text-white shadow-card hover:bg-teal"><span className="chip-ic">🧮</span> Protein Calculator</Link>
          </div>
        </Reveal>
      </section>

      <div className="mt-8"><Marquee items={ticker} /></div>

      <section className="mx-auto mt-10 max-w-6xl px-5" aria-label="Site numbers">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([n, suf, label], i) => (
            <Reveal key={label} delay={i * 90}>
              <div className="card p-5 text-center">
                <p className="gradient-text text-4xl font-extrabold tracking-tight"><CountUp to={n} suffix={suf} /></p>
                <p className="mt-1 text-sm font-bold text-ink/60">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-5" aria-label="Free tools">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map(([h, i, t, d, g], idx) => (
            <Reveal key={h} delay={idx * 90}>
              <Link href={h} className="card card-hover group flex items-center gap-4 p-5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${g} text-2xl text-white shadow-card transition duration-300 ease-spring group-hover:rotate-6 group-hover:scale-110`}>{i}</span>
                <span><span className="block font-extrabold">{t}</span><span className="text-sm text-ink/65">{d}</span></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          {posts.length === 0 ? <p className="card p-8">No articles yet. Sign in at /admin to publish the first one.</p> : (
            <>
              <Reveal><div className="mb-6 flex items-end justify-between gap-3"><div><p className="eyebrow">Fresh from the blog</p><h2 className="title-line mt-1 text-3xl font-extrabold tracking-tight">Latest articles</h2></div><Link href="/blog" className="shrink-0 text-sm font-extrabold text-teal hover:underline">View all →</Link></div></Reveal>
              <div className="grid gap-6 sm:grid-cols-2">{rest.slice(0, 6).map((p, i) => <Reveal key={p.id} delay={(i % 2) * 100} className="h-full"><PostCard p={p} /></Reveal>)}</div>
              <AdSlot />
              {homeCategories().map(c => {
                const list = posts.filter(p => p.category === c.slug).slice(0, 2);
                if (!list.length) return null;
                return (
                  <section key={c.slug} className="mt-14">
                    <Reveal>
                      <div className="relative mb-5 flex items-end justify-between pb-2">
                        <h2 className="text-2xl font-extrabold"><span className="mr-1 inline-block">{c.icon}</span> {c.name}</h2>
                        <Link href={`/category/${c.slug}`} className="text-sm font-bold text-teal hover:underline">See all →</Link>
                        <span aria-hidden className="absolute bottom-0 left-0 h-1 w-full rounded-full opacity-90" style={{ background: `linear-gradient(90deg,${c.from},${c.to},transparent)` }} />
                      </div>
                    </Reveal>
                    <div className="grid gap-6 sm:grid-cols-2">{list.map((p, i) => <Reveal key={p.id} delay={i * 100} className="h-full"><PostCard p={p} /></Reveal>)}</div>
                  </section>
                );
              })}
              {rest.length > 6 && <div className="mt-12 text-center"><Link href="/blog" className="btn btn-dark px-8">Browse all articles</Link></div>}
            </>
          )}
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start"><Sidebar /></div>
      </div>
      <div className="mx-auto max-w-6xl px-5"><Reveal><Newsletter /></Reveal></div>
    </>
  );
}
