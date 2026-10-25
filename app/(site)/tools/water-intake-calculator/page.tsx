import { WaterCalc } from '@/components/tools/Calcs';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'Water intake calculator: how much water per day?', description: 'Free water intake calculator. Estimate your daily fluids in litres from body weight, exercise and hot weather.', alternates: { canonical: '/tools/water-intake-calculator' } };
export default function Page() {
  return (<div className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">Water intake calculator</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">A simple estimate of how many litres of fluids to drink each day.</p><WaterCalc /><AdSlot /></div>);
}
