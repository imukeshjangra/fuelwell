'use client';
import { useState } from 'react';
type Goal = 'maintain' | 'lose' | 'gain';
type Act = 'low' | 'moderate' | 'high';
const RANGE: Record<Goal, Record<Act, [number, number]>> = {
  maintain: { low: [0.8, 1.0], moderate: [1.2, 1.6], high: [1.4, 1.8] },
  lose: { low: [1.2, 1.6], moderate: [1.6, 2.0], high: [1.8, 2.2] },
  gain: { low: [1.4, 1.8], moderate: [1.6, 2.0], high: [1.8, 2.2] },
};
type Result = { lo: number; hi: number; ref: number; adj: boolean };
const box = 'w-full border-2 border-mist bg-white px-3 py-2 text-lg';
function L({ t, children }: { t: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-bold">{t}</span>{children}</label>;
}
export default function ProteinCalc() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [h, setH] = useState(''); const [ft, setFt] = useState(''); const [inch, setInch] = useState(''); const [w, setW] = useState('');
  const [goal, setGoal] = useState<Goal>('lose');
  const [act, setAct] = useState<Act>('moderate');
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  function calc() {
    const cm = unit === 'metric' ? +h : (+ft * 12 + +inch) * 2.54;
    const kg = unit === 'metric' ? +w : +w * 0.45359237;
    if (!(cm >= 120 && cm <= 230) || !(kg >= 30 && kg <= 300)) { setRes(null); setErr('Enter a height between 120 and 230 cm (4 ft to 7 ft 6 in) and a weight between 30 and 300 kg (66 to 660 lb).'); return; }
    setErr('');
    const ibw = (sex === 'male' ? 50 : 45.5) + 2.3 * Math.max(0, cm / 2.54 - 60);
    const adj = kg / (cm / 100) ** 2 >= 30;
    const ref = adj ? ibw + 0.25 * (kg - ibw) : kg;
    const [a, b] = RANGE[goal][act];
    setRes({ lo: Math.round(ref * a), hi: Math.round(ref * b), ref: Math.round(ref), adj });
  }
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4 bg-white p-6">
        <div className="flex gap-2">{(['metric', 'imperial'] as const).map(u => <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u} className={`px-4 py-2 font-bold ${unit === u ? 'bg-ink text-white' : 'bg-mist'}`}>{u === 'metric' ? 'cm / kg' : 'ft-in / lb'}</button>)}</div>
        <L t="Sex"><select className={box} value={sex} onChange={e => setSex(e.target.value as 'male' | 'female')}><option value="male">Male</option><option value="female">Female</option></select></L>
        {unit === 'metric'
          ? <><L t="Height (cm)"><input className={box} inputMode="decimal" value={h} onChange={e => setH(e.target.value)} placeholder="170" /></L><L t="Weight (kg)"><input className={box} inputMode="decimal" value={w} onChange={e => setW(e.target.value)} placeholder="70" /></L></>
          : <><div className="grid grid-cols-2 gap-3"><L t="Height (ft)"><input className={box} inputMode="numeric" value={ft} onChange={e => setFt(e.target.value)} placeholder="5" /></L><L t="(in)"><input className={box} inputMode="numeric" value={inch} onChange={e => setInch(e.target.value)} placeholder="7" /></L></div><L t="Weight (lb)"><input className={box} inputMode="decimal" value={w} onChange={e => setW(e.target.value)} placeholder="154" /></L></>}
        <L t="Your goal"><select className={box} value={goal} onChange={e => setGoal(e.target.value as Goal)}><option value="lose">Lose weight</option><option value="maintain">Maintain weight</option><option value="gain">Gain weight / build muscle</option></select></L>
        <L t="Activity level"><select className={box} value={act} onChange={e => setAct(e.target.value as Act)}><option value="low">Low (little exercise)</option><option value="moderate">Moderate (3-4 workouts a week)</option><option value="high">High (5+ workouts a week)</option></select></L>
        <button onClick={calc} className="w-full bg-tang px-4 py-3 text-lg font-extrabold text-ink hover:brightness-95">Calculate my protein</button>
        {err && <p role="alert" className="text-red-700">{err}</p>}
      </div>
      <div className="bg-ink p-6 text-white" aria-live="polite">
        {res ? (<>
          <p className="text-white/70">Your daily protein target</p>
          <p className="mt-1 text-5xl font-extrabold text-tang">{res.lo}–{res.hi} g</p>
          <p className="mt-3 text-lg">About {Math.round(res.lo / 4)}–{Math.round(res.hi / 4)} g per meal across 4 meals.</p>
          <p className="mt-4 text-sm text-white/75">Calculated from {res.ref} kg{res.adj ? ', an adjusted weight based on your height, because protein needs track lean body mass more than total weight' : ''}.</p>
          <p className="mt-4 text-sm text-white/75">Approximate protein: 1 egg 6 g, 100 g cooked chicken breast 30 g, 100 g paneer 18 g, 1 cup Greek yogurt 20 g.</p>
        </>) : <p className="text-lg text-white/80">Enter your height, weight and goal, then press the button to see your range.</p>}
        <p className="mt-6 border-t border-white/20 pt-4 text-sm text-white/70">For healthy adults only. This is an estimate, not medical advice. If you have kidney disease, are pregnant, are under 18 or have any medical condition, ask your doctor or a dietitian first. Nothing you enter is stored.</p>
      </div>
    </div>
  );
}
