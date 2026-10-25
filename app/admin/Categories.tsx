'use client';
import { useState } from 'react';
import type { Category } from '@/lib/db';
import { Ic } from './ui';

type CatStat = { category: string; n: number; v: number };
type Api = (url: string, init?: RequestInit) => Promise<{ ok: boolean; j: { error?: string; url?: string } }>;
type Props = { categories: Category[]; stats: CatStat[]; api: Api; toast: (kind: 'ok' | 'err', text: string) => void; refresh: () => void; showArticles: (slug: string) => void };
type F = { oldSlug: string; slug: string; name: string; icon: string; from: string; to: string; blurb: string; intro: string; banner: string; menu: boolean; home: boolean; visible: boolean };

const GRADIENTS: [string, string, string][] = [
  ['Ocean', '#0B6E70', '#2FB5A8'], ['Sunrise', '#E8590C', '#FFB347'], ['Sky', '#2B5C8A', '#6FA8DC'], ['Violet', '#5B3FA0', '#A084DC'],
  ['Berry', '#C2255C', '#FF6B9D'], ['Meadow', '#2F9E44', '#8CE99A'], ['Sunset', '#F76707', '#FF5A7A'], ['Night', '#0F1B2D', '#2EA8FF'],
];
const EMOJI = ['🔥', '💪', '🥗', '🏋️', '🏃', '🧘', '🍳', '🥑', '🍎', '🥦', '🥛', '🍗', '🥜', '🍚', '🍌', '💧', '😴', '❤️', '🧠', '⚖️', '📈', '🥤', '🍽️', '🌿', '⭐', '🎯'];
const blank: F = { oldSlug: '', slug: '', name: '', icon: '⭐', from: '#0B6E70', to: '#2FB5A8', blurb: '', intro: '', banner: '', menu: true, home: true, visible: true };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const HEX = /^#[0-9a-fA-F]{6}$/;
const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

function Switch({ on, set, label, hint }: { on: boolean; set: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label className="aw-sw">
      <input type="checkbox" role="switch" checked={on} onChange={e => set(e.target.checked)} />
      <span className="aw-sw-track" aria-hidden><i /></span>
      <span><b>{label}</b><small className="aw-muted">{hint}</small></span>
    </label>
  );
}

