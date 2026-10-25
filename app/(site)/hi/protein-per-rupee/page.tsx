import PprTable from '@/components/tools/PprTable';
import AdSlot from '@/components/ui/AdSlot';
import { T } from '@/lib/i18n';
export const metadata = { title: T.hi.pprTitle, description: '₹10 में किस भारतीय खाने से सबसे ज़्यादा प्रोटीन मिलता है? सोया चंक्स, दाल, अंडा, पनीर और चिकन की प्रति रुपये प्रोटीन के हिसाब से सूची।', alternates: { canonical: '/hi/protein-per-rupee', languages: { 'en-IN': '/protein-per-rupee', 'hi-IN': '/hi/protein-per-rupee' } } };
export default function Page() {
  return (<div lang="hi" className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">{T.hi.pprH1}</h1><p className="mb-8 mt-3 text-xl text-ink/75">{T.hi.pprIntro}</p><PprTable lang="hi" /><AdSlot /><p className="text-xs text-ink/55">{T.hi.disclaimer}</p></div>);
}
