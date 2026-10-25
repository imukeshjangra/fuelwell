'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FOODS, perServing, costOf, proteinPer10, rupees } from '@/lib/foods';
import { T, base, type Lang } from '@/lib/i18n';
type Sort = 'ppr' | 'protein' | 'cost';
export default function PprTable({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const [staples, setStaples] = useState(false);
  const [veg, setVeg] = useState(false);
  const [sort, setSort] = useState<Sort>('ppr');
  const rows = useMemo(() => FOODS.filter(f => (staples || !f.staple) && (!veg || f.diet === 'veg')).sort((a, b) => sort === 'ppr' ? proteinPer10(b) - proteinPer10(a) : sort === 'protein' ? perServing(b).p - perServing(a).p : costOf(a) - costOf(b)), [staples, veg, sort]);
  const max = Math.max(...rows.map(proteinPer10), 1);
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const top = rows.slice(0, 5).map((f, i) => `${i + 1}. ${lang === 'hi' ? f.hi : f.name}: ${proteinPer10(f)} ${t.g}`).join('\n');
  const wa = `https://wa.me/?text=${encodeURIComponent(`${t.pprH1}\n${top}\n${site}${base(lang)}/protein-per-rupee`)}`;
  const chip = (on: boolean) => `rounded-full px-4 py-2 text-sm font-bold transition ${on ? 'bg-ink text-white' : 'bg-white shadow-card hover:bg-tang'}`;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setVeg(!veg)} aria-pressed={veg} className={chip(veg)}>🌱 {t.onlyVeg}</button>
        <button onClick={() => setStaples(!staples)} aria-pressed={staples} className={chip(staples)}>{t.staples}</button>
        <label className="ml-auto flex items-center gap-2 text-sm font-bold">{t.sort}
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="rounded-full border border-mist bg-white px-3 py-2">
            <option value="ppr">{t.per10}</option><option value="protein">{t.protein}</option><option value="cost">{t.cost}</option>
          </select>
        </label>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-5 py-2 text-sm font-extrabold text-ink shadow-card hover:brightness-95">{t.share}</a>
      </div>
      <ol className="mt-6 space-y-3">
        {rows.map((f, i) => (
          <li key={f.slug}>
            <Link href={`${base(lang)}/foods/${f.slug}`} className="card card-hover flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
              <span className="w-8 shrink-0 text-center text-2xl font-extrabold text-tang">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-snug">{lang === 'hi' ? f.hi : f.name}</span>
                <span className="block text-xs text-ink/55">{lang === 'hi' ? f.hiServing : f.serving} · {perServing(f).p} {t.g} {t.protein.toLowerCase()} · {rupees(costOf(f))}</span>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-mist"><span className="block h-full rounded-full bg-gradient-to-r from-teal to-tang" style={{ width: `${(proteinPer10(f) / max) * 100}%` }} /></span>
              </span>
              <span className="shrink-0 text-right"><span className="block text-2xl font-extrabold text-teal">{proteinPer10(f)}</span><span className="block text-xs text-ink/55">{t.g} / ₹10</span></span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
