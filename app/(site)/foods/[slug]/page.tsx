import FoodDetail from '@/components/tools/FoodDetail';
import { FOODS, getFood, perServing } from '@/lib/foods';
export const dynamicParams = false;
export const generateStaticParams = () => FOODS.map(f => ({ slug: f.slug }));
export function generateMetadata({ params }: { params: { slug: string } }) {
  const f = getFood(params.slug); if (!f) return {};
  const s = perServing(f);
  const hi = false;
  return {
    title: hi ? `${f.hi}: प्रोटीन और कैलोरी` : `${f.name}: protein and calories`,
    description: hi ? `${f.hiServing} में ${s.p} ग्राम प्रोटीन और ${s.k} कैलोरी। कार्ब्स, फैट, लागत और ₹10 में प्रोटीन देखें।` : `${f.name}: ${s.p} g protein and ${s.k} kcal in ${f.serving}. See carbs, fat, cost per serving and protein per ₹10.`,
    alternates: { canonical: `/foods/${f.slug}`, languages: { 'en-IN': `/foods/${f.slug}`, 'hi-IN': `/hi/foods/${f.slug}` } },
  };
}
export default function Page({ params }: { params: { slug: string } }) { return <FoodDetail slug={params.slug} lang="en" />; }
