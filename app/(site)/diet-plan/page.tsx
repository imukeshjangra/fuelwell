import Link from 'next/link';
import MealPlanner from '@/components/tools/MealPlanner';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = {
  title: 'Free Indian diet plan chart: 7-day plan by goal, calories and budget',
  description: 'Make a free 7-day Indian diet plan chart for weight loss, weight gain or maintenance. Get your daily calories and protein, vegetarian, egg or non-veg meals, portions, a shopping list and a printable chart.',
  alternates: { canonical: '/diet-plan' },
};
const FAQ = [
  ['How is my calorie target worked out?', 'We estimate your resting energy with the Mifflin-St Jeor formula, multiply by your activity level, then subtract about 400 kcal to lose weight or add about 350 kcal to gain, never going below a safe minimum.'],
  ['How much protein do I need?', 'About 1.2 g per kg of body weight to maintain, and about 1.6 g per kg when losing or gaining weight, which helps protect muscle.'],
  ['Is this plan vegetarian friendly?', 'Yes. Choose vegetarian, eggs or non-veg. Every plan uses everyday Indian foods and respects the daily budget you enter.'],
  ['Can I use this if I have a medical condition?', 'This tool is for healthy adults. If you have diabetes, kidney or heart disease, are pregnant or take regular medicines, ask your doctor or a registered dietitian for a personal plan.'],
];
export default function Page() {
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="no-print">
        <p className="eyebrow">Free diet chart maker</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Your personal <span className="gradient-text">Indian diet plan</span></h1>
        <p className="mb-8 mt-3 max-w-2xl font-body text-xl text-ink/75">Enter your details once. Get daily calories and protein, a 7-day meal chart with portions, and a shopping list you can print. Built around dal, roti, paneer, eggs and other foods you already eat.</p>
      </div>
      <MealPlanner />
      <div className="no-print">
        <section className="mt-12 grid gap-5 md:grid-cols-3">
          <Link href="/register" className="card card-hover p-6"><h2 className="text-xl font-extrabold">📊 Track your progress</h2><p className="mt-2 text-ink/70">Create a free account to log weight, water, steps and sleep and see charts.</p></Link>
          <Link href="/challenges" className="card card-hover p-6"><h2 className="text-xl font-extrabold">🏆 Join a challenge</h2><p className="mt-2 text-ink/70">Build a streak with 7, 14 and 30 day habits.</p></Link>
          <Link href="/protein-per-rupee" className="card card-hover p-6"><h2 className="text-xl font-extrabold">💰 Cheapest protein</h2><p className="mt-2 text-ink/70">See which foods give the most protein per rupee.</p></Link>
        </section>
        <section className="mt-12 max-w-3xl"><h2 className="text-3xl font-extrabold">Diet plan questions</h2><div className="mt-4 space-y-3">{FAQ.map(([q, a]) => <details key={q} className="card p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-2 text-ink/75">{a}</p></details>)}</div></section>
        <AdSlot />
      </div>
    </div>
  );
}
