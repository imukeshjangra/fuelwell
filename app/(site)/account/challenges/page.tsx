import { CHALLENGES } from '@/lib/challenges';
import { requireMember, myChallenges } from '@/lib/members';
import { todayKey } from '@/lib/today';
import ChallengeCard from '@/components/member/ChallengeCard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My challenges', robots: { index: false, follow: false } };
export default function Page() {
  const m = requireMember(); const mine = myChallenges(m.id, todayKey());
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Fitness challenges</h1>
      <p className="mb-6 mt-2 max-w-2xl text-ink/70">Pick a challenge and check in every day. Water, steps, exercise and sleep challenges are counted automatically when you save your daily log.</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{CHALLENGES.map(c => <ChallengeCard key={c.id} c={c} mine={mine.find(x => x.id === c.id)} signedIn />)}</div>
    </div>
  );
}
