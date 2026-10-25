import { redirect } from 'next/navigation';
import AuthForm from '@/components/member/AuthForm';
import { getMember } from '@/lib/members';
export const metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export default function Page({ searchParams }: { searchParams: { passwordReset?: string } }) { if (getMember()) redirect('/account'); return <div className="px-5 py-14"><AuthForm mode="login" passwordReset={searchParams.passwordReset === '1'} /></div>; }
