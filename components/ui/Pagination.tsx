import Link from 'next/link';
export default function Pagination({ page, pages, base }: { page: number; pages: number; base: string }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}?page=${n}`);
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2 font-bold">
      {page > 1 && <Link href={href(page - 1)} rel="prev" className="rounded-full bg-white px-4 py-2 shadow-card hover:bg-tang">← Newer</Link>}
      {Array.from({ length: pages }, (_, i) => i + 1).map(n => <Link key={n} href={href(n)} aria-current={n === page} className={`grid h-10 w-10 place-items-center rounded-full ${n === page ? 'bg-ink text-white' : 'bg-white shadow-card hover:bg-tang'}`}>{n}</Link>)}
      {page < pages && <Link href={href(page + 1)} rel="next" className="rounded-full bg-white px-4 py-2 shadow-card hover:bg-tang">Older →</Link>}
    </nav>
  );
}
