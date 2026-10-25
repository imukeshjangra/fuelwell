'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ACTIVITY, bmi as bmiOf, calorieTarget, proteinTarget, type Sex } from '@/lib/mealplan';
const box = 'w-full rounded-xl border-2 border-mist bg-white px-3 py-2 text-lg';
const num = (v: string) => (v === '' ? NaN : Number(v));
const Field = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block"><span className="mb-1 block text-sm font-bold">{t}</span>{children}</label>;
const Card = ({ children }: { children: React.ReactNode }) => <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">{children}</div>;
const Res = ({ children }: { children: React.ReactNode }) => <div role="status" className="mt-6 rounded-2xl bg-gradient-to-br from-ink to-[#1d3557] p-6 text-white">{children}</div>;
const Err = ({ m }: { m: string }) => (m ? <p role="alert" className="mt-4 font-bold text-red-700">{m}</p> : null);
const Btn = ({ onClick }: { onClick: () => void }) => <button onClick={onClick} className="mt-5 rounded-full bg-ink px-7 py-3 font-extrabold text-white shadow-card hover:bg-teal">Calculate</button>;
const Next = ({ links }: { links: [string, string][] }) => <p className="mt-6 flex flex-wrap gap-3 text-sm font-bold">{links.map(([h, t]) => <Link key={h} href={h} className="rounded-full bg-white px-4 py-2 text-teal shadow-card hover:bg-tang hover:text-ink">{t} →</Link>)}</p>;

export function CalorieCalc() {
  const [s, setS] = useState({ sex: 'male' as Sex, age: '28', cm: '170', kg: '70', act: '1.375' });
  const [r, setR] = useState<null | { tdee: number; lose: number; gain: number; p: number }>(null); const [e, setE] = useState('');
  const go = () => {
    const age = num(s.age), cm = num(s.cm), kg = num(s.kg);
    if (![age, cm, kg].every(Number.isFinite) || age < 18 || age > 80 || cm < 120 || cm > 220 || kg < 30 || kg > 250) return setE('Enter an adult age (18-80), height 120-220 cm and weight 30-250 kg.');
    setE(''); const a = Number(s.act);
    setR({ tdee: calorieTarget(s.sex, kg, cm, age, a, 'maintain').tdee, lose: calorieTarget(s.sex, kg, cm, age, a, 'lose').target, gain: calorieTarget(s.sex, kg, cm, age, a, 'gain').target, p: proteinTarget(kg, 'lose') });
  };
  return (<><Card><div className="grid gap-4 sm:grid-cols-2">
    <Field t="Sex"><select className={box} value={s.sex} onChange={x => setS({ ...s, sex: x.target.value as Sex })}><option value="male">Male</option><option value="female">Female</option></select></Field>
    <Field t="Age (years)"><input className={box} inputMode="numeric" value={s.age} onChange={x => setS({ ...s, age: x.target.value })} /></Field>
    <Field t="Height (cm)"><input className={box} inputMode="numeric" value={s.cm} onChange={x => setS({ ...s, cm: x.target.value })} /></Field>
    <Field t="Weight (kg)"><input className={box} inputMode="decimal" value={s.kg} onChange={x => setS({ ...s, kg: x.target.value })} /></Field>
    <div className="sm:col-span-2"><Field t="Activity"><select className={box} value={s.act} onChange={x => setS({ ...s, act: x.target.value })}>{ACTIVITY.map(a => <option key={a.v} value={a.v}>{a.label}</option>)}</select></Field></div>
  </div><Btn onClick={go} /><Err m={e} />
  {r && <Res><p className="text-sm text-white/70">Calories to maintain your weight</p><p className="text-4xl font-extrabold text-tang">{r.tdee} kcal/day</p><p className="mt-3">For gentle weight loss: about <b>{r.lose}</b> kcal/day · For gentle weight gain: about <b>{r.gain}</b> kcal/day</p><p className="mt-1 text-sm text-white/70">A daily protein target while losing weight is roughly {r.p} g.</p></Res>}
  </Card><p className="mt-3 text-xs text-ink/60">Estimate using the Mifflin-St Jeor equation. Real needs vary. Not medical advice.</p>
  <Next links={[['/meal-plan', 'Get a 7-day meal plan'], ['/protein-calculator', 'Protein calculator'], ['/foods', 'Food database']]} /></>);
}

