import Database from 'better-sqlite3';
const db = new Database('fuelwell.db');
db.pragma('busy_timeout = 5000');
db.exec(`create table if not exists posts(id integer primary key autoincrement, slug text unique, title text, excerpt text, category text, cover text default '', featured integer default 0, body text, created text default (datetime('now')));
create table if not exists messages(id integer primary key autoincrement, name text, email text, message text, created text default (datetime('now')));`);
for (const q of ["alter table posts add column status text default 'published'", "alter table posts add column views integer default 0", "alter table posts add column tags text default ''", "alter table posts add column publish_at text default ''", "alter table posts add column updated text default ''"]) { try { db.exec(q); } catch {} }
for (const q of ["alter table posts add column author_name text default ''", 'alter table posts add column author_id integer default 0']) { try { db.exec(q); } catch {} }
db.exec(`create table if not exists subscribers(id integer primary key autoincrement, email text unique, created text default (datetime('now')))`);
db.exec('create table if not exists daily(day text, post_id integer, n integer default 0, primary key(day, post_id))');
try { db.exec('alter table messages add column read integer default 0'); } catch {}
db.exec(`create table if not exists revisions(id integer primary key autoincrement, slug text, title text, excerpt text, body text, created text default (datetime('now')));
create table if not exists activity(id integer primary key autoincrement, action text, detail text, created text default (datetime('now')));
create index if not exists idx_posts_status on posts(status, publish_at);
create index if not exists idx_posts_cat on posts(category);
create index if not exists idx_rev_slug on revisions(slug, id desc);
create index if not exists idx_daily_day on daily(day);`);
db.exec(`create table if not exists categories(slug text primary key, name text not null, icon text default '', col_from text default '#0B6E70', col_to text default '#2FB5A8', blurb text default '', intro text default '', banner text default '', sort integer default 0, in_menu integer default 1, on_home integer default 1, visible integer default 1)`);
export type Post = { author_name?: string; author_id?: number; id: number; slug: string; title: string; excerpt: string; category: string; cover: string; featured: number; status: string; views: number; body: string; created: string; tags: string; publish_at: string; updated: string };
export type Msg = { id: number; name: string; email: string; message: string; created: string; read: number };
export const allPosts = () => db.prepare('select * from posts order by created desc').all() as Post[];
export const getPost = (s: string) => db.prepare('select * from posts where slug=?').get(s) as Post | undefined;
const upsertPost = (p: Omit<Post, 'id' | 'created' | 'views' | 'updated'>) =>
  db.prepare(`insert into posts(slug,title,excerpt,category,cover,featured,status,body,tags,publish_at,created) values(@slug,@title,@excerpt,@category,@cover,@featured,@status,@body,@tags,@publish_at,coalesce(nullif(@publish_at,''),datetime('now'))) on conflict(slug) do update set title=@title,excerpt=@excerpt,category=@category,cover=@cover,featured=@featured,status=@status,body=@body,tags=@tags,publish_at=@publish_at,updated=datetime('now'),created=coalesce(nullif(@publish_at,''),created)`).run(p);
