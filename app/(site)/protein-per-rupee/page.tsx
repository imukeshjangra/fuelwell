import PprTable from '@/components/tools/PprTable';
import AdSlot from '@/components/ui/AdSlot';
import { T } from '@/lib/i18n';
export const metadata = { title: T.en.pprTitle, description: 'Which Indian foods give the most protein for ₹10? A ranked list of soya chunks, dal, eggs, paneer, chicken and more by protein per rupee.', alternates: { canonical: '/protein-per-rupee', languages: { 'en-IN': '/protein-per-rupee', 'hi-IN': '/hi/protein-per-rupee' } } };
export default function Page() {
  return (<div className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">{T.en.pprH1}</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">{T.en.pprIntro}</p><PprTable /><AdSlot /><p className="text-xs text-ink/55">{T.en.disclaimer}</p></div>);
}
