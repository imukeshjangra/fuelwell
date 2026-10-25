'use client';
import { useEffect, useRef, useState } from 'react';

const P: Record<string, string> = {
  dashboard: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
  doc: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6 M8 13h8 M8 17h5',
  pen: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  plus: 'M12 5v14 M5 12h14',
  trash: 'M3 6h18 M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  copy: 'M8 8h12v12H8z M4 16V4h12',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12 M18 6L6 18',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 21h16',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 2',
  image: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 20',
  bold: 'M6 4h8a4 4 0 0 1 0 8H6z M6 12h9a4 4 0 0 1 0 8H6z',
  italic: 'M19 4h-9 M14 20H5 M15 4L9 20',
  link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  listol: 'M10 6h11 M10 12h11 M10 18h11 M4 6h1v4 M4 10h2 M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
  quote: 'M3 21c3 0 7-1 7-8V5H3v8h4 M14 21c3 0 7-1 7-8V5h-7v8h4',
  code: 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  up: 'M7 14l5-5 5 5',
  down: 'M7 10l5 5 5-5',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  hr: 'M3 12h18',
  columns: 'M3 4h18v16H3z M12 4v16',
  ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  pulse: 'M22 12h-4l-3 9L9 3l-3 9H2',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01',
  alert: 'M12 9v4 M12 17h.01 M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  back: 'M19 12H5 M12 19l-7-7 7-7',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2 M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z',
};

export function Ic({ n, className = '' }: { n: keyof typeof P | string; className?: string }) {
  return <svg className={`aw-ic ${className}`} viewBox="0 0 24 24" aria-hidden="true">{(P[n] || '').split(' M').map((d, i) => <path key={i} d={(i ? 'M' : '') + d} />)}</svg>;
}

export const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animates a number up from its previous value. */
export function useCount(to: number, ms = 900) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (reduced()) { setV(to); from.current = to; return; }
    let raf = 0; const t0 = performance.now(); const a = from.current;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(a + (to - a) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

export function Counter({ to }: { to: number }) { return <>{useCount(to).toLocaleString('en-IN')}</>; }

export function Delta({ now, prev }: { now: number; prev: number }) {
  if (!now && !prev) return <span className="aw-delta flat">no change</span>;
  if (!prev) return <span className="aw-delta up"><Ic n="up" />new</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="aw-delta flat">same as last week</span>;
  return <span className={`aw-delta ${pct > 0 ? 'up' : 'down'}`}><Ic n={pct > 0 ? 'up' : 'down'} />{Math.abs(pct)}% vs last week</span>;
}

/** Smooth SVG area chart with a drawing line animation and hover tooltip. */
export function AreaChart({ data }: { data: { day: string; n: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 210, top = 16, bot = 10;
  const max = Math.max(4, ...data.map(d => d.n));
  const x = (i: number) => (data.length < 2 ? W / 2 : (i / (data.length - 1)) * W);
  const y = (n: number) => top + (1 - n / max) * (H - top - bot);
  let line = '';
  data.forEach((d, i) => { line += i === 0 ? `M${x(0)},${y(d.n)}` : ` C${(x(i - 1) + x(i)) / 2},${y(data[i - 1].n)} ${(x(i - 1) + x(i)) / 2},${y(d.n)} ${x(i)},${y(d.n)}`; });
  const area = `${line} L${x(data.length - 1)},${H} L${x(0)},${H} Z`;
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r || !data.length) return;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(((cx - r.left) / r.width) * (data.length - 1)))));
  };
  const h = hover === null ? null : data[hover];
  return (
    <div>
      <div className="aw-chart" ref={ref} onMouseMove={move} onTouchMove={move} onMouseLeave={() => setHover(null)} role="img" aria-label="Article views for the last 14 days">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs><linearGradient id="awg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--aw-brand)" stopOpacity=".35" /><stop offset="1" stopColor="var(--aw-brand)" stopOpacity="0" /></linearGradient></defs>
          {[0, 1, 2, 3].map(i => <line key={i} className="aw-grid-line" x1="0" x2={W} y1={top + (i / 3) * (H - top - bot)} y2={top + (i / 3) * (H - top - bot)} />)}
          <path className="aw-fill" d={area} fill="url(#awg)" />
          <path className="aw-line" d={line} pathLength={1} />
        </svg>
        {h && hover !== null && <>
          <span className="aw-dot" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.n) / H) * 100}%` }} />
          <span className="aw-tip" style={{ left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%`, top: `${(y(h.n) / H) * 100}%` }}>{h.day.slice(5)}: {h.n} view{h.n === 1 ? '' : 's'}</span>
        </>}
      </div>
      <div className="aw-axis"><span>{data[0]?.day.slice(5)}</span><span>{data[Math.floor(data.length / 2)]?.day.slice(5)}</span><span>{data[data.length - 1]?.day.slice(5)}</span></div>
    </div>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const r = 30, c = 2 * Math.PI * r;
  const color = score >= 80 ? 'var(--aw-ok)' : score >= 50 ? 'var(--aw-accent)' : 'var(--aw-danger)';
  return (
    <div className="aw-ring" role="img" aria-label={`SEO score ${score} out of 100`}>
      <svg viewBox="0 0 74 74"><circle className="bg" cx="37" cy="37" r={r} /><circle className="fg" cx="37" cy="37" r={r} stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} /></svg>
      <b>{score}</b>
    </div>
  );
}
