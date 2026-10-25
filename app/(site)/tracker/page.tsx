import Tracker from '@/components/tools/Tracker';
export const metadata = { title: 'Weight and protein progress tracker', description: 'Free private progress tracker. Log your weight and protein, see your trend chart and download your data. Everything stays in your browser.', alternates: { canonical: '/tracker' } };
export default function Page() {
  return (<div className="mx-auto max-w-4xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">Progress tracker</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">Log your weight (and protein if you like), watch the trend, and keep going. Private: your data never leaves this device.</p><Tracker /></div>);
}