export const savePost = (p: Omit<Post, 'id' | 'created' | 'views' | 'updated'>) => {
  const before = getPost(p.slug);
  const run = db.transaction(() => {
    if (before && (before.body !== p.body || before.title !== p.title || before.excerpt !== p.excerpt)) {
      db.prepare('insert into revisions(slug,title,excerpt,body) values(?,?,?,?)').run(before.slug, before.title, before.excerpt, before.body);
      db.prepare('delete from revisions where slug=? and id not in (select id from revisions where slug=? order by id desc limit 20)').run(p.slug, p.slug);
    }
    upsertPost(p);
  });
  run();
  logActivity(before ? 'edit' : 'create', p.title);
  return !before;
};
export const deletePost = (s: string) => db.prepare('delete from posts where slug=?').run(s);
export const addMessage = (m: { name: string; email: string; message: string }) => db.prepare('insert into messages(name,email,message) values(@name,@email,@message)').run(m);
export const allMessages = () => db.prepare('select * from messages order by created desc').all() as Msg[];
export const deleteMessage = (id: number) => db.prepare('delete from messages where id=?').run(id);
const LIVE = "status='published' and (publish_at is null or publish_at='' or publish_at<=datetime('now'))";
export const isLive = (p: Post) => p.status === 'published' && (!p.publish_at || p.publish_at <= new Date().toISOString().slice(0, 19).replace('T', ' '));
export const livePosts = () => db.prepare(`select * from posts where ${LIVE} order by created desc`).all() as Post[];
export const searchPosts = (q: string) => { const l = `%${q.replace(/[%_]/g, '')}%`; return db.prepare(`select * from posts where ${LIVE} and (title like ? or excerpt like ? or body like ? or tags like ?) order by created desc limit 30`).all(l, l, l, l) as Post[]; };
export const popularPosts = (n = 5, exclude = 0) => db.prepare(`select * from posts where ${LIVE} and id!=? order by views desc, created desc limit ?`).all(exclude, n) as Post[];
export const bumpViews = (id: number) => {
  db.prepare('update posts set views=views+1 where id=?').run(id);
  db.prepare("insert into daily(day,post_id,n) values(date('now'),?,1) on conflict(day,post_id) do update set n=n+1").run(id);
};
export const viewsByDay = (days = 14) => {
  const rows = db.prepare("select day, sum(n) n from daily where day>=date('now',?) group by day").all(`-${days - 1} days`) as { day: string; n: number }[];
  const m = new Map(rows.map(r => [r.day, r.n]));
  return Array.from({ length: days }, (_, i) => { const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10); return { day: d, n: m.get(d) || 0 }; });
};
export const tagSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const tagList = (p: { tags?: string }) => (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
export const allTags = () => {
  const m = new Map<string, { name: string; slug: string; n: number }>();
  for (const p of livePosts()) for (const t of tagList(p)) { const slug = tagSlug(t); const e = m.get(slug); if (e) e.n++; else m.set(slug, { name: t, slug, n: 1 }); }
  return [...m.values()].sort((a, b) => b.n - a.n);
};
export const postsByTag = (slug: string) => livePosts().filter(p => tagList(p).some(t => tagSlug(t) === slug));
export const addSubscriber = (email: string) => db.prepare('insert or ignore into subscribers(email) values(?)').run(email);
export type Sub = { id: number; email: string; created: string };
export const allSubscribers = () => db.prepare('select * from subscribers order by created desc').all() as Sub[];

export type Revision = { id: number; slug: string; title: string; excerpt: string; body: string; created: string };
export type Activity = { id: number; action: string; detail: string; created: string };
export const logActivity = (action: string, detail: string) => { try { db.prepare('insert into activity(action,detail) values(?,?)').run(action, String(detail).slice(0, 200)); db.prepare('delete from activity where id not in (select id from activity order by id desc limit 200)').run(); } catch {} };
export const recentActivity = (n = 12) => db.prepare('select * from activity order by id desc limit ?').all(n) as Activity[];
export const revisionsFor = (slug: string) => db.prepare('select id,slug,title,excerpt,created,substr(body,1,0) as body from revisions where slug=? order by id desc limit 20').all(slug) as Revision[];
export const getRevision = (id: number) => db.prepare('select * from revisions where id=?').get(id) as Revision | undefined;
export const slugTaken = (slug: string) => !!db.prepare('select 1 from posts where slug=?').get(slug);
export const bulkSetStatus = (slugs: string[], status: 'published' | 'draft') => { const st = db.prepare("update posts set status=?, updated=datetime('now') where slug=?"); db.transaction(() => slugs.forEach(s => st.run(status, s)))(); logActivity(status === 'draft' ? 'unpublish' : 'publish', `${slugs.length} article(s)`); };
export const bulkDelete = (slugs: string[]) => { const st = db.prepare('delete from posts where slug=?'); db.transaction(() => slugs.forEach(s => st.run(s)))(); logActivity('delete', `${slugs.length} article(s)`); };
export const bulkSetCategory = (slugs: string[], category: string) => { const st = db.prepare("update posts set category=?, updated=datetime('now') where slug=?"); db.transaction(() => slugs.forEach(s => st.run(category, s)))(); logActivity('move', `${slugs.length} article(s) to ${category}`); };
export const toggleFeatured = (slug: string) => { db.prepare("update posts set featured=1-featured, updated=datetime('now') where slug=?").run(slug); };
export const markMessage = (id: number, read: boolean) => db.prepare('update messages set read=? where id=?').run(read ? 1 : 0, id);
export const markAllMessagesRead = () => db.prepare('update messages set read=1 where read=0').run();
export const deleteSubscriber = (id: number) => db.prepare('delete from subscribers where id=?').run(id);
export const adminStats = () => {
  const c = (sql: string) => (db.prepare(sql).get() as { c: number }).c;
  return {
    posts: c('select count(*) c from posts'), unread: c('select count(*) c from messages where read=0'),
    subsWeek: c("select count(*) c from subscribers where created>=datetime('now','-7 days')"),
    subsPrev: c("select count(*) c from subscribers where created>=datetime('now','-14 days') and created<datetime('now','-7 days')"),
    viewsPrev7: c("select coalesce(sum(n),0) c from daily where day>=date('now','-13 days') and day<date('now','-6 days')"),
  };
};
export const categoryCounts = () => db.prepare("select category, count(*) n, coalesce(sum(views),0) v from posts group by category").all() as { category: string; n: number; v: number }[];
export const exportAll = () => ({ exported: new Date().toISOString(), posts: allPosts(), messages: allMessages(), subscribers: allSubscribers() });

// ---------- categories (editable from Admin > Categories) ----------
export type Category = { slug: string; name: string; icon: string; from: string; to: string; blurb: string; intro: string; banner: string; sort: number; menu: boolean; home: boolean; visible: boolean };
type CatRow = { slug: string; name: string; icon: string; col_from: string; col_to: string; blurb: string; intro: string; banner: string; sort: number; in_menu: number; on_home: number; visible: number };
const toCat = (r: CatRow): Category => ({ slug: r.slug, name: r.name, icon: r.icon, from: r.col_from, to: r.col_to, blurb: r.blurb, intro: r.intro, banner: r.banner, sort: r.sort, menu: !!r.in_menu, home: !!r.on_home, visible: !!r.visible });
let catCache: Category[] | null = null;
export const allCategories = (): Category[] => catCache ?? (catCache = (db.prepare('select * from categories order by sort, name').all() as CatRow[]).map(toCat));
export const saveCategory = (c: Omit<Category, 'sort'>, oldSlug = '') => {
  db.transaction(() => {
    const exists = oldSlug ? db.prepare('select 1 from categories where slug=?').get(oldSlug) : null;
    const v = { ...c, from: c.from, to: c.to, menu: c.menu ? 1 : 0, home: c.home ? 1 : 0, visible: c.visible ? 1 : 0 };
    if (exists) {
      if (oldSlug !== c.slug) db.prepare('update posts set category=? where category=?').run(c.slug, oldSlug);
      db.prepare('update categories set slug=@slug,name=@name,icon=@icon,col_from=@from,col_to=@to,blurb=@blurb,intro=@intro,banner=@banner,in_menu=@menu,on_home=@home,visible=@visible where slug=@old').run({ ...v, old: oldSlug });
    } else {
      const next = ((db.prepare('select coalesce(max(sort),0)+1 n from categories').get() as { n: number }).n);
      db.prepare('insert into categories(slug,name,icon,col_from,col_to,blurb,intro,banner,sort,in_menu,on_home,visible) values(@slug,@name,@icon,@from,@to,@blurb,@intro,@banner,@sort,@menu,@home,@visible)').run({ ...v, sort: next });
    }
  })();
  catCache = null;
  logActivity(oldSlug ? 'category-edit' : 'category-add', c.name);
};
export const categorySlugTaken = (slug: string) => !!db.prepare('select 1 from categories where slug=?').get(slug);
export const postsInCategory = (slug: string) => (db.prepare('select count(*) c from posts where category=?').get(slug) as { c: number }).c;
export const deleteCategory = (slug: string, moveTo = '') => {
  const name = allCategories().find(c => c.slug === slug)?.name || slug;
  db.transaction(() => {
    if (moveTo) db.prepare('update posts set category=? where category=?').run(moveTo, slug);
    db.prepare('delete from categories where slug=?').run(slug);
  })();
  catCache = null;
  logActivity('category-delete', name);
};
export const reorderCategories = (slugs: string[]) => {
  const st = db.prepare('update categories set sort=? where slug=?');
  db.transaction(() => slugs.forEach((s, i) => st.run(i + 1, s)))();
  catCache = null;
};
const SEED_CATS: Omit<Category, 'sort'>[] = [
  { slug: 'weight-loss', name: 'Weight Loss', icon: '🔥', from: '#0B6E70', to: '#2FB5A8', blurb: 'Sustainable fat loss: food, habits and training without crash diets.', intro: '', banner: '', menu: true, home: true, visible: true },
  { slug: 'weight-gain', name: 'Weight Gain', icon: '💪', from: '#E8590C', to: '#FFB347', blurb: 'Gain weight and muscle the healthy way, with meals and plans that work.', intro: '', banner: '', menu: true, home: true, visible: true },
  { slug: 'nutrition', name: 'Nutrition', icon: '🥗', from: '#2B5C8A', to: '#6FA8DC', blurb: 'Protein, calories and food choices explained simply.', intro: '', banner: '', menu: true, home: true, visible: true },
  { slug: 'workouts', name: 'Workouts', icon: '🏋️', from: '#5B3FA0', to: '#A084DC', blurb: 'Beginner-friendly routines for home and gym.', intro: '', banner: '', menu: true, home: true, visible: true },
];
if ((db.prepare('select count(*) c from categories').get() as { c: number }).c === 0) {
  const ins = db.prepare('insert into categories(slug,name,icon,col_from,col_to,blurb,intro,banner,sort,in_menu,on_home,visible) values(?,?,?,?,?,?,?,?,?,1,1,1)');
  SEED_CATS.forEach((c, i) => ins.run(c.slug, c.name, c.icon, c.from, c.to, c.blurb, c.intro, c.banner, i + 1));
}

const DISC = '\n\n> This article is general information, not medical advice. Check with a doctor or dietitian if you have a health condition.';
// [slug, category, featured, title, excerpt, body]
const demo: [string, string, number, string, string, string][] = [
['lose-weight-without-crash-diets', 'weight-loss', 1, 'How to lose weight without crash diets', 'A calm, practical plan: a small calorie gap, enough protein and habits you can keep.',
 'Crash diets work for a few weeks and then fall apart. A steady approach lasts longer.\n\nThe core idea is a modest calorie gap that you can live with for months, not days.\n\n## Four habits to start with\n\n- Eat protein at every meal\n- Walk daily and add strength training twice a week\n- Sleep seven to eight hours\n- Weigh yourself weekly and look at the trend, not one day\n\n## Keep it simple\n\nChange one habit at a time. When it feels automatic, add the next one.' + DISC],
['protein-while-cutting', 'weight-loss', 1, 'Eating enough protein while losing weight', 'Why protein helps you feel full and keep muscle when calories are lower.',
 'When you eat fewer calories, your body can lose muscle along with fat.\n\nEating enough protein and lifting weights helps you keep the muscle you have.\n\n## Easy ways to add protein\n\n- Eggs or paneer at breakfast\n- Dal, curd and sprouts through the day\n- A palm-sized portion of chicken, fish or tofu at dinner\n\n## How much?\n\nUse our protein calculator to get a daily range for your weight and height.' + DISC],
['why-weight-loss-stalls', 'weight-loss', 0, 'Why your weight loss stalls and what to check', 'Plateaus are normal. Here is what to review before you change everything.',
 'Weight naturally moves up and down by a kilo or more from day to day.\n\nBefore you cut more food, check the basics.\n\n## Quick checklist\n\n- Are you still tracking portions honestly?\n- Has your daily step count dropped?\n- Are you sleeping enough?\n- Has it been at least two to three weeks?\n\n## What to do\n\nIf all of that looks fine, make one small change, such as ten more minutes of walking each day.' + DISC],
['gain-weight-the-healthy-way', 'weight-gain', 1, 'How to gain weight the healthy way', 'A step-by-step approach for people who struggle to eat enough.',
 'Gaining weight is about eating a little more than you burn, consistently.\n\nMost people who find it hard are simply not eating often enough.\n\n## Practical steps\n\n- Eat three meals and two or three snacks\n- Add healthy fats such as nuts, ghee, olive oil and peanut butter\n- Drink calories with milk, smoothies or lassi\n- Lift weights so the gain is muscle, not only fat\n\n## Be patient\n\nAim for a slow, steady rise of about half a kilo a week at most.' + DISC],
['high-calorie-meals-not-junk', 'weight-gain', 0, 'Easy high-calorie meals that are not junk', 'Simple meals that add calories and nutrients together.',
 'You do not need fast food to eat more. Small changes make normal meals denser.\n\nThe goal is more energy and protein in the same plate.\n\n## Ideas\n\n- Paratha or roti with ghee and paneer or egg\n- Banana, oats, milk and peanut butter smoothie\n- Rice with dal, curd and a side of nuts\n\n## Tip\n\nEat even when you are not very hungry, and set phone reminders for snacks.' + DISC],
['muscle-gain-vs-fat-gain', 'weight-gain', 0, 'Muscle gain vs fat gain: what is the difference?', 'How training, protein and calories decide what the extra weight is made of.',
 'The scale cannot tell muscle from fat.\n\nWhat decides it is how you train and how big your calorie surplus is.\n\n## What helps build muscle\n\n- Progressive strength training\n- Enough protein every day\n- A small surplus rather than a huge one\n\n## Track it\n\nTake photos and measurements monthly, along with your weight.' + DISC],
['vegetarian-protein-sources', 'nutrition', 1, 'Best protein sources for vegetarians', 'Everyday vegetarian foods that help you reach your daily protein.',
 'Vegetarians can reach their protein needs with planning.\n\nMix a few sources across the day instead of relying on one.\n\n## Good options\n\n- Paneer, curd, milk and whey if you use it\n- Dal, chana, rajma and soy\n- Tofu, tempeh and sprouts\n- Nuts and seeds as snacks\n\n## Tip\n\nCombine pulses with grains, such as dal with rice, for a wider range of amino acids.' + DISC],
['three-day-full-body-routine', 'workouts', 1, 'A simple 3-day full-body workout routine', 'Three sessions a week that suit beginners and fit a busy schedule.',
 'You do not need six days a week to see progress.\n\nThree full-body sessions are enough for most beginners.\n\n## The plan\n\n- Squat or leg press, three sets of ten\n- Push-ups or bench press, three sets of ten\n- Rows or lat pulldown, three sets of ten\n- Plank, three rounds of thirty seconds\n\n## Progress\n\nAdd a little weight or one more rep each week, and rest a day between sessions.' + DISC],
];
const demoTags: Record<string, string> = {
  'lose-weight-without-crash-diets': 'fat loss, habits, beginners', 'protein-while-cutting': 'protein, fat loss, indian diet',
  'why-weight-loss-stalls': 'plateau, fat loss, habits', 'gain-weight-the-healthy-way': 'weight gain, meals, beginners',
  'high-calorie-meals-not-junk': 'weight gain, meals, indian diet', 'muscle-gain-vs-fat-gain': 'muscle, weight gain, strength training',
  'vegetarian-protein-sources': 'protein, vegetarian, indian diet', 'three-day-full-body-routine': 'strength training, beginners, home workout' };
const seed = db.prepare("insert or ignore into posts(slug,category,featured,title,excerpt,body,created) values(?,?,?,?,?,?,datetime('now', ?))");
if ((db.prepare('select count(*) c from posts').get() as { c: number }).c === 0)
  demo.forEach((d, i) => seed.run(d[0], d[1], d[2], d[3], d[4], d[5], `-${i} days`));

for (const [slug, t] of Object.entries(demoTags)) db.prepare("update posts set tags=? where slug=? and (tags is null or tags='')").run(t, slug);

/** Raw handle for the member features (lib/members.ts). */
export const rawDb = db;
