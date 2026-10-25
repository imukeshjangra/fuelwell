import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { readJson, fail } from '@/lib/http';
import { approveSubmission, rejectSubmission, removeSubmission } from '@/lib/members';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const r = await readJson(req, 3000); if ('res' in r) return r.res;
  if (!isAdmin()) return fail('Not signed in', 401);
  const id = Number(r.body.id);
  if (r.body.action === 'approve') { const slug = approveSubmission(id); return slug ? NextResponse.json({ ok: true, slug }) : fail('Already approved or not found'); }
  if (r.body.action === 'reject') { rejectSubmission(id, String(r.body.note || '')); return NextResponse.json({ ok: true }); }
  if (r.body.action === 'delete') { removeSubmission(id); return NextResponse.json({ ok: true }); }
  return fail('Unknown action');
}
