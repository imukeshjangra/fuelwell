import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { rawDb as db, savePost, slugTaken, logActivity } from './db';
import { getChallenge, type ChallengeKind } from './challenges';

db.exec(`create table if not exists users(id integer primary key autoincrement, name text not null, email text unique not null, pass text not null, created text default (datetime('now')), sex text default '', age integer default 0, height_cm real default 0, goal text default '', goal_kg real default 0);
create table if not exists health_logs(user_id integer, day text, weight real, water integer, steps integer, workout integer, sleep real, primary key(user_id, day));
create table if not exists user_challenges(user_id integer, cid text, start text, done integer default 0, primary key(user_id, cid));
create table if not exists checkins(user_id integer, cid text, day text, primary key(user_id, cid, day));
create table if not exists submissions(id integer primary key autoincrement, user_id integer, title text, excerpt text, category text, cover text default '', tags text default '', body text, status text default 'pending', note text default '', slug text default '', created text default (datetime('now')), updated text default (datetime('now')));
create index if not exists idx_sub_status on submissions(status);
create table if not exists pw_resets(token_hash text primary key, user_id integer not null, expires integer not null, used integer default 0);`);
try { db.exec('alter table users add column pw_changed integer default 0'); } catch {}

// ---------- accounts and sessions ----------
export type Member = { id: number; name: string; email: string; created: string; sex: string; age: number; height_cm: number; goal: string; goal_kg: number };
export const MEMBER_COOKIE = 'fw_user';
export const MEMBER_SECONDS = 60 * 60 * 24 * 30;
const secret = () => `${process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'dev'}::member`;
const sig = (s: string) => crypto.createHmac('sha256', secret()).update(s).digest('hex');

