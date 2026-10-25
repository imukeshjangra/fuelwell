import FoodTable from '@/components/tools/FoodTable';
import AdSlot from '@/components/ui/AdSlot';
import { T } from '@/lib/i18n';
export const metadata = { title: T.hi.foodsTitle, description: 'दाल, पनीर, रोटी, चना, अंडा, दही और सोया चंक्स जैसे खाने में प्रोटीन, कैलोरी, कार्ब्स और फैट, साथ में प्रति सर्विंग लागत।', alternates: { canonical: '/hi/foods', languages: { 'en-IN': '/foods', 'hi-IN': '/hi/foods' } } };
export default function Page() {
  return (<div lang="hi" className="mx-auto max-w-6xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">{T.hi.foodsH1}</h1><p className="mb-8 mt-3 max-w-2xl text-xl text-ink/75">{T.hi.foodsIntro}</p><FoodTable lang="hi" /><AdSlot /><p className="text-xs text-ink/55">{T.hi.disclaimer}</p></div>);
}
