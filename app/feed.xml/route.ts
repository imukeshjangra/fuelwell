import { livePosts } from '@/lib/db';
export const dynamic = 'force-dynamic';
const esc = (s: string) => s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
export function GET() {
  const b = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const items = livePosts().slice(0, 30).map(p => `<item><title>${esc(p.title)}</title><link>${b}/blog/${p.slug}</link><guid>${b}/blog/${p.slug}</guid><pubDate>${new Date(p.created.replace(' ', 'T') + 'Z').toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Fuelwell</title><link>${b}</link><description>Weight loss, weight gain and nutrition guides</description>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml' } });
}
