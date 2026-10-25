import PasswordResetForm from '@/components/member/PasswordResetForm';

export const metadata = { title: 'Reset password', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };

export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  return <div className="px-5 py-14"><PasswordResetForm token={searchParams.token} /></div>;
}