export const hashPassword = (pw: string) => { const salt = crypto.randomBytes(16).toString('hex'); return `${salt}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`; };
export const checkPassword = (pw: string, stored: string) => {
  const [salt, hash] = stored.split(':'); if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex'), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
export const makeMemberToken = (id: number) => {
  const body = `${id}.${Math.floor(Date.now() / 1000) + MEMBER_SECONDS}.${crypto.randomBytes(6).toString('hex')}`;
  return `${body}.${sig(body)}`;
};
export function memberIdFromToken(t?: string | null) {
  if (!t) return 0;
  const p = t.split('.'); if (p.length !== 4) return 0;
  const [id, exp, nonce, s] = p;
  if (!/^\d+$/.test(id) || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return 0;
  const a = Buffer.from(s), b = Buffer.from(sig(`${id}.${exp}.${nonce}`));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? Number(id) : 0;
}
const COLS = 'id,name,email,created,sex,age,height_cm,goal,goal_kg';
export const getMember = (): Member | null => {
  const tok = cookies().get(MEMBER_COOKIE)?.value;
  const id = memberIdFromToken(tok);
  if (!id) return null;
  const u = db.prepare(`select ${COLS}, pw_changed from users where id=?`).get(id) as (Member & { pw_changed: number }) | undefined;
  if (!u) return null;
  const issued = Number(tok!.split('.')[1]) - MEMBER_SECONDS; // sessions made before a password change stop working
  if (issued < (u.pw_changed || 0)) return null;
  const { pw_changed: _omit, ...member } = u; void _omit;
  return member;
};
/** For pages that need a signed-in member. Pages render in parallel with their layout, so each page must redirect on its own. */
export function requireMember(): Member { const m = getMember(); if (!m) redirect('/login'); return m; }
export const memberByEmail = (email: string) => db.prepare('select * from users where email=?').get(email) as (Member & { pass: string }) | undefined;
export const createMember = (name: string, email: string, password: string) =>
  Number(db.prepare('insert into users(name,email,pass) values(?,?,?)').run(name, email, hashPassword(password)).lastInsertRowid);
export const updateProfile = (id: number, p: { sex: string; age: number; height_cm: number; goal: string; goal_kg: number }) =>
  db.prepare('update users set sex=?, age=?, height_cm=?, goal=?, goal_kg=? where id=?').run(p.sex, p.age, p.height_cm, p.goal, p.goal_kg, id);
export const memberCount = () => (db.prepare('select count(*) c from users').get() as { c: number }).c;

// ---------- health log ----------
export type Log = { day: string; weight: number | null; water: number | null; steps: number | null; workout: number | null; sleep: number | null };
export const logsFor = (uid: number, days = 30) => db.prepare("select day,weight,water,steps,workout,sleep from health_logs where user_id=? and day>=date('now',?) order by day").all(uid, `-${days + 1} days`) as Log[];
export const logOn = (uid: number, day: string) => db.prepare('select day,weight,water,steps,workout,sleep from health_logs where user_id=? and day=?').get(uid, day) as Log | undefined;

export function saveLog(uid: number, day: string, v: Partial<Omit<Log, 'day'>>) {
  const cur = (logOn(uid, day) || {}) as Partial<Log>;
  const m = { weight: v.weight ?? cur.weight ?? null, water: v.water ?? cur.water ?? null, steps: v.steps ?? cur.steps ?? null, workout: v.workout ?? cur.workout ?? null, sleep: v.sleep ?? cur.sleep ?? null };
  db.transaction(() => {
    db.prepare('insert into health_logs(user_id,day,weight,water,steps,workout,sleep) values(?,?,?,?,?,?,?) on conflict(user_id,day) do update set weight=excluded.weight, water=excluded.water, steps=excluded.steps, workout=excluded.workout, sleep=excluded.sleep').run(uid, day, m.weight, m.water, m.steps, m.workout, m.sleep);
    autoCheckins(uid, day, m);
  })();
  return m;
}

// ---------- challenges ----------
type Joined = { cid: string; start: string; done: number };
const refreshDone = (uid: number, cid: string) => {
  const ch = getChallenge(cid); const j = db.prepare('select start from user_challenges where user_id=? and cid=?').get(uid, cid) as { start: string } | undefined;
  if (!ch || !j) return;
  const n = (db.prepare('select count(*) c from checkins where user_id=? and cid=? and day>=?').get(uid, cid, j.start) as { c: number }).c;
  db.prepare('update user_challenges set done=? where user_id=? and cid=?').run(n >= ch.days ? 1 : 0, uid, cid);
};
function autoCheckins(uid: number, day: string, m: Record<string, number | null>) {
  const rows = db.prepare('select cid,start from user_challenges where user_id=?').all(uid) as Joined[];
  for (const r of rows) {
    const ch = getChallenge(r.cid); if (!ch || ch.rule.kind === 'manual' || day < r.start) continue;
    const val = m[ch.rule.kind as Exclude<ChallengeKind, 'manual'>];
    if (val != null && val >= ch.rule.target) db.prepare('insert or ignore into checkins(user_id,cid,day) values(?,?,?)').run(uid, r.cid, day);
    else db.prepare('delete from checkins where user_id=? and cid=? and day=?').run(uid, r.cid, day);
    refreshDone(uid, r.cid);
  }
}
export const joinChallenge = (uid: number, cid: string, day: string) => {
  if (!getChallenge(cid)) return false;
  db.transaction(() => {
    db.prepare('delete from checkins where user_id=? and cid=?').run(uid, cid);
    db.prepare('insert into user_challenges(user_id,cid,start,done) values(?,?,?,0) on conflict(user_id,cid) do update set start=excluded.start, done=0').run(uid, cid, day);
    const l = logOn(uid, day); if (l) autoCheckins(uid, day, l as unknown as Record<string, number | null>);
  })();
  return true;
};
export const leaveChallenge = (uid: number, cid: string) => { db.prepare('delete from user_challenges where user_id=? and cid=?').run(uid, cid); db.prepare('delete from checkins where user_id=? and cid=?').run(uid, cid); };
export const toggleCheckin = (uid: number, cid: string, day: string) => {
  const ch = getChallenge(cid); const j = db.prepare('select start from user_challenges where user_id=? and cid=?').get(uid, cid) as { start: string } | undefined;
  if (!ch || !j || ch.rule.kind !== 'manual' || day < j.start) return false;
  const has = db.prepare('select 1 from checkins where user_id=? and cid=? and day=?').get(uid, cid, day);
  if (has) db.prepare('delete from checkins where user_id=? and cid=? and day=?').run(uid, cid, day);
  else db.prepare('insert into checkins(user_id,cid,day) values(?,?,?)').run(uid, cid, day);
  refreshDone(uid, cid);
  return true;
};
const dayMinus = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) - n * 86400000).toISOString().slice(0, 10);
export type MyChallenge = { id: string; start: string; done: boolean; count: number; streak: number; today: boolean; days: string[] };
export function myChallenges(uid: number, today: string): MyChallenge[] {
  const rows = db.prepare('select cid,start,done from user_challenges where user_id=? order by start desc').all(uid) as Joined[];
  return rows.map(r => {
    const days = (db.prepare('select day from checkins where user_id=? and cid=? and day>=? order by day').all(uid, r.cid, r.start) as { day: string }[]).map(x => x.day);
    const set = new Set(days); const t = set.has(today);
    let streak = 0; let d = t ? today : dayMinus(today, 1);
    while (set.has(d)) { streak++; d = dayMinus(d, 1); }
    return { id: r.cid, start: r.start, done: !!r.done, count: days.length, streak, today: t, days };
  });
}
export const challengePoints = (uid: number) => (db.prepare('select count(*) c from checkins where user_id=?').get(uid) as { c: number }).c;

