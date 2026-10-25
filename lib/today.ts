import { cookies } from 'next/headers';
/** The visitor's own calendar day (set by <DaySync/>), falling back to the server's UTC day. */
export const todayKey = () => {
  const c = cookies().get('fw_day')?.value;
  return c && /^\d{4}-\d{2}-\d{2}$/.test(c) ? c : new Date().toISOString().slice(0, 10);
};
export const lastDays = (today: string, n: number) => Array.from({ length: n }, (_, i) => new Date(Date.parse(`${today}T00:00:00Z`) - (n - 1 - i) * 86400000).toISOString().slice(0, 10));
