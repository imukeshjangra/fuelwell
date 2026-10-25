import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ConsentGate from '@/components/layout/ConsentGate';
import Aurora from '@/components/layout/Aurora';
import BackToTop from '@/components/layout/BackToTop';
// Menus and category lists come from the database, so never serve a stale build-time copy.
export const dynamic = 'force-dynamic';
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Fuelwell', url: base, potentialAction: { '@type': 'SearchAction', target: `${base}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Fuelwell', url: base },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Aurora />
      <ConsentGate adId={process.env.NEXT_PUBLIC_ADSENSE_ID} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
