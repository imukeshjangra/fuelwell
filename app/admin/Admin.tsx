'use client';
import './admin.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import type { Post, Msg, Sub, Activity } from '@/lib/db';
import type { Category } from '@/lib/db';
import Categories from './Categories';
import { Ic, Counter, Delta, AreaChart, ScoreRing } from './ui';
import Login from './Login';

type Stats = { posts: number; unread: number; subsWeek: number; subsPrev: number; viewsPrev7: number };
type CatStat = { category: string; n: number; v: number };
type Props = { authed: boolean; categories: Category[]; posts: Post[]; messages: Msg[]; subs: Sub[]; daily: { day: string; n: number }[]; activity: Activity[]; stats: Stats; cats: CatStat[] };
type Form = { slug: string; title: string; excerpt: string; category: string; cover: string; featured: boolean; status: string; body: string; tags: string; publish_at: string };
type View = 'dashboard' | 'articles' | 'categories' | 'editor' | 'messages' | 'subscribers' | 'activity';
type Mode = 'write' | 'split' | 'preview';
type ToastT = { id: number; kind: 'ok' | 'err'; text: string };
type ConfirmT = { title: string; body: string; label: string; danger?: boolean; run: () => void | Promise<void> };
type Rev = { id: number; title: string; excerpt?: string; body?: string; created: string };
type J = { error?: string; created?: boolean; revisions?: Rev[]; revision?: Rev; url?: string };
type PalItem = { id: string; label: string; hint?: string; icon: string; run: () => void };

const empty: Form = { slug: '', title: '', excerpt: '', category: 'weight-loss', cover: '', featured: false, status: 'published', body: '', tags: '', publish_at: '' };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
const p2 = (n: number) => String(n).padStart(2, '0');
const toLocal = (u: string) => { if (!u) return ''; const d = new Date(u.replace(' ', 'T') + 'Z'); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const toUtc = (l: string) => (l ? new Date(l).toISOString().slice(0, 19).replace('T', ' ') : '');
const nowUtc = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const stateOf = (p: { status: string; publish_at: string }) => (p.status === 'draft' ? 'Draft' : p.publish_at && p.publish_at > nowUtc() ? 'Scheduled' : 'Published');
const ago = (u: string) => {
  const t = new Date(u.replace(' ', 'T') + 'Z').getTime(); if (!t) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)} min ago`; if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`; return u.slice(0, 10);
};
const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const hue = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const ACT: Record<string, [string, string, string]> = {
  create: ['Created', 'pen', 'good'], edit: ['Edited', 'pen', 'brand'], delete: ['Deleted', 'trash', 'bad'], publish: ['Published', 'globe', 'good'],
  unpublish: ['Moved to draft', 'doc', ''], login: ['Signed in from', 'shield', 'brand'], 'login-failed': ['Failed sign-in from', 'alert', 'bad'],
  backup: ['Downloaded backup', 'download', 'brand'], 'category-add': ['Added category', 'tag', 'good'], 'category-edit': ['Edited category', 'tag', 'brand'], 'category-delete': ['Deleted category', 'trash', 'bad'], move: ['Moved', 'columns', ''], feature: ['Featured changed for', 'star', ''],
};
const CHECK = ['Publish 2 to 3 articles every week', 'Fill the summary and 3+ tags on every article', 'Add a cover image to each article', 'Share each new article on WhatsApp, X and Facebook', 'Submit your sitemap.xml in Google Search Console'];

export default function Admin(props: Props) {
  const router = useRouter();
  if (!props.authed) return <Login onDone={() => router.refresh()} />;
  return <Panel {...props} />;
}

