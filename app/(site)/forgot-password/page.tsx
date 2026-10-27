import { redirect } from 'next/navigation';
import { ForgotForm } from '@/components/member/PasswordForms';
import { getMember } from '@/lib/members';
export const metadata = { title: 'Forgot password', robots: { index: false, follow: false } };
export default function Page() { if (getMember()) redirect('/account'); return <div className="px-5 py-14"><ForgotForm /></div>; }