export function BmiCalc() {
  const [s, setS] = useState({ cm: '170', kg: '70' }); const [r, setR] = useState<null | { b: number; cat: string; lo: number; hi: number }>(null); const [e, setE] = useState('');
  const go = () => {
    const cm = num(s.cm), kg = num(s.kg);
    if (![cm, kg].every(Number.isFinite) || cm < 120 || cm > 220 || kg < 30 || kg > 250) return setE('Enter height 120-220 cm and weight 30-250 kg.');
    setE(''); const b = bmiOf(kg, cm), m2 = (cm / 100) ** 2;
    // WHO Asia-Pacific cut-offs, commonly used for Indian adults.
    setR({ b, cat: b < 18.5 ? 'Underweight' : b < 23 ? 'Healthy range' : b < 25 ? 'Overweight (at risk)' : 'Obese range', lo: 18.5 * m2, hi: 22.9 * m2 });
  };
  return (<><Card><div className="grid gap-4 sm:grid-cols-2">
    <Field t="Height (cm)"><input className={box} inputMode="numeric" value={s.cm} onChange={x => setS({ ...s, cm: x.target.value })} /></Field>
    <Field t="Weight (kg)"><input className={box} inputMode="decimal" value={s.kg} onChange={x => setS({ ...s, kg: x.target.value })} /></Field>
  </div><Btn onClick={go} /><Err m={e} />
  {r && <Res><p className="text-sm text-white/70">Your BMI</p><p className="text-5xl font-extrabold text-tang">{r.b.toFixed(1)}</p><p className="mt-2 text-xl font-bold">{r.cat}</p><p className="mt-2 text-sm text-white/75">For your height, a BMI of 18.5 to 22.9 means roughly {r.lo.toFixed(0)} to {r.hi.toFixed(0)} kg.</p></Res>}
  </Card><p className="mt-3 text-xs text-ink/60">Uses WHO Asia-Pacific cut-offs (healthy 18.5-22.9), often used for Indian adults. BMI does not measure body fat or muscle and is for adults only. Not medical advice.</p>
  <Next links={[['/tools/calorie-calculator', 'Calorie calculator'], ['/tools/weight-goal-planner', 'Goal planner'], ['/meal-plan', 'Meal plan']]} /></>);
}

export function WaterCalc() {
  const [s, setS] = useState({ kg: '70', mins: '30', hot: false }); const [r, setR] = useState<null | { lo: number; hi: number }>(null); const [e, setE] = useState('');
  const go = () => {
    const kg = num(s.kg), mins = num(s.mins);
    if (!Number.isFinite(kg) || kg < 30 || kg > 250 || !Number.isFinite(mins) || mins < 0 || mins > 300) return setE('Enter weight 30-250 kg and exercise minutes 0-300.');
    setE(''); const extra = (mins / 60) * 600 + (s.hot ? 500 : 0);
    setR({ lo: Math.round((kg * 30 + extra) / 100) / 10, hi: Math.round((kg * 35 + extra) / 100) / 10 });
  };
  return (<><Card><div className="grid gap-4 sm:grid-cols-2">
    <Field t="Weight (kg)"><input className={box} inputMode="decimal" value={s.kg} onChange={x => setS({ ...s, kg: x.target.value })} /></Field>
    <Field t="Exercise per day (minutes)"><input className={box} inputMode="numeric" value={s.mins} onChange={x => setS({ ...s, mins: x.target.value })} /></Field>
    <label className="flex items-center gap-3 font-bold sm:col-span-2"><input type="checkbox" className="h-5 w-5" checked={s.hot} onChange={x => setS({ ...s, hot: x.target.checked })} /> Hot or humid weather / lots of sweating</label>
  </div><Btn onClick={go} /><Err m={e} />
  {r && <Res><p className="text-sm text-white/70">Estimated total fluids per day</p><p className="text-4xl font-extrabold text-tang">{r.lo} to {r.hi} litres</p><p className="mt-2 text-sm text-white/75">This includes water from tea, milk, buttermilk and food. Thirst and pale-yellow urine are good everyday signals.</p></Res>}
  </Card><p className="mt-3 text-xs text-ink/60">A general estimate of 30-35 ml per kg plus extra for exercise and heat. People with heart, kidney or other conditions, or on fluid limits, should follow their doctor. Not medical advice.</p>
  <Next links={[['/tools/calorie-calculator', 'Calorie calculator'], ['/protein-calculator', 'Protein calculator'], ['/tracker', 'Progress tracker']]} /></>);
}

