import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { allSubmissions } from '@/lib/members';
import SubmissionsClient from './SubmissionsClient';
export const dynamic = 'force-dynamic';
export const metadata = { title: { absolute: 'Member articles | Fuelwell Admin' }, robots: { index: false, follow: false } };
export default function Page() {
  if (!isAdmin()) redirect('/admin');
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <p><a href="/admin" style={{ color: '#0B6E70', fontWeight: 700 }}>← Back to admin</a></p>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '12px 0 4px' }}>Member articles</h1>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Articles written by members. Approve to publish with the author&apos;s name, or reject with a short note.</p>
      <SubmissionsClient items={allSubmissions()} />
    </div>
  );
}
