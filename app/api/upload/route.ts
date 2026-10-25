import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { isAdmin, sameOrigin } from '@/lib/auth';
import { getMember } from '@/lib/members';
import { allow } from '@/lib/rate';
const MAX_SIZE = 10_000_000; // 10 MB
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const sniff = (b: Buffer) => (b[0] === 0xff && b[1] === 0xd8 ? 'jpg' : b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' ? 'png' : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' ? 'webp' : '');
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Blocked request origin' }, { status: 403 });
  const admin = isAdmin(); const member = admin ? null : getMember();
  if (!admin && !member) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (member && !allow(`upload:${member.id}`, 20, 3600_000)) return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 });
  const f = (await req.formData()).get('file');
  if (!f || typeof f === 'string') return NextResponse.json({ error: 'No file received' }, { status: 400 });
  const ext = EXT[f.type];
  if (!ext) return NextResponse.json({ error: 'Use a JPG, PNG or WebP image' }, { status: 400 });
  if (f.size > MAX_SIZE) return NextResponse.json({ error: 'Image must be under 10 MB' }, { status: 400 });
  const buf = Buffer.from(await f.arrayBuffer());
  if (sniff(buf) !== ext) return NextResponse.json({ error: 'That file is not a real JPG, PNG or WebP image' }, { status: 400 });
  const name = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
  fs.mkdirSync('uploads', { recursive: true });
  fs.writeFileSync(path.join('uploads', name), buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}
