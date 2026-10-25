import { NextResponse } from 'next/server';
import { readJson, fail, numIn, validDay } from '@/lib/http';
import { getMember, saveLog } from '@/lib/members';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 2000); if ('res' in r) return r.res;
  const m = getMember(); if (!m) return fail('Please sign in', 401);
  const b = r.body; if (!validDay(b.day)) return fail('Invalid date');
  const weight = numIn(b.weight, 25, 300), water = numIn(b.water, 0, 40), steps = numIn(b.steps, 0, 100000), workout = numIn(b.workout, 0, 600), sleep = numIn(b.sleep, 0, 24);
  if ([weight, water, steps, workout, sleep].includes(undefined)) return fail('Please check the numbers you entered');
  const log = saveLog(m.id, b.day, {
    weight: weight as number | null, water: water == null ? null : Math.round(water), steps: steps == null ? null : Math.round(steps),
    workout: workout == null ? null : Math.round(workout), sleep: sleep as number | null,
  });
  return NextResponse.json({ ok: true, log });
}
