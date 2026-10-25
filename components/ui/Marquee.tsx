/** Endless scrolling ticker. Pauses on hover. The list is doubled so the loop is seamless. */
export default function Marquee({ items }: { items: { icon: string; text: string }[] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="group relative overflow-hidden border-y border-ink/5 bg-white/60 py-3 backdrop-blur" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]">
        {row.map((it, i) => <span key={i} className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[.14em] text-ink/60"><span className="text-lg normal-case">{it.icon}</span>{it.text}<span className="ml-8 text-tang">✦</span></span>)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ground to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ground to-transparent" />
    </div>
  );
}
