import { NextResponse } from 'next/server';
import { readJson, fail, validDay } from '@/lib/http';
import { getMember, joinChallenge, leaveChallenge, toggleCheckin } from '@/lib/members';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 1000); if ('res' in r) return r.res;
  const m = getMember(); if (!m) return fail('Please sign in', 401);
  const { action, id, day } = r.body; const cid = String(id || '');
  if (!validDay(day)) return fail('Invalid date');
  if (action === 'join') return joinChallenge(m.id, cid, day) ? NextResponse.json({ ok: true }) : fail('Unknown challenge');
  if (action === 'leave') { leaveChallenge(m.id, cid); return NextResponse.json({ ok: true }); }
  if (action === 'checkin') return toggleCheckin(m.id, cid, day) ? NextResponse.json({ ok: true }) : fail('This challenge is counted automatically from your daily log');
  return fail('Unknown action');
}
