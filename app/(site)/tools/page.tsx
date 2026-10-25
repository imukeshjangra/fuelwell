import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'Free health and nutrition tools for Indians', description: 'Free calculators and planners: protein, calories, BMI, water intake, goal date, 7-day Indian meal plans, a protein-per-rupee ranking and a progress tracker.', alternates: { canonical: '/tools' } };
const TOOLS = [
  ['/protein-calculator', '🧮', 'Protein calculator', 'How many grams of protein you need each day.'],
  ['/protein-per-rupee', '₹', 'Protein per rupee', 'The cheapest protein foods, ranked per ₹10.'],
  ['/meal-plan', '🍛', '7-day meal plan', 'Indian meals by goal, diet and daily budget. Printable.'],
  ['/foods', '🥗', 'Food database', 'Protein and calories for everyday Indian foods.'],
  ['/tools/calorie-calculator', '🔥', 'Calorie calculator', 'Maintenance, weight-loss and weight-gain calories.'],
  ['/tools/bmi-calculator', '⚖️', 'BMI calculator', 'With cut-offs used for Indian adults.'],
  ['/tools/water-intake-calculator', '💧', 'Water intake', 'Daily litres from weight, exercise and heat.'],
  ['/tools/weight-goal-planner', '🎯', 'Goal planner', 'Weeks to reach your goal weight at a safe pace.'],
  ['/tracker', '📈', 'Progress tracker', 'Private weight log with a trend chart.'],
  ['/hi', 'अ', 'हिन्दी में', 'खाने की तालिका और प्रति रुपये प्रोटीन हिन्दी में।'],
];
export default function Page() {
  return (<div className="mx-auto max-w-6xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">Free tools</h1><p className="mb-8 mt-3 max-w-2xl font-body text-xl text-ink/75">Calculators and planners built for Indian food, budgets and routines.</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{TOOLS.map(([h, i, t, d]) => <Link key={h} href={h} className="card card-hover rounded-2xl bg-white p-6 shadow-card"><span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-2xl text-tang">{i}</span><span className="mt-4 block text-xl font-extrabold">{t}</span><span className="mt-1 block text-ink/70">{d}</span></Link>)}</div><AdSlot /></div>);
}
