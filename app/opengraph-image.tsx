import { ImageResponse } from 'next/og';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Fuelwell: weight loss, weight gain and protein guides';
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: 80, color: '#fff', background: 'linear-gradient(135deg,#0F1B2D,#0B6E70)' }}>
        <div style={{ display: 'flex', fontSize: 110, fontWeight: 800 }}>Fuelwell</div>
        <div style={{ display: 'flex', fontSize: 44, marginTop: 20, color: '#FF7A1A', fontWeight: 700 }}>Weight loss. Weight gain. Protein.</div>
      </div>
    ),
    size,
  );
}
