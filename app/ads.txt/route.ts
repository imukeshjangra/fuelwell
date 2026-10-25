export const dynamic = 'force-dynamic';
/** Serves /ads.txt from NEXT_PUBLIC_ADSENSE_ID (ca-pub-123 becomes pub-123). Empty until AdSense is configured. */
export function GET() {
  const id = (process.env.NEXT_PUBLIC_ADSENSE_ID || '').replace(/^ca-/, '');
  const body = /^pub-\d{10,20}$/.test(id) ? `google.com, ${id}, DIRECT, f08c47fec0942fa0\n` : '# Set NEXT_PUBLIC_ADSENSE_ID to publish your AdSense line here.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
