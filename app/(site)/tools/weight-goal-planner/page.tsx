import { GoalPlanner } from '@/components/tools/Calcs';
import AdSlot from '@/components/ui/AdSlot';
export const metadata = { title: 'Weight goal planner: how many weeks to reach your goal weight?', description: 'Free weight goal planner. Enter your current and goal weight and a safe weekly pace to see roughly how many weeks it will take.', alternates: { canonical: '/tools/weight-goal-planner' } };
export default function Page() {
  return (<div className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-4xl font-extrabold sm:text-5xl">Weight goal planner</h1><p className="mb-8 mt-3 font-body text-xl text-ink/75">See roughly how many weeks it takes to reach your goal weight at a safe pace.</p><GoalPlanner /><AdSlot /></div>);
}
