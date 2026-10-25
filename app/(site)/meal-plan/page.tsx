import MealPlanner from '@/components/tools/MealPlanner';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: '7-day Indian meal plan generator by budget', description: 'Free 7-day Indian meal plan for weight loss, maintenance or weight gain. Pick vegetarian, eggs or non-veg and a daily rupee budget, then print the plan and shopping list.', alternates: { canonical: '/meal-plan' } };
export default function Page() {
  return (<div className="mx-auto max-w-5xl px-5 py-10"><h1 className="no-print text-4xl font-extrabold sm:text-5xl">7-day Indian meal plan generator</h1><p className="no-print mb-8 mt-3 max-w-2xl font-body text-xl text-ink/75">Tell us your goal, food preference and daily budget in rupees. Get a week of everyday Indian meals, portions and a shopping list you can print.</p><MealPlanner /><div className="no-print"><AdSlot /></div></div>);
}
