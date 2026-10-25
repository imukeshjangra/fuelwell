import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FOODS, CATS, getFood, perServing, costOf, proteinPer10, rupees } from '@/lib/foods';
import { T, base, type Lang } from '@/lib/i18n';
import AdSlot from '@/components/ui/AdSlot';
export default function FoodDetail({ slug, lang = 'en' }: { slug: string; lang?: Lang }) {
  const f = getFood(slug); if (!f) notFound();
  const t = T[lang], b = base(lang), s = perServing(f);
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const related = FOODS.filter(x => x.cat === f.cat && x.slug !== f.slug).concat(FOODS.filter(x => x.cat !== f.cat && x.slug !== f.slug && Math.abs(x.p - f.p) < 6)).slice(0, 4);
  const pct = Math.round((s.p / 80) * 100);
  const name = lang === 'hi' ? f.hi : f.name, serving = lang === 'hi' ? f.hiServing : f.serving;
  const intro = lang === 'hi'
    ? `${name} की ${serving} में लगभग ${s.p} ग्राम प्रोटीन और ${s.k} कैलोरी होती है। 80 ग्राम के रोज़ के लक्ष्य में यह लगभग ${pct}% है (आपका लक्ष्य वज़न के हिसाब से अलग होगा)। अनुमानित लागत ${rupees(costOf(f))} प्रति सर्विंग, यानी ₹10 में लगभग ${proteinPer10(f)} ग्राम प्रोटीन।`
    : `${name} gives about ${s.p} g of protein and ${s.k} kcal in ${serving}. Against a common 80 g daily protein target that is roughly ${pct}% (your own target depends on your weight). At an indicative ${rupees(costOf(f))} per serving, you get about ${proteinPer10(f)} g of protein for every ₹10.`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: t.home, item: site + (b || '/') }, { '@type': 'ListItem', position: 2, name: t.foods, item: `${site}${b}/foods` }, { '@type': 'ListItem', position: 3, name, item: `${site}${b}/foods/${f.slug}` }] }];
  const row = (label: string, v: string) => <tr className="border-t border-mist"><th className="px-4 py-3 text-left font-semibold">{label}</th><td className="px-4 py-3 font-bold">{v}</td></tr>;
  return (
    <div lang={lang} className="mx-auto max-w-3xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink/70"><Link href={b || '/'} className="hover:text-teal">{t.home}</Link> / <Link href={`${b}/foods`} className="hover:text-teal">{t.foods}</Link> / {name}</nav>
      <p className="mt-5 text-sm font-extrabold uppercase tracking-wide text-teal">{CATS[f.cat].icon} {CATS[f.cat][lang]}</p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">{lang === 'hi' ? `${name}: प्रोटीन और कैलोरी` : `${name}: protein and calories`}</h1>
      <p className="mt-4 font-body text-xl text-ink/75">{intro}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[`${s.p} ${t.g}`, t.protein], [`${s.k}`, t.kcal], [rupees(costOf(f)), t.cost], [`${proteinPer10(f)} ${t.g}`, t.ppr]].map(([v, l]) => <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-card"><p className="text-2xl font-extrabold text-teal">{v}</p><p className="text-xs font-semibold text-ink/60">{l}</p></div>)}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section><h2 className="mb-2 text-lg font-extrabold">{t.perServing} ({serving})</h2><table className="w-full overflow-hidden rounded-2xl bg-white text-sm shadow-card"><tbody>{row(t.protein, `${s.p} ${t.g}`)}{row(t.kcal, `${s.k}`)}{row(t.carbs, `${s.c} ${t.g}`)}{row(t.fat, `${s.f} ${t.g}`)}</tbody></table></section>
        <section><h2 className="mb-2 text-lg font-extrabold">{t.per100}</h2><table className="w-full overflow-hidden rounded-2xl bg-white text-sm shadow-card"><tbody>{row(t.protein, `${f.p} ${t.g}`)}{row(t.kcal, `${f.k}`)}{row(t.carbs, `${f.c} ${t.g}`)}{row(t.fat, `${f.f} ${t.g}`)}</tbody></table></section>
      </div>
      <p className="mt-3 text-xs text-ink/55">{t.priceNote} · {t.disclaimer}</p>
      <AdSlot />
      <Link href="/protein-calculator" className="block rounded-2xl bg-gradient-to-r from-tang to-[#ffb347] p-5 text-lg font-extrabold text-ink shadow-card hover:brightness-95">{t.calcLink} →</Link>
      <section className="mt-10"><h2 className="mb-4 text-2xl font-extrabold">{t.related}</h2>
        <div className="grid gap-3 sm:grid-cols-2">{related.map(r => <Link key={r.slug} href={`${b}/foods/${r.slug}`} className="card card-hover rounded-2xl bg-white p-4 shadow-card"><span className="block font-bold">{lang === 'hi' ? r.hi : r.name}</span><span className="text-sm text-ink/60">{perServing(r).p} {t.g} {t.protein.toLowerCase()} · {perServing(r).k} {t.kcal.toLowerCase()}</span></Link>)}</div>
      </section>
      <p className="mt-8"><Link href={`${b}/foods`} className="font-bold text-teal hover:underline">{t.backAll}</Link> · <Link href={`${b}/protein-per-rupee`} className="font-bold text-teal hover:underline">{t.ppr}</Link></p>
    </div>
  );
}
