import Link from 'next/link';
import { ResetForm } from '@/components/member/PasswordForms';
import { resetValid } from '@/lib/members';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reset password', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  return (
    <div className="px-5 py-14">
      {resetValid(token) ? <ResetForm token={token} /> : (
        <div className="card mx-auto w-full max-w-md space-y-3 p-7 text-center sm:p-9">
          <div className="text-5xl" aria-hidden>⏰</div>
          <h1 className="text-2xl font-extrabold">This link has expired</h1>
          <p className="text-ink/75">Reset links work once and last 1 hour. Request a new one and try again.</p>
          <Link href="/forgot-password" className="btn btn-primary">Send a new link</Link>
        </div>
      )}
    </div>
  );
}
