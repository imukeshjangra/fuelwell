import { CalorieCalc } from '@/components/tools/Calcs';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'Calorie calculator: how many calories do you need a day?', description: 'Free calorie needs calculator for Indian adults. Estimate maintenance calories and gentle weight loss or gain targets from your age, height, weight and activity.', alternates: { canonical: '/tools/calorie-calculator' } };
export default function Page() {
  return (<div className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">Calorie calculator</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">Estimate how many calories you burn each day, and a gentle target for losing or gaining weight.</p><CalorieCalc /><AdSlot /></div>);
}
