import Link from 'next/link';
import { requireMember, logsFor, logOn, myChallenges, challengePoints } from '@/lib/members';
import { todayKey, lastDays } from '@/lib/today';
import { calorieTarget, proteinTarget, bmi, type Goal, type Sex } from '@/lib/mealplan';
import { getChallenge } from '@/lib/challenges';
import HealthLogger from '@/components/member/HealthLogger';
import ProfileForm from '@/components/member/ProfileForm';
import MiniChart from '@/components/member/MiniChart';
export const dynamic = 'force-dynamic';

const bmiLabel = (b: number) => (b < 18.5 ? 'Underweight' : b < 23 ? 'Healthy range' : b < 27.5 ? 'Overweight' : 'Obese');
export default function Page() {
  const m = requireMember(); const today = todayKey();
  const logs = logsFor(m.id, 30); const byDay = new Map(logs.map(l => [l.day, l]));
  const d30 = lastDays(today, 30), d14 = lastDays(today, 14);
  const series = (days: string[], k: 'weight' | 'water' | 'steps' | 'workout' | 'sleep') => days.map(d => ({ label: d.slice(5), value: byDay.get(d)?.[k] ?? null }));
  const latestW = [...logs].reverse().find(l => l.weight != null)?.weight ?? null;
  const first = logs.find(l => l.weight != null)?.weight ?? null;
  const ready = !!(m.age && m.height_cm && m.sex);
  const goal = (m.goal || 'maintain') as Goal;
  const kg = latestW ?? 0;
  const t = ready && kg ? calorieTarget(m.sex as Sex, kg, m.height_cm, m.age, 1.375, goal) : null;
  const b = ready && kg ? bmi(kg, m.height_cm) : null;
  const mine = myChallenges(m.id, today); const active = mine.filter(c => !c.done);
  const pts = challengePoints(m.id);
  const stat = (n: string | number, l: string, c: string) => <div className="rounded-2xl bg-white/15 p-4 backdrop-blur"><div className="text-3xl font-extrabold">{n}</div><div className="text-sm text-white/80">{l}</div><span className="sr-only">{c}</span></div>;
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-ink via-[#16345a] to-teal p-6 text-white shadow-lift sm:p-8">
        <p className="eyebrow text-sun">Your dashboard</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Hello, {m.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-white/75">Small daily habits add up. Log today and keep your streak alive.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stat(latestW ? `${latestW} kg` : '—', 'Current weight', '')}
          {stat(b ? b.toFixed(1) : '—', b ? `BMI · ${bmiLabel(b)}` : 'BMI (add your goal)', '')}
          {stat(active.length, 'Active challenges', '')}
          {stat(pts, 'Check-ins earned', '')}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <HealthLogger today={logOn(m.id, today)} />
        {ready ? (
          <section className="card p-6">
            <h2 className="text-xl font-extrabold">Your daily targets</h2>
            {t ? <>
              <ul className="mt-4 grid grid-cols-3 gap-3 text-center">
                <li className="rounded-2xl bg-tang/15 p-3"><b className="block text-2xl">{t.target}</b><span className="text-xs">kcal / day</span></li>
                <li className="rounded-2xl bg-aqua/15 p-3"><b className="block text-2xl">{proteinTarget(kg, goal)} g</b><span className="text-xs">protein</span></li>
                <li className="rounded-2xl bg-sky/15 p-3"><b className="block text-2xl">{Math.max(6, Math.round((kg * 35) / 250))}</b><span className="text-xs">glasses water</span></li>
              </ul>
              {m.goal_kg > 0 && latestW && <p className="mt-4 text-sm">Goal weight <b>{m.goal_kg} kg</b>{first && first !== latestW ? <> · changed <b>{(latestW - first).toFixed(1)} kg</b> in 30 days</> : null}. {Math.abs(latestW - m.goal_kg) < 0.5 ? '🎉 You are at your goal!' : <>{Math.abs(latestW - m.goal_kg).toFixed(1)} kg to go.</>}</p>}
              <Link href="/diet-plan" className="btn btn-primary mt-4 w-full">Get my 7-day diet plan →</Link>
            </> : <p className="mt-3 text-ink/70">Log your weight today to see your calorie, protein and water targets.</p>}
            <details className="mt-4"><summary className="cursor-pointer text-sm font-bold text-teal">Edit goal details</summary><div className="mt-3"><ProfileForm m={m} /></div></details>
          </section>
        ) : <ProfileForm m={m} />}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <MiniChart title="Weight (30 days)" type="line" color="#FF7A1A" unit=" kg" target={m.goal_kg || undefined} data={series(d30, 'weight')} />
        <MiniChart title="Water (14 days)" type="bar" color="#2EA8FF" target={8} data={series(d14, 'water')} />
        <MiniChart title="Steps (14 days)" type="bar" color="#7ED957" target={10000} data={series(d14, 'steps')} />
        <MiniChart title="Exercise minutes (14 days)" type="bar" color="#FF5A7A" target={30} data={series(d14, 'workout')} />
        <MiniChart title="Sleep hours (14 days)" type="bar" color="#7C5CFF" target={7} data={series(d14, 'sleep')} />
        <section className="card p-5">
          <div className="flex items-baseline justify-between"><h2 className="font-extrabold">Active challenges</h2><Link href="/account/challenges" className="text-sm font-bold text-teal">All →</Link></div>
          {active.length === 0 ? <p className="mt-3 text-ink/70">No active challenge yet. <Link href="/account/challenges" className="font-bold text-teal underline">Pick one</Link> and start today.</p> :
            <ul className="mt-3 space-y-3">{active.map(c => { const ch = getChallenge(c.id)!; return <li key={c.id} className="flex items-center gap-3"><span className="text-2xl">{ch.icon}</span><div className="flex-1"><div className="flex justify-between text-sm font-bold"><span>{ch.title}</span><span>{c.count}/{ch.days}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-grad-sunrise" style={{ width: `${Math.round((c.count / ch.days) * 100)}%` }} /></div></div></li>; })}</ul>}
        </section>
      </div>
      <p className="text-center text-xs text-ink/55">Fuelwell gives general information, not medical advice. Check with a doctor before starting a new diet or exercise plan.</p>
    </div>
  );
}
