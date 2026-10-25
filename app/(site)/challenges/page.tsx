import Link from 'next/link';
import { CHALLENGES } from '@/lib/challenges';
import { getMember, myChallenges } from '@/lib/members';
import { todayKey } from '@/lib/today';
import ChallengeCard from '@/components/member/ChallengeCard';
import AdSlot from '@/components/ui/AdSlot';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Free fitness challenges: water, steps, workout, sleep and protein',
  description: 'Join free 7, 14 and 30 day fitness challenges. Track water, steps, exercise, sleep and protein, build a streak and see your progress on a personal health chart.',
  alternates: { canonical: '/challenges' },
};
const FAQ = [
  ['Are the challenges free?', 'Yes. Creating an account and joining every challenge on Fuelwell is free.'],
  ['How are my days counted?', 'Water, steps, exercise and sleep challenges are counted automatically when you save your daily health log. Protein and low-sugar challenges need one tap each day.'],
  ['What if I miss a day?', 'Nothing is lost. Your total check-ins keep counting, and your streak simply restarts. Aim to never miss two days in a row.'],
  ['Are these challenges safe?', 'They are designed for healthy adults. If you have a medical condition, are pregnant or take medicines, check with your doctor first.'],
];
export default function Page() {
  const me = getMember(); const mine = me ? myChallenges(me.id, todayKey()) : [];
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Fuelwell fitness challenges', itemListElement: CHALLENGES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.title, url: `${base}/challenges` })) },
  ];
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p className="eyebrow">Free for everyone</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Fitness challenges that <span className="gradient-text">build real habits</span></h1>
      <p className="mt-4 max-w-2xl font-body text-xl text-ink/75">Pick a challenge, log your day and watch your streak and health chart grow. Short, simple goals work better than big promises.</p>
      {!me && <div className="mt-6 flex flex-wrap gap-3"><Link href="/register" className="btn btn-primary">Create free account</Link><Link href="/login" className="btn btn-ghost">Sign in</Link></div>}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{CHALLENGES.map(c => <ChallengeCard key={c.id} c={c} mine={mine.find(x => x.id === c.id)} signedIn={!!me} />)}</div>
      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {[['1. Join', 'Create a free account and choose a challenge that fits your week.'], ['2. Log daily', 'Save water, steps, exercise, sleep and weight in under a minute.'], ['3. See progress', 'Your dashboard charts show trends, streaks and how far you have come.']].map(([h, t]) => <div key={h} className="card p-6"><h2 className="text-xl font-extrabold">{h}</h2><p className="mt-2 text-ink/70">{t}</p></div>)}
      </section>
      <section className="mt-14 max-w-3xl"><h2 className="text-3xl font-extrabold">Challenge questions</h2><div className="mt-4 space-y-3">{FAQ.map(([q, a]) => <details key={q} className="card p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-2 text-ink/75">{a}</p></details>)}</div></section>
      <AdSlot />
    </div>
  );
}
