import { redirect } from 'next/navigation';
import AccountNav from '@/components/member/AccountNav';
import DaySync from '@/components/member/DaySync';
import { getMember } from '@/lib/members';
export const metadata = { title: 'My account', robots: { index: false, follow: false } };
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!getMember()) redirect('/login');
  return <div className="mx-auto max-w-6xl px-5 py-8"><DaySync /><AccountNav /><div className="mt-6">{children}</div></div>;
}
