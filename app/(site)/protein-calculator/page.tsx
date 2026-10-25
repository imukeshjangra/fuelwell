import ProteinCalc from '@/components/tools/ProteinCalc';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'Protein Calculator: how much protein per day?', description: 'Free protein calculator. Enter your height, weight, goal and activity level to get a daily protein range in grams.', alternates: { canonical: '/protein-calculator' } };
export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Protein calculator</h1>
      <p className="mb-8 mt-3 max-w-2xl font-body text-xl text-ink/75">Find out how many grams of protein to eat each day for fat loss, maintenance or muscle gain.</p>
      <ProteinCalc />
      <AdSlot />
      <section className="article mx-auto max-w-[720px]">
        <h2>How the calculator works</h2>
        <p>Protein needs are usually set per kilogram of body weight. The general guideline for adults is 0.8 g per kg, while people who train or are losing weight often aim higher, in the range of 1.2 to 2.2 g per kg.</p>
        <p>Your height is used to estimate a healthy reference weight. For people with a high body mass index, the calculator uses that adjusted weight, because muscle needs more protein than body fat does.</p>
        <h2>Who should be careful</h2>
        <p>People with kidney disease, pregnant or breastfeeding women, teenagers and anyone with a medical condition should get advice from a doctor or dietitian before changing protein intake.</p>
      </section>
    </div>
  );
}
