import '../styles/tailwind.css';
import { Bricolage_Grotesque, Source_Serif_4, Noto_Sans_Devanagari } from 'next/font/google';
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--display', display: 'swap' });
const body = Source_Serif_4({ subsets: ['latin'], variable: '--body', display: 'swap' });
const hindi = Noto_Sans_Devanagari({ subsets: ['devanagari', 'latin'], variable: '--hindi', display: 'swap' });
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Fuelwell: weight loss, weight gain and protein guides', template: '%s | Fuelwell' },
  description: 'Practical guides on losing weight, gaining weight and eating enough protein, plus a free protein calculator.',
  openGraph: { siteName: 'Fuelwell', type: 'website', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
};
export const viewport = { themeColor: '#0F1B2D' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${display.variable} ${body.variable} ${hindi.variable}`}><body>{children}</body></html>;
}
