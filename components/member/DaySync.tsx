'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
/** Remembers the visitor's local date in a cookie so "today" matches their time zone. */
export default function DaySync() {
  const router = useRouter();
  useEffect(() => {
    const d = new Date(); const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!document.cookie.includes(`fw_day=${day}`)) { document.cookie = `fw_day=${day}; path=/; max-age=172800; samesite=lax`; router.refresh(); }
  }, [router]);
  return null;
}
