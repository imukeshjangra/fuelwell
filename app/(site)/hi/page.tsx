import Link from 'next/link';
export const metadata = { title: 'हिन्दी में प्रोटीन, कैलोरी और वज़न गाइड', description: 'भारतीय खाने में प्रोटीन और कैलोरी, प्रति रुपये सबसे सस्ता प्रोटीन और वज़न घटाने-बढ़ाने की जानकारी हिन्दी में।', alternates: { canonical: '/hi', languages: { 'en-IN': '/', 'hi-IN': '/hi' } } };
export default function Page() {
  const cards = [['/hi/foods', '🥗', 'खाने की तालिका', 'दाल, पनीर, रोटी, अंडा, चना और बहुत कुछ: प्रोटीन, कैलोरी और लागत।'], ['/hi/protein-per-rupee', '₹', '₹10 में प्रोटीन', 'सबसे सस्ते प्रोटीन वाले खाने, क्रम से।']];
  return (<div lang="hi" className="mx-auto max-w-4xl px-5 py-12"><p className="text-sm font-extrabold uppercase tracking-wide text-teal">Fuelwell हिन्दी</p><h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">छोटी आदतें। मज़बूत आप।</h1><p className="mt-4 max-w-2xl text-xl text-ink/75">अपने रोज़ के भारतीय खाने में प्रोटीन और कैलोरी जानिए, और कम खर्च में ज़्यादा प्रोटीन पाइए।</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2">{cards.map(([h, i, t, d]) => <Link key={h} href={h} className="card card-hover rounded-2xl bg-white p-6 shadow-card"><span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-2xl text-tang">{i}</span><span className="mt-4 block text-xl font-extrabold">{t}</span><span className="mt-1 block text-ink/70">{d}</span></Link>)}</div>
    <p className="mt-8 text-ink/70">कैलकुलेटर, मील प्लान और लेख अभी अंग्रेज़ी में हैं: <Link href="/tools" className="font-bold text-teal underline">सभी टूल देखें</Link>।</p></div>);
}
