import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/db';
import { getCat } from '@/lib/categories';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const size = { width: 1200, height: 630 };
export function GET(_: Request, { params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  const c = getCat(p?.category || '');
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 70, color: '#fff', background: `linear-gradient(135deg, ${c?.from ?? '#0F1B2D'}, ${c?.to ?? '#2B5C8A'})` }}>
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>{c?.name}</div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>{p?.title ?? 'Fuelwell'}</div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 800 }}>
          <div style={{ display: 'flex', width: 56, height: 56, borderRadius: 14, background: '#FF7A1A', color: '#0F1B2D', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>F</div>Fuelwell
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
  );
}
