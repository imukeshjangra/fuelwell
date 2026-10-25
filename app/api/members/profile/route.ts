import { NextResponse } from 'next/server';
import { readJson, fail, numIn } from '@/lib/http';
import { getMember, updateProfile } from '@/lib/members';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 2000); if ('res' in r) return r.res;
  const m = getMember(); if (!m) return fail('Please sign in', 401);
  const b = r.body;
  const age = numIn(b.age, 18, 90), cm = numIn(b.height_cm, 120, 230), gk = numIn(b.goal_kg, 30, 250);
  if (age === undefined || cm === undefined || gk === undefined) return fail('Please check your age, height and goal weight');
  const sex = b.sex === 'female' ? 'female' : b.sex === 'male' ? 'male' : '';
  const goal = ['lose', 'maintain', 'gain'].includes(String(b.goal)) ? String(b.goal) : '';
  updateProfile(m.id, { sex, age: age ?? 0, height_cm: cm ?? 0, goal, goal_kg: gk ?? 0 });
  return NextResponse.json({ ok: true });
}
