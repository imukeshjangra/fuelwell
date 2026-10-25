import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
      <div>
        <p className="text-7xl font-extrabold text-tang">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">We could not find that page</h1>
        <p className="mt-3 text-ink/70">It may have moved or never existed. Try the latest articles or search.</p>
        <div className="mt-6 flex justify-center gap-3"><Link href="/" className="rounded-full bg-ink px-6 py-3 font-bold text-white">Home</Link><Link href="/search" className="rounded-full bg-tang px-6 py-3 font-bold text-ink">Search</Link></div>
      </div>
    </div>
  );
}
