import { BmiCalc } from '@/components/tools/Calcs';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'BMI calculator with Indian (Asia-Pacific) cut-offs', description: 'Free BMI calculator using WHO Asia-Pacific cut-offs often used for Indian adults. See your BMI, category and a healthy weight range for your height.', alternates: { canonical: '/tools/bmi-calculator' } };
export default function Page() {
  return (<div className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">BMI calculator</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">Check your BMI using the cut-offs commonly used for Indian adults.</p><BmiCalc /><AdSlot /></div>);
}