function Panel({ posts, messages, subs, daily, activity, stats, cats, categories }: Props) {
  const router = useRouter();
  const catOf = (slug: string) => categories.find(c => c.slug === slug);
  const emptyForm: Form = { ...empty, category: categories[0]?.slug || empty.category };
  const [view, setView] = useState<View>('dashboard');
  const [form, setForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [mode, setMode] = useState<Mode>('write');
  const [snapshot, setSnapshot] = useState(JSON.stringify(emptyForm));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverOver, setCoverOver] = useState(false);
  const [lastBackup, setLastBackup] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort] = useState('new');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [confirmBox, setConfirmBox] = useState<ConfirmT | null>(null);
  const [palOpen, setPalOpen] = useState(false);
  const [palQ, setPalQ] = useState('');
  const [palIdx, setPalIdx] = useState(0);
  const [hist, setHist] = useState<{ open: boolean; loading: boolean; items: Rev[]; pick: Rev | null }>({ open: false, loading: false, items: [], pick: null });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [hello, setHello] = useState('Welcome back');
  const [site, setSite] = useState('');
  const [isMac, setIsMac] = useState(false);
  const [openMsg, setOpenMsg] = useState<number | null>(null);
  const [msgFilter, setMsgFilter] = useState('all');
  const [readOv, setReadOv] = useState<Record<number, boolean>>({});
  const [subQ, setSubQ] = useState('');
  const [checks, setChecks] = useState<boolean[]>(CHECK.map(() => false));
  const ta = useRef<HTMLTextAreaElement>(null);
  const toastId = useRef(0);

  const dirty = JSON.stringify(form) !== snapshot;
  const hasContent = !!(form.title || form.body);

  // ---------- helpers ----------
  const toast = (kind: 'ok' | 'err', text: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  };
  const when = (u: string) => (mounted ? ago(u) : u.slice(0, 10));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  async function api(url: string, init: RequestInit = {}): Promise<{ ok: boolean; j: J }> {
    try {
      const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
      const r = await fetch(url, { ...init, headers: init.body && !isForm ? { 'Content-Type': 'application/json' } : undefined });
      const j = (await r.json().catch(() => ({}))) as J;
      if (r.status === 401) { toast('err', 'Your session ended. Sign in again.'); router.refresh(); }
      return { ok: r.ok, j };
    } catch { toast('err', 'Cannot reach the server. Check your connection.'); return { ok: false, j: {} }; }
  }
  const ask = (c: ConfirmT) => setConfirmBox(c);

  // ---------- effects ----------
  useEffect(() => {
    setMounted(true);
    setSite(window.location.host);
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const h = new Date().getHours(); setHello(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    try {
      setDraftSaved(!!localStorage.getItem('fw_draft'));
      const t = localStorage.getItem('fw_theme'); if (t === 'dark' || t === 'light') setTheme(t);
      const c = JSON.parse(localStorage.getItem('fw_check') || '[]'); if (Array.isArray(c)) setChecks(CHECK.map((_, i) => !!c[i]));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem('fw_theme', theme); } catch {} }, [theme]);
  useEffect(() => {
    if (view === 'editor' && hasContent) {
      const t = setTimeout(() => { try { localStorage.setItem('fw_draft', JSON.stringify({ form, editing })); const d = new Date(); setLastBackup(`${p2(d.getHours())}:${p2(d.getMinutes())}`); } catch {} }, 800);
      return () => clearTimeout(t);
    }
  }, [form, editing, view, hasContent]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty && hasContent) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, hasContent]);
  useEffect(() => { setSel(s => { const keep = new Set([...s].filter(x => posts.some(p => p.slug === x))); return keep.size === s.size ? s : keep; }); }, [posts]);

  const keyRef = useRef<(e: KeyboardEvent) => void>();
  keyRef.current = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalQ(''); setPalIdx(0); setPalOpen(o => !o); }
    else if (mod && e.key.toLowerCase() === 's' && view === 'editor') { e.preventDefault(); save(); }
    else if (e.key === 'Escape') { setPalOpen(false); setConfirmBox(null); setHist(h => ({ ...h, open: false })); }
  };
  useEffect(() => { const f = (e: KeyboardEvent) => keyRef.current?.(e); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, []);

  // ---------- derived ----------
  const live = posts.filter(p => stateOf(p) === 'Published');
  const total = posts.reduce((a, p) => a + (p.views || 0), 0);
  const week = daily.slice(-7).reduce((a, d) => a + d.n, 0);
  const fortnight = daily.reduce((a, d) => a + d.n, 0);
  const top = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const maxViews = Math.max(1, ...posts.map(p => p.views || 0));
  const counts = { All: posts.length, Published: live.length, Scheduled: posts.filter(p => stateOf(p) === 'Scheduled').length, Draft: posts.filter(p => p.status === 'draft').length } as Record<string, number>;
  const shown = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const r = posts.filter(p => (filter === 'All' || stateOf(p) === filter) && (catFilter === 'all' || p.category === catFilter) && (!ql || p.title.toLowerCase().includes(ql) || p.slug.includes(ql) || (p.tags || '').toLowerCase().includes(ql)));
    return r.sort((a, b) => sort === 'views' ? (b.views || 0) - (a.views || 0) : sort === 'title' ? a.title.localeCompare(b.title) : sort === 'updated' ? (b.updated || b.created).localeCompare(a.updated || a.created) : b.created.localeCompare(a.created));
  }, [posts, q, filter, catFilter, sort]);
  const isRead = (m: Msg) => (m.id in readOv ? readOv[m.id] : !!m.read);
  const unread = messages.filter(m => !isRead(m)).length;
  const html = useMemo(() => (mode === 'write' ? '' : (marked.parse(form.body || '*Nothing to preview yet.*', { async: false }) as string)), [mode, form.body]);
  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;
  const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
  const titleLen = form.title.length, exLen = form.excerpt.length;
  const slugClash = !editing && !!form.slug && posts.some(p => p.slug === form.slug);

  const seo = useMemo(() => {
    const h2 = (form.body.match(/^##\s+\S/gm) || []).length;
    const badAlt = /!\[\s*\]\(|!\[Describe this image\]/.test(form.body);
    const items: [boolean, string][] = [
      [titleLen >= 30 && titleLen <= 60, 'Title is 30 to 60 characters'],
      [exLen >= 110 && exLen <= 160, 'Summary is 110 to 160 characters'],
      [!!form.cover, 'Cover image added'],
      [tagList.length >= 3, 'At least 3 tags'],
      [words >= 300, 'At least 300 words'],
      [h2 >= 2, 'Two or more subheadings (H2)'],
      [!badAlt, 'Every image has a description'],
      [!!form.slug && form.slug.length <= 60, 'Short web address (60 characters or fewer)'],
    ];
    return { items, score: Math.round((items.filter(i => i[0]).length / items.length) * 100) };
  }, [form.body, form.cover, form.slug, titleLen, exLen, tagList.length, words]);

  // ---------- navigation ----------
  function go(v: View) { setView(v); window.scrollTo({ top: 0 }); }
  function newArticle() { setForm(emptyForm); setSnapshot(JSON.stringify(emptyForm)); setEditing(''); setSlugTouched(false); setMode('write'); setLastBackup(''); go('editor'); }
  function openEditor() { if (editing || (hasContent && dirty)) go('editor'); else newArticle(); }
  function edit(p: Post) {
    const f: Form = { slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, cover: p.cover, featured: !!p.featured, status: p.status || 'published', body: p.body, tags: p.tags || '', publish_at: toLocal(p.publish_at) };
    setForm(f); setSnapshot(JSON.stringify(f)); setEditing(p.slug); setSlugTouched(true); setMode('write'); setLastBackup(''); go('editor');
  }
  function duplicate(p: Post) {
    const f: Form = { slug: `${p.slug}-copy`.slice(0, 100), title: `Copy of ${p.title}`, excerpt: p.excerpt, category: p.category, cover: p.cover, featured: false, status: 'draft', body: p.body, tags: p.tags || '', publish_at: '' };
    setForm(f); setSnapshot(JSON.stringify(emptyForm)); setEditing(''); setSlugTouched(true); setMode('write'); go('editor'); toast('ok', 'Copied as a draft. Edit it and save.');
  }
  function restoreDraft() {
    try { const d = JSON.parse(localStorage.getItem('fw_draft') || ''); setForm(d.form); setSnapshot(JSON.stringify(emptyForm)); setEditing(d.editing || ''); setSlugTouched(true); go('editor'); } catch { toast('err', 'Could not restore the draft'); }
  }

  // ---------- editor actions ----------
  const upload = async (file?: File | null) => {
    if (!file) return null;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const { ok, j } = await api('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!ok) { toast('err', j.error || 'Upload failed'); return null; }
    return j.url as string;
  };
  async function addCover(file?: File | null) { const u = await upload(file); if (u) { set('cover', u); toast('ok', 'Cover added. Save to keep it.'); } }
  async function addInline(file?: File | null) { const u = await upload(file); if (u) insert(`\n\n![Describe this image](${u})\n`); }
  function insert(text: string) { const el = ta.current; const s = el ? el.selectionStart : form.body.length; setForm(f => ({ ...f, body: f.body.slice(0, s) + text + f.body.slice(s) })); }
  function wrap(a: string, b = '', ph = 'text') {
    const el = ta.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd, sel0 = form.body.slice(s, e) || ph;
    set('body', form.body.slice(0, s) + a + sel0 + b + form.body.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + a.length, s + a.length + sel0.length); });
  }
  function line(prefix: string) {
    const el = ta.current; if (!el) return;
    const s = el.selectionStart, start = form.body.lastIndexOf('\n', s - 1) + 1;
    set('body', form.body.slice(0, start) + prefix + form.body.slice(start));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length); });
  }
  const imgFrom = (items: DataTransferItemList) => { for (const it of Array.from(items)) if (it.kind === 'file' && it.type.startsWith('image/')) return it.getAsFile(); return null; };
  function addTag(raw: string) {
    const t = raw.replace(/,/g, '').trim().slice(0, 30); if (!t) return;
    if (tagList.length >= 8) return toast('err', 'Up to 8 tags');
    if (tagList.some(x => x.toLowerCase() === t.toLowerCase())) return;
    set('tags', [...tagList, t].join(', ')); setTagDraft('');
  }
  async function save() {
    if (busy) return;
    if (!form.title.trim()) return toast('err', 'Add a title first');
    if (!form.body.trim()) return toast('err', 'Write the article text first');
    const slug = form.slug || slugify(form.title);
    if (!slug) return toast('err', 'Add a web address');
    if (!editing && posts.some(p => p.slug === slug)) return toast('err', 'That web address is already used. Change it.');
    setBusy(true);
    const { ok, j } = await api('/api/posts', { method: 'POST', body: JSON.stringify({ ...form, slug, publish_at: toUtc(form.publish_at), isEdit: !!editing }) });
    setBusy(false);
    if (!ok) return toast('err', j.error || 'Could not save');
    const next = { ...form, slug };
    setForm(next); setSnapshot(JSON.stringify(next)); setEditing(slug); setSlugTouched(true);
    try { localStorage.removeItem('fw_draft'); } catch {} setDraftSaved(false);
    toast('ok', form.status === 'draft' ? 'Draft saved' : form.publish_at && toUtc(form.publish_at) > nowUtc() ? 'Scheduled' : 'Published. It is live now.');
    router.refresh();
  }
  async function openHistory() {
    if (!editing) return;
    setHist({ open: true, loading: true, items: [], pick: null });
    const { ok, j } = await api(`/api/revisions?slug=${encodeURIComponent(editing)}`);
    setHist({ open: true, loading: false, items: ok ? j.revisions || [] : [], pick: null });
  }
  async function pickRevision(id: number) { const { ok, j } = await api(`/api/revisions?id=${id}`); if (ok && j.revision) setHist(h => ({ ...h, pick: j.revision! })); }
  function applyRevision() {
    const r = hist.pick; if (!r) return;
    setForm(f => ({ ...f, title: r.title, excerpt: r.excerpt || '', body: r.body || '' }));
    setHist({ open: false, loading: false, items: [], pick: null }); toast('ok', 'Earlier version loaded. Save to keep it.');
  }

  // ---------- list actions ----------
  function del(p: Post) {
    ask({ title: 'Delete this article?', body: `"${p.title}" will be removed for good. Earlier versions are removed too.`, label: 'Delete article', danger: true, run: async () => {
      const { ok, j } = await api(`/api/posts?slug=${encodeURIComponent(p.slug)}`, { method: 'DELETE' });
      if (ok) { toast('ok', 'Article deleted'); if (editing === p.slug) { setForm(emptyForm); setSnapshot(JSON.stringify(emptyForm)); setEditing(''); } router.refresh(); } else toast('err', j.error || 'Could not delete');
    } });
  }
  async function bulk(action: string, extra: Record<string, string> = {}, okText = 'Done') {
    const { ok, j } = await api('/api/posts', { method: 'PATCH', body: JSON.stringify({ action, slugs: [...sel], ...extra }) });
    if (ok) { toast('ok', okText); setSel(new Set()); router.refresh(); } else toast('err', j.error || 'Action failed');
  }
  function bulkDelete() { ask({ title: `Delete ${sel.size} article${sel.size > 1 ? 's' : ''}?`, body: 'This cannot be undone.', label: 'Delete', danger: true, run: () => bulk('delete', {}, 'Deleted') }); }
  async function star(p: Post) { const { ok } = await api('/api/posts', { method: 'PATCH', body: JSON.stringify({ action: 'feature', slugs: [p.slug] }) }); if (ok) { toast('ok', p.featured ? 'Removed from home page' : 'Featured on home page'); router.refresh(); } }
  const toggleSel = (s: string) => setSel(x => { const n = new Set(x); if (n.has(s)) n.delete(s); else n.add(s); return n; });
  const allSel = shown.length > 0 && shown.every(p => sel.has(p.slug));

  async function setRead(m: Msg, read: boolean) { setReadOv(o => ({ ...o, [m.id]: read })); const { ok } = await api('/api/contact', { method: 'PATCH', body: JSON.stringify({ id: m.id, read }) }); if (!ok) setReadOv(o => ({ ...o, [m.id]: !read })); else router.refresh(); }
  async function readAll() { const { ok } = await api('/api/contact', { method: 'PATCH', body: JSON.stringify({ all: true }) }); if (ok) { setReadOv(Object.fromEntries(messages.map(m => [m.id, true]))); toast('ok', 'All messages marked read'); router.refresh(); } }
  function delMsg(m: Msg) { ask({ title: 'Delete this message?', body: `From ${m.name}. This cannot be undone.`, label: 'Delete message', danger: true, run: async () => { await api(`/api/contact?id=${m.id}`, { method: 'DELETE' }); toast('ok', 'Message deleted'); router.refresh(); } }); }
  function delSub(s: Sub) { ask({ title: 'Remove this subscriber?', body: s.email, label: 'Remove', danger: true, run: async () => { const { ok } = await api(`/api/subscribers?id=${s.id}`, { method: 'DELETE' }); if (ok) { toast('ok', 'Subscriber removed'); router.refresh(); } } }); }
  async function copyEmails() { try { await navigator.clipboard.writeText(subs.map(s => s.email).join(', ')); toast('ok', `${subs.length} emails copied`); } catch { toast('err', 'Copy was blocked by the browser'); } }
  async function logout() { if (dirty && hasContent) { try { localStorage.setItem('fw_draft', JSON.stringify({ form, editing })); } catch {} } await api('/api/logout', { method: 'POST' }); router.refresh(); }
  const tickCheck = (i: number) => setChecks(c => { const n = c.map((v, k) => (k === i ? !v : v)); try { localStorage.setItem('fw_check', JSON.stringify(n)); } catch {} return n; });

  // ---------- command palette ----------
  const pal: PalItem[] = (() => {
    if (!palOpen) return [];
    const base: PalItem[] = [
      { id: 'new', label: 'Write a new article', icon: 'plus', run: newArticle },
      { id: 'dash', label: 'Go to Dashboard', icon: 'dashboard', run: () => go('dashboard') },
      { id: 'arts', label: 'Go to Articles', icon: 'doc', run: () => go('articles') },
      { id: 'cats', label: 'Go to Categories', icon: 'tag', run: () => go('categories') },
      { id: 'msgs', label: 'Go to Messages', hint: unread ? `${unread} unread` : '', icon: 'mail', run: () => go('messages') },
      { id: 'subs', label: 'Go to Subscribers', icon: 'users', run: () => go('subscribers') },
      { id: 'act', label: 'Go to Activity and backup', icon: 'pulse', run: () => go('activity') },
      { id: 'theme', label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', icon: theme === 'dark' ? 'sun' : 'moon', run: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) },
      { id: 'bak', label: 'Download full backup (JSON)', icon: 'download', run: () => { window.location.href = '/api/export'; } },
      { id: 'out', label: 'Sign out', icon: 'logout', run: logout },
    ];
    const ql = palQ.trim().toLowerCase();
    const a = base.filter(b => !ql || b.label.toLowerCase().includes(ql));
    const b = posts.filter(p => !ql || p.title.toLowerCase().includes(ql)).slice(0, ql ? 7 : 3).map<PalItem>(p => ({ id: `p${p.id}`, label: `Edit: ${p.title}`, hint: stateOf(p), icon: 'pen', run: () => edit(p) }));
    return [...a, ...b];
  })();
  const runPal = (i: number) => { const it = pal[i]; if (!it) return; setPalOpen(false); it.run(); };

  const nav: { v: View; i: string; l: string; c?: number; hot?: boolean }[] = [
    { v: 'dashboard', i: 'dashboard', l: 'Dashboard' },
    { v: 'articles', i: 'doc', l: 'Articles', c: posts.length },
    { v: 'categories', i: 'tag', l: 'Categories', c: categories.length },
    { v: 'editor', i: 'pen', l: editing ? 'Editor' : 'New article', c: dirty && hasContent ? 1 : undefined, hot: true },
    { v: 'messages', i: 'mail', l: 'Messages', c: unread || messages.length, hot: unread > 0 },
    { v: 'subscribers', i: 'users', l: 'Subscribers', c: subs.length },
    { v: 'activity', i: 'pulse', l: 'Activity & backup' },
  ];
  const saveLabel = form.status === 'draft' ? 'Save draft' : form.publish_at && toUtc(form.publish_at) > nowUtc() ? 'Schedule' : editing ? 'Update' : 'Publish';
  const maxCatViews = Math.max(1, ...cats.map(c => c.v));
  const attention: { icon: string; text: string; run: () => void }[] = [];
  if (unread) attention.push({ icon: 'mail', text: `${unread} unread message${unread > 1 ? 's' : ''}`, run: () => go('messages') });
  posts.filter(p => p.status === 'draft').slice(0, 3).forEach(p => attention.push({ icon: 'pen', text: `Finish draft: ${p.title}`, run: () => edit(p) }));
  if (counts.Scheduled) attention.push({ icon: 'clock', text: `${counts.Scheduled} scheduled for later`, run: () => { setFilter('Scheduled'); go('articles'); } });
  const noCover = live.filter(p => !p.cover).length;
  if (noCover) attention.push({ icon: 'image', text: `${noCover} live article${noCover > 1 ? 's have' : ' has'} no cover image`, run: () => { setFilter('Published'); go('articles'); } });
  const shownMsgs = messages.filter(m => msgFilter === 'all' || !isRead(m));
  const shownSubs = subs.filter(s => !subQ || s.email.toLowerCase().includes(subQ.toLowerCase()));

  // =====================================================================
  return (
    <div className="aw" data-theme={theme}>
      <div className="aw-shell">
        <aside className="aw-side">
          <div className="aw-brand"><span className="aw-logo">F</span><span className="t">Fuelwell</span></div>
          <nav className="aw-nav" aria-label="Admin">
            {nav.map(n => (
              <button key={n.v} aria-current={view === n.v ? 'page' : undefined} onClick={() => (n.v === 'editor' ? openEditor() : go(n.v))}>
                <Ic n={n.i} />{n.l}{n.c !== undefined && <span className={`aw-count ${n.hot ? 'hot' : ''}`}>{n.v === 'editor' ? '•' : n.c}</span>}
              </button>
            ))}
          </nav>
          <div className="aw-side-foot aw-nav">
            <a href="/admin/submissions"><Ic n="users" /><span className="lbl">Member articles</span></a>
            <a href="/" target="_blank" rel="noreferrer"><Ic n="globe" /><span className="lbl">View site</span></a>
            <button onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}><Ic n={theme === 'dark' ? 'sun' : 'moon'} /><span className="lbl">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
            <button onClick={logout} aria-label="Sign out"><Ic n="logout" /><span className="lbl">Sign out</span></button>
          </div>
        </aside>

        <div className="aw-main">
          <header className="aw-top">
            <div className="grow"><h2>{hello}</h2></div>
            <button className="aw-btn" onClick={() => { setPalQ(''); setPalIdx(0); setPalOpen(true); }}><Ic n="search" /><span className="lbl">Search or jump to</span><span className="aw-kbd">{isMac ? '⌘K' : 'Ctrl K'}</span></button>
            <button className="aw-btn primary" onClick={newArticle}><Ic n="plus" /><span className="lbl2">New article</span></button>
          </header>

          <div key={view} className="aw-view">
            {/* ================= DASHBOARD ================= */}
            {view === 'dashboard' && (
              <div className="aw-stack" style={{ gap: 20 }}>
                <div><h1 className="aw-h1">Dashboard</h1><p className="aw-muted" style={{ margin: '6px 0 0' }}>Traffic, content and inbox at a glance.</p></div>
                {draftSaved && <div className="aw-card" style={{ background: 'var(--aw-warn-soft)', borderColor: 'transparent', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Ic n="history" /><b style={{ flex: 1 }}>You have an unsaved draft from the editor.</b><button className="aw-btn sm" onClick={restoreDraft}>Restore it</button><button className="aw-btn sm ghost" onClick={() => { try { localStorage.removeItem('fw_draft'); } catch {} setDraftSaved(false); }}>Discard</button></div>}
                <div className="aw-kpis">
                  <div className="aw-card aw-kpi"><span className="ico"><Ic n="globe" /></span><div className="n"><Counter to={live.length} /></div><div className="l">Published articles</div><span className="aw-delta flat">{counts.Draft} draft · {counts.Scheduled} scheduled</span></div>
                  <div className="aw-card aw-kpi"><span className="ico"><Ic n="eye" /></span><div className="n"><Counter to={total} /></div><div className="l">Total views</div><span className="aw-delta flat">{fortnight} in 14 days</span></div>
                  <div className="aw-card aw-kpi"><span className="ico"><Ic n="pulse" /></span><div className="n"><Counter to={week} /></div><div className="l">Views, last 7 days</div><Delta now={week} prev={stats.viewsPrev7} /></div>
                  <div className="aw-card aw-kpi"><span className="ico"><Ic n="users" /></span><div className="n"><Counter to={subs.length} /></div><div className="l">Subscribers</div><Delta now={stats.subsWeek} prev={stats.subsPrev} /></div>
                </div>
                <div className="aw-grid-2">
                  <section className="aw-card"><div className="aw-row-flex" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Views, last 14 days</h3><span className="aw-muted" style={{ fontSize: '.82rem', fontWeight: 700 }}>{fortnight} total</span></div><AreaChart data={daily} /></section>
                  <section className="aw-card"><h3>Needs your attention</h3>
                    {attention.length === 0 ? <div className="aw-empty" style={{ padding: '28px 0' }}><span className="big">✅</span><b>You are all caught up</b><span>No drafts, unread messages or missing covers.</span></div> :
                      <ul className="aw-list">{attention.slice(0, 6).map((a, i) => <li key={i}><span className="aw-feed-ic brand"><Ic n={a.icon} /></span><button className="aw-item-btn" onClick={a.run}>{a.text}</button></li>)}</ul>}
                  </section>
                </div>
                <div className="aw-grid-eq">
                  <section className="aw-card"><h3>Most viewed articles</h3>
                    {top.length === 0 ? <p className="aw-muted">No articles yet.</p> : <ul className="aw-list">{top.map(p => <li key={p.id}><div style={{ flex: 1, minWidth: 0 }}><button className="aw-item-btn" style={{ display: 'block', width: '100%' }} onClick={() => edit(p)}>{p.title}</button><div className="aw-bar" style={{ marginTop: 7 }}><i style={{ width: `${Math.max(4, ((p.views || 0) / maxViews) * 100)}%` }} /></div></div><b style={{ fontVariantNumeric: 'tabular-nums' }}>{(p.views || 0).toLocaleString('en-IN')}</b></li>)}</ul>}
                  </section>
                  <section className="aw-card"><h3>Content by category</h3>
                    <ul className="aw-list">{categories.map(c => { const s = cats.find(x => x.category === c.slug); return <li key={c.slug}><span className="aw-feed-ic" style={{ background: `linear-gradient(135deg,${c.from},${c.to})`, color: '#fff' }}>{c.icon}</span><div style={{ flex: 1 }}><div className="aw-row-flex" style={{ justifyContent: 'space-between', fontWeight: 700, fontSize: '.9rem' }}><span>{c.name}</span><span className="aw-muted">{pl(s?.n || 0, 'article')} · {pl(s?.v || 0, 'view')}</span></div><div className="aw-bar" style={{ marginTop: 7 }}><i style={{ width: `${Math.max(3, ((s?.v || 0) / maxCatViews) * 100)}%`, background: `linear-gradient(90deg,${c.from},${c.to})` }} /></div></div></li>; })}</ul>
                  </section>
                </div>
                <div className="aw-grid-eq">
                  <section className="aw-card"><div className="aw-row-flex" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Recent activity</h3><button className="aw-btn sm ghost" onClick={() => go('activity')}>See all</button></div>
                    <ul className="aw-list" style={{ marginTop: 8 }}>{activity.slice(0, 6).map(a => { const m = ACT[a.action] || [a.action, 'pulse', '']; return <li key={a.id}><span className={`aw-feed-ic ${m[2]}`}><Ic n={m[1]} /></span><span style={{ flex: 1, minWidth: 0, fontSize: '.88rem' }}><b>{m[0]}</b> <span className="aw-muted">{a.detail}</span></span><small className="aw-muted" style={{ whiteSpace: 'nowrap' }}>{when(a.created)}</small></li>; })}{activity.length === 0 && <li className="aw-muted">Nothing yet.</li>}</ul>
                  </section>
                  <section className="aw-card"><h3>Growth checklist</h3>
                    {CHECK.map((c, i) => <label key={c} className="aw-check"><input type="checkbox" checked={checks[i]} onChange={() => tickCheck(i)} /><span>{i === 4 ? `Submit ${site || 'your-site'}/sitemap.xml in Google Search Console` : c}</span></label>)}
                  </section>
                </div>
              </div>
            )}

            {/* ================= ARTICLES ================= */}
            {view === 'articles' && (
              <div className="aw-stack" style={{ gap: 18 }}>
                <h1 className="aw-h1">Articles</h1>
                <div className="aw-row-flex">
                  <div className="aw-tabs" role="group" aria-label="Status">{['All', 'Published', 'Scheduled', 'Draft'].map(s => <button key={s} aria-pressed={filter === s} onClick={() => setFilter(s)}>{s}<small>{counts[s]}</small></button>)}</div>
                  <div style={{ flex: 1, minWidth: 180, position: 'relative' }}><input className="aw-input" style={{ paddingLeft: 38 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search title, address or tag" aria-label="Search articles" /><span style={{ position: 'absolute', left: 13, top: 12 }} className="aw-muted"><Ic n="search" /></span></div>
                  <select className="aw-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Category"><option value="all">All categories</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
                  <select className="aw-select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="new">Newest</option><option value="updated">Recently edited</option><option value="views">Most viewed</option><option value="title">Title A to Z</option></select>
                </div>
                <div className="aw-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="aw-table">
                      <thead><tr><th style={{ width: 44 }}><input type="checkbox" className="aw-cb" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(shown.map(p => p.slug)))} /></th><th>Article</th><th className="hide-sm">Category</th><th>Status</th><th className="hide-sm">Views</th><th className="hide-sm">Updated</th><th /></tr></thead>
                      <tbody>
                        {shown.map((p, i) => { const c = catOf(p.category); const st = stateOf(p); return (
                          <tr key={p.id} className={`aw-row ${sel.has(p.slug) ? 'sel' : ''}`} style={{ animationDelay: `${Math.min(i, 12) * 28}ms` }}>
                            <td><input type="checkbox" className="aw-cb" aria-label={`Select ${p.title}`} checked={sel.has(p.slug)} onChange={() => toggleSel(p.slug)} /></td>
                            <td><div className="aw-row-flex" style={{ flexWrap: 'nowrap' }}>{p.cover ? <img src={p.cover} alt="" className="aw-thumb" /> : <span className="aw-thumb" />}<div style={{ minWidth: 0 }}><button className="aw-item-btn" style={{ display: 'block', maxWidth: 360 }} onClick={() => edit(p)}>{p.featured ? '★ ' : ''}{p.title}</button><small className="aw-muted">/blog/{p.slug}</small></div></div></td>
                            <td className="hide-sm">{c && <span className="aw-cat" style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>{c.icon} {c.name}</span>}</td>
                            <td><span className={`aw-badge ${st}`}>{st}</span></td>
                            <td className="hide-sm" style={{ minWidth: 110 }}><b style={{ fontVariantNumeric: 'tabular-nums' }}>{p.views || 0}</b><div className="aw-bar" style={{ marginTop: 5 }}><i style={{ width: `${Math.max(3, ((p.views || 0) / maxViews) * 100)}%` }} /></div></td>
                            <td className="hide-sm aw-muted" style={{ whiteSpace: 'nowrap' }}>{when(p.updated || p.created)}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                              <button className="aw-icon-btn" title="Edit" aria-label="Edit" onClick={() => edit(p)}><Ic n="pen" /></button>
                              <button className={`aw-icon-btn ${p.featured ? 'on' : ''}`} title={p.featured ? 'Remove from home page' : 'Feature on home page'} aria-label="Toggle featured" onClick={() => star(p)}><Ic n="star" /></button>
                              <button className="aw-icon-btn" title="Duplicate" aria-label="Duplicate" onClick={() => duplicate(p)}><Ic n="copy" /></button>
                              <a className="aw-icon-btn" title="View on site" aria-label="View on site" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"><Ic n="ext" /></a>
                              <button className="aw-icon-btn del" title="Delete" aria-label="Delete" onClick={() => del(p)}><Ic n="trash" /></button>
                            </td>
                          </tr>); })}
                      </tbody>
                    </table>
                  </div>
                  {shown.length === 0 && <div className="aw-empty"><span className="big">🗂️</span><b>{posts.length ? 'No articles match' : 'No articles yet'}</b><span>{posts.length ? 'Try a different search or filter.' : 'Write your first article to get started.'}</span>{!posts.length && <button className="aw-btn primary" onClick={newArticle}>Write an article</button>}</div>}
                </div>
              </div>
            )}

            {/* ================= EDITOR ================= */}
            {view === 'editor' && (
              <div>
                <div className="aw-editbar">
                  <button className="aw-btn sm ghost" onClick={() => go('articles')}><Ic n="back" />Articles</button>
                  <span className={`aw-state ${dirty ? 'dirty' : ''}`}><i />{dirty ? 'Unsaved changes' : editing ? 'All changes saved' : 'New article'}</span>
                  <span className="aw-muted hide-sm" style={{ fontSize: '.76rem' }}>{lastBackup ? `Backup kept in this browser at ${lastBackup}` : ''}</span>
                  <span style={{ flex: 1 }} />
                  {editing && <button className="aw-btn sm" onClick={openHistory}><Ic n="history" />History</button>}
                  <button className="aw-btn primary" onClick={save} disabled={busy}>{busy ? <><span className="aw-spin" />Saving…</> : <><Ic n="check" />{saveLabel}</>}<span className="aw-kbd" style={{ background: 'rgba(0,0,0,.08)', border: 0, color: 'inherit' }}>{isMac ? '⌘S' : 'Ctrl S'}</span></button>
                </div>
                <div className="aw-editor">
                  <div className="aw-stack" style={{ minWidth: 0 }}>
                    <input className="aw-input aw-title" placeholder="Article title" aria-label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing || slugTouched ? f.slug : slugify(e.target.value) }))} />
                    <div className="aw-row-flex" style={{ flexWrap: 'nowrap', fontSize: '.85rem' }}>
                      <span className="aw-muted" style={{ flex: 'none' }}>{site || 'yoursite'}/blog/</span>
                      <input className="aw-input" style={{ padding: '6px 10px' }} aria-label="Web address" value={form.slug} disabled={!!editing} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />
                      {slugClash && <span style={{ color: 'var(--aw-danger)', fontWeight: 700, whiteSpace: 'nowrap' }}>Already used</span>}
                    </div>
                    <div><textarea className="aw-area aw-input" rows={2} placeholder="Short summary shown on cards and in Google (about 150 characters)" aria-label="Summary" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} /><div className="aw-bar" style={{ marginTop: 6, height: 4 }}><i style={{ width: `${Math.min(100, (exLen / 160) * 100)}%`, animation: 'none', transition: 'width .25s', background: exLen > 160 ? 'var(--aw-danger)' : exLen >= 110 ? 'var(--aw-ok)' : 'var(--aw-accent)' }} /></div><small className="aw-muted">{exLen}/160 characters</small></div>
                    <div className="aw-editor-box">
                      <div className="aw-toolbar" role="toolbar" aria-label="Formatting">
                        <button type="button" title="Heading 2" onClick={() => line('## ')}>H2</button><button type="button" title="Heading 3" onClick={() => line('### ')}>H3</button><span className="sep" />
                        <button type="button" title="Bold" onClick={() => wrap('**', '**')}><Ic n="bold" /></button><button type="button" title="Italic" onClick={() => wrap('*', '*')}><Ic n="italic" /></button><button type="button" title="Link" onClick={() => wrap('[', '](https://)', 'link text')}><Ic n="link" /></button><button type="button" title="Inline code" onClick={() => wrap('`', '`', 'code')}><Ic n="code" /></button><span className="sep" />
                        <button type="button" title="Bulleted list" onClick={() => line('- ')}><Ic n="list" /></button><button type="button" title="Numbered list" onClick={() => line('1. ')}><Ic n="listol" /></button><button type="button" title="Quote" onClick={() => line('> ')}><Ic n="quote" /></button><button type="button" title="Divider" onClick={() => insert('\n\n---\n\n')}><Ic n="hr" /></button>
                        <label title="Insert image">{uploading ? <span className="aw-spin" /> : <Ic n="image" />}<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => { addInline(e.target.files?.[0]); e.target.value = ''; }} /></label>
                        <span style={{ flex: 1 }} />
                        <div className="aw-tabs" style={{ padding: 2 }} role="group" aria-label="View"><button aria-pressed={mode === 'write'} onClick={() => setMode('write')}>Write</button><button aria-pressed={mode === 'split'} onClick={() => setMode('split')}>Split</button><button aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>Preview</button></div>
                      </div>
                      <div className={mode === 'split' ? 'aw-split' : ''}>
                        {mode !== 'preview' && <textarea ref={ta} className="aw-write" value={form.body} onChange={e => set('body', e.target.value)} placeholder="Write your article here. Use the toolbar, or paste or drop an image straight in." aria-label="Article text"
                          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); wrap('**', '**'); } if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); wrap('*', '*'); } }}
                          onPaste={e => { const f = imgFrom(e.clipboardData.items); if (f) { e.preventDefault(); addInline(f); } }} onDrop={e => { const f = imgFrom(e.dataTransfer.items); if (f) { e.preventDefault(); addInline(f); } }} />}
                        {mode !== 'write' && <div className="aw-preview article" dangerouslySetInnerHTML={{ __html: html }} />}
                      </div>
                      <div className="aw-foot"><span>{words} words · about {Math.max(1, Math.round(words / 200))} min read</span><span>{hasContent ? 'Markdown supported' : ''}</span></div>
                    </div>
                  </div>

                  <aside className="aw-stack" style={{ minWidth: 0 }}>
                    <section className="aw-card aw-stack" style={{ gap: 12 }}>
                      <h3 style={{ margin: 0 }}>Publish</h3>
                      <div className="aw-seg" role="group" aria-label="Status"><button aria-pressed={form.status === 'published'} onClick={() => set('status', 'published')}>Published</button><button aria-pressed={form.status === 'draft'} onClick={() => set('status', 'draft')}>Draft</button></div>
                      <div><label className="aw-label" htmlFor="sch">Schedule for later (optional)</label><input id="sch" type="datetime-local" className="aw-input" value={form.publish_at} onChange={e => set('publish_at', e.target.value)} />
                        <div className="aw-row-flex" style={{ marginTop: 8 }}><button className="aw-btn sm" onClick={() => { const d = new Date(Date.now() + 86400000); d.setHours(9, 0, 0, 0); set('publish_at', `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T09:00`); set('status', 'published'); }}>Tomorrow 9:00</button>{form.publish_at && <button className="aw-btn sm ghost" onClick={() => set('publish_at', '')}>Publish now</button>}</div></div>
                      <label className="aw-check" style={{ padding: 0 }}><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /><span style={{ textDecoration: 'none', color: 'inherit' }}>Feature on the home page</span></label>
                      {editing && <a className="aw-btn" href={`/blog/${editing}`} target="_blank" rel="noreferrer"><Ic n="ext" />View on site</a>}
                    </section>

                    <section className="aw-card">
                      <div className="aw-row-flex" style={{ flexWrap: 'nowrap', gap: 14 }}><ScoreRing score={seo.score} /><div><h3 style={{ margin: 0 }}>SEO score</h3><small className="aw-muted">{seo.score >= 80 ? 'Ready to rank' : seo.score >= 50 ? 'Getting there' : 'Needs work'}</small></div></div>
                      <ul className="aw-list aw-seo" style={{ marginTop: 10 }}>{seo.items.map(([ok, t]) => <li key={t} className={ok ? 'ok' : 'no'}><Ic n={ok ? 'check' : 'x'} />{t}</li>)}</ul>
                    </section>

                    <section className="aw-card aw-stack" style={{ gap: 12 }}>
                      <h3 style={{ margin: 0 }}>Category and tags</h3>
                      <div className="aw-cats">{categories.map(c => <button key={c.slug} className="aw-catbtn" aria-pressed={form.category === c.slug} onClick={() => set('category', c.slug)}><span>{c.icon}</span>{c.name}</button>)}</div>
                      <div className="aw-tags" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus()}>
                        {tagList.map(t => <span className="aw-chip" key={t}>{t}<button aria-label={`Remove ${t}`} onClick={() => set('tags', tagList.filter(x => x !== t).join(', '))}><Ic n="x" /></button></span>)}
                        <input aria-label="Add tag" value={tagDraft} placeholder={tagList.length ? '' : 'Type a tag, press Enter'} onChange={e => { if (e.target.value.includes(',')) addTag(e.target.value); else setTagDraft(e.target.value); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagDraft); } else if (e.key === 'Backspace' && !tagDraft && tagList.length) set('tags', tagList.slice(0, -1).join(', ')); }} onBlur={() => addTag(tagDraft)} />
                      </div>
                    </section>

                    <section className="aw-card">
                      <h3>Cover image</h3>
                      <label className={`aw-drop ${coverOver ? 'over' : ''}`} onDragOver={e => { e.preventDefault(); setCoverOver(true); }} onDragLeave={() => setCoverOver(false)} onDrop={e => { e.preventDefault(); setCoverOver(false); addCover(e.dataTransfer.files[0]); }}>
                        {uploading ? <><span className="aw-spin" />Uploading…</> : form.cover ? <img src={form.cover} alt="Cover preview" /> : <><Ic n="image" /><b>Click or drop an image</b><small>JPG, PNG or WebP · under 10 MB · 1200×675 is ideal</small></>}
                        <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => { addCover(e.target.files?.[0]); e.target.value = ''; }} />
                      </label>
                      {form.cover && <button className="aw-btn sm danger" style={{ marginTop: 10 }} onClick={() => set('cover', '')}>Remove cover</button>}
                    </section>

                    <section className="aw-card aw-stack" style={{ gap: 12 }}>
                      <h3 style={{ margin: 0 }}>Search and social preview</h3>
                      <div className="aw-serp"><div className="u">{site || 'yoursite'} › blog › {form.slug || 'your-article'}</div><div className="t">{form.title || 'Article title'} | Fuelwell</div><div className="d">{form.excerpt || 'Your summary appears here.'}</div></div>
                      <div className="aw-og"><div className="img" style={form.cover ? { backgroundImage: `url(${form.cover})` } : undefined} /><div className="txt"><small className="aw-muted">{site || 'yoursite'}</small><div style={{ fontWeight: 800, lineHeight: 1.25 }}>{form.title || 'Article title'}</div></div></div>
                      <small style={{ color: titleLen > 60 ? 'var(--aw-danger)' : undefined }} className="aw-muted">Title {titleLen}/60 characters</small>
                    </section>
                  </aside>
                </div>
              </div>
            )}

            {/* ================= MESSAGES ================= */}
            {view === 'messages' && (
              <div className="aw-stack" style={{ gap: 18 }}>
                <div className="aw-row-flex" style={{ justifyContent: 'space-between' }}><h1 className="aw-h1">Messages</h1><div className="aw-row-flex"><div className="aw-tabs" role="group"><button aria-pressed={msgFilter === 'all'} onClick={() => setMsgFilter('all')}>All<small>{messages.length}</small></button><button aria-pressed={msgFilter === 'unread'} onClick={() => setMsgFilter('unread')}>Unread<small>{unread}</small></button></div>{unread > 0 && <button className="aw-btn" onClick={readAll}><Ic n="check" />Mark all read</button>}</div></div>
                {shownMsgs.length === 0 && <div className="aw-card aw-empty"><span className="big">📭</span><b>{messages.length ? 'No unread messages' : 'No messages yet'}</b><span>Messages from your contact page show up here.</span></div>}
                {shownMsgs.map((m, i) => { const open = openMsg === m.id; const rd = isRead(m); return (
                  <article key={m.id} className={`aw-card aw-msg ${rd ? '' : 'unread'}`} style={{ animation: 'aw-view .4s both', animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                    <div className="aw-row-flex" style={{ flexWrap: 'nowrap', gap: 14 }} role="button" tabIndex={0} aria-expanded={open} onClick={() => { setOpenMsg(open ? null : m.id); if (!rd && !open) setRead(m, true); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenMsg(open ? null : m.id); if (!rd && !open) setRead(m, true); } }}>
                      <span className="aw-avatar" style={{ background: `hsl(${hue(m.name)} 55% 42%)` }}>{(m.name.trim()[0] || '?').toUpperCase()}</span>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: rd ? 700 : 800 }}>{m.name} <span className="aw-muted" style={{ fontWeight: 600, fontSize: '.85rem' }}>{m.email}</span></div>{!open && <div className="aw-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.88rem' }}>{m.message}</div>}</div>
                      <small className="aw-muted" style={{ whiteSpace: 'nowrap' }}>{when(m.created)}</small>
                    </div>
                    <div className={`aw-msg-body ${open ? 'open' : ''}`}><div><p style={{ whiteSpace: 'pre-wrap', margin: '16px 0', lineHeight: 1.65 }}>{m.message}</p>
                      <div className="aw-row-flex"><a className="aw-btn primary sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message to Fuelwell')}`}><Ic n="mail" />Reply by email</a><button className="aw-btn sm" onClick={() => setRead(m, !rd)}>{rd ? 'Mark unread' : 'Mark read'}</button><button className="aw-btn sm danger" onClick={() => delMsg(m)}><Ic n="trash" />Delete</button></div></div></div>
                  </article>); })}
              </div>
            )}

            {/* ================= CATEGORIES ================= */}
            {view === 'categories' && <Categories categories={categories} stats={cats} api={api} toast={toast} refresh={() => router.refresh()} showArticles={slug => { setCatFilter(slug); setFilter('All'); go('articles'); }} />}

            {/* ================= SUBSCRIBERS ================= */}
            {view === 'subscribers' && (
              <div className="aw-stack" style={{ gap: 18 }}>
                <div className="aw-row-flex" style={{ justifyContent: 'space-between' }}><div><h1 className="aw-h1">Subscribers</h1><p className="aw-muted" style={{ margin: '6px 0 0' }}>{subs.length} total · {stats.subsWeek} joined in the last 7 days</p></div><div className="aw-row-flex"><button className="aw-btn" onClick={copyEmails} disabled={!subs.length}><Ic n="copy" />Copy emails</button><a className="aw-btn dark" href="/api/subscribers"><Ic n="download" />Download CSV</a></div></div>
                <div style={{ position: 'relative', maxWidth: 420 }}><input className="aw-input" style={{ paddingLeft: 38 }} placeholder="Search emails" aria-label="Search subscribers" value={subQ} onChange={e => setSubQ(e.target.value)} /><span style={{ position: 'absolute', left: 13, top: 12 }} className="aw-muted"><Ic n="search" /></span></div>
                <div className="aw-card" style={{ padding: '4px 20px' }}>
                  {shownSubs.length === 0 ? <div className="aw-empty"><span className="big">📬</span><b>{subs.length ? 'No match' : 'No subscribers yet'}</b><span>People who sign up through the newsletter box appear here.</span></div> :
                    <ul className="aw-list">{shownSubs.map(s => <li key={s.id}><span className="aw-avatar" style={{ width: 34, height: 34, borderRadius: 11, background: `hsl(${hue(s.email)} 55% 42%)` }}>{s.email[0].toUpperCase()}</span><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 650 }}>{s.email}</span><small className="aw-muted">{when(s.created)}</small><button className="aw-icon-btn del" aria-label={`Remove ${s.email}`} onClick={() => delSub(s)}><Ic n="trash" /></button></li>)}</ul>}
                </div>
              </div>
            )}

            {/* ================= ACTIVITY & BACKUP ================= */}
            {view === 'activity' && (
              <div className="aw-stack" style={{ gap: 18 }}>
                <h1 className="aw-h1">Activity and backup</h1>
                <div className="aw-grid-2">
                  <section className="aw-card"><h3>Activity log</h3>
                    <ul className="aw-list">{activity.map(a => { const m = ACT[a.action] || [a.action, 'pulse', '']; return <li key={a.id}><span className={`aw-feed-ic ${m[2]}`}><Ic n={m[1]} /></span><span style={{ flex: 1, minWidth: 0 }}><b>{m[0]}</b> <span className="aw-muted">{a.detail}</span></span><small className="aw-muted" style={{ whiteSpace: 'nowrap' }}>{when(a.created)}</small></li>; })}{activity.length === 0 && <li className="aw-muted">Nothing recorded yet.</li>}</ul>
                  </section>
                  <div className="aw-stack">
                    <section className="aw-card"><h3>Back up your site</h3><p className="aw-muted" style={{ marginTop: 0 }}>Download every article, message and subscriber as one JSON file. Also copy the <code>uploads/</code> folder and <code>fuelwell.db</code> from your server.</p><a className="aw-btn primary" href="/api/export"><Ic n="download" />Download backup</a></section>
                    <section className="aw-card"><h3>Keep your admin safe</h3><ul className="aw-list" style={{ fontSize: '.88rem' }}><li><Ic n="shield" />Sessions end by themselves after 7 days.</li><li><Ic n="shield" />8 wrong passwords lock sign-in for 15 minutes.</li><li><Ic n="shield" />Use a long ADMIN_PASSWORD and a random AUTH_SECRET.</li><li><Ic n="shield" />Every edit keeps the last 20 earlier versions.</li></ul></section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sel.size > 0 && view === 'articles' && (
        <div className="aw-bulk" role="toolbar" aria-label="Bulk actions">
          <b style={{ padding: '0 6px' }}>{sel.size} selected</b>
          <button className="aw-btn sm" onClick={() => bulk('publish', {}, 'Published')}>Publish</button>
          <button className="aw-btn sm" onClick={() => bulk('draft', {}, 'Moved to draft')}>Make draft</button>
          <button className="aw-btn sm" onClick={() => bulk('feature', {}, 'Featured changed')}>Toggle feature</button>
          <select className="aw-select" aria-label="Move to category" value="" onChange={e => e.target.value && bulk('category', { category: e.target.value }, 'Moved')}><option value="">Move to…</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          <button className="aw-btn sm danger" onClick={bulkDelete}><Ic n="trash" />Delete</button>
          <button className="aw-icon-btn" style={{ color: 'inherit' }} aria-label="Clear selection" onClick={() => setSel(new Set())}><Ic n="x" /></button>
        </div>
      )}

      {palOpen && (
        <div className="aw-scrim" onMouseDown={e => e.target === e.currentTarget && setPalOpen(false)}>
          <div className="aw-pal" role="dialog" aria-modal="true" aria-label="Command palette">
            <input autoFocus placeholder="Type a command or article title" value={palQ} onChange={e => { setPalQ(e.target.value); setPalIdx(0); }}
              onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setPalIdx(i => Math.min(pal.length - 1, i + 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setPalIdx(i => Math.max(0, i - 1)); } else if (e.key === 'Enter') { e.preventDefault(); runPal(palIdx); } }} />
            <ul role="listbox">{pal.map((it, i) => <li key={it.id}><button role="option" aria-selected={i === palIdx} onMouseEnter={() => setPalIdx(i)} onClick={() => runPal(i)}><Ic n={it.icon} />{it.label}{it.hint && <small>{it.hint}</small>}</button></li>)}{pal.length === 0 && <li className="aw-muted" style={{ padding: 16 }}>Nothing found</li>}</ul>
          </div>
        </div>
      )}

      {confirmBox && (
        <div className="aw-scrim center" onMouseDown={e => e.target === e.currentTarget && setConfirmBox(null)}>
          <div className="aw-modal" role="alertdialog" aria-modal="true" aria-labelledby="cft">
            <h3 id="cft">{confirmBox.title}</h3><p className="aw-muted" style={{ margin: '0 0 22px' }}>{confirmBox.body}</p>
            <div className="aw-row-flex" style={{ justifyContent: 'flex-end' }}><button className="aw-btn" onClick={() => setConfirmBox(null)}>Cancel</button><button autoFocus className={`aw-btn ${confirmBox.danger ? 'solid-danger' : 'primary'}`} onClick={async () => { const c = confirmBox; setConfirmBox(null); await c.run(); }}>{confirmBox.label}</button></div>
          </div>
        </div>
      )}

      {hist.open && (
        <>
          <div className="aw-scrim" style={{ zIndex: 65 }} onMouseDown={() => setHist(h => ({ ...h, open: false }))} />
          <aside className="aw-drawer" aria-label="Version history">
            <div className="aw-row-flex" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0, fontSize: '1.2rem' }}>Version history</h3><button className="aw-icon-btn" aria-label="Close" onClick={() => setHist(h => ({ ...h, open: false }))}><Ic n="x" /></button></div>
            <p className="aw-muted" style={{ fontSize: '.88rem' }}>Each time you save a change, the previous version is kept. The last 20 are available.</p>
            {hist.loading && <div className="aw-row-flex"><span className="aw-spin" />Loading…</div>}
            {!hist.loading && hist.items.length === 0 && <div className="aw-empty"><span className="big">🕘</span><b>No earlier versions yet</b><span>They appear after you save a change.</span></div>}
            <ul className="aw-list">{hist.items.map(r => <li key={r.id}><button className="aw-item-btn" style={{ whiteSpace: 'normal' }} onClick={() => pickRevision(r.id)}>{r.title}<br /><small className="aw-muted">{when(r.created)}</small></button><button className="aw-btn sm" onClick={() => pickRevision(r.id)}>Preview</button></li>)}</ul>
            {hist.pick && <div className="aw-card" style={{ marginTop: 14, background: 'var(--aw-raise)' }}><b>{hist.pick.title}</b><p className="aw-muted" style={{ fontSize: '.85rem', whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto' }}>{(hist.pick.body || '').slice(0, 900)}{(hist.pick.body || '').length > 900 ? '…' : ''}</p><button className="aw-btn primary" onClick={applyRevision}><Ic n="history" />Restore this version</button></div>}
          </aside>
        </>
      )}

      <div className="aw-toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={`aw-toast ${t.kind}`} role="status"><Ic n={t.kind === 'ok' ? 'check' : 'alert'} />{t.text}</div>)}</div>
    </div>
  );
}
