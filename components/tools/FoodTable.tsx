'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FOODS, CATS, perServing, costOf, proteinPer10, rupees, type Cat } from '@/lib/foods';
import { T, base, type Lang } from '@/lib/i18n';
export default function FoodTable({ lang = 'en' }: { lang?: Lang }) {
  const t = T[lang];
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat | 'all'>('all');
  const [veg, setVeg] = useState(false);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FOODS.filter(f => (cat === 'all' || f.cat === cat) && (!veg || f.diet === 'veg') && (!s || f.name.toLowerCase().includes(s) || f.hi.includes(s)));
  }, [q, cat, veg]);
  const chip = (on: boolean) => `rounded-full px-4 py-2 text-sm font-bold transition ${on ? 'bg-ink text-white' : 'bg-white shadow-card hover:bg-tang'}`;
  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} aria-label={t.search} placeholder={t.search} className="w-full max-w-md rounded-full border-2 border-mist bg-white px-5 py-3 text-lg" />
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.cat}>
        <button onClick={() => setCat('all')} className={chip(cat === 'all')}>{t.all}</button>
        {(Object.keys(CATS) as Cat[]).map(c => <button key={c} onClick={() => setCat(c)} className={chip(cat === c)}>{CATS[c].icon} {CATS[c][lang]}</button>)}
        <button onClick={() => setVeg(!veg)} aria-pressed={veg} className={`${chip(veg)} ml-auto`}>🌱 {t.veg}</button>
      </div>
      <p className="mt-4 text-sm text-ink/60" role="status" aria-live="polite">{rows.length} / {FOODS.length}</p>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-ink text-white"><tr>{[t.food, t.serving, t.protein, t.kcal, t.carbs, t.fat, t.cost, t.per10].map(h => <th key={h} className="whitespace-nowrap px-4 py-3 font-bold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(f => { const s = perServing(f); return (
              <tr key={f.slug} className="border-t border-mist hover:bg-ground">
                <td className="px-4 py-3"><Link href={`${base(lang)}/foods/${f.slug}`} className="font-bold text-teal hover:underline">{lang === 'hi' ? f.hi : f.name}</Link><span className="block text-xs text-ink/50">{lang === 'hi' ? f.name : f.hi}</span></td>
                <td className="px-4 py-3 text-ink/70">{lang === 'hi' ? f.hiServing : f.serving}</td>
                <td className="px-4 py-3 font-extrabold">{s.p} {t.g}</td><td className="px-4 py-3">{s.k}</td><td className="px-4 py-3">{s.c} {t.g}</td><td className="px-4 py-3">{s.f} {t.g}</td>
                <td className="px-4 py-3">{rupees(costOf(f))}</td><td className="px-4 py-3 font-bold text-teal">{proteinPer10(f)} {t.g}</td>
              </tr>); })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-ink/70">{t.none}</p>}
      </div>
    </div>
  );
}
