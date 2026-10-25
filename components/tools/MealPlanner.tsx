'use client';
import Link from 'next/link';
import { useState } from 'react';
import { getFood } from '@/lib/foods';
import { ACTIVITY, SLOTS, bmi, buildPlan, calorieTarget, proteinTarget, type Goal, type Sex } from '@/lib/mealplan';
import type { Diet } from '@/lib/foods';
import Newsletter from '@/components/ui/Newsletter';
const box = 'w-full rounded-xl border-2 border-mist bg-white px-3 py-2 text-lg';
const num = (v: string) => (v === '' ? NaN : Number(v));
export default function MealPlanner() {
  const [f, setF] = useState({ goal: 'lose' as Goal, diet: 'veg' as Diet, sex: 'male' as Sex, age: '28', cm: '170', kg: '70', act: '1.375', budget: '150' });
  const [res, setRes] = useState<null | { plan: ReturnType<typeof buildPlan>; target: number; tdee: number; protein: number; goal: Goal }>(null);
  const [err, setErr] = useState('');
  const set = (k: string, v: string) => setF({ ...f, [k]: v });
  function make() {
    const age = num(f.age), cm = num(f.cm), kg = num(f.kg), budget = num(f.budget);
    if (![age, cm, kg, budget].every(Number.isFinite)) return setErr('Please fill in every number.');
    if (age < 18) return setErr('This planner is for adults aged 18 and over. Young people should get a plan from a doctor or dietitian.');
    if (age > 80 || cm < 120 || cm > 220 || kg < 30 || kg > 250) return setErr('Please check your age, height and weight.');
    if (budget < 40 || budget > 2000) return setErr('Enter a daily food budget between ₹40 and ₹2000.');
    const b = bmi(kg, cm);
    if (f.goal === 'lose' && b < 18.5) return setErr('Your BMI is already in the underweight range, so we cannot suggest a weight-loss plan. Please talk to a doctor or dietitian.');
    setErr('');
    const c = calorieTarget(f.sex, kg, cm, age, Number(f.act), f.goal);
    setRes({ plan: buildPlan(f.diet, c.target, budget), target: c.target, tdee: c.tdee, protein: proteinTarget(kg, f.goal), goal: f.goal });
  }
  const label = (t: string, el: React.ReactNode) => <label className="block"><span className="mb-1 block text-sm font-bold">{t}</span>{el}</label>;
  return (
    <div>
      <div className="no-print rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {label('Goal', <select className={box} value={f.goal} onChange={e => set('goal', e.target.value)}><option value="lose">Lose weight</option><option value="maintain">Maintain weight</option><option value="gain">Gain weight</option></select>)}
          {label('Food preference', <select className={box} value={f.diet} onChange={e => set('diet', e.target.value)}><option value="veg">Vegetarian</option><option value="egg">Vegetarian + eggs</option><option value="nonveg">Non-vegetarian</option></select>)}
          {label('Sex', <select className={box} value={f.sex} onChange={e => set('sex', e.target.value)}><option value="male">Male</option><option value="female">Female</option></select>)}
          {label('Age (years)', <input className={box} inputMode="numeric" value={f.age} onChange={e => set('age', e.target.value)} />)}
          {label('Height (cm)', <input className={box} inputMode="numeric" value={f.cm} onChange={e => set('cm', e.target.value)} />)}
          {label('Weight (kg)', <input className={box} inputMode="decimal" value={f.kg} onChange={e => set('kg', e.target.value)} />)}
          {label('Activity', <select className={box} value={f.act} onChange={e => set('act', e.target.value)}>{ACTIVITY.map(a => <option key={a.v} value={a.v}>{a.label}</option>)}</select>)}
          {label('Daily food budget (₹)', <input className={box} inputMode="numeric" value={f.budget} onChange={e => set('budget', e.target.value)} />)}
        </div>
        <button onClick={make} className="mt-6 rounded-full bg-ink px-8 py-3 text-lg font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-teal">Create my 7-day plan</button>
        {err && <p role="alert" className="mt-4 font-bold text-red-700">{err}</p>}
        <p className="mt-4 text-xs text-ink/60">For healthy adults only. Not suitable if you are pregnant or breastfeeding or have diabetes, kidney disease or another condition. Ask your doctor or dietitian first.</p>
      </div>
      {res && (
        <div className="mt-10" id="plan">
          <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-3xl font-extrabold">Your 7-day Indian meal plan</h2><button onClick={() => window.print()} className="no-print rounded-full bg-tang px-6 py-2.5 font-extrabold text-ink shadow-card hover:brightness-95">Print or save as PDF</button></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[`${res.plan.avgKcal}`, 'kcal per day'], [`${res.plan.avgP} g`, `protein per day (target about ${res.protein} g)`], [`₹${res.plan.avgCost}`, 'average cost per day'], [`${res.tdee}`, 'estimated kcal you burn']].map(([v, l]) => <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-card"><p className="text-2xl font-extrabold text-teal">{v}</p><p className="text-xs font-semibold text-ink/60">{l}</p></div>)}
          </div>
          {res.plan.overBudget && <p role="status" className="mt-4 rounded-xl bg-tang/20 p-4 font-bold">This plan costs more than your budget even with the cheapest meals we have. Try raising the budget slightly or choosing vegetarian.</p>}
          {res.plan.avgP < res.protein * 0.9 && <p role="status" className="mt-4 rounded-xl bg-white p-4 shadow-card">This plan gives a little less protein than your target. Adding an extra katori of dal, 30 g soya chunks or a glass of milk each day closes the gap cheaply.</p>}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {res.plan.days.map((d, i) => (
              <section key={i} className="break-inside-avoid rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-baseline justify-between"><h3 className="text-xl font-extrabold">Day {i + 1}</h3><span className="text-sm font-semibold text-ink/60">{d.kcal} kcal · {d.p} g protein · ₹{d.cost}</span></div>
                <ul className="mt-3 space-y-3">
                  {d.meals.map((pm, j) => (
                    <li key={j}><p className="text-xs font-extrabold uppercase tracking-wide text-teal">{SLOTS[j]}</p><p className="font-bold">{pm.meal.name}</p>
                      <p className="text-sm text-ink/65">{pm.items.map(it => { const fd = getFood(it.slug)!; return `${fd.name.replace(/ \(.*\)/, '')}: ${it.qty} × ${fd.serving}`; }).join(' · ')}</p></li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <section className="mt-8 break-inside-avoid rounded-2xl bg-white p-5 shadow-card">
            <h3 className="text-xl font-extrabold">Weekly shopping list (approx.)</h3>
            <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">{res.plan.shopping.map(s => { const fd = getFood(s.slug)!; return <li key={s.slug} className="flex justify-between border-b border-mist py-1"><span>{fd.name.replace(/ \(.*\)/, '')}</span><span className="font-semibold">{s.grams >= 1000 ? `${(s.grams / 1000).toFixed(1)} kg` : `${s.grams} g`} · ~₹{s.cost}</span></li>; })}</ul>
            <p className="mt-3 text-xs text-ink/55">Quantities are as bought (dry dal, atta, rice). Prices are indicative and vary by city. Add vegetables, oil and spices as usual; they are not counted above.</p>
          </section>
          <p className="mt-6 text-xs text-ink/60">General information, not medical advice. Estimates only; portions are scaled to a gentle {res.goal === 'lose' ? '400 kcal deficit' : res.goal === 'gain' ? '350 kcal surplus' : 'maintenance level'}. Stop and see a doctor if you feel unwell. <Link href="/disclaimer" className="underline">Full disclaimer</Link>.</p>
          <div className="no-print"><Newsletter /></div>
        </div>
      )}
    </div>
  );
}