export default function Categories({ categories, stats, api, toast, refresh, showArticles }: Props) {
  const [f, setF] = useState<F | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const [del, setDel] = useState<{ cat: Category; to: string } | null>(null);
  const statOf = (slug: string) => stats.find(s => s.category === slug) || { category: slug, n: 0, v: 0 };
  const set = <K extends keyof F>(k: K, v: F[K]) => setF(x => (x ? { ...x, [k]: v } : x));

  const openNew = () => { setF({ ...blank }); setSlugTouched(false); setDel(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openEdit = (c: Category) => { setF({ oldSlug: c.slug, slug: c.slug, name: c.name, icon: c.icon, from: c.from, to: c.to, blurb: c.blurb, intro: c.intro, banner: c.banner, menu: c.menu, home: c.home, visible: c.visible }); setSlugTouched(true); setDel(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  async function save() {
    if (!f) return;
    setBusy(true);
    const { ok, j } = await api('/api/categories', { method: 'POST', body: JSON.stringify(f) });
    setBusy(false);
    if (!ok) { toast('err', j.error || 'Could not save the category'); return; }
    toast('ok', f.oldSlug ? 'Category updated' : 'Category added');
    setF(null); refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const order = categories.map(c => c.slug); const k = i + dir;
    if (k < 0 || k >= order.length) return;
    [order[i], order[k]] = [order[k], order[i]];
    const { ok, j } = await api('/api/categories', { method: 'PATCH', body: JSON.stringify({ order }) });
    if (ok) refresh(); else toast('err', j.error || 'Could not reorder');
  }
  async function toggle(c: Category, k: 'visible' | 'menu' | 'home') {
    const { ok, j } = await api('/api/categories', { method: 'POST', body: JSON.stringify({ ...c, oldSlug: c.slug, [k]: !c[k] }) });
    if (ok) { toast('ok', 'Saved'); refresh(); } else toast('err', j.error || 'Could not save');
  }
  async function remove() {
    if (!del) return;
    setBusy(true);
    const q = new URLSearchParams({ slug: del.cat.slug, ...(del.to ? { moveTo: del.to } : {}) });
    const { ok, j } = await api(`/api/categories?${q}`, { method: 'DELETE' });
    setBusy(false);
    if (!ok) { toast('err', j.error || 'Could not delete'); return; }
    toast('ok', 'Category deleted'); setDel(null); refresh();
  }
  async function upload(file?: File) {
    if (!file) return;
    setUp(true);
    const fd = new FormData(); fd.append('file', file);
    const { ok, j } = await api('/api/upload', { method: 'POST', body: fd });
    setUp(false);
    if (ok && j.url) set('banner', j.url); else toast('err', j.error || 'Upload failed');
  }

  const bad = !!f && (!f.name.trim() || !f.slug || !HEX.test(f.from) || !HEX.test(f.to));
  const clash = !!f && f.slug !== f.oldSlug && categories.some(c => c.slug === f.slug);

  return (
    <div className="aw-stack" style={{ gap: 18 }}>
      <div className="aw-row-flex" style={{ justifyContent: 'space-between' }}>
        <div><h1 className="aw-h1">Categories</h1><p className="aw-muted" style={{ margin: '6px 0 0' }}>Name, icon, colours, description, banner and menu placement for every topic on the site.</p></div>
        <button className="aw-btn primary" onClick={openNew}><Ic n="plus" />New category</button>
      </div>

      {f && (
        <div className="aw-grid-2 aw-catedit">
          <section className="aw-card" aria-label={f.oldSlug ? 'Edit category' : 'New category'}>
            <h3 style={{ marginTop: 0 }}>{f.oldSlug ? `Edit “${categories.find(c => c.slug === f.oldSlug)?.name || f.oldSlug}”` : 'New category'}</h3>
            <div className="aw-stack" style={{ gap: 14 }}>
              <div className="aw-grid-name">
                <div><label className="aw-label" htmlFor="cn">Name</label><input id="cn" className="aw-input" maxLength={40} value={f.name} placeholder="e.g. Healthy Recipes" onChange={e => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} /></div>
                <div><label className="aw-label" htmlFor="ci">Icon</label><input id="ci" className="aw-input aw-icon-in" maxLength={8} value={f.icon} onChange={e => set('icon', e.target.value)} aria-label="Icon (emoji)" /></div>
              </div>
              <div className="aw-emojis" role="group" aria-label="Pick an icon">{EMOJI.map(e => <button key={e} type="button" className="aw-emoji" aria-pressed={f.icon === e} onClick={() => set('icon', e)}>{e}</button>)}</div>
              <div>
                <label className="aw-label" htmlFor="cs">Web address</label>
                <div className="aw-slug"><span className="aw-muted">/category/</span><input id="cs" className="aw-input" value={f.slug} onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></div>
                {clash && <p className="aw-hint bad">That address is already used by another category.</p>}
                {!!f.oldSlug && f.slug !== f.oldSlug && <p className="aw-hint">Changing the address moves its articles automatically, but old links to the category page will stop working.</p>}
              </div>
              <div>
                <span className="aw-label">Colours</span>
                <div className="aw-swatches" role="group" aria-label="Colour presets">{GRADIENTS.map(([n, a, b]) => <button key={n} type="button" title={n} aria-label={n} aria-pressed={f.from === a && f.to === b} className="aw-swatch" style={{ background: `linear-gradient(135deg,${a},${b})` }} onClick={() => setF(x => (x ? { ...x, from: a, to: b } : x))} />)}</div>
                <div className="aw-colors">
                  {(['from', 'to'] as const).map(k => (
                    <label key={k} className="aw-colorpick"><span className="aw-muted">{k === 'from' ? 'Start' : 'End'}</span><input type="color" value={HEX.test(f[k]) ? f[k] : '#000000'} onChange={e => set(k, e.target.value)} aria-label={k === 'from' ? 'Start colour' : 'End colour'} /><input className="aw-input" value={f[k]} maxLength={7} onChange={e => set(k, e.target.value)} aria-label={`${k} hex`} /></label>
                  ))}
                </div>
              </div>
              <div><label className="aw-label" htmlFor="cb">Short description <span className="aw-muted">({f.blurb.length}/160)</span></label><input id="cb" className="aw-input" maxLength={160} value={f.blurb} placeholder="One line shown under the category title and in search results" onChange={e => set('blurb', e.target.value)} /></div>
              <div><label className="aw-label" htmlFor="cp">Page introduction <span className="aw-muted">({f.intro.length}/700, optional)</span></label><textarea id="cp" className="aw-area" rows={4} maxLength={700} value={f.intro} placeholder="A few sentences shown at the top of the category page. Good for SEO." onChange={e => set('intro', e.target.value)} /></div>
              <div>
                <span className="aw-label">Banner image (optional)</span>
                {f.banner ? (
                  <div className="aw-banner"><img src={f.banner} alt="Banner preview" /><button className="aw-btn sm danger" onClick={() => set('banner', '')}><Ic n="trash" />Remove</button></div>
                ) : (
                  <label className="aw-btn">{up ? <span className="aw-spin" /> : <Ic n="image" />}Upload banner<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} /></label>
                )}
                <p className="aw-hint">Blends softly into the category header. JPG, PNG or WebP under 10 MB.</p>
              </div>
              <div className="aw-switches">
                <Switch on={f.visible} set={v => set('visible', v)} label="Show on the website" hint="Turn off to hide the category page. Articles stay published." />
                <Switch on={f.menu} set={v => set('menu', v)} label="Show in menu and footer" hint="Adds a link in the header and footer." />
                <Switch on={f.home} set={v => set('home', v)} label="Show a section on the home page" hint="Lists the latest articles from this category." />
              </div>
              <div className="aw-row-flex">
                <button className="aw-btn primary" disabled={busy || bad || clash} onClick={save}>{busy ? <span className="aw-spin" /> : <Ic n="check" />}{f.oldSlug ? 'Save changes' : 'Add category'}</button>
                <button className="aw-btn ghost" onClick={() => setF(null)}>Cancel</button>
              </div>
            </div>
          </section>

          <aside className="aw-card aw-catpreview" aria-label="Live preview">
            <h3 style={{ marginTop: 0 }}>Live preview</h3>
            <div className="aw-pv-hero" style={{ background: `linear-gradient(135deg,${HEX.test(f.from) ? f.from : '#0B6E70'},${HEX.test(f.to) ? f.to : '#2FB5A8'})` }}>
              {f.banner && <img src={f.banner} alt="" />}
              <span className="aw-pv-ic">{f.icon}</span>
              <b>{f.name || 'Category name'}</b>
              <small>{f.blurb || 'Your short description appears here.'}</small>
            </div>
            <p className="aw-label" style={{ marginTop: 16 }}>Chip and label</p>
            <div className="aw-row-flex" style={{ flexWrap: 'wrap' }}>
              <span className="aw-pv-chip" style={{ background: `linear-gradient(135deg,${f.from},${f.to})` }}>{f.icon} {f.name || 'Category'}</span>
              <span className="aw-pv-pill" style={{ background: `linear-gradient(135deg,${f.from},${f.to})` }}>{f.name || 'Category'}</span>
            </div>
            <p className="aw-hint">White text is used on these colours, so pick mid-to-dark shades for the best contrast.</p>
          </aside>
        </div>
      )}

      {del && (
        <section className="aw-card aw-delbox" role="alertdialog" aria-label="Delete category">
          <h3 style={{ marginTop: 0 }}>Delete “{del.cat.name}”?</h3>
          {statOf(del.cat.slug).n > 0 ? (
            <>
              <p className="aw-muted">It has {pl(statOf(del.cat.slug).n, 'article')}. Choose where they should go. Nothing is deleted except the category itself.</p>
              <label className="aw-label" htmlFor="mv">Move articles to</label>
              <select id="mv" className="aw-select" style={{ maxWidth: 300 }} value={del.to} onChange={e => setDel({ ...del, to: e.target.value })}>
                <option value="">Choose a category…</option>
                {categories.filter(c => c.slug !== del.cat.slug).map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </>
          ) : <p className="aw-muted">This category has no articles.</p>}
          <div className="aw-row-flex" style={{ marginTop: 14 }}>
            <button className="aw-btn solid-danger" disabled={busy || (statOf(del.cat.slug).n > 0 && !del.to)} onClick={remove}>{busy ? <span className="aw-spin" /> : <Ic n="trash" />}Delete category</button>
            <button className="aw-btn ghost" onClick={() => setDel(null)}>Keep it</button>
          </div>
        </section>
      )}

      <div className="aw-catgrid">
        {categories.map((c, i) => {
          const s = statOf(c.slug);
          return (
            <article key={c.slug} className={`aw-catcard ${c.visible ? '' : 'off'}`} style={{ animationDelay: `${i * 50}ms` }}>
              <header style={{ background: `linear-gradient(135deg,${c.from},${c.to})` }}>
                <span className="aw-catcard-ic">{c.icon}</span>
                <div><b>{c.name}</b><small>/category/{c.slug}</small></div>
              </header>
              <div className="aw-catcard-body">
                <p className="aw-muted aw-catcard-blurb">{c.blurb || 'No description yet.'}</p>
                <div className="aw-row-flex" style={{ flexWrap: 'wrap', gap: 6 }}>
                  <span className="aw-chip">{pl(s.n, 'article')}</span><span className="aw-chip">{pl(s.v, 'view')}</span>
                  {!c.visible && <span className="aw-badge Draft">Hidden</span>}
                </div>
                <div className="aw-togglerow">
                  <button className="aw-mini" aria-pressed={c.visible} onClick={() => toggle(c, 'visible')} title="Show on the website"><Ic n="eye" />Live</button>
                  <button className="aw-mini" aria-pressed={c.menu} onClick={() => toggle(c, 'menu')} title="Show in menu and footer"><Ic n="menu" />Menu</button>
                  <button className="aw-mini" aria-pressed={c.home} onClick={() => toggle(c, 'home')} title="Show a home page section"><Ic n="dashboard" />Home</button>
                </div>
                <div className="aw-row-flex aw-catcard-actions">
                  <button className="aw-btn sm" onClick={() => openEdit(c)}><Ic n="pen" />Edit</button>
                  <button className="aw-btn sm ghost" onClick={() => showArticles(c.slug)} title="See its articles"><Ic n="doc" /></button>
                  <a className="aw-btn sm ghost" href={`/category/${c.slug}`} target="_blank" rel="noreferrer" title="Open the page"><Ic n="ext" /></a>
                  <span style={{ flex: 1 }} />
                  <button className="aw-btn sm ghost" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}><Ic n="up" /></button>
                  <button className="aw-btn sm ghost" aria-label="Move later" disabled={i === categories.length - 1} onClick={() => move(i, 1)}><Ic n="down" /></button>
                  <button className="aw-btn sm danger" aria-label={`Delete ${c.name}`} disabled={categories.length <= 1} onClick={() => { setF(null); setDel({ cat: c, to: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Ic n="trash" /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