export function GoalPlanner() {
  const [s, setS] = useState({ now: '75', goal: '68', cm: '170', pace: '0.5' }); const [r, setR] = useState<null | { weeks: number; date: string; dir: string; warn: string }>(null); const [e, setE] = useState('');
  const go = () => {
    const now = num(s.now), goal = num(s.goal), cm = num(s.cm), pace = Number(s.pace);
    if (![now, goal, cm].every(Number.isFinite) || now < 30 || now > 250 || goal < 30 || goal > 250 || cm < 120 || cm > 220) return setE('Enter realistic weights (30-250 kg) and a height (120-220 cm).');
    if (goal === now) return setE('Your goal weight is the same as your current weight.');
    setE(''); const diff = Math.abs(goal - now), weeks = Math.ceil(diff / pace); const d = new Date(); d.setDate(d.getDate() + weeks * 7);
    const gb = bmiOf(goal, cm); let warn = '';
    if (goal < now && gb < 18.5) warn = `A goal weight of ${goal} kg gives a BMI of ${gb.toFixed(1)}, which is underweight for your height. Please pick a higher goal or talk to a doctor.`;
    else if (goal > now && gb >= 27.5) warn = `A goal weight of ${goal} kg gives a BMI of ${gb.toFixed(1)}. Gaining toward this range may not be healthy. Speak to a doctor or dietitian.`;
    setR({ weeks, date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), dir: goal < now ? 'lose' : 'gain', warn });
  };
  const loseMax = Number(s.now) > Number(s.goal);
  return (<><Card><div className="grid gap-4 sm:grid-cols-2">
    <Field t="Current weight (kg)"><input className={box} inputMode="decimal" value={s.now} onChange={x => setS({ ...s, now: x.target.value })} /></Field>
    <Field t="Goal weight (kg)"><input className={box} inputMode="decimal" value={s.goal} onChange={x => setS({ ...s, goal: x.target.value })} /></Field>
    <Field t="Height (cm)"><input className={box} inputMode="numeric" value={s.cm} onChange={x => setS({ ...s, cm: x.target.value })} /></Field>
    <Field t="Pace"><select className={box} value={s.pace} onChange={x => setS({ ...s, pace: x.target.value })}><option value="0.25">Slow: 0.25 kg per week</option><option value="0.5">Steady: 0.5 kg per week</option>{loseMax && <option value="0.75">Faster: 0.75 kg per week</option>}</select></Field>
  </div><Btn onClick={go} /><Err m={e} />
  {r && <Res><p className="text-sm text-white/70">Time to {r.dir} {Math.abs(Number(s.now) - Number(s.goal)).toFixed(1)} kg</p><p className="text-4xl font-extrabold text-tang">about {r.weeks} weeks</p><p className="mt-2">Around <b>{r.date}</b> if you keep the pace.</p>{r.warn && <p className="mt-3 rounded-lg bg-white/10 p-3 font-bold text-tang">{r.warn}</p>}</Res>}
  </Card><p className="mt-3 text-xs text-ink/60">Real progress is uneven, so treat the date as a rough guide. A pace above about 1% of body weight per week is not recommended. Not medical advice.</p>
  <Next links={[['/tools/calorie-calculator', 'Calorie calculator'], ['/meal-plan', 'Meal plan'], ['/tracker', 'Track progress']]} /></>);
}
