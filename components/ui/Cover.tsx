import { getCat } from '@/lib/categories';
export default function Cover({ cover, cat, title, className = '', priority = false }: { cover?: string; cat: string; title: string; className?: string; priority?: boolean }) {
  const c = getCat(cat);
  if (cover) return <img src={cover} alt={title} width={1200} height={750} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" className={`object-cover ${className}`} />;
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg,${c?.from ?? '#0F1B2D'},${c?.to ?? '#2B5C8A'})` }}>
      <div className="dot-grid absolute inset-0 opacity-30 [background-image:radial-gradient(#fff_1.4px,transparent_1.4px)]" />
      <div className="absolute -right-10 -top-10 h-44 w-44 animate-float-slow rounded-full bg-white/20 blur-[1px]" />
      <div className="absolute -bottom-14 left-8 h-36 w-36 animate-float-slow rounded-full bg-black/10 [animation-delay:-4s]" />
      <div className="absolute left-1/3 top-6 h-16 w-16 animate-float rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm" />
      <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-float text-6xl opacity-90 drop-shadow-lg">{c?.icon}</span>
    </div>
  );
}