// ---------- member articles (moderated) ----------
export type Submission = { id: number; user_id: number; title: string; excerpt: string; category: string; cover: string; tags: string; body: string; status: 'pending' | 'approved' | 'rejected'; note: string; slug: string; created: string; updated: string; author?: string };
/** Member text is Markdown only: raw HTML and script-style links are neutralised. */
export const cleanBody = (s: string) => s.replace(/</g, '&lt;').replace(/\]\(\s*(javascript|data|vbscript):/gi, '](#');
export const mySubmissions = (uid: number) => db.prepare('select * from submissions where user_id=? order by id desc').all(uid) as Submission[];
export const getSubmission = (id: number) => db.prepare('select s.*, u.name author from submissions s left join users u on u.id=s.user_id where s.id=?').get(id) as Submission | undefined;
export const pendingCount = () => (db.prepare("select count(*) c from submissions where status='pending'").get() as { c: number }).c;
export const allSubmissions = () => db.prepare('select s.*, u.name author from submissions s left join users u on u.id=s.user_id order by (s.status=\'pending\') desc, s.id desc limit 200').all() as Submission[];
type SubIn = { title: string; excerpt: string; category: string; cover: string; tags: string; body: string };
export const saveSubmission = (uid: number, v: SubIn, id = 0) => {
  if (id) { db.prepare("update submissions set title=?,excerpt=?,category=?,cover=?,tags=?,body=?,status='pending',note='',updated=datetime('now') where id=? and user_id=? and status!='approved'").run(v.title, v.excerpt, v.category, v.cover, v.tags, v.body, id, uid); return id; }
  return Number(db.prepare('insert into submissions(user_id,title,excerpt,category,cover,tags,body) values(?,?,?,?,?,?,?)').run(uid, v.title, v.excerpt, v.category, v.cover, v.tags, v.body).lastInsertRowid);
};
export const deleteOwnSubmission = (uid: number, id: number) => db.prepare("delete from submissions where id=? and user_id=? and status!='approved'").run(id, uid);
export const countRecentSubmissions = (uid: number) => (db.prepare("select count(*) c from submissions where user_id=? and created>=datetime('now','-1 day')").get(uid) as { c: number }).c;
export const pendingOf = (uid: number) => (db.prepare("select count(*) c from submissions where user_id=? and status='pending'").get(uid) as { c: number }).c;

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '') || 'article';
export function approveSubmission(id: number) {
  const s = getSubmission(id); if (!s || s.status === 'approved') return null;
  let slug = slugify(s.title); if (slugTaken(slug)) slug = `${slug}-${crypto.randomBytes(2).toString('hex')}`;
  savePost({ slug, title: s.title, excerpt: s.excerpt, category: s.category, cover: s.cover, featured: 0, status: 'published', body: s.body, tags: s.tags, publish_at: '' });
  db.prepare('update posts set author_name=?, author_id=? where slug=?').run(s.author || 'Fuelwell member', s.user_id, slug);
  db.prepare("update submissions set status='approved', slug=?, note='', updated=datetime('now') where id=?").run(slug, id);
  logActivity('member-post-approved', s.title);
  return slug;
}
export const rejectSubmission = (id: number, note: string) => { db.prepare("update submissions set status='rejected', note=?, updated=datetime('now') where id=? and status!='approved'").run(note.slice(0, 500), id); logActivity('member-post-rejected', String(id)); };
export const removeSubmission = (id: number) => db.prepare('delete from submissions where id=?').run(id);

// ---------- password reset ----------
const RESET_MINUTES = 60;
const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
/** Creates a one-time reset token (only its hash is stored). Older unused tokens for the user are removed. */
export function createReset(userId: number) {
  const token = crypto.randomBytes(32).toString('hex'); const now = Math.floor(Date.now() / 1000);
  db.prepare('delete from pw_resets where user_id=? or expires<?').run(userId, now);
  db.prepare('insert into pw_resets(token_hash,user_id,expires) values(?,?,?)').run(sha(token), userId, now + RESET_MINUTES * 60);
  return token;
}
export const resetValid = (token: string) => /^[a-f0-9]{64}$/.test(token) && !!db.prepare('select 1 from pw_resets where token_hash=? and used=0 and expires>?').get(sha(token), Math.floor(Date.now() / 1000));
/** Sets a new password if the token is valid, then burns the token. Returns the user id or 0. */
export function useReset(token: string, newPassword: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return 0;
  const now = Math.floor(Date.now() / 1000);
  return db.transaction(() => {
    const r = db.prepare('select user_id from pw_resets where token_hash=? and used=0 and expires>?').get(sha(token), now) as { user_id: number } | undefined;
    if (!r) return 0;
    db.prepare('update users set pass=?, pw_changed=? where id=?').run(hashPassword(newPassword), now, r.user_id);
    db.prepare('delete from pw_resets where user_id=?').run(r.user_id);
    return r.user_id;
  })();
}
