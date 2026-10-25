import { redirect } from 'next/navigation';
import AuthForm from '@/components/member/AuthForm';
import { getMember } from '@/lib/members';
export const metadata = { title: 'Create a free account', robots: { index: false, follow: false } };
export default function Page() { if (getMember()) redirect('/account'); return <div className="px-5 py-14"><AuthForm mode="register" /></div>; }
