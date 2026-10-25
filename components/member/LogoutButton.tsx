'use client';
import { useRouter } from 'next/navigation';
export default function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  return <button className={className} onClick={async () => { await fetch('/api/members/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }); router.push('/'); router.refresh(); }}>Sign out</button>;
}
