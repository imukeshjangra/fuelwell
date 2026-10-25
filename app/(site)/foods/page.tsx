import FoodTable from '@/components/tools/FoodTable';
import AdSlot from '@/components/ui/AdSlot';
import { T } from '@/lib/i18n';
export const metadata = { title: T.en.foodsTitle, description: 'Searchable protein, calorie, carb and fat values for dal, paneer, roti, chana, eggs, curd, soya chunks and more, with cost per serving.', alternates: { canonical: '/foods', languages: { 'en-IN': '/foods', 'hi-IN': '/hi/foods' } } };
export default function Page() {
  return (<div className="mx-auto max-w-6xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">{T.en.foodsH1}</h1><p className="mb-8 mt-3 max-w-2xl font-body text-xl text-ink/75">{T.en.foodsIntro}</p><FoodTable /><AdSlot /><p className="text-xs text-ink/55">{T.en.disclaimer}</p></div>);
}
