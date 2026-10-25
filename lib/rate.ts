const buckets = new Map<string, number[]>();

/** Sliding-window limiter. Returns true when the call is allowed (and records it). */
export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= max) { buckets.set(key, recent); return false; }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some(t => now - t < windowMs)) buckets.delete(k);
  return true;
}

/** Counts only failures (used for login). */
export const fails = new Map<string, number[]>();
export function tooManyFails(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (fails.get(key) || []).filter(t => now - t < windowMs);
  fails.set(key, recent);
  return recent.length >= max;
}
export function recordFail(key: string) { fails.set(key, [...(fails.get(key) || []), Date.now()]); }
export function clearFails(key: string) { fails.delete(key); }
