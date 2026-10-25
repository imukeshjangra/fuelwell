type P = { label: string; value: number | null };
/** Small dependency-free SVG chart: bars or a line, with an optional dashed target line. */
export default function MiniChart({ data, type, color, target, unit = '', title }: { data: P[]; type: 'bar' | 'line'; color: string; target?: number; unit?: string; title: string }) {
  const W = 320, H = 150, L = 8, R = 8, T = 14, B = 26;
  const vals = data.map(d => d.value).filter((v): v is number => v != null);
  const hasData = vals.length > 0;
  let lo = 0, hi = Math.max(1, ...vals, target ?? 0) * 1.15;
  if (type === 'line' && hasData) { const all = [...vals, ...(target ? [target] : [])]; const mn = Math.min(...all), mx = Math.max(...all); const pad = Math.max(1, (mx - mn) * 0.25); lo = mn - pad; hi = mx + pad; }
  const x = (i: number) => L + (data.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (data.length - 1));
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const bw = Math.max(4, (W - L - R) / data.length - 4);
  const pts = data.map((d, i) => (d.value == null ? null : [x(i), y(d.value)] as const));
  const line = pts.filter(Boolean).map((p, i) => `${i ? 'L' : 'M'}${p![0].toFixed(1)},${p![1].toFixed(1)}`).join(' ');
  const last = [...data].reverse().find(d => d.value != null);
  const gid = `g-${title.replace(/\W/g, '')}`;
  return (
    <figure className="card p-5">
      <figcaption className="flex items-baseline justify-between"><span className="font-extrabold">{title}</span><span className="text-sm text-ink/60">{last ? <><b className="text-ink">{last.value}{unit}</b> latest</> : 'No data yet'}</span></figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} chart`} className="mt-3 w-full">
        <defs><linearGradient id={gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="#DDE5EE" />
        {target != null && hasData && <g><line x1={L} x2={W - R} y1={y(target)} y2={y(target)} stroke={color} strokeDasharray="4 4" opacity=".7" /><text x={W - R} y={y(target) - 4} textAnchor="end" fontSize="9" fill="#64748B">goal {target}{unit}</text></g>}
        {type === 'bar' && data.map((d, i) => d.value != null && <rect key={i} x={x(i) - bw / 2} y={y(d.value)} width={bw} height={Math.max(2, H - B - y(d.value))} rx="3" fill={color} opacity={target != null && d.value >= target ? 1 : 0.55} />)}
        {type === 'line' && line && <><path d={`${line} L${pts.filter(Boolean).slice(-1)[0]![0]},${H - B} L${pts.filter(Boolean)[0]![0]},${H - B} Z`} fill={`url(#${gid})`} /><path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{pts.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={color} strokeWidth="2" />)}</>}
        {!hasData && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="#94A3B8">Log your first entry to see this chart</text>}
        <text x={L} y={H - 8} fontSize="9" fill="#94A3B8">{data[0]?.label}</text>
        <text x={W - R} y={H - 8} textAnchor="end" fontSize="9" fill="#94A3B8">{data[data.length - 1]?.label}</text>
      </svg>
    </figure>
  );
}
